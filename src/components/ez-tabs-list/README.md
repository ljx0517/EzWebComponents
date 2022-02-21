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
  qwe.addEventListener("close-tab", (e) => {
      console.log('close-tab', e.detail)
  })
  qwe.addEventListener("active-tab", (e) => {
    console.log('active-tab', e.detail);
    e.stopPropagation();
    e.preventDefault();
  })
</script>
```

## hooks
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
