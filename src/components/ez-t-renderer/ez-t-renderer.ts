import * as style from "./ez-t-renderer.less"
const ELEMENT_NODE = 1;
const DOCUMENT_FRAGMENT_NODE = 11;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;

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

type VELEMENT  = HTMLElement & {dirty: boolean}
type EXPRESSION_ACTION = (...args: any) => void;

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

// const expressionString = (function(){
//   const cache: {[key: string]: CallableFunction} = {};
//
//   function expressionTemplate(exp: string){
//     let fn = cache[exp];
//     if (!fn){
//       const sanitized = `with(obj){return ${exp}}`
//       fn = Function('obj', sanitized);
//     }
//     return fn;
//   }
//   return expressionTemplate;
// })();

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
  const func = (new Function( `with(this) { return ${exp};}`));
  return func.call(ctx);
}

const lambda: CallableFunction = (function(){
  const cache: {[key: string]: CallableFunction} = {};

  function expressionTemplate(exp: string){
    let fn = cache[exp];
    if (!fn){
      fn =(new Function( 'ctx', `with(ctx) { return ${exp};}`));
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
          // debugger
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
  has:() => true,
  get(target: any, prop: string, receiver) {
    if (prop === 'startRecordExpressionVars') {
      this.recordExpressionVars = []
      return () => {
        //
      };
    }
    if (prop === 'stopRecordExpressionVars') {
      return () => {
        const result = [...this.recordExpressionVars]
        try{
          return result;
        } finally {
          this.recordExpressionVars.length = 0;
          delete this.recordExpressionVars;
        }
      }


    }

    // let value = target[prop];
    // return (typeof value === 'function') ? value.bind(target) : value; // (*)

    if (Object.prototype.hasOwnProperty.call(target, prop)) {
      if (this.recordExpressionVars) {
        this.recordExpressionVars.push(prop)
        console.log( '__state get', prop, prop in target)
      }
      // varNodeMap[prop] = node
    }
    return Reflect.get(target, prop, receiver);
  },
  set(target: any, prop: string, val, receiver) { // to intercept property writing
    let newVal = val
    if (val && typeof val === 'object') {
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


class EzTRenderer extends HTMLElement {


  private beforeCloseHooks:(() => boolean)[] = [];
  private afterCloseHooks: (() => void)[] = [];
  private beforeActiveTabHooks:(() => boolean)[] = [];
  private afterActiveTabHooks: (() => void)[] = [];
  private __state:{
  [key: string]: any
} = new StateProxy<{[key: string]: any}>({});

  // private __state:{
  //   [key: string]: DirtyableValue
  // } = new StateProxy<{[key: string]: DirtyableValue}>({});

  private varReflectMap: {
    [key: string]: ((args: any) => void)[]
  } = {};
  // private varNodeMap: {
  //   [key: string]: VELEMENT[]
  // } = {}
  // private varNodeMap: {
  //   [key: string]: Set<VELEMENT>
  // } = {};
  // private varActionMap: {
  //   [key: string]: Set<CallableFunction>
  // } = {};

  private varExpressionObj: {[key: string]: Set<EXPRESSION_ACTION|Node>} = {};
  private expressionNodeMap = new WeakMap();
  private nodePositionMap = new WeakMap();
  private rendererNodeObj: {[key: string]: any} = {};
  private originalDomFragment: DocumentFragment;
  private cacheIfTagDomFragment: DocumentFragment;
  private cacheLoopTagDomFragment: DocumentFragment;
  private userStateScope: {[key: string]: any}  = {};
  private bindScopeFunction = {}
  // private virtualChildNodes: any[];
  // private calcDomFragment: DocumentFragment;

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
    debugger
    // const tmpl = this.shadowRoot.querySelector('slot');
    // this.vdom = tmpl.cloneNode(true);

    this.cacheIfTagDomFragment = document.createDocumentFragment();
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
    walk(this.childNodes, this.check)
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
    this.userStateScope = source;
    Object.entries(source).forEach(([key, val]) => {
      const pathKey = `${root ? `${root}.` : ''}${key}`;
      console.log('pathKey', pathKey);
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
          self.__state[internalKey] = value // new DirtyableValue(value, internalKey);

          const expSet = self.varExpressionObj[internalKey];
          expSet && expSet.forEach(exp => {
            const act = self.expressionNodeMap.get(exp);
            act()
          })
        }
      });

    })
  }
  setState(source: any) {
    this.makeStateReflectable(source);
    this.render();
  }
  removeNode(node: VELEMENT) {
    const index = Array.from(node.parentNode.children).indexOf(node);
    this.nodePositionMap.set(node, {
      parent: node.parentElement,
      index
    });
    this.cacheIfTagDomFragment.appendChild(node);
  }
  restoreRemoveNode(node: VELEMENT) {
    const info = this.nodePositionMap.get(node);
    if (!info) {
      return;
    }
    const {parent, index} = info;
    const afterNode = parent.children[index];
    if (!afterNode) {
      parent.appendChild(node);
      return
    }
    parent.insertBefore(node, afterNode)

  }





  bindCalcNodeAction(strExpr: string, node: VELEMENT|Text, action: (...args: any) => void) {
    const lambdaFn = lambda(strExpr);
    this.expressionNodeMap.set(node, action.bind(null, lambdaFn, node))

    this.__state.startRecordExpressionVars()
    const result = lambdaFn(this.__state);
    const vars = this.__state.stopRecordExpressionVars();
    vars.forEach((v: string) => {
      if (!this.varExpressionObj[v]) {
        this.varExpressionObj[v] = new Set<EXPRESSION_ACTION>();
      }
      // this.varExpressionObj[v].push(action.bind(null, lambdaFn));
      this.varExpressionObj[v].add(node);
    });
    return result;
  }

  bindForLoopNodeAction(varName: string, node: VELEMENT, action: (...args: any) => void) {
    const loopItemName = varName.replace(':each-', '')
    const holder = document.createComment(`each ${loopItemName} of ${varName}`)
    node.parentNode.insertBefore(holder, node);
    this.expressionNodeMap.set(node, action.bind(node))
    if (!this.varExpressionObj[varName]) {
      this.varExpressionObj[varName] = new Set<Node>();
    }
    this.varExpressionObj[varName].add(holder);
    this.cacheLoopTagDomFragment.appendChild(node)
  }


  bindStateFunction(fn: () => void) {
    return (function() {
      return eval(fn.toString());
    }).call(this.__state)
  }

  check = (node: VELEMENT): LOOP_CONDITION_STATEMENT => {
    node.dirty = false;
    if (node.nodeName == 'SCRIPT') {
      return;
    }
    if (node.nodeType === COMMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE) { // comment & DOCUMENT_FRAGMENT_NODE
      return ;
    }


    // console.log('check', node.nodeType, node.nodeName, node);
    if (node.nodeType === TEXT_NODE) {
      const txtNode = (node as unknown as Text);


      const txtExp = txtNode.wholeText
        .replace(/\{\{/gi, '${', )
        .replace(/\}\}/gi, '}', )
      this.bindCalcNodeAction("`" +txtExp + "`", txtNode, (expFn, actNode) => {
        const result = expFn(this.__state);
        actNode.textContent = result;
      });

      return
    }


    const attrs = node.getAttributeNames();
    console.log('attrs', attrs);
    const varName = attrs.find((attr) => {
      return attr.startsWith(':each-')
    })

    const isLoopNode = Boolean(varName);
    if (isLoopNode) {
      const loopVar = node.getAttribute(varName)
      const loopItemVarName = varName.replace(':each-', '');


      this.bindForLoopNodeAction(loopVar, node, () => {
        this.__state[loopVar].forEach((item: any, index: number) => {
          // holder.parentNode.appendChild()
        })
        console.log(this.__state[loopVar]);
      })
      return LOOP_CONDITION_STATEMENT.CONTINUE;
    }
    for (let i = 0; i < attrs.length; i++) {
      const attr = node.getAttributeNode(attrs[i])
      const attrName = attr.name as unknown as string;
      const attrValue = attr.value as unknown as string;
      // node.removeAttribute(attrName);
      const name = this.getInternalKey(attrName.substring(1));
      // let internalKey = this.getInternalKey(attrValue);


      // check attrValue is plain value of value ref
      if (attrName.startsWith(':if-')) { // if expression
        const ifExp = `${attrName.substring(4)} === ${attrValue}`;
        console.log('[if]', ifExp);
        // node.removeAttribute(attrName);
        this.bindCalcNodeAction(ifExp, node, (expFn, actNode) => {
          const result = expFn(this.__state);
          console.log(actNode)
          if (!result) {
            this.removeNode(actNode);
          } else {
            this.restoreRemoveNode(actNode);
          }
        });
        continue
      }

      // if (attrName.startsWith(':each-') && node.tagName != 'IF') { // for-loop expression
      //   const bindVarName = attrName.replace(':each-', '')
      //   if (this.__state[attrValue]) {
      //     node.remove()
      //     this.bindForLoopNodeAction(attrValue, node, () => {
      //       console.log(this.__state[attrValue]);
      //     })
      //   }
      // }



      if (attrName.startsWith(':')) {
        console.log('[attr]', attrName, attrValue);
        // internalKey = this.getInternalKey(attrValue)
        // const attrExp = attrValue;
        this.bindCalcNodeAction(attrValue, node, (expFn) => {
          const result = expFn(this.__state);
          node.setAttribute(name, result)
        });
      }
      if (attrName.startsWith('@')) {
        const eventName = attrName.substring(1);
        console.log('[event]', attrName, attrValue);
        node.addEventListener(eventName, (evt) => {
          this.__state[attrValue](evt)
        })

      }

    }


    return LOOP_CONDITION_STATEMENT.NOTHING; // true will break walker
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
customElements.define("ez-t-render", EzTRenderer);
