export const ELEMENT_NODE = 1;
export const DOCUMENT_FRAGMENT_NODE = 11;
export const TEXT_NODE = 3;
export const COMMENT_NODE = 8;

export const IS_PROXY = Symbol("IS_PROXY")
export const PARENT_PATH = Symbol("PARENT_PATH")
export type VAR_AND_EXPRESSION = {
  expression: string;
  vars: Set<string>;
  monitState?: boolean,
  runtimeFn?: CallableFunction
}
export enum LOOP_CONDITION_STATEMENT {
  CONTINUE,
  BREAK,
  RETURN,
  NOTHING
}
export const EXPRESSION_REGEX = /{([^{}]+?)}/g;

export enum DOM_RENDER_ACTION_TYPE {
  REPLACE,
  REORDER,
  ATTRS,
  TEXT
}

export type ACTOR = ((...args: any) => void|CallableFunction) & {
  stack?: any,
  node?: any
};

export type iterableObj<T> = {
  [key: string]: T
  // [Symbol.iterator]: T
  // [Symbol.iterator]() : IterableIterator<any>;
};

export type VELEMENT  = (HTMLElement ) & {
  detach: () => void;
  ___bind_meta?: any;
  ___uniqueItemKey?:string|symbol;
  ___ez_compiled: boolean;
  compileContext: iterableObj<any>} & {
  [propName: string]: any;
}
export type EXPRESSION_ACTION = (...args: any) => void;
