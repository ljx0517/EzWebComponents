import * as style from "./ez-pop-wrapper.less"
const stylesheet = new CSSStyleSheet();


const IS_OPEN_BELOW = 'is-open-below'
interface IDimensions {
  height: number;
  width: number;
}
const numbers = {
  /** Total duration of menu-surface open animation. */
  TRANSITION_OPEN_DURATION: 120,

  /** Total duration of menu-surface close animation. */
  TRANSITION_CLOSE_DURATION: 75,

  /**
   * Margin left to the edge of the viewport when menu-surface is at maximum
   * possible height. Also used as a viewport margin.
   */
  MARGIN_TO_EDGE: 32,

  /**
   * Ratio of anchor width to menu-surface width for switching from corner
   * positioning to center positioning.
   */
  ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO: 0.67,

  /**
   * Amount of time to wait before restoring focus when closing the menu
   * surface. This is important because if a touch event triggered the menu
   * close, and the subsequent mouse event occurs after focus is restored, then
   * the restored focus would be lost.
   */
  TOUCH_EVENT_WAIT_MS: 30,
};
/**
 * Enum for bits in the {@see Corner) bitmap.
 */
enum CornerBit {
  BOTTOM = 1,
  CENTER = 2,
  RIGHT = 4,
  FLIP_RTL = 8,
}

/**
 * Enum for representing an element corner for positioning the menu-surface.
 *
 * The START constants map to LEFT if element directionality is left
 * to right and RIGHT if the directionality is right to left.
 * Likewise END maps to RIGHT or LEFT depending on the directionality.
 */
enum Corner {
  TOP_LEFT = 0,
  TOP_RIGHT = CornerBit.RIGHT,
  BOTTOM_LEFT = CornerBit.BOTTOM,
  BOTTOM_RIGHT = CornerBit.BOTTOM | CornerBit.RIGHT, // tslint:disable-line:no-bitwise
  TOP_START = CornerBit.FLIP_RTL,
  TOP_END = CornerBit.FLIP_RTL | CornerBit.RIGHT, // tslint:disable-line:no-bitwise
  BOTTOM_START = CornerBit.BOTTOM | CornerBit.FLIP_RTL, // tslint:disable-line:no-bitwise
  BOTTOM_END = CornerBit.BOTTOM | CornerBit.RIGHT | CornerBit.FLIP_RTL, // tslint:disable-line:no-bitwise
}
interface IDistance {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IPoint {
  x: number;
  y: number;
}
interface IAutoLayoutMeasurements {
  anchorSize: IDimensions;
  bodySize: IDimensions;
  surfaceSize: IDimensions;
  viewportDistance: IDistance;
  viewportSize: IDimensions;
  windowScroll: IPoint;
}
class EzPopWrapper extends HTMLElement {


  private beforeCloseHooks:(() => boolean)[] = [];
  private afterCloseHooks: (() => void)[] = [];
  private beforeActiveTabHooks:(() => boolean)[] = [];
  private afterActiveTabHooks: (() => void)[] = [];
  private isSurfaceOpen: any;
  private dimensions: IDimensions;
  private measurements: any;
  private isHoistedElement = false;
  private isFixedPosition = false
  private isHorizontallyCenteredOnViewport = false;
  private anchor: HTMLElement;
  private root: HTMLElement;
  private position: IPoint;
  private anchorCorner: Corner = Corner.TOP_START;
  private maxHeight = 0;
  private openBottomBias = 0;
  private originCorner: Corner = Corner.TOP_START;
  private readonly anchorMargin:
    IDistance = {top: 0, right: 0, bottom: 0, left: 0};
  // TODO isQuickOpen is not use animation
  private isQuickOpen = true;
  private targetItem: HTMLElement;
  constructor() {
    super();
    // element created
    const shadow = this.attachShadow({ mode: 'open' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    shadow.adoptedStyleSheets = [stylesheet];
    shadow.innerHTML = `
       <slot name="title" class="${style.anchor}"></slot>
       <slot name="pop" tabIndex="-1" class="${style.popSlot}"></slot>
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
    // this.anchor = document.createElement('div')
    // this.anchor.className = style.anchor
    // this.anchor = this.shadowRoot.querySelector(`.${style.anchor}`)
    this.anchor = this.querySelector('[slot=title]');
    this.root = this.shadowRoot.querySelector('slot[name=pop]');

    this.targetItem = (this.querySelector('[slot=pop]') as HTMLElement);
    this.targetItem.setAttribute('tabIndex', '-1')

    this.root.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    this.anchor.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.open();
    });
    /*console.log(this.targetItem)
    this.targetItem.addEventListener('blur', (e) => {
      console.log('blur', e.target)
      let t = e.target as HTMLElement
      while (t != this.targetItem) {
        t = t.parentElement;
        if ( t == document.body ) {
          break
        }
        if ( t == this.targetItem ) {
          this.close();
          break
        }
      }

      e.preventDefault();
      e.stopPropagation()
    }) */
    document.addEventListener('click', (e) => {
      this.close();
      e.preventDefault();
      e.stopPropagation()
    })

    const backdrop = document.createElement('div');
    // backdrop.setAttribute('slot', 'pop')
    backdrop.className = style.backdrop
    backdrop.style.cssText = ``.replace(/[\s\n]*\n[\s\n]*/g, '');
    this.root.appendChild(backdrop);
  }

  open() {
    if (this.isSurfaceOpen) {
      return;
    }
    if (this.isQuickOpen) {
      this.isSurfaceOpen = true;
      this.root.classList.add(style.open);
      this.dimensions = this.getInnerDimensions();
      this.autoPosition();
      const target = (this.querySelector('[slot=pop]') as HTMLElement)
      // target.setAttribute('tabIndex', '-1')
      // target.focus({preventScroll: true})
      // this.notifyOpen();
    }

  }
  close(skipRestoreFocus = false) {
    if (!this.isSurfaceOpen) {
      return;
    }
    // if (this.isQuickOpen) {
      this.isSurfaceOpen = false;
      this.root.classList.remove(style.open);
      this.anchor.classList.remove(IS_OPEN_BELOW);
      // notifyClosing;
    // }


  }


  getInnerDimensions() :IDimensions{
    return { width:this.anchor.offsetWidth, height: this.anchor.offsetHeight };
  }
  private hasBit(corner: Corner, bit: CornerBit): boolean {
    return Boolean(corner & bit);  // tslint:disable-line:no-bitwise
  }

  private setBit(corner: Corner, bit: CornerBit): Corner {
    return corner | bit;  // tslint:disable-line:no-bitwise
  }

  private unsetBit(corner: Corner, bit: CornerBit): Corner {
    return corner ^ bit;
  }

  private autoPosition() {

    this.measurements = this.getAutoLayoutMeasurements();
    const corner = this.getOriginCorner();
    const maxMenuSurfaceHeight = this.getMenuSurfaceMaxHeight(corner);
    const verticalAlignment =
      this.hasBit(corner, CornerBit.BOTTOM) ? 'bottom' : 'top';
    let horizontalAlignment =
      this.hasBit(corner, CornerBit.RIGHT) ? 'right' : 'left';
    const horizontalOffset = this.getHorizontalOriginOffset(corner);
    const verticalOffset = this.getVerticalOriginOffset(corner);
    const {anchorSize, surfaceSize} = this.measurements;

    const position: Partial<IDistance> = {
      [horizontalAlignment]: horizontalOffset,
      [verticalAlignment]: verticalOffset,
    };

    // Center align when anchor width is comparable or greater than menu
    // surface, otherwise keep corner.
    if (anchorSize.width / surfaceSize.width >
      numbers.ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO) {
      horizontalAlignment = 'center';
    }

    // If the menu-surface has been hoisted to the body, it's no longer relative
    // to the anchor element
    if (this.isHoistedElement || this.isFixedPosition) {
      this.adjustPositionForHoistedElement(position);
    }

    this.setTransformOrigin(
      `${horizontalAlignment} ${verticalAlignment}`);
    this.setPosition(position);
    this.setMaxHeight(
      maxMenuSurfaceHeight ? maxMenuSurfaceHeight + 'px' : '');

    // If it is opened from the top then add is-open-below class
    if (!this.hasBit(corner, CornerBit.BOTTOM)) {
      this.anchor.classList.add(IS_OPEN_BELOW);
    }
  }
  setPosition (position:  Partial<IDistance>) {
    const rootHTML = this.targetItem as HTMLElement;
    rootHTML.style.left = 'left' in position ? `${position.left}px` : '';
    rootHTML.style.right = 'right' in position ? `${position.right}px` : '';
    rootHTML.style.top = 'top' in position ? `${position.top}px` : '';
    rootHTML.style.bottom = 'bottom' in position ? `${position.bottom}px` : '';
  }
  setMaxHeight(height: string) {
    (this.targetItem as HTMLElement).style.maxHeight = height;
  }
  setTransformOrigin (origin: string) {
    const propertyName = `transform-origin`;
     // (this.root as HTMLElement).style.setProperty(propertyName, origin);
     (this.targetItem as HTMLElement).style.setProperty(propertyName, origin);
  }
  /**
   * Calculates the offsets for positioning the menu-surface when the
   * menu-surface has been hoisted to the body.
   */
  private adjustPositionForHoistedElement(position: Partial<IDistance>) {
    const {windowScroll, viewportDistance, surfaceSize, viewportSize} =
      this.measurements;

    const props =
      Object.keys(position) as Array<keyof Partial<IDistance>>;

    for (const prop of props) {
      let value = position[prop] || 0;

      if (this.isHorizontallyCenteredOnViewport &&
        (prop === 'left' || prop === 'right')) {
        position[prop] = (viewportSize.width - surfaceSize.width) / 2;
        continue;
      }

      // Hoisted surfaces need to have the anchor elements location on the page
      // added to the position properties for proper alignment on the body.
      value += viewportDistance[prop];

      // Surfaces that are absolutely positioned need to have additional
      // calculations for scroll and bottom positioning.
      if (!this.isFixedPosition) {
        if (prop === 'top') {
          value += windowScroll.y;
        } else if (prop === 'bottom') {
          value -= windowScroll.y;
        } else if (prop === 'left') {
          value += windowScroll.x;
        } else {  // prop === 'right'
          value -= windowScroll.x;
        }
      }

      position[prop] = value;
    }
  }
  /**
   * @param corner Origin corner of the menu surface.
   * @return Vertical offset of menu surface origin corner from corresponding
   *     anchor corner.
   */
  private getVerticalOriginOffset(corner: Corner): number {
    const {anchorSize} = this.measurements;
    const isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
    const avoidVerticalOverlap =
      this.hasBit(this.anchorCorner, CornerBit.BOTTOM);

    let y = 0;
    if (isBottomAligned) {
      y = avoidVerticalOverlap ? anchorSize.height - this.anchorMargin.top :
        -this.anchorMargin.bottom;
    } else {
      y = avoidVerticalOverlap ?
        (anchorSize.height + this.anchorMargin.bottom) :
        this.anchorMargin.top;
    }
    return y;
  }
  /**
   * @param corner Origin corner of the menu surface.
   * @return Horizontal offset of menu surface origin corner from corresponding
   *     anchor corner.
   */
  private getHorizontalOriginOffset(corner: Corner): number {
    const {anchorSize} = this.measurements;

    // isRightAligned corresponds to using the 'right' property on the surface.
    const isRightAligned = this.hasBit(corner, CornerBit.RIGHT);
    const avoidHorizontalOverlap =
      this.hasBit(this.anchorCorner, CornerBit.RIGHT);

    if (isRightAligned) {
      const rightOffset = avoidHorizontalOverlap ?
        anchorSize.width - this.anchorMargin.left :
        this.anchorMargin.right;

      // For hoisted or fixed elements, adjust the offset by the difference
      // between viewport width and body width so when we calculate the right
      // value (`adjustPositionForHoistedElement`) based on the element
      // position, the right property is correct.
      if (this.isHoistedElement || this.isFixedPosition) {
        return rightOffset -
          (this.measurements.viewportSize.width -
            this.measurements.bodySize.width);
      }

      return rightOffset;
    }

    return avoidHorizontalOverlap ? anchorSize.width - this.anchorMargin.right :
      this.anchorMargin.left;
  }
  private getAnchorDimensions() {
    return this.anchor.getBoundingClientRect();
  }
  private getBodyDimensions(): IDimensions { return  { width: document.body.clientWidth, height: document.body.clientHeight }; }
  private getWindowDimensions(): IDimensions {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  getWindowScroll () {
    // return { x: window.pageXOffset, y: window.pageYOffset };
    return { x: window.scrollX, y: window.scrollY};
  }
  private getAutoLayoutMeasurements() {
    let anchorRect = this.getAnchorDimensions();
    const bodySize = this.getBodyDimensions();
    const viewportSize = this.getWindowDimensions();
    const windowScroll = this.getWindowScroll();

    if (!anchorRect) {
      // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
      anchorRect = {
        top: this.position.y,
        right: this.position.x,
        bottom: this.position.y,
        left: this.position.x,
        width: 0,
        height: 0,
      } as any;
    }
      return {
        anchorSize: anchorRect!,
        bodySize,
        surfaceSize: this.dimensions,
        viewportDistance: {
          // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
          top: anchorRect!.top,
          right: viewportSize.width - anchorRect!.right,
          bottom: viewportSize.height - anchorRect!.bottom,
          left: anchorRect!.left,
          // tslint:enable:object-literal-sort-keys
        },
        viewportSize,
        windowScroll,
      };

  }

  /**
   * @param corner Origin corner of the menu surface.
   * @return Maximum height of the menu surface, based on available space. 0
   *     indicates should not be set.
   */
  private getMenuSurfaceMaxHeight(corner: Corner): number {
    if (this.maxHeight > 0) {
      return this.maxHeight;
    }

    const {viewportDistance} = this.measurements;

    let maxHeight = 0;
    const isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
    const isBottomAnchored = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
    const {MARGIN_TO_EDGE} = numbers;

    // When maximum height is not specified, it is handled from CSS.
    if (isBottomAligned) {
      maxHeight = viewportDistance.top + this.anchorMargin.top - MARGIN_TO_EDGE;
      if (!isBottomAnchored) {
        maxHeight += this.measurements.anchorSize.height;
      }
    } else {
      maxHeight = viewportDistance.bottom - this.anchorMargin.bottom +
        this.measurements.anchorSize.height - MARGIN_TO_EDGE;
      if (isBottomAnchored) {
        maxHeight -= this.measurements.anchorSize.height;
      }
    }

    return maxHeight;
  }
  private setAnchorMargin(margin: Partial<IDistance>) {
      this.anchorMargin.top = margin.top || 0;
      this.anchorMargin.right = margin.right || 0;
      this.anchorMargin.bottom = margin.bottom || 0;
      this.anchorMargin.left = margin.left || 0;
  }
  /**
   * Computes the corner of the anchor from which to animate and position the
   * menu surface.
   *
   * Only LEFT or RIGHT bit is used to position the menu surface ignoring RTL
   * context. E.g., menu surface will be positioned from right side on TOP_END.
   */
  private getOriginCorner(): Corner {
    let corner = this.originCorner;

    const {viewportDistance, anchorSize, surfaceSize} = this.measurements;
    const {MARGIN_TO_EDGE} = numbers;

    const isAnchoredToBottom = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);

    let availableTop;
    let availableBottom;
    if (isAnchoredToBottom) {
      availableTop =
        viewportDistance.top - MARGIN_TO_EDGE + this.anchorMargin.bottom;
      availableBottom =
        viewportDistance.bottom - MARGIN_TO_EDGE - this.anchorMargin.bottom;
    } else {
      availableTop =
        viewportDistance.top - MARGIN_TO_EDGE + this.anchorMargin.top;
      availableBottom = viewportDistance.bottom - MARGIN_TO_EDGE +
        anchorSize.height - this.anchorMargin.top;
    }

    const isAvailableBottom = availableBottom - surfaceSize.height > 0;
    if (!isAvailableBottom &&
      availableTop > availableBottom + this.openBottomBias) {
      // Attach bottom side of surface to the anchor.
      corner = this.setBit(corner, CornerBit.BOTTOM);
    }

    const isRtl = false; //this.adapter.isRtl();
    const isFlipRtl = this.hasBit(this.anchorCorner, CornerBit.FLIP_RTL);
    const hasRightBit = this.hasBit(this.anchorCorner, CornerBit.RIGHT) ||
      this.hasBit(corner, CornerBit.RIGHT);

    // Whether surface attached to right side of anchor element.
    let isAnchoredToRight = false;

    // Anchored to start
    if (isRtl && isFlipRtl) {
      isAnchoredToRight = !hasRightBit;
    } else {
      // Anchored to right
      isAnchoredToRight = hasRightBit;
    }


    let availableLeft;
    let availableRight;
    if (isAnchoredToRight) {
      availableLeft =
        viewportDistance.left + anchorSize.width + this.anchorMargin.right;
      availableRight = viewportDistance.right - this.anchorMargin.right;
    } else {
      availableLeft = viewportDistance.left + this.anchorMargin.left;
      availableRight =
        viewportDistance.right + anchorSize.width - this.anchorMargin.left;
    }

    const isAvailableLeft = availableLeft - surfaceSize.width > 0;
    const isAvailableRight = availableRight - surfaceSize.width > 0;
    const isOriginCornerAlignedToEnd =
      this.hasBit(corner, CornerBit.FLIP_RTL) &&
      this.hasBit(corner, CornerBit.RIGHT);

    if (isAvailableRight && isOriginCornerAlignedToEnd && isRtl ||
      !isAvailableLeft && isOriginCornerAlignedToEnd) {
      // Attach left side of surface to the anchor.
      corner = this.unsetBit(corner, CornerBit.RIGHT);
    } else if (
      isAvailableLeft && isAnchoredToRight && isRtl ||
      (isAvailableLeft && !isAnchoredToRight && hasRightBit) ||
      (!isAvailableRight && availableLeft >= availableRight)) {
      // Attach right side of surface to the anchor.
      corner = this.setBit(corner, CornerBit.RIGHT);
    }

    return corner;
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
customElements.define("ez-pop-wrapper", EzPopWrapper);
