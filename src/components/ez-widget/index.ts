import style from "./style.less";
// console.log('style', typeof style.toString())
// import fastdom from './fastdom';
import {Scheduler} from './scheduler';
import {
  ACTOR, COMMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE, EXPRESSION_ACTION, EXPRESSION_REGEX,
  IS_PROXY,
  LOOP_CONDITION_STATEMENT,
  PARENT_PATH, TEXT_NODE, VAR_AND_EXPRESSION,
  VELEMENT
} from './types';
import { IterableWeakSet } from 'iterable-weak-set';
import {IterableWeakMap} from "iterable-weak-map";
// import { TaskRefRunCounter } from './actor-ref-run-counter';
const fastdom = new Scheduler({limit: 100});

const randomLocalsScopeName = `___$locals$___${Date.now()}`
const randomSourceScopeName = `___$source$___${Date.now()}`
// https://gist.github.com/seanlinsley/bc10378fd311d75cf6b5e80394be813d
class ___IterableWeakSet<T> extends Set {
  add(el: any) {
    for (const ref of super.values()) {
      const value = ref.deref()
      if (value == el) {
        return this
      }
    }
    // const ref = new WeakRef(el);
    super.add(new WeakRef(el))
    return this
  }

  forEach(fn: CallableFunction) {
    super.forEach((ref, index) => {
      const value = ref.deref()
      if (value) {fn(value, ref)} else {
        super.delete(ref)
      }
    })
  }
  *[Symbol.iterator]() {
    for (const ref of super.values()) {
      const value = ref.deref()
      if (value) yield value
    }
  }
}



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
const toCamel = (s: string) => {
  return s.replace(/([-_][a-z])/ig, ($1: string) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};


// https://stackoverflow.com/questions/543533/restricting-eval-to-a-narrow-scope
// https://stackoverflow.com/questions/61552/are-there-legitimate-uses-for-javascripts-with-statement
// function ___lambda(exp: string,ctx={}, node:any=null) {
//   if (node) {
//     ctx = new Proxy(ctx,{
//       has:()=>true,
//       get: (target: any, prop: string, receiver) => {
//         console.log( prop, prop in target)
//         return Reflect.get(target, prop, receiver);
//       },
//     })
//   }
//
//   // execute script in private context
//   const func = (new Function( `with(this) {
//    try {
//     return ${exp};
//    } catch(e) {
//    }
//   }`));
//   return func.call(ctx);
// }

const lambda: CallableFunction = (function(){
  const cache: {[key: string]: CallableFunction} = {};

  function expressionTemplate(exp: string){
    let fn = cache[exp];
    if (!fn){
      // fn =(new Function( 'ctx', `with(ctx) { try {return ${exp};} catch(r) {}}`));
      // fn =(new Function( 'ctx', `with(ctx) { return ${exp};}`));
      try{
        fn = (new Function( `ctx, ${randomSourceScopeName}, ${randomLocalsScopeName}`, `
        if (!${randomLocalsScopeName} || !Object.keys(${randomLocalsScopeName}).length) {
          ${randomLocalsScopeName} = {};
        };
        if (!${randomSourceScopeName}|| !Object.keys(${randomSourceScopeName}).length) {
          ${randomSourceScopeName} = {};
        };
        with(ctx) {
          with(${randomSourceScopeName}) {
            with(${randomLocalsScopeName}) {
              return  ${exp};
            }
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
function compileWalker(nodes: Node|Node[]|NodeListOf<ChildNode>, compile: (n: VELEMENT) => LOOP_CONDITION_STATEMENT) {
  if (!('length' in nodes)) {
    nodes = [nodes]
  }
  nodes = slice.call(nodes)
  while((nodes as VELEMENT[]).length) {
    const node = (nodes as  VELEMENT[]).shift()
    node.normalize();
    const ret = compile(node)
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
            expName: template.slice(start, end).trim(),
            varName: template.slice(start + ol, j).trim()
          })
          i = j+1;
          break;
        }
      }
    }
  } while (++i <= (template.length - openChar.length ))

  return data;
}
function replaceAllWithoutRegex(s: string, oldStr: string, newStr: string) {
  // let index = 0;
  // do {
  //   s = s.replace(oldStr, newStr);
  // } while((index = s.indexOf(oldStr, index + 1)) > -1);

  const fromLen = oldStr.length;
  const output = [];
  let pos = 0;
  for (;;) {
    const matchPos = s.indexOf(oldStr, pos);
    if (matchPos === -1) {
      // output += s.slice(pos);
      output.push(s.slice(pos))
      break;
    }
    // output += s.slice(pos, matchPos);
    output.push(s.slice(pos, matchPos))
    // output += newStr;
    output.push(newStr)
    pos = matchPos + fromLen;
  }
  return output.join('');
}
function extractVarsFromObject(obj: any, str: string) {
  const ks = Object.keys(obj).filter(k => {
    // return typeof obj[k] != 'function' && typeof obj[k] != 'object'
    // return typeof obj[k] != 'object'
    return obj[k].constructor.name != 'Object';
  })
  // const re = new RegExp(`\\b(?:${ks.join('|')})\\b`.replaceAll('.', `\\.`), 'g')
  const re = new RegExp(`\\b(?:${ks.join('|')})\\b`.replace(/\./, `\\.`), 'g')
  return str.match(re) || []
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
    if (p === randomSourceScopeName) {
      return false;
    }
    return true;
  },
  get(target: any, prop: string|symbol, receiver) {
    console.log('[internal][state][GET]', prop)
    if (prop === IS_PROXY) {
      return true;
    }
    // if (prop === 'ctx') {
    //   return receiver;
    // }
    /*
    if (prop === 'startRecordExpressionVars') {
      this.recordExpressionVars = new WeakSet()
      return () => {
        //
      };
    }
    if (prop === 'stopRecordExpressionVars') {
      // TODO 如果一个函数内没执行到的块里的变量将记录不到, 咋处理?
      // 除非返回全部state内变量, 或者通过编译,通过Acorn语法树提取变量
      return () => {
        const result = Object.keys(target);
        // const result = Array.from(this.recordExpressionVars)
        try{
          return result;
        } finally {
          this.recordExpressionVars.clear();
          delete this.recordExpressionVars;
        }
      }


    }
    */
    // let value = target[prop];
    // return (typeof value === 'function') ? value.bind(target) : value; // (*)

    /*
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
      // 引起循环调用，应该规避掉循环调用还是注释下面凑合
      // if (typeof target[prop] === 'function') {
        // if (this.recordExpressionVars) {
        //   return target[prop].call(receiver);
        // } else {
        //   return target[prop]();
        // }
      // }

    }*/
    /*if (prop != Symbol.unscopables && String(prop).includes('.')) {
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
    }*/
    return Reflect.get(target, prop, receiver);
  },
  set(target: any, prop: string|symbol, val, receiver) { // to intercept property writing
    console.log('[internal][state][SET]', prop, val)
    if (Object.prototype.hasOwnProperty.call(target, prop)) {
      // return true;
      // throw new Error(`property ${String(prop)} has already been set`);
    }
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

    /*if (prop != Symbol.unscopables && String(prop).includes('.')) {
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
              target[p] = {}; // new StateProxy({});
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
      // target[final] = newVal;
      return Reflect.set(target, final, newVal, receiver);
    }*/
    return Reflect.set(target, prop, newVal, receiver);
  },
  deleteProperty(target: any, prop: string) { // to intercept property deletion
    // delete target[prop];
    // return true;
    return Reflect.deleteProperty(target, prop);
  },
  getOwnPropertyDescriptor(target, prop) {
    let value = undefined;
    /*if (prop != Symbol.unscopables && String(prop).includes('.')) {
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
    } else {*/
      value = Object.prototype.hasOwnProperty.call(target, prop)
    // }
    if (value && value != undefined) {
      return {
        value : value,
        //use a logical set of descriptors:
        enumerable : true,
        configurable : true,
        writable : true
      };
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


export class EzWidget extends HTMLElement {

  private __state: Record<string, any> = new StateProxy<Record<string, any>>({});

  private varExpressionObj: {[key: string]: Set<EXPRESSION_ACTION|Node>} = {};
  private expressionNodeMap = new WeakMap();

  private nodePositionMap = new WeakMap();
  private compileContentNodeMap = new WeakMap();

  public nodeActorsMap = new WeakMap<VELEMENT|Text, Set<ACTOR>>()
  public varBindNodeObj: {[key: string]:  IterableWeakSet<any>} = {};
  public nodeBindVarObj = new WeakMap<VELEMENT|Text, Set<string>>();
  public varBindActorsMap: {[key: string]:  Set<ACTOR>} = {};

  // weakmap cannot loop
  public nodeBindActorsMap = new IterableWeakMap<VELEMENT|Text, Set<ACTOR>>();
  // public fnNodesSet = new  IterableWeakSet<VELEMENT|Text>();

  private cacheIfTagDomFragment: DocumentFragment;
  private cacheLoopTagDomFragment: DocumentFragment;

  // for internal change value
  private sourceRef: any;
  private gcRegistry: FinalizationRegistry<unknown>;

  constructor() {
    super();
    // console.log('constructor')
    // element created
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [stylesheet];


    shadow.innerHTML = `
       <slot></slot>
    `.replace(/[\s\n]*\n[\s\n]*/g, '');

    this.gcRegistry = new FinalizationRegistry(heldValue => {
      console.log('gcRegistry', heldValue)
      debugger
      // ....
    });
  }

  connectedCallback() {
    // browser calls this method when the element is added to the document
    // (can be called many times if an element is repeatedly added/removed)
    // Only actually parse the stylesheet when the first instance is connected.
    if (stylesheet.cssRules.length == 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      //   stylesheet.replaceSync(style.toString());
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
    this.dispatchEvent(new CustomEvent('created', {bubbles: true,detail: this}));
    // console.log(22222)
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
  makeStateReflectable(state: {[p: string]: any}, source: any, root='') {
    // console.log('root', root);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = source[key]
      const pathKey = `${root ? `${root}.` : ''}${key}`;
      const internalKey = this.getInternalKey(pathKey)
      // console.log('internalKey', internalKey)
      // if (DirtyableValue.isPrimitiveValue(val)) {
      //   val = new DirtyableValue(val, internalKey);
      // }
      state[internalKey] = val; // new DirtyableValue(val, internalKey);
      if (typeof val === 'function') {
        continue
      }

      if (isReflectable(val)) {
        self.makeStateReflectable(state, val, pathKey);
        continue;
      }
      Object.defineProperty(source, key, {
        get() { // ? 嵌套Object，应该从内部__state取还是外部source取？，内部外部取都会产生循环调用
          console.log('[external][state] [GET]',internalKey, state[internalKey]);
          return state[internalKey];
        },

        set(value) {
          console.log('[external][state] [SET]', internalKey, value);
          if (isReflectable(value)) {
            self.makeStateReflectable(state, value, pathKey);
            return
          }
          if (typeof value === 'function') {debugger
            // self.__state[internalKey] = self.bindStateFunction(value)
            value = bindFunctionScope(source ,value)
          }
          const beforeValue = state[internalKey];
          if (beforeValue === value) {
            return
          }
          state[internalKey] = value // new DirtyableValue(value, internalKey);

         const actsArr = [];
          console.log(1000, internalKey)
          const actors = self.varBindActorsMap[internalKey];
          // actors && self.runActors(actors);
          actsArr.push(actors)
          for (const [el, actors] of self.nodeBindActorsMap) {
          //   console.log(el)
          //   // const actors = self.nodeBindActorsMap.get(el);
          //   // actors && self.runActors(actors);
            actsArr.push(actors)
          }
          self.requestUpdate(internalKey, actsArr)
          // self.varBindActorsMap
          // self.nodeBindActorsMap

        }
      });
    }
  }

  private isUpdatePending = false;
  private enableUpdating:  (...args: any) => void = null;
  private __updatePromise: Promise<any> = null;//new Promise((res) => (this.enableUpdating = res));
  private _$changedProperties = new Map();
  async __enqueueUpdate() {
    this.isUpdatePending = true;
    try {
      // this.__updatePromise = new Promise((res) => (this.enableUpdating = res));
      // Ensure any previous update has resolved before updating.
      // This `await` also ensures that property changes are batched.
      await this.__updatePromise;
    }
    catch (e) {
      // Refire any previous errors async so they do not disrupt the update
      // cycle. Errors are refired so developers have a chance to observe
      // them, and this can be done by implementing
      // `window.onunhandledrejection`.
      Promise.reject(e);
    }
    const result = this.scheduleUpdate();
    // If `scheduleUpdate` returns a Promise, we await it. This is done to
    // enable coordinating updates with a scheduler. Note, the result is
    // checked to avoid delaying an additional microtask unless we need to.
    if (result != null) {
      await result;
    }
    return !this.isUpdatePending;
  }
  /**
   * Controls whether or not `update()` should be called when the element requests
   * an update. By default, this method always returns `true`, but this can be
   * customized to control when to update.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  // shouldUpdate(_changedProperties) {
  //   return true;
  // }
  // willUpdate(_changedProperties) { }
  __markUpdated() {
    this._$changedProperties = new Map();
    this.isUpdatePending = false;
    console.log('this.updateComplete', this.updateComplete)
    // if (this.enableUpdating) {
    //   this.enableUpdating(true)
    //   this.enableUpdating = null;
    // }
    // this.updateComplete.then(() => {
    //   console.log(55555, this.updateComplete)
    // })
  }
  performUpdate() {
    // var _a, _b;
    // Abort any update if one is not pending when this is called.
    // This can happen if `performUpdate` is called early to "flush"
    // the update.
    if (!this.isUpdatePending) {
      return;
    }

    let shouldUpdate = false;
    const changedProperties = this._$changedProperties;
    try {
      // shouldUpdate = this.shouldUpdate(changedProperties);
      // if (shouldUpdate) {
      //   this.willUpdate(changedProperties);
      //   (_b = this.__controllers) === null || _b === void 0 ? void 0 : _b.forEach((c) => { var _a; return (_a = c.hostUpdate) === null || _a === void 0 ? void 0 : _a.call(c); });
      //   this.update(changedProperties);
      // }
      // else {
      //   this.__markUpdated();
      // }
      changedProperties.forEach((v: Set<ACTOR>[], k: string) => {console.log('changedProperties', k)
        v && v.forEach((acts) => {
          acts && acts.forEach((act) => {
            act();
          })
        })
      });
      this.__markUpdated();
    }
    catch (e) {
      // Prevent `firstUpdated` and `updated` from running when there's an
      // update exception.
      shouldUpdate = false;
      // Ensure element can accept additional updates after an exception.
      this.__markUpdated();
      throw e;
    }
    // The update is no longer considered pending and further updates are now allowed.
    // if (shouldUpdate) {
    //   this._$didUpdate(changedProperties);
    // }
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  get updateComplete() {
    return this.__updatePromise;
  }
  requestUpdate(name: string, actorsArray:Set<ACTOR>[]) {
    if (name !== undefined) {
        if (!this._$changedProperties.has(name)) {
          this._$changedProperties.set(name, actorsArray);
        }
        // Add to reflecting properties set.
        // Note, it's important that every change has a chance to add the
        // property to `_reflectingProperties`. This ensures setting
        // attribute + property reflects correctly.
        // if (options.reflect === true && this.__reflectingProperty !== name) {
        //   if (this.__reflectingProperties === undefined) {
        //     this.__reflectingProperties = new Map();
        //   }
        //   this.__reflectingProperties.set(name, options);
        // }

    }
    if (!this.isUpdatePending) {
      this.__updatePromise = this.__enqueueUpdate();
    }
    // Note, since this no longer returns a promise, in dev mode we return a
    // thenable which warns if it's called.
    // return DEV_MODE
    //     ? requestUpdateThenable(this.localName)
    //     : undefined;
  }
  runActors(actors: Set<ACTOR>) {
    for (const act of actors) {
      console.log('run actor')
      // fastdom.mutate(act)
      act()
    }
    // actors.forEach((act: ACTOR) => {
    //   // this.actorRefCounter.add(act);
    //   console.log('run actor')
    //   fastdom.mutate(act)
    // });
  }
  setState(source: any) {
    this.sourceRef = source;
    this.makeStateReflectable(this.__state, source);
    this.render();
    // this.dispatchEvent(new CustomEvent('ready', {bubbles: true,detail: this}));
  }
  removeNode(node: VELEMENT) {
    // const index = Array.from(node.parentNode.children).indexOf(node);
    const next = node.nextSibling
    const prev = node.previousSibling
    this.nodePositionMap.set(node, {
      parent: node.parentElement,
      next,
      prev
    });
    this.cacheIfTagDomFragment.appendChild(node);
  }
  restoreRemoveNode(node: VELEMENT) {
    const info = this.nodePositionMap.get(node);
    if (!info) {
      return;
    }
    const {parent, next, prev} = info;
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
  bindVarToNode(varName: string, node: VELEMENT) {
    if (!this.varBindNodeObj[varName]) {
      this.varBindNodeObj[varName] = new IterableWeakSet<VELEMENT>();
    }
    this.varBindNodeObj[varName].add(node)
    if (!this.nodeBindVarObj.get(node)) {
      this.nodeBindVarObj.set(node, new Set<string>())
    }
    this.nodeBindVarObj.get(node).add(varName)
  }
  bindNodePropAction(node: VELEMENT, attrName: string, attrValue: string) {
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




  bindNodeExpression(node: VELEMENT, exp: VAR_AND_EXPRESSION, action: CallableFunction) {
    let lambdaFn: CallableFunction;
    if (exp.runtimeFn) {
      lambdaFn = exp.runtimeFn
    } else {
      lambdaFn = lambda(exp.expression)
    }



    exp.vars.forEach((v: string) => {return
      if (!Object.prototype.hasOwnProperty.call(this.__state, v)) {
        return;
      }
      if (typeof this.__state[v] == 'function') {
        return
      }
      this.bindVarToNode(v, node)
    });
    const compileVar = () => {
      // 应该是不需要了，不需要运行时采集变量了
      return
      if (!node.parentNode) {
        return
      }
      const scope = this.getNodeCompileScope(node);
      let result = null
      if (exp.monitState) {
        this.__state.startRecordExpressionVars();
        result = lambdaFn(this.__state, this.sourceRef, scope);
        const vars = this.__state.stopRecordExpressionVars();
        vars.forEach((v: string) => {
          this.bindVarToNode(v, node);
        });
      } else {
        result = lambdaFn(this.__state, this.sourceRef,  scope);
      }

      return result
    }

    const actor: ACTOR =  ((result :string) => {
      if (!result) {
        const scope = this.getNodeCompileScope(node);
        // const fnStr = lambdaFn.toString().slice(275)
        // console.log(fnStr)
        result = lambdaFn( this.__state, this.sourceRef, scope)
      }
      action(result)
      // node.textContent = result;
    });


    exp.vars.forEach((v: string) => {
      // if (!Object.prototype.hasOwnProperty.call(this.__state, v)) {
      //   return;
      // }
      if (typeof this.__state[v] == 'function') {
        this.doBindNodeToActor(node, actor)
      } else {
        this.doBindVarToActor(v, actor)
      }
    });
    // actor.stack = new Error();
    // actor.node = node;
    // actor();
    // this.bindNodeActor(node, actor, compileVar);
  }

  doBindVarToActor(varName: string, actor: ACTOR) {
    if (!this.varBindActorsMap[varName]) {
      this.varBindActorsMap[varName] = new Set<ACTOR>();
    }
    this.varBindActorsMap[varName].add(actor)
    fastdom.mutate(actor)
    // actor()
  }

  doBindNodeToActor(node: VELEMENT, actor: ACTOR) {
    // this.fnNodesSet.add(node);
    if (!this.nodeBindActorsMap.get(node)) {
      this.nodeBindActorsMap.set(node, new Set<ACTOR>());
    }
    this.nodeBindActorsMap.get(node).add(actor)
    fastdom.mutate(actor)
    // actor()
  }

  bindNodeLoop(node: VELEMENT, loopVarName: string, bindVar: string, eachKey = '') {
    const begin = document.createComment(`each ${bindVar} of ${loopVarName}`)
    const end = document.createComment(`end each`)
    node.parentNode.insertBefore(begin, node)
    node.parentNode.insertBefore(end, node.nextSibling)
    debugger
    this.cacheLoopTagDomFragment.appendChild(node)
    // if (typeof this.__state[loopVarName] !== 'function') {
    //   this.bindVarToNode(loopVarName, node)
    // }
    const exp: VAR_AND_EXPRESSION = {
      expression: `${loopVarName}`,
      vars: new Set([loopVarName]),
      // TODO loop 里的这个应该是返回操作,例如,del => 0,1 append 4, 5, and 2, 3 no change
      // runtimeFn: () => {}
    }
    // const lambdaFn = lambda(exp.expression)
    const patchItems = (old_blocks: any[], list: any[], keyName: string, bindVar:string) => {
      // const nodeCompileContext = this.compileContentNodeMap.get(next);
      // old_list.push(nodeCompileContext[bindVar].item)
      let o = old_blocks.length;
      let n = list.length;
      const old_indexes:{[key: string]: any} = {}
      let i = o;
      const lookup = new Map()
      while (i--) {
        const nodeCompileContext = this.compileContentNodeMap.get(old_blocks[i]);
        const k = nodeCompileContext[bindVar]['item'][keyName]
        old_indexes[k] = i;
        lookup.set(k, old_blocks[i])
      }
      console.log('old_indexes', old_indexes)

      // const lookup = new Map()
      // old_blocks.forEach(b => {
      //   // lookup.set(b[key], new Node(b.key))
      //   lookup.set(b[keyName], b)
      // })

      const new_blocks = [];
      const new_lookup = new Map();
      const deltas = new Map();
      i = n
      while (i--) {
        const key = list[i][keyName];
        let block = lookup.get(key);
        // 这个block 应该对节点操作了?
        if (!block) { // 新node, create it
          // block = create_each_block(key, child_ctx);
          // block.c();
          // console.log('create', key);
          block = node.cloneNode(true) as VELEMENT;

          // const nodeCompileContext = this.compileContentNodeMap.get(block);
          // this.compileContentNodeMap.set(block, {
          //   // ...nodeCompileContext,
          //   [bindVar]: {
          //     item: list[i], index: i, key
          //   },
          // })

          block.___uniqueItemKey = key;
          block['detach'] = () => {
            const varNames = this.nodeBindVarObj.get(block)
            varNames && varNames.forEach(v => {
              const iterSet = this.varBindNodeObj[v]
              iterSet.forEach((el: any, ref: WeakRef<any>) => {
                if (el === block) {
                  iterSet.delete(ref)
                }
              })
            })
            this.nodeActorsMap.delete(block)
          }
          // block = new Node(key)
        } else { // is old, only update it
          // block.p(child_ctx, dirty);
          // block.update(key)
          console.log('update', key);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
          deltas.set(key, Math.abs(i - old_indexes[key]));
      }
      let next: any = end;
      const will_move = new Set();
      const did_move = new Set();

      const destroy = (block: VELEMENT, lookup: Map<any, any>) => {
        // const nodeCompileContext = this.compileContentNodeMap.get(block);
        // const k = nodeCompileContext[bindVar]['item'][keyName]
        lookup.delete(block.___uniqueItemKey);
        block.remove()
        block.detach()
        this.gcRegistry.register(block, `block-${String(block.___uniqueItemKey)}`);
        console.log('destory', block, lookup )
      }
      const insert = (block: VELEMENT) => {

        // console.log('insert', next? 'prev' : 'append', block)
        lookup.set(block.___uniqueItemKey, block);
        if (next) {
          end.parentNode.insertBefore(block, next);
        } else {
          end.parentNode.appendChild(block);
        }
        const item = list[n-1]
        const index = n;
        const nodeCompileContext = this.compileContentNodeMap.get(block);
        this.compileContentNodeMap.set(block, {
          ...nodeCompileContext,
          [bindVar]: {
            item, index, key: block.___uniqueItemKey
          },
        });
        compileWalker(block as VELEMENT, this.compile)
        next = block;
        n--;
      }

      while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        // const new_key = new_block.id;
        // const old_key = old_block.key;
        const new_key = new_block.___uniqueItemKey;
        const old_key = old_block.___uniqueItemKey;
        if (new_block === old_block) {
          next = new_block.first;
          o--;
          n--;
        } else if (!new_lookup.has(old_key)) {
          // remove old block
          destroy(old_block, lookup);

          o--;
        } else if (!lookup.has(new_key) || will_move.has(new_key)) {
          insert(new_block);
        } else if (did_move.has(old_key)) {
          o--;
        } else if (deltas.get(new_key) > deltas.get(old_key)) {
          did_move.add(new_key);
          insert(new_block);
        } else {
          will_move.add(old_key);
          o--;
        }
      }
      while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block[keyName])) {
          destroy(old_block, lookup);

        }
      }
      while (n) {
        insert(new_blocks[n - 1]);
      }
      return new_blocks
    }



    this.bindNodeExpression(node, exp, (result: any) => {
      // let originResult = node.___bind_meta;console.log(exp)
      // if (!originResult||!Array.isArray(originResult)) {
      //   originResult = [];
      // }
      const old_list = [];
      let start = begin.nextSibling;
      while(start && start != end) {
        const next = start.nextSibling;

        // const nodeCompileContext = this.compileContentNodeMap.get(next);
        // old_list.push(nodeCompileContext[bindVar].item)
        old_list.push(start)
        start = next;
      }
      patchItems(old_list, result, eachKey, bindVar);
      // node.___bind_meta = result;
    })
  }

  bindNodeProp(node: VELEMENT, propName: string, valueExp: string) {
    const prop = propName.substring(1)
    node.removeAttribute(propName);
    node.addEventListener('input', (e) => {
      // this.__state[valueExp] = node[prop]
      const paths = valueExp.split('.')
      let target = this.sourceRef;
      const final = paths.pop();
      while(paths.length) {
        const p = paths.shift()
        target = target[p]
      }
      let nodeType = node.type;
      if (nodeType === 'range') {
        nodeType = 'number'
      }
      const asType = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
      let valProp = `${prop}As${asType}`;
      if(typeof node[valProp] == 'undefined') {
        valProp = prop
      }
      target[final] = node[valProp]
    });
    this.bindNodeExpression(node, {
      expression: valueExp,
      vars: new Set([valueExp])
    }, (result: string) => {
      // const asType = result.charAt(0).toUpperCase() + result.slice(1);
      // if (prop == 'value') {
      //   const testProp = `valueAs${asType}`;
      // }
      node[prop] = result
    });
  }

  getSourcePropByName = (dotName: string) => {
    const props = String(dotName).split('.');
    const final = props.pop();
    let layer = this.sourceRef;
    let p = null;
    for (let i = 0; i < props.length; i++) {
      p = props[i];
      if (typeof layer[p] === 'undefined') {
        return undefined
      }
      layer = layer[p]
    }
    if ( typeof layer[final] === 'function') {
      return layer[final].bind(layer)
    }
    return layer[final]
  }


  bindStateFunction(fn: () => void) {
    return (function() {
      return eval(fn.toString());
    }).call(this.__state)
  }
  bindNodeActor(node: VELEMENT|Text, actor: ACTOR, compileVar: CallableFunction) {
    if (!this.nodeActorsMap.get(node)) {
      this.nodeActorsMap.set(node, new Set<ACTOR>())
      // this.nodeActorsMap.set(node, new IterableWeakSet<ACTOR>())
    }
    this.gcRegistry.register(actor, "gc actor fn");
    this.nodeActorsMap.get(node).add(actor);
    fastdom.mutate(actor)
    // fastdom.measure(() => {
    //   const result = compileVar()
    //   fastdom.mutate(() => {
    //     actor(result);
    //   })
    // })
    // this.compileVarQueue.add(compileVar)
    // if (!this.compileVarNodes.get(node)) {
    //   this.compileVarNodes.set(node, new WeakSet())
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
  isTrigger(attrName: string) {
    return attrName.startsWith('@')
  }
  isValidExpression(expStr: string) {
    return !!expStr.replace(/{/g, '').replace(/}/g, '').trim().length
  }
  compile = (node: VELEMENT): LOOP_CONDITION_STATEMENT => {
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
            // console.log(expName, start, end);
            const vv = extractVarsFromObject(this.__state, expName)
            textNodes.push(document.createTextNode(t) );
            t = expName

            if (typeof this.__state[varName] === 'function') {
              // const p1 = varName.indexOf('{')
              // const p2 =varName.lastIndexOf('}')
              // varName = varName.substring(p1 + 1, p2)
              // debugger
              // t = `{${varName}()}`
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
            if(!this.isValidExpression(t)) {
              continue
            }
            this.bindNodeExpression(tn as unknown as VELEMENT, {
              expression: "`$" + t + "`",
              vars: new Set([varName, ...vv])
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
      return LOOP_CONDITION_STATEMENT.CONTINUE;
    }

    this.expandShorthandAttributes(node);
    const attrs = node.getAttributeNames()
    const eachVarName = attrs.find((attr) => {
       return attr.startsWith(':each-')
     });

     const isLoopNode = Boolean(eachVarName);


     if (isLoopNode) {
       if (eachVarName.startsWith(':each-')) { // each expression
         const keyAttr = node.getAttribute(':each-key')
         if (!keyAttr) {
           throw new Error('each expression need key')
         }
        node.removeAttribute(':each-key')

         const attrValue = node.getAttribute(eachVarName)
         // console.log('[each]', eachVarName, attrValue);
         let loopVar = toCamel(eachVarName.replace(':each-', '')  )
         let bindVar = attrValue
         // const eachPlaceHolder = document.createComment(`each ${attrValue } of ${loopVar}`) as unknown as VELEMENT
         // node.parentNode.insertBefore(eachPlaceHolder, node.nextSibling)
         node.removeAttribute(eachVarName)
         const loopItemVars = extractVarsV2(loopVar)
         if (loopItemVars[0]) {
           const { varName } = loopItemVars[0];
           loopVar = varName
           // console.log('[each] [loopVar]', loopVar)
         }
         const eachItemVars = extractVarsV2(attrValue)
         if (eachItemVars[0]) {
           const { varName } = eachItemVars[0];
           bindVar = varName
           // console.log('[each] [bindVar]', bindVar)
         }
         let loopExpression = loopVar;
         if (typeof this.__state[loopVar] === 'function') { // 是方法的话应该按attribute原样显示
           loopExpression = `${loopVar}()`
         }
         this.bindNodeLoop(node, loopVar, bindVar, keyAttr);
         return LOOP_CONDITION_STATEMENT.CONTINUE;
       }

     }

    // console.log('attrs', node, attrs);
    for (let i = 0; i < attrs.length; i++) {
      const attr = node.getAttributeNode(attrs[i])
      const attrName = attr.name as unknown as string;
      const attrValue = attr.value as unknown as string;

      if (attrName.startsWith(':if-')) { // if expression
        // console.log('[if]', attrName, attrValue);
        const ifPlaceHolder = document.createComment(`if ${attrName}==${attrValue}`) as unknown as VELEMENT
        // node.parentNode.insertBefore(ifPlaceHolder, node)
        node.parentNode.insertBefore(ifPlaceHolder, node.nextSibling)
        node.removeAttribute(attrName)
        const vars = extractVarsV2(attrValue)
        if (vars[0]) { // should only one
          let { varName } = vars[0];
          let vv: string[] = [];
          if (typeof this.__state[varName] === 'function') {
            varName = `${varName}()`
          } else {
            vv = extractVarsFromObject(this.__state, varName)
          }
          const conditionExpr = `${attrName.substring(4)} === ${varName}`

          this.bindNodeExpression(node as unknown as VELEMENT, {
            expression: conditionExpr,
            vars: new Set(vv)
          } , (result: any) => {
            if (!result) {
              this.removeNode(node);
            } else {
              this.restoreRemoveNode(node);
            }
          })
        }
        continue
      }

      if (attrName.startsWith('.')) {
        console.log('[prop]', attrName, attrValue);
        const vars = extractVarsV2(attrValue)
        if (vars[0]) { // should only one
          this.bindNodeProp(node, attrName, vars[0].varName );
        }
        continue
      }


      const attrVars = this.isTrigger(attrName) ? [] : extractVarsV2(attrValue);
      if (attrVars.length) {
        const vars: Set<string> = new Set([]);
        // console.log('attrValue', attrValue)
        let attrStr = attrValue;
        attrVars.forEach((v) => {
          // console.log(v)
          const extVars = extractVarsFromObject(this.__state, v.varName);
          extVars.forEach(ev=> {
            let varName = ev;
            const attrVar = this.__state[ev]
            if (typeof attrVar === 'undefined') {
              return
            }
            if (typeof attrVar === 'function') {
              // varName = `${ev}()`  // 方法名, 不能执行，删除方法属性
              node.removeAttribute(attrName)
              return
            }
            // const re = new RegExp(v.expName, 'g')
            // attrStr = attrStr.replace(re, "${" + varName + "}");
            attrStr = replaceAllWithoutRegex(attrStr, v.expName, "${" + varName + "}" )
            // attrStr = attrStr.replaceAll(v.expName, "$" + varName + "");
            vars.add(ev)
          })

        })
        // console.log(attrStr)
        if (vars.size) {
          this.bindNodeExpression(node as unknown as VELEMENT, {
            expression: "`" + attrStr + "`",
            vars
          }, (result: any) => {
            // console.log(node, attrName, result)
            node.setAttribute(attrName, result);
          });
        }

      }

      if (attrName.startsWith('@')) {
        node.removeAttribute(attrName)
        const eventName = attrName.substring(1);
        console.log('[event]', attrName, attrValue);
        const callbacks = extractVarsV2(attrValue);
        let callback = attrValue;
        if (callbacks && callbacks.length) {
          for (let j = 0; j < callbacks.length; j++) {
            const cb = callbacks[j];
            let cbName: any = cb;
            if (cb && cb.varName) {
              cbName = cb.varName
            }
            if (this.__state[cbName] ) {
              callback = cbName
            }
          }
        }
        console.log('callback', callback)
        node.addEventListener(eventName, (evt) => {
          // this.getSourcePropByName(callback).call(this.sourceRef, evt)
          this.getSourcePropByName(callback)(evt)
          // this.sourceRef['user']['toggle'](evt)
          // fastdom.mutate(() => {
          //   this.sourceRef[callback](evt)
          // })
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
