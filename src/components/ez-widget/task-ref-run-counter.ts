import { ACTOR } from './types';

import { IterableWeakMap } from 'iterable-weak-map';
export class TaskRefRunCounter {
  private __taskRunCounter: IterableWeakMap<object, number>;
  private limit = 100;
  constructor(limit = 100) {
    this.limit = limit;
    this.__taskRunCounter = new IterableWeakMap();
  }
  add(act: any){
    const val = this.__taskRunCounter.get(act);
    if (val > this.limit) {
      // copy from vue
      throw new Error(`Maximum recursive updates exceeded in component. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`)
    }
    if (!val) {
      this.__taskRunCounter.set(act, 1)
    } else {
      this.__taskRunCounter.set(act, val + 1)
    }

  }
  reset() {
    this.__taskRunCounter.clear()
  }
}
