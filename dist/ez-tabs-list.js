var t={143:(t,e,n)=>{var o=n(537),s=n(645)(o);s.push([t.id,":host {\n  width: 100%;\n  height: 100%;\n}\n.style__list {\n  overflow: hidden;\n  width: 100%;\n  height: 100%;\n}\n.style__scroll-area {\n  -webkit-overflow-scrolling: touch;\n  display: -ms-flexbox;\n  display: flex;\n  overflow-x: scroll;\n  scroll-behavior: smooth;\n  width: 100%;\n  height: 100%;\n}\n.style__scroll-content.style__col {\n  flex-direction: column;\n}\n.style__scroll-content {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  will-change: transform;\n}\n.style__scroll-area::-webkit-scrollbar {\n  display: none;\n}\n.style__close-tab {\n  vertical-align: middle;\n  text-align: center;\n  display: inline-block;\n  font-size: var(--close-font-size, 1.3125rem);\n  position: absolute;\n  right: 4px;\n  height: 100%;\n  cursor: pointer;\n}\n.style__close-tab:hover {\n  opacity: 0.7;\n}\n.style__scroll-content > *:before,\n.style__close-tab:before {\n  content: '';\n  display: inline-block;\n  height: 100%;\n  vertical-align: middle;\n}\n.style__scroll-content > * {\n  width: var(--tab-width, auto);\n  padding: var(--tab-padding, 0 24px 0 12px);\n  font-family: Roboto, sans-serif;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-size: var(--label-font-size, 0.875rem);\n  vertical-align: middle;\n  font-weight: 500;\n  letter-spacing: 0.08928571em;\n  text-decoration: none;\n  text-transform: uppercase;\n  position: relative;\n  display: inline-block;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  margin: 0;\n  border: none;\n  outline: none;\n  background: var(--tab-bg-color, none);\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  -webkit-appearance: none;\n  z-index: 1;\n  overflow: hidden;\n}\n.style__scroll-content > .style__active {\n  background: var(--active-tab-bg-color, #ddd);\n}\n","",{version:3,sources:["webpack://./src/components/ez-tabs-list/style.less"],names:[],mappings:"AACA;EACE,WAAA;EACA,YAAA;AAAF;AAKA;EACE,gBAAA;EACA,WAAA;EACA,YAAA;AAHF;AAKA;EACE,iCAAA;EACA,oBAAA;EACA,aAAA;EACA,kBAAA;EACA,uBAAA;EACA,WAAA;EACA,YAAA;AAHF;AAMA;EACE,sBAAA;AAJF;AAQA;EACE,kBAAA;EACA,oBAAA;EACA,aAAA;EACA,kBAAA;EACA,cAAA;EACA,uBAAA;EACA,mBAAA;EACA,eAAA;EACA,sBAAA;AANF;AAaA;EACE,aAAA;AAXF;AAcA;EACE,sBAAA;EACA,kBAAA;EACA,qBAAA;EACA,4CAAA;EACA,kBAAA;EACA,UAAA;EACA,YAAA;EACA,eAAA;AAZF;AAcA;EACE,YAAA;AAZF;AAiBA;;EAAiD,WAAA;EAAY,qBAAA;EAAsB,YAAA;EAAa,sBAAA;AAVhG;AAWA;EACE,6BAAA;EACA,0CAAA;EACA,+BAAA;EACA,kCAAA;EACA,mCAAA;EACA,2CAAA;EACA,sBAAA;EAGA,gBAAA;EACA,4BAAA;EACA,qBAAA;EACA,yBAAA;EAEA,kBAAA;EACA,qBAAA;EACA,kBAAA;EACA,cAAA;EACA,qBAAA;EACA,uBAAA;EACA,8BAAA;EACA,sBAAA;EACA,SAAA;EACA,YAAA;EACA,aAAA;EACA,qCAAA;EACA,kBAAA;EACA,mBAAA;EACA,eAAA;EACA,wBAAA;EACA,UAAA;EACA,gBAAA;AAZF;AAcA;EACE,4CAAA;AAZF",sourcesContent:["\n:host{\n  width: 100%;\n  height: 100%;\n}\n:host.col{\n\n}\n.list{\n  overflow: hidden;\n  width: 100%;\n  height: 100%;\n}\n.scroll-area{\n  -webkit-overflow-scrolling: touch;\n  display: -ms-flexbox;\n  display: flex;\n  overflow-x: scroll;\n  scroll-behavior: smooth;\n  width: 100%;\n  height: 100%;\n}\n\n.scroll-content.col{\n  flex-direction: column;\n}\n\n\n.scroll-content{\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  will-change: transform;\n}\n\n\n\n\n\n.scroll-area::-webkit-scrollbar {\n  display: none;\n}\n\n.close-tab{\n  vertical-align: middle;\n  text-align: center;\n  display: inline-block;\n  font-size: var(--close-font-size, 1.3125rem);\n  position: absolute;\n  right: 4px;\n  height: 100%;\n  cursor: pointer;\n}\n.close-tab:hover{\n  opacity: .7;\n}\n\n\n\n.scroll-content > *:before , .close-tab:before { content:''; display:inline-block; height:100%; vertical-align:middle; }\n.scroll-content > *{\n  width: var(--tab-width, auto);\n  padding: var(--tab-padding, 0 24px 0 12px);\n  font-family: Roboto,sans-serif;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-size: var(--label-font-size, .875rem);\n  vertical-align: middle;\n  text-align: center;\n  //line-height: 2.25rem;\n  font-weight: 500;\n  letter-spacing: .0892857143em;\n  text-decoration: none;\n  text-transform: uppercase;\n\n  position: relative;\n  display: inline-block;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  margin: 0;\n  border: none;\n  outline: none;\n  background: var(--tab-bg-color, none);;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  -webkit-appearance: none;\n  z-index: 1;\n  overflow: hidden;\n}\n.scroll-content > .active{\n  background: var(--active-tab-bg-color, #ddd);\n}\n"],sourceRoot:""}]),s.locals={list:"style__list","scroll-area":"style__scroll-area",scrollArea:"style__scroll-area","scroll-content":"style__scroll-content",scrollContent:"style__scroll-content",col:"style__col","close-tab":"style__close-tab",closeTab:"style__close-tab",active:"style__active"},t.exports=s},645:t=>{t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var n="",o=void 0!==e[5];return e[4]&&(n+="@supports (".concat(e[4],") {")),e[2]&&(n+="@media ".concat(e[2]," {")),o&&(n+="@layer".concat(e[5].length>0?" ".concat(e[5]):""," {")),n+=t(e),o&&(n+="}"),e[2]&&(n+="}"),e[4]&&(n+="}"),n})).join("")},e.i=function(t,n,o,s,i){"string"==typeof t&&(t=[[null,t,void 0]]);var l={};if(o)for(var a=0;a<this.length;a++){var r=this[a][0];null!=r&&(l[r]=!0)}for(var c=0;c<t.length;c++){var A=[].concat(t[c]);o&&l[A[0]]||(void 0!==i&&(void 0===A[5]||(A[1]="@layer".concat(A[5].length>0?" ".concat(A[5]):""," {").concat(A[1],"}")),A[5]=i),n&&(A[2]?(A[1]="@media ".concat(A[2]," {").concat(A[1],"}"),A[2]=n):A[2]=n),s&&(A[4]?(A[1]="@supports (".concat(A[4],") {").concat(A[1],"}"),A[4]=s):A[4]="".concat(s)),e.push(A))}},e}},537:t=>{t.exports=function(t){var e=t[1],n=t[3];if(!n)return e;if("function"==typeof btoa){var o=btoa(unescape(encodeURIComponent(JSON.stringify(n)))),s="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(o),i="/*# ".concat(s," */"),l=n.sources.map((function(t){return"/*# sourceURL=".concat(n.sourceRoot||"").concat(t," */")}));return[e].concat(l).concat([i]).join("\n")}return[e].join("\n")}},745:function(t,e,n){var o=this&&this.__createBinding||(Object.create?function(t,e,n,o){void 0===o&&(o=n),Object.defineProperty(t,o,{enumerable:!0,get:function(){return e[n]}})}:function(t,e,n,o){void 0===o&&(o=n),t[o]=e[n]}),s=this&&this.__setModuleDefault||(Object.create?function(t,e){Object.defineProperty(t,"default",{enumerable:!0,value:e})}:function(t,e){t.default=e}),i=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)"default"!==n&&Object.prototype.hasOwnProperty.call(t,n)&&o(e,t,n);return s(e,t),e};Object.defineProperty(e,"__esModule",{value:!0});const l=i(n(143)),a=new CSSStyleSheet;var r,c;!function(t){t[t.row=0]="row",t[t.col=1]="col"}(r||(r={})),function(t){t.left="Left",t.top="Top"}(c||(c={}));class A extends HTMLElement{constructor(){super(),this.closeable=!0,this.activeIndex=0,this.activeClass="ez-tabs-list__active",this.mode=r.row,this.scrollKey=c.left,this.EXTRA_SCROLL_AMOUNT=20,this.custom=!1,this.beforeCloseHooks=[],this.afterCloseHooks=[],this.beforeActiveTabHooks=[],this.afterActiveTabHooks=[];const t=this.attachShadow({mode:"open"});t.adoptedStyleSheets=[a],t.innerHTML=`\n      <div class="${l.list}" role="tablist">\n      <div class="${l.scrollArea}">\n        <slot class="${l.scrollContent}">\n        </slot>\n      </div>\n    </div>\n    `.replace(/[\s\n]*\n[\s\n]*/g,"")}connectedCallback(){if(0==a.cssRules.length&&a.replaceSync(l.toString()),this.scrollArea=this.shadowRoot.querySelector(`.${l.scrollArea}`),this.shadowRoot.host.hasAttribute("mode")&&"col"===this.shadowRoot.host.getAttribute("mode").trim().toLocaleLowerCase()&&(this.mode=r.col),this.shadowRoot.host.hasAttribute("custom")&&"true"===this.shadowRoot.host.getAttribute("custom").trim().toLocaleLowerCase()&&(this.custom=!0),this.custom?this.scrollContent=this.shadowRoot.host:(this.scrollContent=document.createElement("div"),this.scrollContent.className=l.scrollContent,this.scrollArea.appendChild(this.scrollContent),this.shadowRoot.querySelector(`.${l.scrollContent}`).remove()),this.custom&&this.shadowRoot.host.hasAttribute("active-class")){const t=this.shadowRoot.host.getAttribute("active-class").trim();t&&(this.activeClass=t)}if(this.shadowRoot.host.hasAttribute("active-index")){const t=this.shadowRoot.host.getAttribute("active-index").trim();t&&(this.activeIndex=parseInt(t))}this.shadowRoot.host.hasAttribute("closeable")&&"true"===this.shadowRoot.host.getAttribute("closeable").toLocaleLowerCase()&&(this.closeable=!0),this.custom||Array.from(this.shadowRoot.host.children).forEach((t=>{this.scrollContent.appendChild(t)})),this.initInternalEvent(),this.mode===r.col&&(this.shadowRoot.querySelector(`.${l.scrollContent}`).classList.add(l.col),this.scrollKey=c.top)}initInternalEvent(){for(let t=0;t<this.scrollContent.children.length;t++){const e=this.scrollContent.children[t];if(this.activeIndex==t&&e.classList.add(this.activeClass),this.closeable){const n=document.createElement("span");n.innerHTML="&times;",n.className=l.closeTab,e.appendChild(n),n.addEventListener("click",(e=>{e.stopPropagation(),e.preventDefault();const n=new CustomEvent("before-close-tab",{detail:{item:e.target,index:t}});if(this.dispatchEvent(n),!this.beforeCloseHooks.map((t=>t())).every((t=>t)))return;e.target.parentElement.remove();const o=new CustomEvent("close-tab",{detail:{item:e.target,index:1}});this.dispatchEvent(o),this.afterCloseHooks.map((t=>t()))}))}e.addEventListener("click",(t=>{t.target.classList.add(this.activeClass);for(let e=0;e<this.scrollContent.children.length;e++){const n=this.scrollContent.children[e];t.target!==n&&n.classList.remove(this.activeClass)}const e=Array.from(this.scrollContent.children).indexOf(t.target);if(!this.beforeActiveTabHooks.map((t=>t())).every((t=>t)))return;const n=new CustomEvent("active-tab",{detail:{item:t.target,index:e}});this.dispatchEvent(n),this.afterActiveTabHooks.map((t=>{t()}))}))}}activateTab(t){const e=this.shadowRoot.host.children[t];if(e){e.classList.add(this.activeClass);for(let t=0;t<this.shadowRoot.host.children.length;t++){const n=this.shadowRoot.host.children[t];e!==n&&n.classList.remove(this.activeClass)}}}scrollTabIntoView(t){if(!this.indexIsInRange_(t))return;const e=this.scrollKey.toLocaleLowerCase();0!==t?t!==this.getTabListLength()-1?this.scrollIntoViewImpl(t):this.scrollArea.scrollTo({[e]:this.getScrollContentWidth()}):this.scrollArea.scrollTo({[e]:0})}scrollIntoViewImpl(t){const e=this.getScrollPosition(),n=this.getScrollSize(),o=this.getTabDimensionsAtIndex(t),s=this.findAdjacentTabIndexClosestToEdge(t,o,e,n);if(!this.indexIsInRange_(s))return;const i=this.calculateScrollIncrement(t,s,e,n);this.incrementScroll(i)}calculateScrollIncrement(t,e,n,o){const s=this.getTabDimensionsAtIndex(e),i=s.start-n-o;let l=s.end-n-this.EXTRA_SCROLL_AMOUNT,a=i+this.EXTRA_SCROLL_AMOUNT;return console.log(1,l,a,e<t),this.mode===r.col&&(l-=this.EXTRA_SCROLL_AMOUNT,a+=this.EXTRA_SCROLL_AMOUNT),console.log(2,l,a),e<t?Math.min(l,0):Math.max(a,0)}getTabDimensionsAtIndex(t){const e=this.scrollContent.children[t];let n=e.offsetWidth,o=e.offsetLeft;return this.mode===r.col&&(n=e.offsetHeight,o=e.offsetTop),{start:o,end:o+n,contentLeft:o,contentRight:o+n,rootLeft:o,rootRight:o+n}}findAdjacentTabIndexClosestToEdge(t,e,n,o){const s=e.start-n,i=e.end-n-o,l=s+i;return s<0||l<0?t-1:i>0||l>0?t+1:-1}scrollTabTo(t){}incrementScroll(t){const e=`scroll${this.scrollKey}`;console.log("offsetIncrement",this.scrollArea[e],t),this.scrollArea[e]+=t}getScrollPosition(){const t=`scroll${this.scrollKey}`;return this.scrollArea[t]}getScrollContentWidth(){return this.mode===r.col?this.scrollContent.offsetHeight:this.scrollContent.offsetWidth}getScrollSize(){return this.mode===r.col?this.scrollArea.offsetHeight:this.scrollArea.offsetWidth}getTabOffsetWidth(t){return this.scrollContent.children[t].offsetWidth}setActiveTab(t){const e=this.getPreviousActiveTabIndex();this.indexIsInRange_(t)&&t!==e&&(-1!==e&&this.deactivateTabAtIndex(e),this.activateTabAtIndex(t),this.scrollTabIntoView(t),this.notifyTabActivated(t))}notifyTabActivated(t){}getTabIndicatorClientRectAtIndex(t){return null}getTabListLength(){return this.scrollContent.children.length}activateTabAtIndex(t){const e=this.getTabElementAtIndex(t);e.classList.add(this.activeClass),e.setAttribute("aria-selected","true"),e.setAttribute("tabIndex","0"),e.focus()}deactivateTabAtIndex(t){const e=this.getTabElementAtIndex(t);e&&e.classList.contains(this.activeClass)&&(e.classList.remove(this.activeClass),e.setAttribute("aria-selected","false"),e.setAttribute("tabIndex","-1"))}getTabElementAtIndex(t){return this.scrollContent.children[t]}getPreviousActiveTabIndex(){return Array.from(this.scrollContent.children).findIndex((t=>t.classList.contains(this.activeClass)))}indexIsInRange_(t){return t>=0&&t<this.getTabListLength()}getFocusedTabIndex(){return 0}disconnectedCallback(){}static get observedAttributes(){return[]}attributeChangedCallback(t,e,n){}adoptedCallback(){}}customElements.define("ez-tab-list",A)}},e={};!function n(o){var s=e[o];if(void 0!==s)return s.exports;var i=e[o]={id:o,exports:{}};return t[o].call(i.exports,i,i.exports,n),i.exports}(745);
//# sourceMappingURL=ez-tabs-list.js.map