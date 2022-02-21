## Stand webcomponents

this component do not contain tab panel, you can use event build you own tan panel

### tab
attrs:

&emsp;&emsp;`custom` default: false


&emsp;&emsp;when custom = true;
```html
<ez-tab-list custom="true">
    <div class="tab">tab 1</div>
    <div class="tab">tab 2</div>
</ez-tab-list>
```
&emsp;&emsp;tab element in outer dom, use your own css

&emsp;&emsp;when custom is false;

&emsp;&emsp;the tab element will slot in shadowRoot, use default style css

&emsp;&emsp;`closeable` default: true

&emsp;&emsp;tab can closeable, this will append an X in tab element

&emsp;&emsp;`active-index` default: 0

&emsp;&emsp;default active tab page index

&emsp;&emsp;`active-class` default: active

&emsp;&emsp;active tab's css className

## Event
`close-tab` 

`active-tab`

```javascript
<ez-tab-list id="abc">
    <div class="tab">tab 1</div>
    <div class="tab">tab 2</div>
</ez-tab-list>
<script>
  const tabs = document.querySelector('#abc');
  tabs.addEventListener("close-tab", (e) => {
      console.log('close-tab', e.detail)
  })
  tabs.addEventListener("active-tab", (e) => {
    console.log('active-tab', e.detail)
    e.stopPropagation();
    e.preventDefault();
  })
</script>
```

## hooks
can add many hook function in hook point
```javascript
const tabs = document.querySelector('#abc');
// run hook function before close tab
tabs.addBeforeCloseHooks(() => {
  // return false prevent close tab
  return false
});


// run hook function after tab close
tabs.addAfterCloseHooks(() => {
  
})

// run hook function before active tab
tabs.addBeforeActiveTabHooks(() => {
  // return false prevent close tab
  return false
});


// run hook function after active close
tabs.addAfteActiveTabHooks(() => {

})

```

## style
`--tab-width: auto;`

`--tab-padding: 0 24px 0 12px;`

`--label-font-size: .875rem;`

`--tab-bg-color:#666;`

`--active-tab-bg-color: #ccc;`

`--close-font-size: 1.3125rem`

```html
<ez-tab-list id="qwe"
             style="--tab-width: auto;--tab-padding: 0 16px;--label-font-size: 16px;--tab-bg-color:#666;--active-tab-bg-color: #ccc;"
             custom="false" closeable="true" active-index="0" active-class="active">
</ez-tab-list>

```
