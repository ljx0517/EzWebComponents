import * as style from "./ez-t-renderer.less"
const stylesheet = new CSSStyleSheet();
const slice = Array.prototype.slice

function iterativelyWalk(nodes: Node|Node[], check: (n: HTMLElement) => boolean) {
  if (!('length' in nodes)) {
    nodes = [nodes]
  }

  nodes = slice.call(nodes)

  while((nodes as  HTMLElement[]).length) {
    const node = (nodes as  HTMLElement[]).shift()
    const ret = check(node)

    if (ret) {
      return ret
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


const DataSourceHandler: ProxyHandler<any> = {
  get(target: any, prop: string, receiver) {
    // let value = target[prop];
    // return (typeof value === 'function') ? value.bind(target) : value; // (*)
    return Reflect.get(target, prop, receiver);
  },
  set(target: any, prop: string, val, receiver) { // to intercept property writing
    let newVal = val
    if (val && typeof val === 'object') {
      newVal = new DataSourceProxy(val);
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




class DataSourceProxy<T> {
  constructor(source: T) {
    return new Proxy(source, DataSourceHandler);
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
  return new DataSourceProxy(obj)
};


class EzTRenderer extends HTMLElement {


  private beforeCloseHooks:(() => boolean)[] = [];
  private afterCloseHooks: (() => void)[] = [];
  private beforeActiveTabHooks:(() => boolean)[] = [];
  private afterActiveTabHooks: (() => void)[] = [];
  private dataSource:{
  [key: string]: any
} = new DataSourceProxy<{[key: string]: any}>({});
  // private dataSource: {[key: string]: any} = {};

  private varReflectMap: {
    [key: string]: ((args: any) => void)[]
  } = {};
  private vdom: Node;
  private vChildNodes: any[];

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

    this.vChildNodes = [];
    for (let i = 0; i < this.childNodes.length; i++) {
      this.vChildNodes.push(this.childNodes[i])
    }
    this.dispatchEvent( new CustomEvent('created', {detail: this}));
    console.log(22222)
    iterativelyWalk(this.childNodes as unknown as |Node[], this.check)
    // tmpl.remove()
    // this.shadowRoot.append(dom);
    this.dispatchEvent( new CustomEvent('mounted', {detail: this}));
  }
  render() {
    //
  }



  getInternalKey(key: string) {
    return `__ez__|${key}`
  }
  setDataSource(source: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    Object.entries(source).forEach(([key, val]) => {
      // this.dataSource[`__ez__|${key}`] = val;
      if (val && typeof val === "object") {
        source[key] = loopNestedObj(val);
        return
      }
      const internalKey = this.getInternalKey(key)
      self.dataSource[internalKey] = val;
      Object.defineProperty(source, key, {
        get() {
          return self.dataSource[internalKey];
        },

        set(value) {
          self.dataSource[internalKey] = value;
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

  check = (node: HTMLElement): boolean => {
    if (node.nodeType === 8) {
      return ;
    }
    debugger
    console.log('check', node);
    if (node.nodeType === 3) {
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
        if (this.dataSource[internalKey]) {
          action(this.dataSource[internalKey]);
        }
      })
      return
    }

    for (let i = 0; i < node.attributes.length; i++) {
      const attrName = node.attributes[i].name as unknown as string;
      const attrValue = node.attributes[i].value as unknown as string;
      const name = this.getInternalKey(attrName.substring(1));
      debugger // check attrValue is plain value of valur ref
      const internalKey = this.getInternalKey(attrValue);
      if (attrName.startsWith(':') && internalKey in this.dataSource) {
        if (!this.varReflectMap[internalKey]) {
          this.varReflectMap[internalKey] = [];
        }
        this.varReflectMap[internalKey].push((args) => {
          node.attributes[i].value = args;
        });
      }
      if (attrName.startsWith('@') && internalKey in this.dataSource) {
        // this.varReflectMap[internalKey].push((args) => {
        //
        // })
      }

    }


    return false; // true will break walker
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
