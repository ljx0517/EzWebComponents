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
type VELEMENT  = HTMLElement & {dirty: boolean}
function lambda(exp: string){
  const sanitized = `console.log(obj);with(obj){return ${exp}}`
  return Function('obj', sanitized);
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

const stylesheet = new CSSStyleSheet();
const slice = Array.prototype.slice

function walk(nodes: Node|Node[], check: (n: VELEMENT) => LOOP_CONDITION_STATEMENT) {
  if (!('length' in nodes)) {
    nodes = [nodes]
  }

  nodes = slice.call(nodes)

  while((nodes as  VELEMENT[]).length) {
    const node = (nodes as  VELEMENT[]).shift()
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


const StateHandle: ProxyHandler<any> = {
  get(target: any, prop: string, receiver) {
    // let value = target[prop];
    // return (typeof value === 'function') ? value.bind(target) : value; // (*)
    return Reflect.get(target, prop, receiver);
  },
  set(target: any, prop: string, val, receiver) { // to intercept property writing
    let newVal = val
    if (val && typeof val === 'object') {
      newVal = new StateProxy(val);
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
    if (val && typeof val === "object") {
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
  // private dataSource: {[key: string]: any} = {};

  private varReflectMap: {
    [key: string]: ((args: any) => void)[]
  } = {};
  private expressionNodeMap = new WeakMap();
  private originalChildNodes: any[];
  private virtualChildNodes: any[];

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

    this.originalChildNodes = [];
    for (let i = 0; i < this.childNodes.length; i++) {
      const n = this.childNodes[i];
      if(n.nodeType == COMMENT_NODE
        || n.nodeType == DOCUMENT_FRAGMENT_NODE
        || n.nodeName == 'SCRIPT') {
        continue;
      }
      this.originalChildNodes.push(this.childNodes[i].cloneNode(true))
    }
    this.dispatchEvent(new CustomEvent('created', {detail: this}));
    console.log(22222)
    walk(this.originalChildNodes as unknown as |VELEMENT[], this.check)
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
  setState(source: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    Object.entries(source).forEach(([key, val]) => {
      // this.dataSource[`__ez__|${key}`] = val;
      if (val && typeof val === "object") {
        source[key] = loopNestedObj(val);
        return
      }
      const internalKey = this.getInternalKey(key)
      self.__state[internalKey] = val;
      Object.defineProperty(source, key, {
        get() {
          return self.__state[internalKey];
        },

        set(value) {
          self.__state[internalKey] = value;
          if (self.varReflectMap[internalKey]) {
            self.varReflectMap[internalKey].forEach(fn => {
              fn(value)
            })
          }
        }
      });

    })
    // this.dataSource = loopNestedObj(source);
    // this.dataSource = source; ;
    this.render();
  }

  check = (node: VELEMENT): LOOP_CONDITION_STATEMENT => {
    node.dirty = false;
    if (node.nodeName == 'SCRIPT') {
      return;
    }
    if (node.nodeType === COMMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE) { // comment & DOCUMENT_FRAGMENT_NODE
      return ;
    }




    console.log('check', node.nodeType, node.nodeName, node);
    if (node.nodeType === TEXT_NODE) {
      const txtNode = (node as unknown as Text)
      const vars = extractVars(txtNode.wholeText);
      vars.forEach((key) => {
        const internalKey = this.getInternalKey(key);
        if (!this.varReflectMap[internalKey]) {
          this.varReflectMap[internalKey] = [];
        }
        const action = (args: any) => {
          node.textContent = args
        }
        this.varReflectMap[internalKey].push(action);
        debugger
        if (this.__state[internalKey]) {
          action(this.__state[internalKey]);
        }
      })
      return
    }

    for (let i = 0; i < node.attributes.length; i++) {
      const attrName = node.attributes[i].name as unknown as string;
      const attrValue = node.attributes[i].value as unknown as string;
      const name = this.getInternalKey(attrName.substring(1));
      let internalKey = this.getInternalKey(attrValue);
      // if (node.tagName === 'IF') {
      //   const exp = `${attrName.substring(1)} === ${attrValue}`;
      //   const result = lambda(exp)(this.__state)
      //   debugger
      //   if (!result) {
      //     return LOOP_CONDITION_STATEMENT.CONTINUE
      //   }
      // }

      // check attrValue is plain value of valur ref
      if (attrName.startsWith(':') && node.tagName === 'IF') { // if expression
        const exp = `${attrName.substring(1)} === ${attrValue}`;
        this.expressionNodeMap.set(lambda(exp), node)
      }
      if (attrName.startsWith(':each-')) { // for loop
        internalKey = this.getInternalKey(attrName.replace(':each-', ''))
        if (!this.varReflectMap[internalKey]) {
          this.varReflectMap[internalKey] = [];
        }
        this.varReflectMap[internalKey].push((args) => {
          node.attributes[i].value = args;
        })
      }

      if (attrName.startsWith(':') && internalKey in this.__state) {
        if (!this.varReflectMap[internalKey]) {
          this.varReflectMap[internalKey] = [];
        }
        this.varReflectMap[internalKey].push((args) => {
          node.attributes[i].value = args;
        });
      }
      if (attrName.startsWith('@') && internalKey in this.__state) {
        // this.varReflectMap[internalKey].push((args) => {
        //
        // })
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
