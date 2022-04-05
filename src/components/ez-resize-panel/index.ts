import style from "./style.module.less";




const stylesheet = new CSSStyleSheet();

enum MOVE_LIMIT_PART {
  A, B
}
type DIMENSION =  'width'|'height'
class EzResizePanel extends HTMLElement {
  private dimension: DIMENSION;
  private resizer: HTMLElement;
  public container: HTMLElement;
  private dragRegion: DOMRect;
  private initX = 0;
  private initY = 0;
  private firstX = 0;
  private firstY = 0;
  private lastPos: number;
  private move_direction: number;
  private slotA: HTMLSlotElement;
  private slotB: HTMLSlotElement;
  private move_boundary: number[];
  resizerHandleElement: any;



  constructor() {
    super();
    // element created
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [stylesheet];
    shadow.innerHTML = `<div class="${style.resizePanel}">
      <slot name="A"></slot>
      <slot name="handle" class="resizer">
  <div class="${style.resizerHandle}"></div>
      </slot>
     
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
    // const slots = this.shadowRoot.querySelectorAll('slot');
    // slots.forEach(s => {
    //   this.clearSlot(s)
    // })


    this.dimension = this.getAttribute('dimension') as DIMENSION
    this.container = this.shadowRoot.querySelector(`.${style.resizePanel}`);

    this.slotA = this.shadowRoot.querySelector('[name=A]')
    this.slotB = this.shadowRoot.querySelector('[name=B]')


    this.resizer = this.shadowRoot.querySelector('.resizer');
    this.resizerHandleElement = this.shadowRoot.querySelector(`.${style.resizerHandle}`);
    this.shadowRoot.querySelector('[name=handle]').addEventListener('slotchange', (e) => {
      const assignedElements = (e.target as HTMLSlotElement).assignedElements()
      if (assignedElements[0]) {
        this.resizerHandleElement.removeEventListener('mousedown', this.resizeHandle, false);
        this.resizerHandleElement.remove();
        this.resizerHandleElement = assignedElements[0]
        this.resizerHandleElement.addEventListener('mousedown', this.resizeHandle, false);
        this.calcInitSize();
      }
    });
    this.shadowRoot.querySelector('[name=A]').addEventListener('slotchange', (e) => {
      this.dragRegion = this.container.getBoundingClientRect();
      this.calcInitSize();
    });
    // this.shadowRoot.querySelector('[name=B]').addEventListener('slotchange', (e) => {
    // });

    if (!this.style) {
      const s = document.createAttribute('style')
      this.setAttributeNode(s)
    }



    this.resizerHandleElement.addEventListener('mousedown', this.resizeHandle, false);

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
  dragIt = (e: MouseEvent) => {

    e.preventDefault();
    e.stopPropagation();
    let x = this.initX + e.pageX - this.firstX;
    let y = this.initY + e.pageY - this.firstY;

    x = Math.min(Math.max(this.move_boundary[0], x), this.move_boundary[1]);
    y = Math.min(Math.max(this.move_boundary[0], y), this.move_boundary[1]);
    let val = x;
    if (this.dimension == 'height') {
      val = y;
    }

    let attrStyle = this.style;
    if (!attrStyle) {
      this.container.setAttribute('style', ``);
      attrStyle = this.style;
    }
    // console.log(val, e.target)
    attrStyle.setProperty('--part-a-size', `${val}px`)
  }
  resizeHandle = (e: MouseEvent) => {
    e.preventDefault();
    this.initX = this.resizer.offsetLeft;
    this.initY = this.resizer.offsetTop;
    this.firstX = e.pageX;
    this.firstY = e.pageY;
    this.dragRegion = this.container.getBoundingClientRect();


    const slotA = this.slotA.assignedElements();
    const childA = this.getDeepestLevelContainer(slotA[0] as HTMLElement, 'A', this.dimension); // slotA && (slotA[0].querySelector('ez-resize-panel') as EzResizePanel)
    const slotB = this.slotB.assignedElements();
    const childB = this.getDeepestLevelContainer(slotB[0] as HTMLElement, 'B', this.dimension); // slotB && (slotB[0].querySelector('ez-resize-panel') as EzResizePanel)

    let min = 0 ;
    let max = this.dragRegion.width;
    let ASize = this.resizer.offsetLeft;
    let BaseSize = childB ? childB.getBoundingClientRect().width : 0;
    if (this.dimension == 'height') {
      max = this.dragRegion.height;
      ASize = this.resizer.offsetTop;
      BaseSize = childB ? childB.getBoundingClientRect().height : 0;
    }
    if (childA) {
      const partAStyle = childA.style
      min = partAStyle && parseInt(partAStyle.getPropertyValue('--part-a-size'), 10)
    }

    if (childB) {
      childB.container.style
      const partBStyle = childB.style;
      const baw = partBStyle && parseInt(partBStyle.getPropertyValue('--part-a-size'), 10)
      max = ASize + (BaseSize - baw)
    }
    this.move_boundary = [min, max];
    document.querySelectorAll('iframe').forEach(f => {
      // let s = f.getAttributeNode('style');
      // if (!s) {
      //   s = document.createAttribute('style')
      //   f.setAttributeNode(s);
      // }
      f.style.setProperty('pointer-events', 'none')
    })

    window.addEventListener('mousemove', this.dragIt, false);

    window.addEventListener('mouseup', () => {
      document.querySelectorAll('iframe').forEach(f => {
        f.style.setProperty('pointer-events', '')
      })
      window.removeEventListener('mousemove', this.dragIt, false);
    }, false);
  }
  clearSlot(slot: HTMLSlotElement) {
    slot.addEventListener('slotchange', function(e) {
      console.log(slot.assignedElements());
      slot.assignedElements().forEach((el, index) => {
        if (index > 0) {

          el.remove()
        }
      })
    });
  }
  calcInitSize() {
    console.log('calcInitSize', this.dragRegion)
    let s = this.style.getPropertyValue('--part-a-size')
    if (!s) {
      s = '50%';
    }
    let size = parseInt(s, 10);
    if(s.includes('%')) {
      const p = parseInt(s.trim(), 10) / 100;
      if (this.dimension == 'height') {
        size = (this.dragRegion.height - this.resizer.offsetHeight) * p;
      } else {
        size = (this.dragRegion.width - this.resizer.offsetWidth) * p;
      }
    }
    this.style.setProperty('--part-a-size', `${size}px`)
  }
  getDeepestLevelContainer(slot: HTMLElement, part: 'A'|'B', dimension: DIMENSION) : EzResizePanel{
    // let deepest = slot; //  (slot.querySelector('ez-resize-panel') as EzResizePanel)
    let deepest = (slot.querySelector(`ez-resize-panel[dimension=${dimension}]`) as EzResizePanel)
    while (deepest) {
      // const panel = (deepest.querySelector('ez-resize-panel') as EzResizePanel)
      const s = deepest.querySelector(`[slot=${part}]`) as HTMLSlotElement;
      const p = (s.querySelector(`ez-resize-panel[dimension=${dimension}]`) as EzResizePanel);
      if (p) {
        deepest = p;
      } else {
        break
      }
    }
    return <EzResizePanel>deepest;

  }








  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
    this.resizer.removeEventListener('mousedown', this.resizeHandle, false);
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
if (!customElements.get("ez-resize-panel")) {
  customElements.define("ez-resize-panel", EzResizePanel);
}
