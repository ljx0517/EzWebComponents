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
// declare module '*.module.less'{
//   interface IClassNames {
//     [className: string]: string;
//   }
//   const classNames: IClassNames;
//   export = classNames;
//   // export = Css;
// }


declare module '*module.css'
{
  // const classes: { [className: string]: string };
  // const locals: { [className: string]: string };
  const locals: ILocals;
  const toString: () => string;
  export { locals, toString };
}

