import * as style from "./ez-tabs-list.less"
class EzTabList extends HTMLElement {
  private closeable: boolean;
  private activeIndex: number;
  private activeClass: string;
  private scrollArea: HTMLElement;
  private scrollContent: HTMLElement;
  private EXTRA_SCROLL_AMOUNT = 20;
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
    this.closeable = false;
    this.activeIndex = 0
    this.activeClass = 'active';
    this.scrollArea = this.shadowRoot.querySelector(`.${style.scrollArea}`)
    this.scrollContent = this.shadowRoot.querySelector(`.${style.scrollContent}`)
    if(this.shadowRoot.host.hasAttribute('active-class')){
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
    for (let i = 0; i < this.shadowRoot.host.children.length; i++) {
      const tab = this.shadowRoot.host.children[i] as HTMLElement;
      if (this.activeIndex == i) {
        tab.classList.add(this.activeClass)
      }
      if (this.closeable) {
        const close = document.createElement('span')
        close.innerHTML = '🗙';
        close.className = style.closeTab;
        close.style.cssText = `cursor: pointer;
  text-align: center;
  vertical-align: baseline;
  display: inline-block;
  width:20px;
      height:20px;
      line-height: 20px;`
        tab.appendChild(close);
        close.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const event = new CustomEvent('close-tab', { detail: i });
          this.dispatchEvent(event);
        })
      }

      tab.addEventListener("click", (e) => {
        (e.target as HTMLElement).classList.add(this.activeClass);
        for (let j = 0; j < this.shadowRoot.host.children.length; j++) {
          const el = this.shadowRoot.host.children[j] as HTMLElement;
          if (e.target === el) {
            continue
          }
          el.classList.remove(this.activeClass)
        }
        const idx = Array.from(this.shadowRoot.host.children).indexOf(e.target as HTMLElement)
        const event = new CustomEvent('active-tab', { detail:idx});
        this.dispatchEvent(event);
      })
    }
  }
  // https://material.io/develop/web/supporting/tab-bar
  /**
   * Activates the tab at the given index.
   * @param index
   */
  activateTab(index: number): void {
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
    if (index === 0) {
      this.scrollContent.scrollTo({left: 0});
      return;
    }

    if (index === this.getTabListLength() - 1) {
      this.scrollContent.scrollTo({left: this.getScrollContentWidth()});
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
    const barWidth = this.getOffsetWidth();
    const tabDimensions = this.getTabDimensionsAtIndex(index);
    const nextIndex = this.findAdjacentTabIndexClosestToEdge(
        index, tabDimensions, scrollPosition, barWidth);



    const scrollIncrement = this.calculateScrollIncrement(
        index, nextIndex, scrollPosition, barWidth);
    this.incrementScroll(scrollIncrement);
  }
  /**
   * Calculates the scroll increment that will make the tab at the given index visible
   * @param index The index of the tab
   * @param nextIndex The index of the next tab
   * @param scrollPosition The current scroll position
   * @param barWidth The width of the Tab Bar
   */
  private calculateScrollIncrement(
      index: number,
      nextIndex: number,
      scrollPosition: number,
      barWidth: number,
  ): number {
    const nextTabDimensions = this.getTabDimensionsAtIndex(nextIndex);
    const relativeContentLeft = nextTabDimensions.left - scrollPosition - barWidth;
    const relativeContentRight = nextTabDimensions.right - scrollPosition;
    const leftIncrement = relativeContentRight - this.EXTRA_SCROLL_AMOUNT;
    const rightIncrement = relativeContentLeft + this.EXTRA_SCROLL_AMOUNT;

    if (nextIndex < index) {
      return Math.min(leftIncrement, 0);
    }

    return Math.max(rightIncrement, 0);
  }
  private getTabDimensionsAtIndex(index: number) : DOMRect {
      return this.scrollContent.children[index].getBoundingClientRect();
  }
  private findAdjacentTabIndexClosestToEdge(
      index: number,
      tabDimensions: DOMRect,
      scrollPosition: number,
      barWidth: number,
  ): number {
    const relativeRootLeft = tabDimensions.left - scrollPosition;
    const relativeRootRight = tabDimensions.right - scrollPosition - barWidth;
    const relativeRootDelta = relativeRootLeft + relativeRootRight;
    const leftEdgeIsCloser = relativeRootLeft < 0 || relativeRootDelta < 0;
    const rightEdgeIsCloser = relativeRootRight > 0 || relativeRootDelta > 0;

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
   * @param scrollXIncrement
   */
  incrementScroll(scrollXIncrement: number): void {
    //
  }

  /**
   * Returns the scroll position of the Tab Scroller.
   */
  getScrollPosition(): number {
    return 0;
  }

  /**
   * Returns the width of the Tab Scroller's scroll content element.
   */
  getScrollContentWidth(): number {
    return this.scrollContent.offsetWidth;
  }

  /**
   * Returns the offsetWidth of the root element.
   */
  getOffsetWidth():number {
    return 0;
  }

  /**
   * Sets the tab at the given index to be activated.
   * @param index
   */
  setActiveTab(index: number) :void {
    //
  }

  /**
   * Returns the client rect of the Tab at the given index.
   * @param index
   */
  getTabIndicatorClientRectAtIndex(index: number): DOMRect{
    return null
  }

  /**
   *Returns the number of child Tab components.
   */
  getTabListLength(): number{
    return this.shadowRoot.host.children.length;
  }
  // /**
  //  * Returns whether a given index is inclusively between the ends
  //  * @param index The index to test
  //  */
  // private indexIsInRange(index: number) {
  //   return index >= 0 && index < this.getTabListLength();
  // }
  /**
   * Returns the index of the previously active Tab.
   */
  getPreviousActiveTabIndex(): number{
    return 0;
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
