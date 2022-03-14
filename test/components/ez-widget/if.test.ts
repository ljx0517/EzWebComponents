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
    e.currentTarget.setState(obj);
    await e.currentTarget.updateComplete
    setTimeout(() => {
      callback(e)
    })
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
describe("test if expressions", () => {
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
      user: {
        id: 'uid',
        name: 'John',
        age: 18,
        loggedIn: false,
        toggle() {
          this.loggedIn = !this.loggedIn;
        },
        isLogin() {
          return this.loggedIn
        },
      }
    }
    const html =`<ez-widget id="testComp"  style="">
      <button :if-true={user.loggedIn} @click={user.toggle}>
        Log out
      </button>
      <button :if-false={user.loggedIn} @click={user.toggle}>
        Log in
      </button
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {
      const btns = testComp.querySelectorAll('button')
      expect(btns.length).toBe(1)
      expect(btns[0].innerHTML.trim()).toBe('Log in')
      userEvent.click(btns[0])
      await testComp.updateComplete
      const btns2 = testComp.querySelectorAll('button')
      expect(btns2.length).toBe(1)
      expect(btns2[0].innerHTML.trim()).toBe('Log out')
      done()
    });
  });
});
