import { State } from 'papillon/papillon';
import Engine from '../Engine';
import Path from './Path';
import Flags from './Flags';

export default class Expression {
  static parse(evaluate) {
    const [temp, filter] = evaluate.split('|');
    const flags = new Set();

    for(var index = 0; index < temp.length; index++) {
      if (Flags[temp[index]]) {
        flags.add(temp[index]);
      } else {
        break;
      }
    }

    const expr = temp.substr(index);
    return [flags, expr, filter];
  }

  constructor(engine, evaluate) {
    if(!evaluate || typeof evaluate !== 'string') {
      throw new TypeError(`'${evaluate}': Invalid input type.`);
    }

    const [flags, expr, filter] = Expression.parse(evaluate.trim());
    this.engine = engine;
    this.filter = { get: v => v, set: v => v };

    if (this.engine.state) {
      this.context = ()=> this.engine.state;
    } else {
      this.context = ()=> {
        if (this.engine.state === undefined) {
          this.engine.state = {};
        }
        return this.engine.state;
      };
    }

    if (filter) {
      if (!engine._filters[filter]) {
        throw new ReferenceError(`Filter '${filter}' not found.`);
      }
      Object.assign(this.filter, engine._filters[filter]);
    }

    flags.forEach(f => Flags[f](this, engine));
    this.path = new Path(expr, this.context);
  }

  get() {
    return this.filter.get(this.path.get());
  }

  set(value, onlyDefaults) {
    return this.path.set(this.filter.set(value), onlyDefaults);
  }

  call(...args) {
    return this.path.call(...args);
  }

  observe(cb, init = false, deep = false) {
    let target;
    let cache = this.get();

    if (deep) {
      target = new State(Object.defineProperty({}, 'value', {
        get: this.get.bind(this),
        configurable: true,
        enumerable: true
      }));
    }

    Engine.watch(this.engine, ()=> {
      const newVal = this.get();

      if (target && target.isChanged()) {
        cb(newVal, target.changelog.value);
      } else if (!State.is(newVal, cache)) {
        cb(newVal);
      }

      cache = newVal;
    });

    if (init) {
      cb(cache);
    }
  }
}
