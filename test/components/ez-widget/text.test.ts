// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { EzWidget } from '../../../src/components/ez-widget'
import  '../../../src/components/ez-widget';
import userEvent from '@testing-library/user-event';

const await = async (tm) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, tm)
  });
}
function prepare(html, obj, callback) {
  const create = async (e) => {
    e.target.setState(obj);
    await e.target.updateComplete
    setTimeout(() => {
      callback(e)
    }, 100)
  }
  // const ready = async (e) => {
  //   await callback(e)
  // }
  // const [create, ready] = createHandle();
  document.addEventListener('created', create);
  document.body.innerHTML = html;
  return () => {
    document.removeEventListener('created', create);
  }
}
let clearCallback = null
describe("test expressions", () => {
  beforeEach(() => {
    //
  });

  afterEach(() => {
    if (clearCallback && clearCallback.call) {
      clearCallback();
    }
  });
  it("text render", (done) => {
    const obj = {
      aaaa: 'aaaa',
      src: 'ssrrcc',
      bbbb: '<b>boldHtml</b>'}
    const html =`<ez-widget id="testTextW1"  style="">
      <p id="p1">{aaaa}</p>
      <p id="p2">{  src}</p>
      <p id="p3">{!bbbb}</p>
    </ez-widget>`;
    clearCallback = prepare(html, obj, () => {
      expect(p1.innerHTML.trim()).toBe(obj.aaaa);
      expect(p2.innerHTML.trim()).toBe(obj.src);
      expect(p3.innerHTML.trim()).toContain(obj.bbbb);
      done()
    });
  });
  it("text change", (done) => {
    const obj = {
      aaaa: 'aaaa',
      src: 'ssrrcc',
      bbbb: '<b>boldHtml</b>'}
    const html =`<ez-widget id="testTextW1"  style="">
      <p id="p1">{aaaa}</p>
      <p id="p2">{  src}</p>
      <p id="p3">{!bbbb}</p>
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {
      obj.aaaa = '11111'
      await testTextW1.updateComplete
      expect(p1.innerHTML.trim()).toBe('11111');
      obj.src = '12345678'
      await testTextW1.updateComplete
      expect(p2.innerHTML.trim()).toBe('12345678');

      obj.bbbb = `<div style="color: red">HTML tag</div>`
      await testTextW1.updateComplete
      const div = p3.querySelector('div')
      expect(div.innerHTML.trim()).toBe('HTML tag');
      expect(div.style.color).toBe('red');
      done()
    });
  });
  it("text ith function", (done) => {
    const obj = {
      a: 'aaaa',
      fn1(){
        return this.a
      }
    }
    const html =`<ez-widget id="testTextW1"  style="">
      <p id="p1">{fn1()}</p>
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {
      await testTextW1.updateComplete
      expect(p1.innerHTML.trim()).toBe(obj.a);
      obj.a = '12345678'
      await testTextW1.updateComplete
      expect(p1.innerHTML.trim()).toBe('12345678');
      done()
    });
  });
});
