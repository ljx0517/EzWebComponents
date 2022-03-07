// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { EzWidget } from '../../../src/components/ez-widget'
import  '../../../src/components/ez-widget';


describe("text node function", () => {
  test("test text display", (done) => {
     document.addEventListener('created', (e) => {
       window.obj = {
        aaaa: 'aaaa',
        src: 'ssrrcc',
        bbbb: '<b>boldHtml</b>'
      }
       e.target.setState(window.obj);
       setTimeout(() => {
          console.log(document.querySelector('p').innerHTML)
         done()
       }, 1000)

     });



    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <p>this is aaaa : {aaaa}} {{  src} {{!bbbb}}} }} </p>
    </ez-widget>`

  });
});
