## Stand webcomponents

### tab
attrs:

&emsp;custom default: false


when custom = true;
```html
<ez-tab-list custom="true">
    <div class="tab">tab 1</div>
    <div class="tab">tab 2</div>
</ez-tab-list>
```
tab element in outer dom, use your own css

when custom is false;

the tab element will slot in shadowRoot, use default style css

&emsp;closeable default: true

`tab can closeble, this will append a X in tab element`

&emsp;active-index default: 0

`default active tab page index`

&emsp;active-class default: active

`active tab's css className`
