(()=>{var t={390:(t,n,i)=>{var o=i(537),e=i(645)(o);e.push([t.id,".ez-pop-wrapper__pop-slot {\n  display: inline;\n  position: relative;\n}\n.ez-pop-wrapper__anchor {\n  /* */\n  position: relative;\n  overflow: visible;\n}\nslot[name=pop]::slotted(*) {\n  min-width: 112px;\n  display: none;\n  position: absolute;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  max-width: calc(100vw - 32px);\n  max-height: calc(100vh - 32px);\n  margin: 0;\n  padding: 0;\n  -webkit-transform: scale(1);\n  -ms-transform: scale(1);\n  transform: scale(1);\n  -webkit-transform-origin: top left;\n  -ms-transform-origin: top left;\n  transform-origin: top left;\n  opacity: 0;\n  overflow: auto;\n  will-change: transform,opacity;\n  z-index: 8;\n  -webkit-transition: opacity 0.03s linear, -webkit-transform 0.12s cubic-bezier(0, 0, 0.2, 1);\n  transition: opacity 0.03s linear, -webkit-transform 0.12s cubic-bezier(0, 0, 0.2, 1);\n  -o-transition: opacity 0.03s linear, transform 0.12s cubic-bezier(0, 0, 0.2, 1);\n  transition: opacity 0.03s linear, transform 0.12s cubic-bezier(0, 0, 0.2, 1);\n  transition: opacity 0.03s linear, transform 0.12s cubic-bezier(0, 0, 0.2, 1), -webkit-transform 0.12s cubic-bezier(0, 0, 0.2, 1);\n  -webkit-box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);\n  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);\n  background-color: #fff;\n  background-color: var(--mdc-theme-surface, #fff);\n  color: #000;\n  color: var(--mdc-theme-on-surface, #000);\n  border-radius: 4px;\n  transform-origin-left: top left;\n  transform-origin-right: top right;\n}\nslot[name=pop].ez-pop-wrapper__open::slotted(*) {\n  display: inline-block;\n  -webkit-transform: scale(1);\n  -ms-transform: scale(1);\n  transform: scale(1);\n  opacity: 1;\n}\n.ez-pop-wrapper__backdrop {\n  background: #333;\n  display: none;\n}\n.ez-pop-wrapper__open .ez-pop-wrapper__backdrop {\n  display: block;\n}\n","",{version:3,sources:["webpack://./src/components/ez-pop-wrapper/ez-pop-wrapper.less"],names:[],mappings:"AAgBA;EACE,eAAA;EACA,kBAAA;AAfF;AAoBA;EAlBE,IAAI;EAoBJ,kBAAA;EACA,iBAAA;AAlBF;AAqBA;EACE,gBAAA;EACA,aAAA;EACA,kBAAA;EACA,8BAAA;EACA,sBAAA;EACA,6BAAA;EACA,8BAAA;EACA,SAAA;EACA,UAAA;EACA,2BAAA;EACA,uBAAA;EACA,mBAAA;EACA,kCAAA;EACA,8BAAA;EACA,0BAAA;EACA,UAAA;EACA,cAAA;EACA,8BAAA;EACA,UAAA;EACA,4FAAA;EACA,oFAAA;EACA,+EAAA;EACA,4EAAA;EACA,gIAAA;EACA,6HAAA;EACA,qHAAA;EACA,sBAAA;EACA,gDAAA;EACA,WAAA;EACA,wCAAA;EACA,kBAAA;EACA,+BAAA;EACA,iCAAA;AAnBF;AAqBA;EACE,qBAAA;EACA,2BAAA;EACA,uBAAA;EACA,mBAAA;EACA,UAAA;AAnBF;AAqBA;EACE,gBAAA;EACA,aAAA;AAnBF;AAqBA;EACE,cAAA;AAnBF",sourcesContent:["\n:host{\n\n}\n\n\n\n//.open {\n//  display: inline-block;\n//  -webkit-transform: scale(1);\n//  -ms-transform: scale(1);\n//  transform: scale(1);\n//  opacity: 1;\n//}\n\n\n.pop-slot{\n  display: inline;\n  position: relative;\n}\n\n\n\n.anchor {\n  /* */\n  position: relative;\n  overflow: visible;\n}\n\nslot[name=pop]::slotted(*) {\n  min-width: 112px;\n  display: none;\n  position: absolute;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  max-width: calc(100vw - 32px);\n  max-height: calc(100vh - 32px);\n  margin: 0;\n  padding: 0;\n  -webkit-transform: scale(1);\n  -ms-transform: scale(1);\n  transform: scale(1);\n  -webkit-transform-origin: top left;\n  -ms-transform-origin: top left;\n  transform-origin: top left;\n  opacity: 0;\n  overflow: auto;\n  will-change: transform,opacity;\n  z-index: 8;\n  -webkit-transition: opacity .03s linear,-webkit-transform .12s cubic-bezier(0,0,.2,1);\n  transition: opacity .03s linear,-webkit-transform .12s cubic-bezier(0,0,.2,1);\n  -o-transition: opacity .03s linear,transform .12s cubic-bezier(0,0,.2,1);\n  transition: opacity .03s linear,transform .12s cubic-bezier(0,0,.2,1);\n  transition: opacity .03s linear,transform .12s cubic-bezier(0,0,.2,1),-webkit-transform .12s cubic-bezier(0,0,.2,1);\n  -webkit-box-shadow: 0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);\n  box-shadow: 0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);\n  background-color: #fff;\n  background-color: var(--mdc-theme-surface,#fff);\n  color: #000;\n  color: var(--mdc-theme-on-surface,#000);\n  border-radius: 4px;\n  transform-origin-left: top left;\n  transform-origin-right: top right;\n}\nslot[name=pop].open::slotted(*) {\n  display: inline-block;\n  -webkit-transform: scale(1);\n  -ms-transform: scale(1);\n  transform: scale(1);\n  opacity: 1;\n}\n.backdrop{\n  background: #333;\n  display: none;\n}\n.open .backdrop{\n  display: block;\n}\n"],sourceRoot:""}]),e.locals={"pop-slot":"ez-pop-wrapper__pop-slot",popSlot:"ez-pop-wrapper__pop-slot",anchor:"ez-pop-wrapper__anchor",open:"ez-pop-wrapper__open",backdrop:"ez-pop-wrapper__backdrop"},e=new Proxy(e,{get:function(t,n,i){return n in t?t[n]:t.locals&&n in t.locals?t.locals[n]:Reflect.get(...arguments)}}),t.exports=e},645:t=>{"use strict";t.exports=function(t){var n=[];return n.toString=function(){return this.map((function(n){var i="",o=void 0!==n[5];return n[4]&&(i+="@supports (".concat(n[4],") {")),n[2]&&(i+="@media ".concat(n[2]," {")),o&&(i+="@layer".concat(n[5].length>0?" ".concat(n[5]):""," {")),i+=t(n),o&&(i+="}"),n[2]&&(i+="}"),n[4]&&(i+="}"),i})).join("")},n.i=function(t,i,o,e,r){"string"==typeof t&&(t=[[null,t,void 0]]);var s={};if(o)for(var a=0;a<this.length;a++){var c=this[a][0];null!=c&&(s[c]=!0)}for(var h=0;h<t.length;h++){var p=[].concat(t[h]);o&&s[p[0]]||(void 0!==r&&(void 0===p[5]||(p[1]="@layer".concat(p[5].length>0?" ".concat(p[5]):""," {").concat(p[1],"}")),p[5]=r),i&&(p[2]?(p[1]="@media ".concat(p[2]," {").concat(p[1],"}"),p[2]=i):p[2]=i),e&&(p[4]?(p[1]="@supports (".concat(p[4],") {").concat(p[1],"}"),p[4]=e):p[4]="".concat(e)),n.push(p))}},n}},537:t=>{"use strict";t.exports=function(t){var n=t[1],i=t[3];if(!i)return n;if("function"==typeof btoa){var o=btoa(unescape(encodeURIComponent(JSON.stringify(i)))),e="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(o),r="/*# ".concat(e," */"),s=i.sources.map((function(t){return"/*# sourceURL=".concat(i.sourceRoot||"").concat(t," */")}));return[n].concat(s).concat([r]).join("\n")}return[n].join("\n")}}},n={};function i(o){var e=n[o];if(void 0!==e)return e.exports;var r=n[o]={id:o,exports:{}};return t[o](r,r.exports,i),r.exports}(()=>{"use strict";const t=i(390),n=new CSSStyleSheet,o="is-open-below",e={TRANSITION_OPEN_DURATION:120,TRANSITION_CLOSE_DURATION:75,MARGIN_TO_EDGE:32,ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO:.67,TOUCH_EVENT_WAIT_MS:30};var r,s;!function(t){t[t.BOTTOM=1]="BOTTOM",t[t.CENTER=2]="CENTER",t[t.RIGHT=4]="RIGHT",t[t.FLIP_RTL=8]="FLIP_RTL"}(r||(r={})),function(t){t[t.TOP_LEFT=0]="TOP_LEFT",t[t.TOP_RIGHT=4]="TOP_RIGHT",t[t.BOTTOM_LEFT=1]="BOTTOM_LEFT",t[t.BOTTOM_RIGHT=5]="BOTTOM_RIGHT",t[t.TOP_START=8]="TOP_START",t[t.TOP_END=12]="TOP_END",t[t.BOTTOM_START=9]="BOTTOM_START",t[t.BOTTOM_END=13]="BOTTOM_END"}(s||(s={}));class a extends HTMLElement{constructor(){super(),this.beforeCloseHooks=[],this.afterCloseHooks=[],this.beforeActiveTabHooks=[],this.afterActiveTabHooks=[],this.isHoistedElement=!1,this.isFixedPosition=!1,this.isHorizontallyCenteredOnViewport=!1,this.anchorCorner=s.TOP_START,this.maxHeight=0,this.openBottomBias=0,this.originCorner=s.TOP_START,this.anchorMargin={top:0,right:0,bottom:0,left:0},this.isQuickOpen=!0;const i=this.attachShadow({mode:"open"});i.adoptedStyleSheets=[n],i.innerHTML=`\n       <slot name="title" class="${t.anchor}"></slot>\n       <slot name="pop" tabIndex="-1" class="${t.popSlot}"></slot>\n    `.replace(/[\s\n]*\n[\s\n]*/g,"")}connectedCallback(){0==n.cssRules.length&&n.replaceSync(t.toString()),this.anchor=this.querySelector("[slot=title]"),this.root=this.shadowRoot.querySelector("slot[name=pop]"),this.targetItem=this.querySelector("[slot=pop]"),this.targetItem.setAttribute("tabIndex","-1"),this.root.addEventListener("click",(t=>{t.stopPropagation()})),this.anchor.addEventListener("click",(t=>{t.preventDefault(),t.stopPropagation(),this.open()})),document.addEventListener("click",(t=>{this.close(),t.preventDefault(),t.stopPropagation()}));const i=document.createElement("div");i.className=t.backdrop,i.style.cssText="".replace(/[\s\n]*\n[\s\n]*/g,""),this.root.appendChild(i)}open(){!this.isSurfaceOpen&&this.isQuickOpen&&(this.isSurfaceOpen=!0,this.root.classList.add(t.open),this.dimensions=this.getInnerDimensions(),this.autoPosition(),this.querySelector("[slot=pop]"))}close(n=!1){this.isSurfaceOpen&&(this.isSurfaceOpen=!1,this.root.classList.remove(t.open),this.anchor.classList.remove(o))}getInnerDimensions(){return{width:this.anchor.offsetWidth,height:this.anchor.offsetHeight}}hasBit(t,n){return Boolean(t&n)}setBit(t,n){return t|n}unsetBit(t,n){return t^n}autoPosition(){this.measurements=this.getAutoLayoutMeasurements();const t=this.getOriginCorner(),n=this.getMenuSurfaceMaxHeight(t),i=this.hasBit(t,r.BOTTOM)?"bottom":"top";let s=this.hasBit(t,r.RIGHT)?"right":"left";const a=this.getHorizontalOriginOffset(t),c=this.getVerticalOriginOffset(t),{anchorSize:h,surfaceSize:p}=this.measurements,A={[s]:a,[i]:c};h.width/p.width>e.ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO&&(s="center"),(this.isHoistedElement||this.isFixedPosition)&&this.adjustPositionForHoistedElement(A),this.setTransformOrigin(`${s} ${i}`),this.setPosition(A),this.setMaxHeight(n?n+"px":""),this.hasBit(t,r.BOTTOM)||this.anchor.classList.add(o)}setPosition(t){const n=this.targetItem;n.style.left="left"in t?`${t.left}px`:"",n.style.right="right"in t?`${t.right}px`:"",n.style.top="top"in t?`${t.top}px`:"",n.style.bottom="bottom"in t?`${t.bottom}px`:""}setMaxHeight(t){this.targetItem.style.maxHeight=t}setTransformOrigin(t){this.targetItem.style.setProperty("transform-origin",t)}adjustPositionForHoistedElement(t){const{windowScroll:n,viewportDistance:i,surfaceSize:o,viewportSize:e}=this.measurements,r=Object.keys(t);for(const s of r){let r=t[s]||0;!this.isHorizontallyCenteredOnViewport||"left"!==s&&"right"!==s?(r+=i[s],this.isFixedPosition||("top"===s?r+=n.y:"bottom"===s?r-=n.y:"left"===s?r+=n.x:r-=n.x),t[s]=r):t[s]=(e.width-o.width)/2}}getVerticalOriginOffset(t){const{anchorSize:n}=this.measurements,i=this.hasBit(t,r.BOTTOM),o=this.hasBit(this.anchorCorner,r.BOTTOM);let e=0;return e=i?o?n.height-this.anchorMargin.top:-this.anchorMargin.bottom:o?n.height+this.anchorMargin.bottom:this.anchorMargin.top,e}getHorizontalOriginOffset(t){const{anchorSize:n}=this.measurements,i=this.hasBit(t,r.RIGHT),o=this.hasBit(this.anchorCorner,r.RIGHT);if(i){const t=o?n.width-this.anchorMargin.left:this.anchorMargin.right;return this.isHoistedElement||this.isFixedPosition?t-(this.measurements.viewportSize.width-this.measurements.bodySize.width):t}return o?n.width-this.anchorMargin.right:this.anchorMargin.left}getAnchorDimensions(){return this.anchor.getBoundingClientRect()}getBodyDimensions(){return{width:document.body.clientWidth,height:document.body.clientHeight}}getWindowDimensions(){return{width:window.innerWidth,height:window.innerHeight}}getWindowScroll(){return{x:window.scrollX,y:window.scrollY}}getAutoLayoutMeasurements(){let t=this.getAnchorDimensions();const n=this.getBodyDimensions(),i=this.getWindowDimensions(),o=this.getWindowScroll();return t||(t={top:this.position.y,right:this.position.x,bottom:this.position.y,left:this.position.x,width:0,height:0}),{anchorSize:t,bodySize:n,surfaceSize:this.dimensions,viewportDistance:{top:t.top,right:i.width-t.right,bottom:i.height-t.bottom,left:t.left},viewportSize:i,windowScroll:o}}getMenuSurfaceMaxHeight(t){if(this.maxHeight>0)return this.maxHeight;const{viewportDistance:n}=this.measurements;let i=0;const o=this.hasBit(t,r.BOTTOM),s=this.hasBit(this.anchorCorner,r.BOTTOM),{MARGIN_TO_EDGE:a}=e;return o?(i=n.top+this.anchorMargin.top-a,s||(i+=this.measurements.anchorSize.height)):(i=n.bottom-this.anchorMargin.bottom+this.measurements.anchorSize.height-a,s&&(i-=this.measurements.anchorSize.height)),i}setAnchorMargin(t){this.anchorMargin.top=t.top||0,this.anchorMargin.right=t.right||0,this.anchorMargin.bottom=t.bottom||0,this.anchorMargin.left=t.left||0}getOriginCorner(){let t=this.originCorner;const{viewportDistance:n,anchorSize:i,surfaceSize:o}=this.measurements,{MARGIN_TO_EDGE:s}=e;let a,c;this.hasBit(this.anchorCorner,r.BOTTOM)?(a=n.top-s+this.anchorMargin.bottom,c=n.bottom-s-this.anchorMargin.bottom):(a=n.top-s+this.anchorMargin.top,c=n.bottom-s+i.height-this.anchorMargin.top),!(c-o.height>0)&&a>c+this.openBottomBias&&(t=this.setBit(t,r.BOTTOM)),this.hasBit(this.anchorCorner,r.FLIP_RTL);const h=this.hasBit(this.anchorCorner,r.RIGHT)||this.hasBit(t,r.RIGHT);let p,A,l=!1;l=h,l?(p=n.left+i.width+this.anchorMargin.right,A=n.right-this.anchorMargin.right):(p=n.left+this.anchorMargin.left,A=n.right+i.width-this.anchorMargin.left);const g=p-o.width>0,m=A-o.width>0,d=this.hasBit(t,r.FLIP_RTL)&&this.hasBit(t,r.RIGHT);return!g&&d?t=this.unsetBit(t,r.RIGHT):(g&&!l&&h||!m&&p>=A)&&(t=this.setBit(t,r.RIGHT)),t}disconnectedCallback(){}static get observedAttributes(){return[]}attributeChangedCallback(t,n,i){}adoptedCallback(){}}customElements.define("ez-pop-wrapper",a)})()})();
//# sourceMappingURL=ez-pop-wrapper.js.map