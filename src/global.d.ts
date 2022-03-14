
interface IStringable<T> {
  toString: () => string
}
type Css<T> = IStringable<T> & {
  [className: string]: string;
}
interface ILocals {
    [className: string]: string;
}
declare module '*module.less'{
  interface IStyle {
    // locals: ILocals;
    [className: string]: string;
  }
  const classNames: IStyle
  export = classNames;
  // export default IStyle;
}




declare module '*module.css'
{
  const locals: ILocals;
  const toString: () => string;
  export { locals, toString };
}
declare module 'pace-js'{
  // export default class pace {
  //   static start: CallableFunction;
  //   static restart: CallableFunction;
  // }

    const start: ()=> void;
    const restart: ()=> void;
    export {
      start,  restart
    }
}
// declare module 'json-tree-view';{
//   declare class JSONTreeView {}
//   export default JSONTreeView;
// }


type G = (Window  & typeof globalThis)
declare type WindowType =   (Window  & typeof globalThis) & {
  paceOptions: any;
}
