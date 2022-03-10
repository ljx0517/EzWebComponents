// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { EzWidget } from '../../../src/components/ez-widget'
import  '../../../src/components/ez-widget';
import userEvent from '@testing-library/user-event';

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


  it("node attr expressions", (done) => {
    const obj = {
      alt: 'aaaa',
      src: 'ssrrcc'
    }
    const html =`<ez-widget id="testComp"  style="">
      <img id="img" src={src} {alt}>
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {

      expect(img.getAttribute('src')).toBe(obj.src);
      expect(img.getAttribute('alt')).toBe(obj.alt);
      obj.src = '11111'
      await testComp.updateComplete
      expect(img.getAttribute('src')).toBe('11111');
      obj.alt = '22222'
      await testComp.updateComplete
      expect(img.getAttribute('alt')).toBe('22222');
      done()
    });
  });


  it("node attr expressions with function", (done) => {
    const obj = {
      name: 'aaaa',
      fontSize: 16,
      color: 'red',

      getColor() {
        if (this.fontSize % 2) {
          // this.color = 'red'
          return 'red'
        } else {
          // this.color = 'green'
          return 'green'
        }
      }
    }
    const html = `<ez-widget id="testComp"  style="">
      <div id="attrNode" {name}
       title="{name}!!!"
       style="color:{getColor()};font-size: {fontSize}px">{getColor()} {fontSize}</div>
    </ez-widget>`
    clearCallback = prepare(html, obj, async () => {
        expect(attrNode.innerHTML.trim()).toEqual(`green ${obj.fontSize}`);
        expect(attrNode.getAttribute('name')).toEqual(obj.name);
        expect(attrNode.getAttribute('title')).toEqual(`${obj.name}!!!`);
        expect(attrNode.style.color).toEqual('green');
        expect(attrNode.style.fontSize).toEqual(`16px`);
        obj.fontSize += 1
        await testComp.updateComplete
        expect(attrNode.innerHTML.trim()).toEqual(`red 17`);
        expect(attrNode.style.color).toEqual('red');
        expect(attrNode.style.fontSize).toEqual(`17px`);
        obj.fontSize += 1
        await testComp.updateComplete
        expect(attrNode.innerHTML.trim()).toEqual(`green 18`);
        expect(attrNode.style.color).toEqual('green');
        expect(attrNode.style.fontSize).toEqual(`18px`);
        done()
      });
  });
  it("spread attrs expressions", (done) => {
    const obj = {
      user: {
        id: 'uid',
        name: 'John',
        age: 18,
        loggedIn: false,
        login() {
          this.loggedIn = !this.loggedIn
        }
      },
    };
    const html = `<ez-widget id="testComp"  style="">
      <div id="user_{user.id}" {...user}></div>
    </ez-widget>`;
    clearCallback = prepare(html, obj, async () => {
      let userDiv = document.querySelector(`#user_${obj.user.id}`);
      expect(userDiv).toBeFalsy();
      userDiv = document.querySelector(`#${obj.user.id}`);
      expect(userDiv.getAttribute('id')).toBe(obj.user.id);
      expect(userDiv.getAttribute('name')).toBe(obj.user.name);
      expect(userDiv.getAttribute('age')).toBe(`${obj.user.age}`);
      done();
    });
  });
  it("bind function handle", (done) => {
      const obj = {
        count: 0,
        incrementCount(){
          console.log('12312312312312232')
         this.count += 1;
        }
      }
    const html = `<ez-widget id="testComp"  style="">
      <button id="incrementCount" @click="incrementCount">
        Clicked {count} {count === 1 ? 'time' : 'times'}
      </button>
    </ez-widget>`
    clearCallback = prepare(html, obj, async () => {
      userEvent.click(incrementCount)
      await testComp.updateComplete
      expect(incrementCount.innerHTML.trim()).toEqual('Clicked 1 time')
      userEvent.click(incrementCount);
      await testComp.updateComplete
      expect(incrementCount.innerHTML.trim()).toEqual('Clicked 2 times')
      done()
    });
  });
  it("text node display function 1", (done) => {
    const obj =  {
      numbers: [1, 2],
      sum(){
        return this.numbers.reduce((t, n) => t + n, 0)
      },
      addNumber() {
        this.numbers = [...this.numbers, this.numbers.length + 1];
      }
    };
    const html = `<ez-widget id="testComp"  style="">
      <button id="addNumber" @click="{addNumber  }"></button>
      <p id="sum">{numbers.join(' + ')} = {sum}</p>
    </ez-widget>`

    clearCallback = prepare(html, obj, async () => {
        expect(sum.innerHTML.trim()).toEqual('1 + 2 = 3')
        userEvent.click(addNumber)
      await addNumber.updateComplete
        expect(sum.innerHTML.trim()).toEqual('1 + 2 + 3 = 6')
        userEvent.click(addNumber)
      await addNumber.updateComplete
        expect(sum.innerHTML.trim()).toEqual('1 + 2 + 3 + 4 = 10')
        done()
    });

  });
  it("text node display function 2", (done) => {
    const obj = {
      count: 0,
      incrementCount(){
        this.count += 1;
      },
      doubled () {
        return this.count * 2
      }
    }
    const html = `<ez-widget id="testComp"  style="">
      <button id="incrementCount" @click="incrementCount">+</button>
       <p id="display">{count} doubled is {count * 2} | {doubled}| {doubled()}</p>
    </ez-widget>`

    clearCallback = prepare(html, obj, async () => {
      userEvent.click(incrementCount)
      await testComp.updateComplete
      expect(display.innerHTML.trim()).toEqual('1 doubled is 2 | 2| 2')
      userEvent.click(incrementCount);
      await testComp.updateComplete
      expect(display.innerHTML.trim()).toEqual('2 doubled is 4 | 4| 4')
      done()
    })


  });



  it("node attr expressions with function", (done) => {
    const obj = {
      name: 'aaaa',
      fontSize: 16,
      color: 'red',
      incrementFont(){
        this.fontSize += 1;
      },
      getColor() {
        if (this.fontSize % 2) {
          // this.color = 'red'
          return 'red'
        } else {
          // this.color = 'green'
          return 'green'
        }
      }
    }
    const html = `<ez-widget id="testComp"  style="">
       <button id="incrementFont" @click="incrementFont">+</button>
      <div id="attrNode" {name}
       title="{name}!!!"
       style="color:{getColor()};font-size: {fontSize}px">{getColor()} {fontSize}</div>
    </ez-widget>`
    clearCallback = prepare(html, obj, async () => {
      expect(attrNode.innerHTML.trim()).toEqual(`green ${obj.fontSize}`);
      expect(attrNode.getAttribute('name')).toEqual(obj.name);
      expect(attrNode.getAttribute('title')).toEqual(`${obj.name}!!!`);
      expect(attrNode.style.color).toEqual('green');
      expect(attrNode.style.fontSize).toEqual(`16px`);
      userEvent.click(incrementFont)
      await testComp.updateComplete
      expect(attrNode.innerHTML.trim()).toEqual(`red 17`);
      expect(attrNode.style.color).toEqual('red');
      expect(attrNode.style.fontSize).toEqual(`17px`);
      userEvent.click(incrementFont)
      await testComp.updateComplete
      expect(attrNode.innerHTML.trim()).toEqual(`green 18`);
      expect(attrNode.style.color).toEqual('green');
      expect(attrNode.style.fontSize).toEqual(`18px`);
      done()
    });
  });

});
