import * as style from "./style.less"
import * as fastdom from './fastdom';
const ELEMENT_NODE = 1;
const DOCUMENT_FRAGMENT_NODE = 11;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const randomLocalsScopeName = `___$locals$___${Date.now()}`
const IS_PROXY = Symbol("IS_PROXY")
const PARENT_PATH = Symbol("PARENT_PATH")

type VAR_AND_EXPRESSION = {
  expression: string;
  vars: string[];
}
enum LOOP_CONDITION_STATEMENT {
  CONTINUE,
  BREAK,
  RETURN,
  NOTHING
}
const EXPRESSION_REGEX = /{([^{}]+?)}/g

enum DOM_RENDER_ACTION_TYPE {
  REPLACE,
  REORDER,
  ATTRS,
  TEXT
}

type ACTOR = (...args: any) => void|CallableFunction;
type iterableObj<T>= {
  [key: string]: T,
  // [Symbol.iterator]: T
  // [Symbol.iterator]() : IterableIterator<any>;
}
type VELEMENT  = (HTMLElement ) & {___ez_compiled: boolean, compileContext: iterableObj<any>}
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
  static isPrimitiveValue(value: undefined |null |boolean | number | string | symbol): boolean {
    if (value === null) {
      return true;
    }
    const t = typeof value;
    const primitiveTypes = ['undefined' , 'boolean', 'number', 'string', 'symbol']
    return primitiveTypes.includes(t)
  }
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
function isReflectable(v: any) {
  // FIXME to do with or without Array
  return v != null && typeof v !== 'function' &&  !Array.isArray(v) && typeof v == 'object';
  // return !(v != null &&  !Array.isArray(v) && typeof v !== 'function' && typeof v !== 'object');
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
      try{
        fn = (new Function( `ctx, ${randomLocalsScopeName}`, `
        if (!${randomLocalsScopeName} || !Object.keys(${randomLocalsScopeName}).length) {
          ${randomLocalsScopeName} = {};
        };
        with(ctx) { 
          with(${randomLocalsScopeName}) { 
            return  ${exp};
          }
        }`))
      } catch (e) {
        throw new Error(`[Template Compile Error] SyntaxError:${e.message}`)
      }
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


function extractVarsV2(template: string, openChar = "{", closeChar = "}") {

  let i = 0;
  const ol = openChar.length;
  const cl = closeChar.length;
  const tl = template.length;
  const data = [];
  const sq = [];
  const dq = [];
  do {
    if (template.substring(i, i+ol) == openChar) {
      for (let j=i+1; j<=(tl - cl ); j++) {
        if (template[j] === "'") {
          sq.length & 1 ? sq.pop() : sq.push(null);
        }

        if (template[j] === '"') {
          dq.length & 1 ? dq.pop() : dq.push(null);
        }
        if(template.substring(j, j+ol) == openChar && !sq.length && !dq.length) {
          i = j
        }

        if (template.substring(j, j+cl) == closeChar && ( !sq.length && !dq.length )  ) {
          sq.length = 0;
          dq.length = 0;
          const start = i;
          const end = j+cl;
          data.push({
            start,
            end,
            expName: template.slice(start, end),
            varName: template.slice(start + ol, j)
          })
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
  get(target: any, prop: string|symbol, receiver) {
    console.log('get', target, prop)
    if (prop === IS_PROXY) {
      return true;
    }
    // if (prop === 'ctx') {
    //   return receiver;
    // }

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

    if (typeof prop != 'symbol' && Object.prototype.hasOwnProperty.call(target, prop)) {
      if (this.recordExpressionVars) {
        // const parent = Object.getOwnPropertyDescriptor(receiver, PARENT_PATH);
        const parent = receiver[PARENT_PATH]
        let varName = prop;
        if (parent) {
          varName = `${parent}.${String(prop)}`;
        }
        this.recordExpressionVars.add(varName);

        console.log( '__state get', prop, prop in target)
      }
      if (typeof target[prop] === 'function') {
        // if (this.recordExpressionVars) {
        //   return target[prop].call(receiver);
        // } else {
        //   return target[prop]();
        // }
      }

    }
    if (prop != Symbol.unscopables && String(prop).includes('.')) {
      const props = String(prop).split('.');
      const final = props.pop();
      let layer = target;
      let p = null;
      for (let i = 0; i < props.length; i++) {
        p = props[i];
        if (typeof layer[p] === 'undefined') {
          return undefined
          // layer[p] =  new StateProxy({});
        }
        layer = layer[p]
      }
      return layer[final];
    }
    return Reflect.get(target, prop, receiver);
  },
  set(target: any, prop: string|symbol, val, receiver) { // to intercept property writing
    let newVal = val
    if (isReflectable(val)) {
      newVal = new StateProxy(val);
    }
    if (val && typeof val === 'function') {
      // TODO should I make arrow function bind state?
      // https://github.com/flycrum/check-is-arrow-function/blob/master/src/lib/checkIsArrowFunction.ts
    }
    // if (prop === 'objPath') {
    //   return this.objPath.push(prop);
    // }
    // (receiver as any).WATCH_PATH = prop

    if (prop != Symbol.unscopables && String(prop).includes('.')) {
      const props = String(prop).split('.');
      const final = props.pop()
      let p = null;
      const objPath = [];
      for (let i = 0; i < props.length; i++) {
        p = props[i];
        objPath.push(p)
        if (typeof target[p] === 'undefined') {
          // If we're setting
          if (typeof newVal !== 'undefined') {
            // If we're not at the end of the props, keep adding new empty objects
            if (i != props.length)
              target[p] = new StateProxy({});
              const pt = objPath.join('.');
              Object.defineProperty(target[p],
                PARENT_PATH,
                {
                  value: pt,
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  });
          }
          else
            return undefined;
        }
        target = target[p]
      }
      target[final] = newVal;
      return true
    }
    return Reflect.set(target, prop, newVal, receiver);
  },
  deleteProperty(target: any, prop: string) { // to intercept property deletion
    // delete target[prop];
    // return true;
    return Reflect.deleteProperty(target, prop);
  },
  getOwnPropertyDescriptor(target, prop) {
    let value = undefined;
    if (prop != Symbol.unscopables && String(prop).includes('.')) {
      const props = String(prop).split('.');
      const final = props.pop();
      let layer = target;
      let p = null;
      for (let i = 0; i < props.length; i++) {
        p = props[i];
        if (typeof layer[p] === 'undefined') {
          return undefined
        }
        layer = layer[p]
      }
      value = layer[final];
    } else {
      value = Object.prototype.hasOwnProperty.call(target, prop)
      if (value) {
        return {
          // value : value,
          //use a logical set of descriptors:
          enumerable : true,
          configurable : true,
          writable : true
        };
      }
    }

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
    if (isReflectable(val)) {
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

  private nodeActorsMap = new WeakMap<VELEMENT|Text, Set<ACTOR>>()
  // private compileVarNodes = new WeakMap<VELEMENT|Text, Set<CallableFunction>>()
  private compileVarQueue = new Set<CallableFunction>()
  // private varBindNodeObj: {[key: string]: Set<VELEMENT>} = {};
  // private varBindNodeObj: StateProxy<Record<string, any>> = new StateProxy<any>({});
  private varBindNodeObj: any = {};


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
      const pathKey = `${root ? `${root}.` : ''}${key}`;
      const internalKey = this.getInternalKey(pathKey)
      console.log('internalKey', internalKey)
      // if (DirtyableValue.isPrimitiveValue(val)) {
      //   val = new DirtyableValue(val, internalKey);
      // }
      self.__state[internalKey] = val; // new DirtyableValue(val, internalKey);
      if (typeof val === 'function') {
        continue
      }

      if (isReflectable(val)) {
        self.makeStateReflectable(val, pathKey);
        continue;
      }
      Object.defineProperty(source, key, {
        get() {
          console.log('[state] [GET]', internalKey, self.__state[internalKey]);
          return self.__state[internalKey];
        },

        set(value) {
          console.log('[state] [SET]', internalKey, value);
          if (isReflectable(value)) {
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

          const nodes = self.varBindNodeObj[internalKey];
          nodes && nodes.forEach((node: any) => {
            self.nodeActorsMap.get(node).forEach(act => {
              fastdom.mutate(() => {
                act();
              })
            });
          });
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


  bindNodeExpression(node: VELEMENT, exp: VAR_AND_EXPRESSION, action: CallableFunction) {
    const lambdaFn = lambda(exp.expression)

    exp.vars.forEach((v: string) => {
      console.log('var', v)
      if (!Object.prototype.hasOwnProperty.call(this.__state, v)) {
        return;
      }
      if (!this.varBindNodeObj[v]) {
        this.varBindNodeObj[v] = new Set<VELEMENT>();
      }
      this.varBindNodeObj[v].add(node);
    });
    const compileVar = () => {
      this.__state.startRecordExpressionVars();
      const scope = this.getNodeCompileScope(node);
      const result = lambdaFn(this.__state, scope);
      const vars = this.__state.stopRecordExpressionVars();
      vars.forEach((v: string) => {
        if (!this.varBindNodeObj[v]) {
          this.varBindNodeObj[v] = new Set<VELEMENT>();
        }
        this.varBindNodeObj[v].add(node);
      });
      return result
    }
    const actor: ACTOR =  ((result :string) => {
      if (!result) {
        const scope = this.getNodeCompileScope(node);
        result = lambdaFn( this.__state, scope)
      }
      action(result)
      // node.textContent = result;
    });

    this.bindNodeActor(node, actor, compileVar);
  }



  bindTextNodeAction(strExpr: string, node: Text) {return
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
  bindNodeActor(node: VELEMENT|Text, actor: ACTOR, compileVar: CallableFunction) {
    if (!this.nodeActorsMap.get(node)) {
      this.nodeActorsMap.set(node, new Set())
    }
    this.nodeActorsMap.get(node).add(actor)
    fastdom.measure(() => {
      const result = compileVar()
      fastdom.mutate(() => {
        actor(result);
      })
    })
    // this.compileVarQueue.add(compileVar)
    // if (!this.compileVarNodes.get(node)) {
    //   this.compileVarNodes.set(node, new Set())
    // }
    // this.compileVarNodes.get(node).add(compileVar)
  }
  expandShorthandAttributes(node: VELEMENT) {
    const attrs = node.getAttributeNames();
    for (let i = 0; i < attrs.length; i++) {
      const attr = node.getAttributeNode(attrs[i])
      let attrName = attr.name as unknown as string;
      let attrValue = attr.value as unknown as string;
      const isShorthand =  EXPRESSION_REGEX.exec(attrName)
      EXPRESSION_REGEX.lastIndex = 0; // reset pos
      if (isShorthand) {
        node.removeAttribute(attrName);
        attrName = isShorthand[1];
        if (attrName.trim().startsWith('...')) {
          const propsName = attrName.trim().replace('...', '');
          const propsObj = this.sourceRef[propsName];
          if (this.sourceRef[propsName]) {
            const propsKeys =Object.keys(propsObj)
            for (let j = 0; j < propsKeys.length; j++) {
              const pk = propsKeys[j]
              attrValue = `{${propsName}.${pk}}`
              node.setAttribute(pk, attrValue)
            }

          }
        } else {
          attrValue = `{${attrName}}`
          node.setAttribute(attrName, attrValue)
        }

      }
    }
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
      if (txtNode.wholeText.trim()) {
        const textNodes = [];
        const expressionStr = txtNode.wholeText;
        const vars = extractVarsV2(expressionStr);
        if (vars.length) {
          let s = 0;
          while(vars.length) {
            const {varName, expName, start, end} = vars.shift();
            let t = expressionStr.substring(s, start);
            console.log(expName, start, end);
            textNodes.push(document.createTextNode(t) );
            t = expName
            if (typeof this.__state[varName] === 'function') {
              // const p1 = varName.indexOf('{')
              // const p2 =varName.lastIndexOf('}')
              // varName = varName.substring(p1 + 1, p2)
              t = `{${varName}()}`
            }
            let tn: any = null;
            let isHtmlNode = false;
            if (expName.startsWith('{!')) {
              isHtmlNode = true;
              tn = document.createComment('')
              const holderForReplace = document.createComment('')
              textNodes.push(holderForReplace)
              t = t.replace('{!', '{');
            } else {
              tn = document.createTextNode(t)
            }

            this.bindNodeExpression(tn as unknown as VELEMENT, {
              expression: "`$" + t + "`",
              vars:[varName]
            } , (result: any) => {
              if (isHtmlNode) {
                tn.previousSibling.replaceWith(document.createRange().createContextualFragment(result));
              } else {
                tn.textContent = result;
              }
            })
            textNodes.push(tn)
            s = end
          }
          if (s < expressionStr.length) {
            const t = expressionStr.substring(s)
            textNodes.push(document.createTextNode(t))
          }
          txtNode.replaceWith(...textNodes)
        }

      }
      // text node stop here
      return;
    }

    this.expandShorthandAttributes(node);

    /*const eachVarName = attrs.find((attr) => {
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
    }*/
    const attrs = node.getAttributeNames()
    console.log('attrs', node, attrs);
    for (let i = 0; i < attrs.length; i++) {
      const attr = node.getAttributeNode(attrs[i])
      const attrName = attr.name as unknown as string;
      const attrValue = attr.value as unknown as string;

      // if (attrName.startsWith(':if-')) { // if expression
      //   console.log('[if]', attrName, attrValue);
      //   this.bindIfNodeAction(node, attrName, attrValue);
      //   continue
      // }

      const attrVars = extractVarsV2(attrValue);
      if (attrVars.length) {
        const vars: string[] = [];
        console.log('attrValue', attrValue)
        let attrStr = attrValue;
        attrVars.forEach((v) => {
          console.log(v)
          let varName = v.expName;
          vars.push(v.varName)
          if (typeof this.__state[v.varName] === 'function') {
            // const p1 = varName.indexOf('{')
            // const p2 =varName.lastIndexOf('}')
            // varName = varName.substring(p1 + 1, p2)
            varName = `{${v.varName}()}`
          }
          attrStr = attrStr.replaceAll(v.expName, "$" + varName + "");
        })
        console.log(attrStr)
        this.bindNodeExpression(node as unknown as VELEMENT, {
          expression: "`" + attrStr + "`",
          vars
        }, (result: any) => {
          // console.log(node, attrName, result)
          node.setAttribute(attrName, result);
        });
      }



      if (attrName.startsWith('.')) {
        console.log('[prop]', attrName, attrValue);
        this.bindAttrNodeAction(node, attrName, attrValue );
      }
      if (attrName.startsWith('@')) {
        const eventName = attrName.substring(1);
        console.log('[event]', attrName, attrValue);
        node.addEventListener(eventName, (evt) => {
          // this.__state[attrValue](evt)
          fastdom.mutate(() => {
            this.sourceRef[attrValue](evt)
          })
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
