import * as style from "./ez-renderer.less"
const slice = Array.prototype.slice
const stylesheet = new CSSStyleSheet();
const isObject = (v: any) => typeof v === 'object' && v !== null;
interface ISource {
  [key: string]: any
}


function iterativelyWalk(nodes:  ChildNode|ChildNode[], cb: (node: HTMLElement) => boolean) {
  if (!('length' in nodes)) {
    nodes = [nodes]
  }

  nodes = slice.call(nodes)

  while((nodes as HTMLElement[]).length) {
    const node = (nodes as HTMLElement[]).shift();
    const ret = cb(node)

    if (ret) {
      return ret
    }

    if (node.childNodes && node.childNodes.length) {
      nodes = slice.call(node.childNodes).concat(nodes)
    }
  }
}

const loopNestedObj = (obj: any, proxy: (obj: any) => void) => {
  Object.entries(obj).forEach(([key, val]) => {
    if (val && typeof val === "object") {
      loopNestedObj(val, proxy); // recurse.
    } else {
      console.log(key, val);
      obj[key] = val && typeof val == "object" ? proxy(val) : val
    }
  });
  return obj
};

class EzRenderer extends HTMLElement {


  private beforeCloseHooks:(() => boolean)[] = [];
  private afterCloseHooks: (() => void)[] = [];
  private beforeActiveTabHooks:(() => boolean)[] = [];
  private afterActiveTabHooks: (() => void)[] = [];
  private dataSource: ISource;
  private nodeToProxyFnMap : {[key: string]: () => any} = {};
  private nodeToProxyAttrMap: {[key: string]: HTMLElement} = {};
  private txtVarRegex= /\{\{(.*)\}\}/g;
  private dom: Node;
  private vdom: Node;

  constructor() {
    super();
    // element created
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [stylesheet];

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


    this.dispatchEvent(new CustomEvent('ready', { detail: this}))
  }

  render() {
    // const html = `
    //
    // `.replace(/[\s\n]*\n[\s\n]*/g, '');
    // this.dom = new DOMParser().parseFromString(html, 'text/xml');
    // const children = this.dom.childNodes as unknown as ChildNode[];
    const children = this.querySelector('*')
    iterativelyWalk(children, this.check)
    // this.vdom = this.dom.cloneNode(true)
    // shadow.innerHTML =  html
    this.shadowRoot.appendChild(children);
  }
  proxy(source: ISource) {
    return new Proxy(source, {
      get(target, prop, receiver) {

        // if (typeof value === 'function') ? value.bind(target) : value; // (*)
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop: string, val, receiver) { // to intercept property writing
        target[prop] = val;
        return true;
      },
      deleteProperty(target, prop: string) { // to intercept property deletion
        delete target[prop];
        return true;
      },
      ownKeys(target) { // to intercept property list
        return Object.keys(target).filter(key => !key.startsWith('_'));
      }
    });
  }

  setDataSource(source: ISource) {
    console.log('set data source');
    this.dataSource = loopNestedObj(source, this.proxy)
    // this.dataSource = this.proxy(source);
    this.render();
  }
  extractText(text: string) {
    const arr = this.txtVarRegex.exec(text);
    return arr[1];
  }
  check = (node: HTMLElement|Text): boolean => {
    if (node.nodeType == 3 && (node as Text).wholeText.includes('{{')) {
      const name = this.extractText((node as Text).wholeText)
      if (name in this.dataSource) {
        this.nodeToProxyFnMap[name] = () => {
          console.log(`text ${name} fn`)
        }
      }
      return
    }
    for (let i = 0; i < (node as HTMLElement).attributes.length; i++) {
      const {name: attrName} = (node as HTMLElement).attributes[i];
      const name = attrName.substring(1)
      if (attrName.startsWith(':') && name in this.dataSource) {
        this.nodeToProxyAttrMap[name] = (node as HTMLElement)
      }
      if (attrName.startsWith('@') && name in this.dataSource) {
        this.nodeToProxyFnMap[name] = this.dataSource[name].bind(this.dataSource)
      }
    }
    return false;
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
customElements.define("ez-renderer", EzRenderer);
