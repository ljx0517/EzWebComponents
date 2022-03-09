interface IStringable<T> {
  toString: () => string
}
type Css<T> = IStringable<T> & {
  [className: string]: string;
}

declare module '*.less'{
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
  // export = Css;
}
declare module '*.css'
{
  // const classes: { [className: string]: string };
  const locals: { [className: string]: string };
  const toString: () => string;
  export { locals, toString };
}

