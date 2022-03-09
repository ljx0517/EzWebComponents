import { TaskRefRunCounter } from './task-ref-run-counter';

type AnyObj = {[key: string]: any}

type G = (Window  & typeof globalThis)
declare type IWindow =  G & {
  __ez_widget_scheduler: Scheduler;
}
const FPS = 1;

function MockRAF(fn: CallableFunction)
{
  fn()
  setTimeout(() => {
    MockRAF(fn);
  }, 1000 / FPS)


}
type ARGS_FN = (...args:any) => void;
type SCHEDULER_PARAMS = {
  limit: number,
  catchFn?: ARGS_FN
}
export class Scheduler{

  public reads: CallableFunction[];
  public writes: CallableFunction[];
  public raf: any;
  public scheduled = false;
  private taskRefCounter: TaskRefRunCounter;
  private catchFn: (...args: any) => void = null;
  constructor(options: SCHEDULER_PARAMS) {
    if ((window as IWindow).__ez_widget_scheduler) {
      return (window as IWindow).__ez_widget_scheduler
    }
    if (options.limit) {
      this.taskRefCounter = new TaskRefRunCounter(options.limit)
    }
    this.catchFn = options.catchFn
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(cb) { return setTimeout(cb, 16); };
    this.reads = [];
    this.writes = [];
    this.raf = raf.bind(window); // test hook
    (window as IWindow).__ez_widget_scheduler = this;
  }
  /**
   * We run this inside a try catch
   * so that if any jobs error, we
   * are able to recover and continue
   * to flush the batch until it's empty.
   *
   * @param {Array} tasks
   */
  runTasks(tasks: CallableFunction[]) {
    let task = tasks.shift();
    if (this.taskRefCounter) {
      this.taskRefCounter.reset()
    }
    while (task){
      if (this.taskRefCounter) {
        this.taskRefCounter.add(task)
      }
      task();
      task = tasks.shift();
    }
  }
  /**
   * Adds a job to the read batch and
   * schedules a new frame if need be.
   *
   * @param  {Function} fn
   * @param  {Object} ctx the context to be bound to `fn` (optional).
   * @public
   */
  measure(fn: CallableFunction, ctx = {}) {
    const task = !ctx ? fn : fn.bind(ctx);
    this.reads.push(task);
    this.scheduleFlush();
    return task;
  }
  /**
   * Adds a job to the
   * write batch and schedules
   * a new frame if need be.
   *
   * @param  {Function} fn
   * @param  {Object} ctx the context to be bound to `fn` (optional).
   * @public
   */
  mutate(fn: CallableFunction, ctx: any = null) {
    const task = !ctx ? fn : fn.bind(ctx);
    this.writes.push(task);
    this.scheduleFlush();
    return task;
  }
  /**
   * Clears a scheduled 'read' or 'write' task.
   *
   * @param {Object} task
   * @return {Boolean} success
   * @public
   */
  clear(task: CallableFunction) {
    return this.remove(this.reads, task) || this.remove(this.writes, task);
  }
  /**
   * Extend this FastDom with some
   * custom functionality.
   *
   * Because fastdom must *always* be a
   * singleton, we're actually extending
   * the fastdom instance. This means tasks
   * scheduled by an extension still enter
   * fastdom's global task queue.
   *
   * The 'super' instance can be accessed
   * from `this.fastdom`.
   *
   * @example
   *
   * var myFastdom = fastdom.extend({
   *   initialize: function() {
   *     // runs on creation
   *   },
   *
   *   // override a method
   *   measure: function(fn) {
   *     // do extra stuff ...
   *
   *     // then call the original
   *     return this.fastdom.measure(fn);
   *   },
   *
   *   ...
   * });
   *
   * @param  {Object} props  properties to mixin
   * @return {FastDom}
   */
  extend(props: object) {
    if (typeof props != 'object') throw new Error('expected object');

    const child = Object.create(this);
    this.mixin(child, props);
    child.__ez_widget_scheduler = this;

    // run optional creation hook
    if (child.initialize) child.initialize();

    return child;
  }

  /**
   * Schedules a new read/write
   * batch if one isn't pending.
   *
   * @private
   */
  scheduleFlush() {
    if (!this.scheduled) {
      this.scheduled = true;
      this.raf(this.flush);
    }
  }
  /**
   * Runs queued `read` and `write` tasks.
   *
   * Errors are caught and thrown by default.
   * If a `.catch` function has been defined
   * it is called instead.
   *
   * @private
   */
  flush = () => {
    const { reads, writes } = this;
    let error;

    try {
      // this.runTasks(reads);
      this.runTasks(writes);
    } catch (e) {
      this.reads.length = 0;
      this.writes.length = 0;
      error = e;
    }

    this.scheduled = false;

    // If the batch errored we may still have tasks queued
    if (reads.length || writes.length) {
      this.scheduleFlush()
    }

    if (error) {
      if (this.catchFn) this.catchFn(error);
      else throw error;
    }
  }
  /**
   * Remove an item from an Array.
   *
   * @param  {Array} array
   * @param  {*} item
   * @return {Boolean}
   */
  remove(array: any[], item: any) {
    const index = array.indexOf(item);
    return !!~index && !!array.splice(index, 1);
  }

  /**
   * Mixin own properties of source
   * object into the target.
   *
   * @param  {Object} target
   * @param  {Object} source
   */
  mixin(target: AnyObj, source: AnyObj) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
}


