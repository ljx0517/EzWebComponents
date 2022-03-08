// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { EzWidget } from '../../../src/components/ez-widget'
import  '../../../src/components/ez-widget';
import userEvent from '@testing-library/user-event';


describe("test expressions", () => {
  it("text expressions display", (done) => {
    const handle = (e) => {
      window.obj = {
        aaaa: 'aaaa',
        src: 'ssrrcc',
        bbbb: '<b>boldHtml</b>'
      }
      e.target.setState(window.obj);
      setTimeout(() => {
        expect(p1.innerHTML.trim()).toBe(obj.aaaa);
        expect(p2.innerHTML.trim()).toBe(obj.src);
        expect(p3.innerHTML.trim()).toContain(obj.bbbb);
        document.removeEventListener('created', handle)
        done()
      }, 100)
    }
    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <p id="p1">{aaaa}</p>
      <p id="p2">{  src}</p>
      <p id="p3">{!bbbb}</p>
    </ez-widget>`
  });

  it("node attr expressions", (done) => {
    const handle = (e) => {
      window.obj = {
        src: 'aaaa',
        alt: 'ssrrcc',
      }
      e.target.setState(window.obj);
      setTimeout(() => {
        expect(p1.getAttribute('src')).toBe(obj.src);
        expect(p1.getAttribute('alt')).toBe(obj.alt);
        document.removeEventListener('created', handle)
        done()
      }, 100)
    }
    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <img id="p1" src={src} {alt}>
    </ez-widget>`
  });
  it("node attr expressions with function", (done) => {
    const handle = (e) => {
      window.obj = {
        name: 'aaaa',
        fontSize: 16,
        color: 'red',
        incrementFont(){
          this.fontSize += 1;
        },
        getColor() {
          if (this.fontSize % 2) {
            this.color = 'red'
            return 'red'
          } else {
            this.color = 'green'
            return 'green'
          }
        }
      }
      e.target.setState(window.obj);
      setTimeout(() => {
        console.log(attrNode.innerHTML)
        expect(attrNode.innerHTML.trim()).toEqual(`green ${obj.fontSize}`);
        expect(attrNode.getAttribute('name')).toEqual(obj.name);
        expect(attrNode.getAttribute('title')).toEqual(`${obj.name}!!!`);
        expect(attrNode.style.color).toEqual('green');
        expect(attrNode.style.fontSize).toEqual(`16px`);
        userEvent.click(incrementFont)
      }, 100);
      setTimeout(() => {
        console.log(attrNode.innerHTML)
        expect(attrNode.innerHTML.trim()).toEqual(`red 17`);
        expect(attrNode.style.color).toEqual('red');
        expect(attrNode.style.fontSize).toEqual(`17px`);
        userEvent.click(incrementFont)
      }, 200);
      setTimeout(() => {
        expect(attrNode.innerHTML.trim()).toEqual(`green 18`);
        expect(attrNode.style.color).toEqual('green');
        expect(attrNode.style.fontSize).toEqual(`18px`);
        document.removeEventListener('created', handle)
        done()
      }, 300);
    }
    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
       <button id="incrementFont" @click="incrementFont">+</button>
      <div id="attrNode" {name}
       title="{name}!!!"
       style="color:{getColor()};font-size: {fontSize}px">{color} {fontSize}</div>
    </ez-widget>`
  });
  it("spread attrs expressions", (done) => {
    const handle = (e) => {
      window.obj = {
        user: {
          id: 'uid',
          name: 'John',
          age: 18,
          loggedIn: false,
          login() {
            this.loggedIn = !this.loggedIn
          }
        },
      }
      e.target.setState(window.obj);
      setTimeout(() => {
        console.log(document.body.innerHTML);
        let userDiv = document.querySelector(`#user_${obj.user.id}`);
        expect(userDiv).toBeFalsy();
        userDiv = document.querySelector(`#${obj.user.id}`);
        expect(userDiv.getAttribute('id')).toBe(obj.user.id);
        expect(userDiv.getAttribute('name')).toBe(obj.user.name);
        expect(userDiv.getAttribute('age')).toBe(`${obj.user.age}`);
        document.removeEventListener('created', handle);
        done()
      }, 1000);
    }

    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <div id="user_{user.id}" {...user}></div>
    </ez-widget>`
  });

  it("bind function handle", (done) => {
    const handle = (e) => {
      window.obj = {
        count: 0,
        incrementCount(){
          console.log('12312312312312232')
         this.count += 1;
        }
      }
      e.target.setState(window.obj);
      setTimeout(() => {
        userEvent.click(incrementCount)
      }, 500);
      setTimeout(() => {
        expect(incrementCount.innerHTML.trim()).toEqual('Clicked 1 time')
        userEvent.click(incrementCount);
      }, 1000);
      setTimeout(() => {
        expect(incrementCount.innerHTML.trim()).toEqual('Clicked 2 times')
        document.removeEventListener('created', handle);
        done()
      }, 1500);
    }

    document.addEventListener('created', handle);
    document.body.innerHTML = `<ez-widget id="testTextW1"  style="">
      <button id="incrementCount" @click="incrementCount">
        Clicked {count} {count === 1 ? 'time' : 'times'}
      </button>
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
      e.target.setState(window.obj);

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
      e.target.setState(window.obj);
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
