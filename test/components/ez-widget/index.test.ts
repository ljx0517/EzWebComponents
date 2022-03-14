// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { EzWidget } from '../../../src/components/ez-widget'
import  '../../../src/components/ez-widget';
import userEvent from '@testing-library/user-event';


describe("test text node expressions", () => {
  it("text expressions display", (done) => {
    const handle = (e) => {
      window.obj = {
        aaaa: 'aaaa',
        src: 'ssrrcc',
        bbbb: '<b>boldHtml</b>'
      }
      e.currentTarget.setState(window.obj);
      setTimeout(() => {
        expect(p1.innerHTML.trim()).toBe(obj.aaaa);
        expect(p2.innerHTML.trim()).toBe(obj.src);
        expect(p3.innerHTML.trim()).toContain(obj.bbbb);
        document.removeEventListener('created', handle)
        done()
      }, 50)
    }
    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <p id="p1">{aaaa}</p>
      <p id="p2">{  src}</p>
      <p id="p3">{!bbbb}</p>
    </ez-widget>`
  });
  it("text node display function 1", (done) => {
    const handle = (e) => {
      window.obj = {
        numbers: [1, 2],
        sum(){
          return this.numbers.reduce((t, n) => t + n, 0)
        },
        addNumber() {
          this.numbers = [...this.numbers, this.numbers.length + 1];
        }
      }
      e.currentTarget.setState(window.obj);

      setTimeout(() => {
        expect(sum.innerHTML.trim()).toEqual('1 + 2 = 3')
        userEvent.click(addNumber)
      }, 100);
      setTimeout(() => {
        expect(sum.innerHTML.trim()).toEqual('1 + 2 + 3 = 6')
        userEvent.click(addNumber)
      }, 200);
      setTimeout(() => {
        expect(sum.innerHTML.trim()).toEqual('1 + 2 + 3 + 4 = 10')
        document.removeEventListener('created', handle);
        done()
      }, 500)
    }

    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <button id="addNumber" @click="{addNumber  }"></button>
      <p id="sum">{numbers.join(' + ')} = {sum}</p>
    </ez-widget>`
  });
  it("text node display function 2", (done) => {
    const handle = (e) => {
      window.obj = {
        count: 0,
        incrementCount(){
          this.count += 1;
        },
        doubled () {
          return this.count * 2
        }
      }
      e.currentTarget.setState(window.obj);
      setTimeout(() => {
        userEvent.click(incrementCount)
      }, 100);
      setTimeout(() => {
        expect(display.innerHTML.trim()).toEqual('1 doubled is 2 | 2| 2')
        userEvent.click(incrementCount);
      }, 200);
      setTimeout(() => {
        expect(display.innerHTML.trim()).toEqual('2 doubled is 4 | 4| 4')
        document.removeEventListener('created', handle);
        done()
      }, 300);
    }

    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <button id="incrementCount" @click="incrementCount">+</button>
       <p id="display">{count} doubled is {count * 2} | {doubled}| {doubled()}</p>
    </ez-widget>`
  });

});
