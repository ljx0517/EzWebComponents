import * as style from "./style.less"
const ELEMENT_NODE = 1;
const DOCUMENT_FRAGMENT_NODE = 11;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const randomLocalsScopeName = `___$locals$___${Date.now()}`

enum LOOP_CONDITION_STATEMENT {
  CONTINUE,
  BREAK,
  RETURN,
  NOTHING
}

enum DOM_RENDER_ACTION_TYPE {
  REPLACE,
  REORDER,
  ATTRS,
  TEXT
}

type iterableObj<T>= {
  [key: string]: T,
  // [Symbol.iterator]: T
  // [Symbol.iterator]() : IterableIterator<any>;
}
type VELEMENT  = HTMLElement & {compileContext: iterableObj<any>}
type EXPRESSION_ACTION = (...args: any) => void;
type FOR_LOOP_CONFIG = {
  begin: Node,
  end: Node,
  varKeyPath: string,
  iter: CallableFunction,
  forNode: Node}
class DirtyableValue  {
  private _value: any;
  private _dirty= false;
  private _pathKey = '';
  constructor(value: any, pathKey:string) {
    this._value = value;
    this._pathKey = pathKey;
  }



  get value() {
    return this._value
  }
  set value (val: any){
    this._dirty = true;
    this._value = val;
  }
  get isDirty () {
    return this._dirty;
  }
  reset() {
    this._dirty = false;
  }
  toString () {
    // return `<DirtyableValue>${this._value}`;
    return this._value;
  }
  valueOf () {
    return this._value;
  }

}



// https://stackoverflow.com/questions/543533/restricting-eval-to-a-narrow-scope
// https://stackoverflow.com/questions/61552/are-there-legitimate-uses-for-javascripts-with-statement
function ___lambda(exp: string,ctx={}, node:any=null) {
  if (node) {
    ctx = new Proxy(ctx,{
      has:()=>true,
      get: (target: any, prop: string, receiver) => {
        console.log( prop, prop in target)
        return Reflect.get(target, prop, receiver);
      },
    })
  }

  // execute script in private context
  const func = (new Function( `with(this) {
   try {
    return ${exp};
   } catch(e) {
   }
  }`));
  return func.call(ctx);
}

const lambda: CallableFunction = (function(){
  const cache: {[key: string]: CallableFunction} = {};

  function expressionTemplate(exp: string){
    let fn = cache[exp];
    if (!fn){
      // fn =(new Function( 'ctx', `with(ctx) { try {return ${exp};} catch(r) {}}`));
      // fn =(new Function( 'ctx', `with(ctx) { return ${exp};}`));
      fn = (new Function( `ctx, ${randomLocalsScopeName}`, `
      if (!${randomLocalsScopeName} || !Object.keys(${randomLocalsScopeName}).length) {
        ${randomLocalsScopeName} = {};
      };
      with(ctx) { 
        with(${randomLocalsScopeName}) { 
          return  ${exp};
        }
      }`))
      cache[exp] = fn;
    }
    return fn;
  }
  return expressionTemplate;
})();



const stylesheet = new CSSStyleSheet();
const slice = Array.prototype.slice
// const varNodeMap: {
//   [key: string]: Set<VELEMENT>
// } = {};
// const varActionMap: {
//   [key: string]: Set<any>
// } = {};




function treeWalker(node: HTMLElement|Node, compile: (n: VELEMENT) => void) {
  if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE) {
    let curChild = node.firstChild;
    while (curChild) {
      // console.log('[nodeName]',curChild.nodeName)
      compile(curChild as VELEMENT)
      treeWalker(curChild, compile);
      curChild = curChild.nextSibling;
    }
  }
}
function walk(nodes: Node|Node[]|NodeListOf<ChildNode>, check: (n: VELEMENT) => LOOP_CONDITION_STATEMENT) {
  if (!('length' in nodes)) {
    nodes = [nodes]
  }

  nodes = slice.call(nodes)

  while((nodes as VELEMENT[]).length) {
    const node = (nodes as  VELEMENT[]).shift()
    node.normalize();
    const ret = check(node)

    if (ret === LOOP_CONDITION_STATEMENT.CONTINUE) {
      continue
    }
    if (ret === LOOP_CONDITION_STATEMENT.BREAK) {
      break
    }
    if (ret === LOOP_CONDITION_STATEMENT.RETURN) {
      return
    }

    if (node.childNodes && node.childNodes.length) {
      nodes = slice.call(node.childNodes).concat(nodes)
    }
  }
}
function compileWalker(nodes: Node|Node[]|NodeListOf<ChildNode>, compile: (n: VELEMENT) => void) {
  if (!('length' in nodes)) {
    nodes = [nodes]
  }
  nodes = slice.call(nodes)
  while((nodes as VELEMENT[]).length) {
    const node = (nodes as  VELEMENT[]).shift()
    node.normalize();
    compile(node)
    if (node.childNodes && node.childNodes.length) {
      nodes = slice.call(node.childNodes).concat(nodes)
    }
  }
}

// https://javascript.info/mutation-observer
function watchDom(fragment: Node, check: (n: VELEMENT) => LOOP_CONDITION_STATEMENT) {
  const mutationRecords = [];
  const callback = function(mutationsList: MutationRecord[], observer: MutationObserver) {
    console.log(mutationsList, observer );
    // // Use traditional 'for loops' for IE 11
    // for(const mutation of mutationsList) {
    //   if (mutation.type === 'childList') {
    //     console.log('A child node has been added or removed.');
    //   }
    //   else if (mutation.type === 'attributes') {
    //     console.log('The ' + mutation.attributeName + ' attribute was modified.');
    //   }
    // }
  };
  const observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  observer.observe(fragment, {
    childList: true, // observe direct children
    subtree: true, // and lower descendants too
    attributes: true,
    attributeOldValue: true,
    characterDataOldValue: true, // pass old data to callback
    characterData: true,
  });

  try{
    walk(fragment.childNodes, check)
  } catch(e) {
    //
  } finally {
    // get a list of unprocessed mutations
    // should be called before disconnecting,
    // if you care about possibly unhandled recent mutations
    const unhandledMutationRecords = observer.takeRecords();
    unhandledMutationRecords.forEach(MutationRecord => mutationRecords.push(MutationRecord))
    // Later, you can stop observing
    observer.disconnect();
  }
}
function subStrAtPos(tpl: string, step: number , pos: number) {
  const f = []
  for (let i = 0; i < step; i++) {
    const s = tpl[pos + i]
    if (s) {
      f.push(s)
    }
  }
  return f.join('')
}

function extractVars(template: string, openChar = "{{", closeChar = "}}") {

  let i = 0;
  const data = [];

  // do {
  //   if (template[i] == openChar) {
  //     for (let j=i+1; j<template.length; j++) {
  //       if (template[j] == closeChar) {
  //         data[data.length] = template.slice(i+1, j);
  //         i = j+1;
  //         break;
  //       }
  //     }
  //   }
  // } while (++i < template.length);

  do {
    if (subStrAtPos(template, openChar.length, i) == openChar) {
      for (let j=i+1; j<=(template.length - closeChar.length ); j++) {
        if (subStrAtPos(template, closeChar.length, j) == closeChar) {
          // data[data.length] = template.slice(i+openChar.length, j);
          data.push(template.slice(i+openChar.length, j))
          i = j+1;
          break;
        }
      }
    }
  } while (++i <= (template.length - openChar.length ))

  return data;
}
function bindFunctionScope(ctx: any, fn: () => void) {
  return (function() {
    return eval(fn.toString());
  }).call(ctx);
}

const StateHandle: ProxyHandler<any> = {
  has:(target: any, p) => {
    if (p === randomLocalsScopeName) {
      return false;
    }
    return true;
  },
  get(target: any, prop: string, receiver) {
    if (prop === 'startRecordExpressionVars') {
      this.recordExpressionVars = new Set()
      return () => {
        //
      };
    }
    if (prop === 'stopRecordExpressionVars') {
      return () => {
        const result = Array.from(this.recordExpressionVars)
        try{
          return result;
        } finally {
          this.recordExpressionVars.clear();
          delete this.recordExpressionVars;
        }
      }


    }

    // let value = target[prop];
    // return (typeof value === 'function') ? value.bind(target) : value; // (*)

    if (Object.prototype.hasOwnProperty.call(target, prop)) {
      if (this.recordExpressionVars) {
        this.recordExpressionVars.add(prop)
        console.log( '__state get', prop, prop in target)
      }
      // varNodeMap[prop] = node
    }
    return Reflect.get(target, prop, receiver);
  },
  set(target: any, prop: string, val, receiver) { // to intercept property writing
    let newVal = val
    if (val && !Array.isArray(val) && typeof val === 'object') {
      newVal = new StateProxy(val);
    }
    if (val && typeof val === 'function') {
      newVal = bindFunctionScope(target, val)
    }
    return Reflect.set(target, prop, newVal, receiver);
  },
  deleteProperty(target: any, prop: string) { // to intercept property deletion
    // delete target[prop];
    // return true;
    return Reflect.deleteProperty(target, prop);
  },
  ownKeys(target: any) { // to intercept property list
    // return Object.keys(target).filter(key => !key.startsWith('_'));
    return Reflect.ownKeys(target);
  }

}




class StateProxy<T> {
  constructor(source: T) {
    return new Proxy(source, StateHandle);
  }
}



const loopNestedObj = (obj: any) => {
  Object.entries(obj).forEach(([key, val]) => {
    if (val && !Array.isArray(val) && typeof val === "object") {
      obj[key] = loopNestedObj(val);
    } else { // or do something with key and val.
      console.log(key, val);
      //do nothing
    }
  });
  return new StateProxy(obj)
};


class EzWidget extends HTMLElement {

  private __state: Record<string, any> = new StateProxy<Record<string, any>>({});

  private varExpressionObj: {[key: string]: Set<EXPRESSION_ACTION|Node|FOR_LOOP_CONFIG>} = {};
  private expressionNodeMap = new WeakMap();
  private nodePositionMap = new WeakMap();
  private compileContentNodeMap = new WeakMap();
  private cacheIfTagDomFragment: DocumentFragment;
  private cacheLoopTagDomFragment: DocumentFragment;

  // for internal change value
  private sourceRef: any;

  constructor() {
    super();
    // element created
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [stylesheet];


    shadow.innerHTML = `
       <slot></slot>
    `.replace(/[\s\n]*\n[\s\n]*/g, '');
  }

  connectedCallback() {
    // browser calls this method when the element is added to the document
    // (can be called many times if an element is repeatedly added/removed)
    // Only actually parse the stylesheet when the first instance is connected.
    if (stylesheet.cssRules.length == 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stylesheet.replaceSync(style.toString());
    }


    // const tmpl = document.querySelector('template');
    // const dom = tmpl.content.cloneNode(true);

    // const tmpl = this.shadowRoot.querySelector('slot');
    // this.vdom = tmpl.cloneNode(true);

    this.cacheIfTagDomFragment = document.createDocumentFragment();
    this.cacheLoopTagDomFragment = document.createDocumentFragment();
    /*this.originalDomFragment = document.createDocumentFragment();
    // // this.calcDomFragment = document.createDocumentFragment();
    while (false && this.childNodes.length) {
      const n = this.childNodes[0];
      if(n.nodeType == COMMENT_NODE
        || n.nodeType == DOCUMENT_FRAGMENT_NODE
        || n.nodeName == 'SCRIPT') {
        n.remove()
        continue;
      }
    //   console.log(n);
      this.originalDomFragment.appendChild(n)
    //   this.originalDomFragment.appendChild(n.cloneNode(true))
    //   // this.calcDomFragment.appendChild(n);
    }*/
    this.dispatchEvent(new CustomEvent('created', {detail: this}));
    console.log(22222)
    // walk(this.originalChildNodes.childNodes, (node) => {
    //   this.rendererNodeMap.set(node, node.cloneNode())
    //   this.calcChildNodes.appendChild(node)
    //   return LOOP_CONDITION_STATEMENT.NOTHING
    // })
    // walk(this.originalDomFragment.childNodes, this.check)
    compileWalker(this.childNodes, this.compile)
    // walkTree(this, this.compile)
    // walk(this.originalChildNodes.cloneNode(true), this.check)
    // tmpl.remove()
    // this.shadowRoot.append(dom);
    this.dispatchEvent( new CustomEvent('mounted', {detail: this}));
  }

  render() {
    //
  }


  getInternalKey(key: string) {
    // return `__ez__|${key}`
    return key
  }
  makeStateReflectable(source: any, root='') {
    // console.log('root', root);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = source[key]
    // }
    // Object.entries(source).forEach(([key, val]) => {
      const pathKey = `${root ? `${root}.` : ''}${key}`;
      // console.log('pathKey', pathKey);
      if (val &&  !Array.isArray(val)  && typeof val === "object") {
        self.makeStateReflectable(val, pathKey);
        return
      }
      const internalKey = this.getInternalKey(pathKey)
      self.__state[internalKey] = val; // new DirtyableValue(val, internalKey);
      Object.defineProperty(source, key, {
        get() {
          console.log('[state] [GET]', internalKey, self.__state[internalKey]);
          return self.__state[internalKey];
        },

        set(value) {
          console.log('[state] [SET]', internalKey, value);
          if (value && !Array.isArray(val) && typeof value === "object") {
            self.makeStateReflectable(value, pathKey);
            return
          }
          if (typeof value === 'function') {
            // self.__state[internalKey] = self.bindStateFunction(value)
            value = bindFunctionScope(source ,value)
          }
          const beforeValue = self.__state[internalKey];
          if (beforeValue === value) {
            return
          }
          self.__state[internalKey] = value // new DirtyableValue(value, internalKey);

          const expSet = self.varExpressionObj[internalKey];
          expSet && expSet.forEach(exp => {
            const acts = self.expressionNodeMap.get(exp);
            acts.forEach((act: CallableFunction) => {
              act(internalKey, beforeValue, value)
            })
          })
        }
      });

    }
  }
  setState(source: any) {
    this.sourceRef = source;
    this.makeStateReflectable(source);
    this.render();
  }
  removeNode(node: VELEMENT) {
    // const index = Array.from(node.parentNode.children).indexOf(node);
    const next = node.nextSibling
    this.nodePositionMap.set(node, {
      parent: node.parentElement,
      next
    });
    this.cacheIfTagDomFragment.appendChild(node);
  }
  restoreRemoveNode(node: VELEMENT) {
    const info = this.nodePositionMap.get(node);
    if (!info) {
      return;
    }
    const {parent, next} = info;
    if (!next) {
      parent.appendChild(node);
      return
    }
    parent.insertBefore(node, next)

  }





  getNodeCompileScope(node: VELEMENT| Text): any {
    const parent = node.parentNode;
    const parentScope = this.compileContentNodeMap.get(parent);
    const nodeScope = this.compileContentNodeMap.get(node);
    return {...parentScope, ...nodeScope};

    // let parent = node;
    // let mergedScope = {}
    // while ((parent as HTMLElement) != this) {
    //   const scope = this.compileContentNodeMap.get(parent);
    //   if (scope) {
    //     mergedScope = {...scope, ...mergedScope}
    //   }
    //   parent = parent.parentElement as VELEMENT
    // }
    // return mergedScope
  }
  bindAttrNodeAction(node: VELEMENT, attrName: string, attrValue: string) {
    if (!node.parentElement) {
      return
    }
    node.removeAttribute(attrName);

    const lambdaFn = lambda(attrValue);

    this.__state.startRecordExpressionVars()

    const vars = this.__state.stopRecordExpressionVars();
    vars.forEach((v: string) => {
      if (!this.varExpressionObj[v]) {
        this.varExpressionObj[v] = new Set<EXPRESSION_ACTION>();
      }
      this.varExpressionObj[v].add(node);
    });
    const action = ((attrNode: VELEMENT, fn: CallableFunction, actAttrName: string) => {
      const scope = this.getNodeCompileScope(attrNode);
      // const result = lambdaFn({...this.__state, ...scope});
      // const result = lambdaFn( Object.assign(this.__state, scope));
      const result = fn( this.__state, scope);
      attrNode.setAttribute(actAttrName, result)
    }).bind(null, node, lambdaFn, attrName.substring(1));
    if (!this.expressionNodeMap.get(node)) {
      this.expressionNodeMap.set(node, new Set())
    }
    this.expressionNodeMap.get(node).add(action)
    action();
  }


  bindIfNodeAction(node: VELEMENT, attrName: string, attrValue: string) {
    node.removeAttribute(attrName)
    const conditionExpr = `${attrName.substring(4)} === ${attrValue}`;
    const lambdaFn = lambda(conditionExpr);
    this.__state.startRecordExpressionVars()
    const result = lambdaFn(this.__state);
    const vars = this.__state.stopRecordExpressionVars();
    vars.forEach((v: string) => {
      if (!this.varExpressionObj[v]) {
        this.varExpressionObj[v] = new Set<EXPRESSION_ACTION>();
      }
      this.varExpressionObj[v].add(node);
    });
    const action = ((actNode: VELEMENT, fn: CallableFunction) => {
      const result = fn(this.__state);
      if (!result) {
        this.removeNode(actNode);
      } else {
        this.restoreRemoveNode(actNode);
      }
    }).bind(null, node, lambdaFn)
    if (!this.expressionNodeMap.get(node)) {
      this.expressionNodeMap.set(node, new Set())
    }
    this.expressionNodeMap.get(node).add(action)
    action();
  }

  bindTextNodeAction(strExpr: string, node: Text) {
    if (!node.parentElement.parentElement) {
      return
    }
    const lambdaFn = lambda(strExpr);
    const scope = this.getNodeCompileScope(node);
    // console.log(2, node)
    this.__state.startRecordExpressionVars();
    // const result = lambdaFn({...this.__state, ...scope});
    // const result = lambdaFn( Object.assign(this.__state, scope));
    const result = lambdaFn(this.__state, scope);
    const vars = this.__state.stopRecordExpressionVars();
    vars.forEach((v: string) => {
      if (!this.varExpressionObj[v]) {
        this.varExpressionObj[v] = new Set<EXPRESSION_ACTION>();
      }
      this.varExpressionObj[v].add(node);
    });
    const action =  () => {
      const scope = this.getNodeCompileScope(node);
      // const result = lambdaFn({...this.__state, ...scope});
      // const result = lambdaFn( Object.assign(this.__state, scope));
      const result = lambdaFn( this.__state, scope);
      node.textContent = result;
    }

    if (!this.expressionNodeMap.get(node)) {
      this.expressionNodeMap.set(node, new Set())
    }
    this.expressionNodeMap.get(node).add(action)
    action()
  }


  bindLoopNodeAction(node: VELEMENT, loopVarName: string, bindVar: string) {
    const begin = node.previousSibling;
    const end = node.nextSibling;
    loopVarName = loopVarName.replace('(', '').replace(')', '')

    node.removeAttribute(`:each-${bindVar}`)
    const storeNode = node.cloneNode(true)

    if (!this.varExpressionObj[loopVarName]) {
      this.varExpressionObj[loopVarName] = new Set();
    }

    let iter = this.__state[loopVarName];
    let vars = [];
    if (typeof iter === 'function') {
      const ldn = lambda(iter.toString())
      this.__state.startRecordExpressionVars();
      iter = ldn.call(this.__state, this.__state) // first for `this`, second for ctx
      iter()
      vars = this.__state.stopRecordExpressionVars();
    }



    const forKey = {
      begin,
      end,
      forNode: storeNode,
      varKeyPath: loopVarName,
      iter
    }
    vars.forEach((v: string) => {
      if (!this.varExpressionObj[v]) {
        this.varExpressionObj[v] = new Set<EXPRESSION_ACTION>();
      }
      this.varExpressionObj[v].add(forKey);
    });
    this.varExpressionObj[loopVarName].add(forKey);
    const action = ((forKeyCfg: FOR_LOOP_CONFIG) => {
      const {
        begin, end, forNode, varKeyPath, iter
      } = forKeyCfg;
      let start = begin.nextSibling;

      while(start && start != end) {
        const next = start.nextSibling;
        console.log("rrrrrrrrrrrrrrrrrrrrrrr")
        void (start as HTMLElement).remove();
        start = next;
      }
      // let iter = this.__state[varKeyPath]
      let arrayLike = iter;
      if (typeof iter === 'function') {
        arrayLike = iter();
      }
      (arrayLike as unknown as Array<any>).map((item: any, index: number) => {
        const renderForNode = forNode.cloneNode(true) as HTMLElement;
        // console.log(1,renderForNode)
        // renderForNode.setAttribute('for-index', String(index))
        const nodeCompileContext = this.compileContentNodeMap.get(renderForNode)
        this.compileContentNodeMap.set(renderForNode, {
          ...nodeCompileContext,
          [bindVar]: {
            item, index
          },
        });

        end.parentNode.insertBefore(renderForNode, end);
        compileWalker(renderForNode as VELEMENT, this.compile)
      });
    }).bind(null, forKey)
    action();
    if (!this.expressionNodeMap.get(forKey)) {
      this.expressionNodeMap.set(forKey, new Set())
    }
    this.expressionNodeMap.get(forKey).add(action)

    this.cacheLoopTagDomFragment.appendChild(storeNode)
  }


  bindStateFunction(fn: () => void) {
    return (function() {
      return eval(fn.toString());
    }).call(this.__state)
  }
  compile = (node: VELEMENT) => {
    if (node.nodeName == 'SCRIPT') {
      return;
    }
    if (node.nodeType === COMMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE) { // comment & DOCUMENT_FRAGMENT_NODE
      return ;
    }

    if (node.nodeType === TEXT_NODE) {
      const txtNode = (node as unknown as Text);
      // TODO only replace paired {{}}
      const txtExp = txtNode.wholeText
          .replace(/\{\{/gi, '${', )
          .replace(/\}\}/gi, '}', )
      if (txtNode.wholeText.trim()) {
        console.log(1, txtNode.wholeText.trim(), txtExp)
        this.bindTextNodeAction("`" +txtExp + "`", txtNode);
      }
      return
    }

    let attrs = node.getAttributeNames();
    console.log('attrs', attrs);
    const eachVarName = attrs.find((attr) => {
      return attr.startsWith(':each-')
    });
    // const ifVarName = attrs.find((attr) => {
    //   return attr.startsWith(':if-')
    // });
    //
    // const isIfNode = Boolean(ifVarName);
    const isLoopNode = Boolean(eachVarName);


    if (isLoopNode) {
      const loopVar = node.getAttribute(eachVarName)
      const bindVar = eachVarName.replace(':each-', '')
      this.bindLoopNodeAction(node, loopVar, bindVar)
    }
    attrs = node.getAttributeNames()
    for (let i = 0; i < attrs.length; i++) {
      const attr = node.getAttributeNode(attrs[i])
      const attrName = attr.name as unknown as string;
      const attrValue = attr.value as unknown as string;
      const name = this.getInternalKey(attrName.substring(1));

      if (attrName.startsWith(':if-')) { // if expression
        console.log('[if]', attrName, attrValue);
        this.bindIfNodeAction(node, attrName, attrValue);
        continue
      }

      if (attrName.startsWith(':')) {
        console.log('[attr]', attrName, attrValue);
        this.bindAttrNodeAction(node, attrName, attrValue );
      }
      if (attrName.startsWith('@')) {
        const eventName = attrName.substring(1);
        console.log('[event]', attrName, attrValue);
        node.addEventListener(eventName, (evt) => {
          this.__state[attrValue](evt)
        })

      }
    }
  }




  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes(): string[]  {
    return [/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // called when one of attributes listed above is modified
  }

  adoptedCallback() {
    // called when the element is moved to a new document
    // (happens in document.adoptNode, very rarely used)
  }

  // there can be other element methods and properties
}
customElements.define("ez-widget", EzWidget);
