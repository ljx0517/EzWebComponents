import style from "./style.module.less";
import linkStyle from "./link.module.less";




const stylesheet = new CSSStyleSheet();
const linkStylesheet = new CSSStyleSheet();
type BASE_ROUTE = {
  // path: string;
  pathReg: RegExp
  params?: {[key: string]: string|number}
}
type ROUTE_CONF =  {
  redirect?: BASE_ROUTE,
  children?: {[key: string]: ROUTE}
  paramsGroups:{[key: string]: number}
  params?: {[key: string]: string|number}
  query?: {[key: string]: string|number}
  content: ROUTE_CONTENT,
  build: boolean
}
type ROUTE = BASE_ROUTE & ROUTE_CONF;
type ROUTE_CALLBACK = (args: any) => ROUTE_CONTENT;
type ROUTE_CONTENT = string | HTMLElement | NodeListOf<ChildNode> | ROUTE_CALLBACK;


class EzRouterLink extends HTMLElement{
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [linkStylesheet];
    shadow.innerHTML = `<slot class="${linkStyle.routerLink}"></slot>`
        .replace(/[\s\n]*\n[\s\n]*/g, '');
  }

  connectedCallback() {
    if (linkStylesheet.cssRules.length == 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      linkStylesheet.replaceSync(linkStyle.toString());
    }
  }

  disconnectedCallback() {
    //
  }

}
class EzHashRouter extends HTMLElement {
  historyStack:ROUTE[] = [];
  registeredRoute: {[key: string]: ROUTE} = {};
  // indexRouter: ROUTE = {
  //   path: '/',
  //   content:null
  // }
  // _404Route: ROUTE = {
  //   path: '/404',
  //   content: '404'
  // }
  // private createdResolver: typeof Promise.resolve;
  private cacheFragmentContainer = document.createDocumentFragment()
  private routerFallback: ROUTE_CONTENT | ROUTE_CALLBACK;
  constructor() {
    super();
    // element created
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [stylesheet];
    shadow.innerHTML = `<slot class="${style.routerView}"></slot>`
        .replace(/[\s\n]*\n[\s\n]*/g, '');
    this.innerHTML = ''
  }
  // api
  has(path: string): boolean{
    return Boolean(this.registeredRoute[path])
  }
  fallback(fallback?: ROUTE_CONTENT | ROUTE_CALLBACK) {
    this.routerFallback = fallback
  }
  when(path: string , content?: ROUTE_CONTENT | ROUTE_CALLBACK) {
    // let relPath = path

    let relPath = path;
    const children = {};
    const params:{[key: string]: string} = {};
    // if (!content && typeof path != 'string') {
    //   content = (path as ROUTE).content;
    //   children = (path as ROUTE).children;
    //   params = (path as ROUTE).params;
    //   relPath = (path as ROUTE).path as string
    // }

    const paramsGroups:{[key: string]: number} = {}; // { FirstName: 1, LastName: 2 };
    const parts = (relPath as string).split('/')
    relPath = parts.map((p,index) => {
      if (p.startsWith(':')) {
        const paramName = p.substring(1);
        paramsGroups[paramName] = index + 1;
        return '([\\w-]+)'
      }
      return p
    }).join('/')

    // const {protocol, host, hash} = window.location;
    // const u = new URL(`${protocol}//${host}${relPath}`);
    // const u = this.currentURL(relPath as string)

    this.registeredRoute[relPath] = {
      pathReg: new RegExp(relPath),
      query: {},
      paramsGroups,
      params,
      children,
      content,
      build: false
    }
    return this;
  }
  beforeEnter(){
    //
  }
  onEnter(){
    //
  }
  afterEnter(){
    //
  }
  parseParams(searchParams: URLSearchParams) {
    const output: {[key: string]: any} = {};
    // Set will return only unique keys()
    new Set([...searchParams.keys()])
        .forEach(key => {
          output[key] = searchParams.getAll(key).length > 1 ?
              searchParams.getAll(key) : // get multiple values
              searchParams.get(key); // get single value
        });

    return output;
  }
  _monitor = (e: HashChangeEvent) => {
    // console.log(e)
    // const newURL = new URL(e.newURL);
    // const oldURL = new URL(e.oldURL);
    // let path = newURL.hash;
    const oldURL = this.currentURL(e.oldURL);
    const newURL = this.currentURL(e.newURL);
    const path = newURL.pathname
    // if (path.startsWith('#')) {
    //   path = path.substring(1)
    // }

    // let oldPath = oldURL.hash
    let oldPath = oldURL.pathname
    if (!oldPath) {
      oldPath = '/'
    }
    // if (oldPath.startsWith('#')) {
    //   oldPath = oldPath.substring(1)
    // }
    // if (oldPath == path) {
    //   return;
    // }

    // check 404 index
    // if (!this.has('/404')) {
    //   this.when('/404', '404 content')
    // }
    const params: {[key: string]: string} = {};
    const query: {[key: string]: string} = {};
    const routePaths = Object.keys(this.registeredRoute);
    for (let i = 0 ; i < routePaths.length; i++) {
      const routePath= routePaths[i];
      const r = this.registeredRoute[routePath]
      const m = r.pathReg.exec(path);
      if (m) {
        if (m.length > 1) {
          Object.keys(r.params).forEach(k => {
            params[k] = m[r.paramsGroups[k]]
          });
        }
        let content = r.content
        if (r.content && typeof r.content == 'function') {
          content = r.content({
            params,
            query,
            path
          });
          let cacheViewNode = this.cacheFragmentContainer.getElementById(`cache_${oldPath}`)
          if (!cacheViewNode) {
            cacheViewNode = document.createElement('div')
            cacheViewNode.id = `cache_${oldPath}`;
            this.cacheFragmentContainer.appendChild(cacheViewNode);
          }
          cacheViewNode.append(...this.childNodes)
          r.build = true
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.append(...content)
        return
      }
    }
    // const content = this.getRouteViewContent ();
    // this.append(...content)
  }
  getRouteViewContent(r, args: any) {

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


    this.dispatchEvent(new CustomEvent('created', {bubbles: true,detail: this}));
    // this.createdResolver()
    // this.shadowRoot.innerHTML = `
    // <style>
    //   ${style.toString()}
    // </style>
    // <div class="${style.list}" role="tablist">
    //   <div class="${style.scrollAre
    //   a}">
    //     <slot class="${style.scrollContent}">
    //     </slot>
    //   </div>
    // </div>`;
    window.addEventListener( 'hashchange', this._monitor);
    const path = this.getHashPath();
    if (path) {
      // 多实例应该只发送一次
      const oldURL = new URL(window.location.href);
      oldURL.hash = '/'
      const changeEvent = new HashChangeEvent("hashchange", {oldURL: oldURL.href,  newURL: window.location.href})
      window.dispatchEvent(changeEvent)
    }
  }
  getHashPath(hash?: string) {
    let path = window.location.hash;
    if (hash) {
      path = hash;
    }
    if (path.startsWith('#')) {
      path = path.substring(1)
    }
    return path;
  }
  currentURL(url?: string): URL {
    let pathname = this.getHashPath(window.location.hash);
    let newUrl = new URL(pathname, window.location.href);
    if (url) {
      const u = new URL(url, window.location.href);
      if (u.hash) {
        pathname = this.getHashPath(u.hash);
      } else {
        pathname = u.pathname;
      }

      newUrl = new URL(pathname, window.location.href);
      return newUrl
    }
    // protocol = newUrl.protocol;
    // host = newUrl.host;

    // return new URL(`${newUrl.protocol}//${newUrl.host}${pathname}`)
    return new URL(pathname, window.location.href)

    // const relPath = this.hashPath()
    // return new URL(`${protocol}//${host}${pathname}`);
  }
  // created() {
  //   return new Promise((resolve, reject) => {
  //     this.createdResolver = Promise.resolve.bind(Promise)
  //   })
  // }


  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an elemen
    // t is repeatedly added/removed)
    window.removeEventListener( 'hashchange', this._monitor);
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
if (!customElements.get("ez-hash-router")) {
  customElements.define("ez-hash-router", EzHashRouter);
}
if (!customElements.get("ez-router-link")) {
  customElements.define("ez-router-link", EzRouterLink);
}

