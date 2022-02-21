import * as style from "./ez-tabs-list.less"

// TODO support column mode
export interface IClientRect {
  rootLeft: number;
  rootRight: number;
  contentLeft: number;
  contentRight: number;
  start: number;
  end: number;
}

enum Mode {
  row,col
}

enum ScrollDir{
  left = 'Left',
  top = 'Top'
}

class EzTabList extends HTMLElement {
  private closeable = true;
  private activeIndex = 0;
  private activeClass = 'ez-tabs-list__active';
  private mode = Mode.row; // horizontal Vertical
  private scrollKey = ScrollDir.left;
  private scrollArea: HTMLElement;
  private scrollContent: HTMLElement;
  private elementContainer: HTMLElement;
  private EXTRA_SCROLL_AMOUNT = 20;
  private custom = false;
  private beforeCloseHooks:(() => boolean)[] = [];
  private afterCloseHooks: (() => void)[] = [];
  private beforeActiveTabHooks:(() => boolean)[] = [];
  private afterActiveTabHooks: (() => void)[] = [];

  constructor() {
    super();
    // element created
  }

  connectedCallback() {
    // browser calls this method when the element is added to the document
    // (can be called many times if an element is repeatedly added/removed)
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
    <style>
      ${style.toString()}
    </style>
    <div class="${style.list}" role="tablist">
      <div class="${style.scrollArea}">
        <slot class="${style.scrollContent}">
        </slot>
      </div>
    </div>`;
    // this.custom = false;
    // this.closeable = false;
    // this.activeIndex = 0
    // this.activeClass = 'ez-tabs-list__active';
    this.scrollArea = this.shadowRoot.querySelector(`.${style.scrollArea}`);
    if(this.shadowRoot.host.hasAttribute('mode') &&
      this.shadowRoot.host.getAttribute('mode').trim().toLocaleLowerCase() === 'col'){
      this.mode = Mode.col
    }
    if(this.shadowRoot.host.hasAttribute('custom') &&
      this.shadowRoot.host.getAttribute('custom').trim().toLocaleLowerCase() === 'true'){
      this.custom = true
    }

    if (!this.custom) {
      this.scrollContent =document.createElement('div')
      this.scrollContent.className = style.scrollContent;
      this.scrollArea.appendChild(this.scrollContent)
      this.shadowRoot.querySelector(`.${style.scrollContent}`).remove()
    } else {
      // this.scrollContent = this.shadowRoot.querySelector(`.${style.scrollContent}`)
      this.scrollContent = this.shadowRoot.host as HTMLElement; //this.shadowRoot.querySelector(`.${style.scrollContent}`)

    }



    if(this.custom && this.shadowRoot.host.hasAttribute('active-class')){
      const ai = this.shadowRoot.host.getAttribute('active-class').trim()
      if (ai) {
        this.activeClass = ai
      }
    }
    if(this.shadowRoot.host.hasAttribute('active-index')){
      const ai = this.shadowRoot.host.getAttribute('active-index').trim()
      if (ai) {
        this.activeIndex = parseInt(ai)
      }
    }
    if (this.shadowRoot.host.hasAttribute('closeable')
    && this.shadowRoot.host.getAttribute('closeable').toLocaleLowerCase() === 'true') {
      this.closeable = true
    }
    if (!this.custom) {
      Array.from(this.shadowRoot.host.children).forEach(el => {
        this.scrollContent.appendChild(el)
      })
    }
    this.initInternalEvent();
    console.log(this.mode, Mode.col, this.scrollContent);

    if (this.mode === Mode.col) {
      const container = this.shadowRoot.querySelector(`.${style.scrollContent}`) as HTMLElement
      container.classList.add(style.col);
      this.scrollKey = ScrollDir.top
    }
  }


  initInternalEvent() {
    for (let i = 0; i < this.scrollContent.children.length; i++) {
      const tab = this.scrollContent.children[i] as HTMLElement;
      if (this.activeIndex == i) {
        tab.classList.add(this.activeClass)
      }

      if (this.closeable) {
        const close = document.createElement('span')
        close.innerHTML = '&times;';
        // close.setAttribute('attr', 'value');
        close.className = style.closeTab;
        //       close.style.cssText = `cursor: pointer;
        // width:24px;
        //     height:24px;
        //     line-height: 24px;`
        tab.appendChild(close);
        close.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const b4event = new CustomEvent('before-close-tab', { detail: i });
          this.dispatchEvent(b4event);
          const result = this.beforeCloseHooks.map((fn: () => boolean) => {
            return fn();
          }).every(r => r);
          if (!result) {
            return;
          }
          (e.target as HTMLElement).parentElement.remove();
          const event = new CustomEvent('close-tab', { detail: i });
          this.dispatchEvent(event);
          this.afterCloseHooks.map(fn => {
            return fn();
          })
        })
      }

      tab.addEventListener("click", (e) => {
        (e.target as HTMLElement).classList.add(this.activeClass);
        for (let j = 0; j < this.scrollContent.children.length; j++) {
          const el = this.scrollContent.children[j] as HTMLElement;
          if (e.target === el) {
            continue
          }
          el.classList.remove(this.activeClass)
        }
        const idx = Array.from(this.scrollContent.children).indexOf(e.target as HTMLElement)
        const result = this.beforeActiveTabHooks.map((fn: () => boolean) => {
          return fn();
        }).every(r => r)
        if (!result) {
          return
        }
        const event = new CustomEvent('active-tab', { detail:idx});
        this.dispatchEvent(event)
        this.afterActiveTabHooks.map((fn: () => void) => {
          fn();
        })
      })
    }
  }
  // https://material.io/develop/web/supporting/tab-bar
  /**
   * Activates the tab at the given index.
   * @param index
   */
  private activateTab(index: number): void {
    const tab = this.shadowRoot.host.children[index] as HTMLElement;
    if (!tab) {
      return;
    }
    tab.classList.add(this.activeClass);
    for (let j = 0; j < this.shadowRoot.host.children.length; j++) {
      const el = this.shadowRoot.host.children[j] as HTMLElement;
      if (tab === el) {
        continue
      }
      el.classList.remove(this.activeClass)
    }
  }

  /**
   * Scrolls the tab at the given index into view.
   * @param index
   */
  scrollTabIntoView(index: number): void {
    if (!this.indexIsInRange_(index)) {
      return;
    }
    const k = this.scrollKey.toLocaleLowerCase();
    if (index === 0) {
      this.scrollArea.scrollTo({[k]: 0});
      return;
    }

    if (index === this.getTabListLength() - 1) {
      this.scrollArea.scrollTo({[k]: this.getScrollContentWidth()});
      return;
    }
    this.scrollIntoViewImpl(index);
  }
  /**
   * Scrolls the tab at the given index into view for left-to-right user agents.
   * @param index The index of the tab to scroll into view
   */
  private scrollIntoViewImpl(index: number) {
    const scrollPosition = this.getScrollPosition();
    // const barWidth = this.getTabOffsetWidth(index);
    const barSize = this.getScrollSize();
    const tabDimensions = this.getTabDimensionsAtIndex(index);
    const nextIndex = this.findAdjacentTabIndexClosestToEdge(
        index, tabDimensions, scrollPosition, barSize);
    if (!this.indexIsInRange_(nextIndex)) {
      return;
    }


    const scrollIncrement = this.calculateScrollIncrement(
        index, nextIndex, scrollPosition, barSize);
    this.incrementScroll(scrollIncrement);
  }
  /**
   * Calculates the scroll increment that will make the tab at the given index visible
   * @param index The index of the tab
   * @param nextIndex The index of the next tab
   * @param scrollPosition The current scroll position
   * @param barSize The width of the Tab Bar
   */
  private calculateScrollIncrement(
      index: number,
      nextIndex: number,
      scrollPosition: number,
      barSize: number,
  ): number {
    const nextTabDimensions = this.getTabDimensionsAtIndex(nextIndex);
    const relativeContentStart = nextTabDimensions.start - scrollPosition - barSize;
    const relativeContentEnd = nextTabDimensions.end - scrollPosition;
    let startIncrement = relativeContentEnd - this.EXTRA_SCROLL_AMOUNT;
    let endIncrement = relativeContentStart + this.EXTRA_SCROLL_AMOUNT;
    // let startIncrement = relativeContentEnd;
    // let endIncrement = relativeContentStart;
    console.log(1, startIncrement,endIncrement , nextIndex < index);
    if (this.mode === Mode.col) {
      startIncrement = startIncrement - this.EXTRA_SCROLL_AMOUNT;
      endIncrement = endIncrement + this.EXTRA_SCROLL_AMOUNT;
    }
    console.log(2, startIncrement,endIncrement );


    if (nextIndex < index) {
      return Math.min(startIncrement, 0);
    }

    return Math.max(endIncrement, 0);
  }
  private getTabDimensionsAtIndex(index: number) : IClientRect {
    const tab = this.scrollContent.children[index] as HTMLElement

    let size = tab.offsetWidth;
    let sizeStart = tab.offsetLeft;
    if (this.mode === Mode.col) {
      size = tab.offsetHeight;
      sizeStart = tab.offsetTop;

    }

    return {
      start: sizeStart,
      end: sizeStart + size,
      contentLeft: sizeStart ,
      contentRight: sizeStart + size,
      rootLeft: sizeStart,
      rootRight: sizeStart + size,
    };
  }
  private findAdjacentTabIndexClosestToEdge(
      index: number,
      tabDimensions: IClientRect,
      scrollPosition: number,
      barWidth: number,
  ): number {
    const relativeRootStart = tabDimensions.start - scrollPosition;
    const relativeRootEnd = tabDimensions.end - scrollPosition - barWidth;
    const relativeRootDelta = relativeRootStart + relativeRootEnd;
    const leftEdgeIsCloser = relativeRootStart < 0 || relativeRootDelta < 0;
    const rightEdgeIsCloser = relativeRootEnd > 0 || relativeRootDelta > 0;

    if (leftEdgeIsCloser) {
      return index - 1;
    }

    if (rightEdgeIsCloser) {
      return index + 1;
    }

    return -1;
  }
  /**
   * Scrolls the Tab Scroller to the given position.
   * @param scrollX
   */
  scrollTabTo(scrollX: number):void {
    //
  }

  /**
   * Increments the Tab Scroller by the given value.
   * @param offsetIncrement
   */
  incrementScroll(offsetIncrement: number): void {

    const key = `scroll${this.scrollKey}`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log('offsetIncrement', this.scrollArea[key], offsetIncrement)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.scrollArea[key]  += offsetIncrement
    // this.scrollArea.scrollLeft += scrollXIncrement;
  }

  /**
   * Returns the scroll position of the Tab Scroller.
   */
  getScrollPosition(): number {
    const key = `scroll${this.scrollKey}`
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.scrollArea[key];
  }

  /**
   * Returns the width of the Tab Scroller's scroll content element.
   */
  getScrollContentWidth(): number {
    if (this.mode === Mode.col) {
      return this.scrollContent.offsetHeight;
    }
    return this.scrollContent.offsetWidth;
  }

  /**
   * Returns the offsetWidth of the root element.
   */
  getScrollSize():number {
    if (this.mode === Mode.col) {
      return this.scrollArea.offsetHeight;
    }
    return this.scrollArea.offsetWidth;
  }

  getTabOffsetWidth(index: number): number {
    return (this.scrollContent.children[index] as HTMLElement).offsetWidth
  }

  /**
   * Sets the tab at the given index to be activated.
   * @param index
   */
  setActiveTab(index: number) :void {
    const previousActiveIndex = this.getPreviousActiveTabIndex();
    if (!this.indexIsInRange_(index) || index === previousActiveIndex) {
      return;
    }
    if (previousActiveIndex !== -1) {
      this.deactivateTabAtIndex(previousActiveIndex);
    }
    this.activateTabAtIndex(index);
    this.scrollTabIntoView(index);
    this.notifyTabActivated(index);
  }

  /**
   * TODO shoule I send custom event in here ??
   */
  notifyTabActivated(index: number) {
    //
  }
  /**
   * Returns the client rect of the Tab at the given index.
   * @param index
   */
  getTabIndicatorClientRectAtIndex(index: number): IClientRect{
    return null
  }

  /**
   *Returns the number of child Tab components.
   */
  getTabListLength(): number{
    return this.scrollContent.children.length;
  }
  activateTabAtIndex(index: number) {
    const tab = this.getTabElementAtIndex(index);
    tab.classList.add(this.activeClass);
    tab.setAttribute("aria-selected", 'true');
    tab.setAttribute('tabIndex', '0');
    tab.focus();
  }
  private deactivateTabAtIndex(index: number) {
    const tab = this.getTabElementAtIndex(index);
    if (!tab) {
      return;
    }

    if (!tab.classList.contains(this.activeClass)) {
      return;
    }
    tab.classList.remove(this.activeClass)
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabIndex', '-1');
  }
  // /**
  //  * Returns whether a given index is inclusively between the ends
  //  * @param index The index to test
  //  */
  // private indexIsInRange(index: number) {
  //   return index >= 0 && index < this.getTabListLength();
  // }
  getTabElementAtIndex(index: number): HTMLElement {
    return this.scrollContent.children[index] as HTMLElement
  }
  /**
   * Returns the index of the previously active Tab.
   */
  getPreviousActiveTabIndex(): number{
    return Array.from(this.scrollContent.children).findIndex(el => el.classList.contains(this.activeClass))
  }

  /**
   * TODO
   * @param index
   */
  indexIsInRange_(index: number) : boolean{
    return index >= 0 && index < this.getTabListLength();
  }
  /**
   * Returns the index of the focused Tab.
   */
  getFocusedTabIndex(): number {
    return 0;
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
customElements.define("ez-tab-list", EzTabList);
