// import { EzWidget } from '../../../src/components/ez-widget'
import  '../../../src/components/ez-widget';
import fastdom from '../../../src/components/ez-widget/fastdom'


describe("text node function", () => {
  test("test text display", (done) => {
    // actual test

    // (window as any).fastdom = fastdom
    // console.log((window as any).fastdom.measure)
    // window.customElements.define("ez-widget", EzWidget);
    window.eval(`
     document.addEventListener('created', (e) => {
       console.log('created created')
       window.obj = {
        aaaa: 'aaaa',
        src: 'ssrrcc',
        bbbb: '<b>boldHtml</b>' 
      }
       e.target.setState(window.obj);
       console.log('aaaaaaa')
       setTimeout(() => {
       console.log(document.querySelector('p').innerHTML)
       }, 1000)
     });
    `);



    document.body.innerHTML = `
    <ez-widget id="testTextW1"  style="">
      <p>this is aaaa : {aaaa}} {{  src} {{!bbbb}}} }} </p>
    </ez-widget>`



  });
});
