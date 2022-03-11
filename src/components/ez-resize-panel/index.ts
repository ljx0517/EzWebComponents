import style from "./style.module.less";




const stylesheet = new CSSStyleSheet();



class EzResizePanel extends HTMLElement {
  private dimension: string;


  constructor() {
    super();
    // element created
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [stylesheet];
    shadow.innerHTML = `<div class="${style.resizePanel}">
      <slot name="A"></slot>
      <div class="resizer"></div>
      <slot name="B"></slot>
    </div>
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
    this.dimension = this.getAttribute('dimension')

    // this.shadowRoot.innerHTML = `
    // <style>
    //   ${style.toString()}
    // </style>
    // <div class="${style.list}" role="tablist">
    //   <div class="${style.scrollArea}">
    //     <slot class="${style.scrollContent}">
    //     </slot>
    //   </div>
    // </div>`;
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
customElements.define("ez-resize-panel", EzResizePanel);
