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
    }, 300)
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
describe("test for expressions", () => {
  beforeEach(() => {
    //
  });

  afterEach(() => {
    if (clearCallback && clearCallback.call) {
      clearCallback();
    }
  });
  it("each render", (done) => {
    const obj = {
      things : [
        { id: 1, name: 'apple' },
        { id: 2, name: 'banana' },
        { id: 3, name: 'carrot' },
        { id: 4, name: 'doughnut' },
        { id: 5, name: 'egg' },
      ]
    }
    const html =`<ez-widget id="testComp"  style="">
         <input type="text"  .value="{user.name}">
        <h1>Hello {user.name}!</h1>
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {
      // console.log(document.body.innerHTML)
      expect(testComp.children.length).toBe(obj.things.length)
      expect(testComp.children[1].innerHTML).toBe('1|2|banana')
      done()
    });
  });
  it("add item", (done) => {
    const obj = {
      things : [
        { id: 1, name: 'apple' },
        { id: 2, name: 'banana' },
        { id: 3, name: 'carrot' },
        { id: 4, name: 'doughnut' },
        { id: 5, name: 'egg' },
      ]
    }
    const html =`<ez-widget id="testComp"  style="">
       <p :each-things="{thing}" :each-key="id" {...user}>{thing.index}|{thing.item.id}|{thing.item.name}</p>
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {
      // console.log(document.body.innerHTML)
      obj.things = [...obj.things, {id: 6, name: 666}]
      await testComp.updateComplete
      expect(testComp.children.length).toBe(6)
      obj.things = [...obj.things, {id: 7, name: 777}]
      await testComp.updateComplete
      expect(testComp.children.length).toBe(7)
      setTimeout(() => {
        expect(testComp.children[5].innerHTML).toBe('6|6|666')
        done()
      }, 1000)

    });
  });
  it("delete item", (done) => {
    const obj = {
      things : [
        { id: 1, name: 'apple' },
        { id: 2, name: 'banana' },
        { id: 3, name: 'carrot' },
        { id: 4, name: 'doughnut' },
        { id: 5, name: 'egg' },
      ]
    }
    const html =`<ez-widget id="testComp"  style="">
       <p :each-things="{thing}" :each-key="id" {...user}>{thing.index}|{thing.item.id}|{thing.item.name}</p>
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {
      console.log(document.body.innerHTML)
      expect(testComp.children.length).toBe(obj.things.length)
      expect(testComp.children[1].innerHTML).toBe('1|2|banana')
      done()
    });
  });
});
