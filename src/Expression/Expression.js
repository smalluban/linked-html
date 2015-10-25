import { Observer } from 'papillon/papillon';
import Path from './Path';
import Flags from './Flags';

class Expression {
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

  constructor(evaluate, { engine, filters } = {}) {
    if(!evaluate || typeof evaluate !== 'string') {
      throw new TypeError(`'${evaluate}': Invalid input type.`);
    }

    if (engine.state) {
      this.context = ()=> engine.state;
    } else {
      this.context = ()=> {
        if (engine.state === undefined) {
          engine.state = {};
        }
        return engine.state;
      };
    }

    const [flags, expr, filter] = Expression.parse(evaluate.trim());

    this.evaluate = expr;

    this.filter = { get: v => v, set: v => v };

    if (filter) {
      if (!filters[filter]) {
        throw new ReferenceError(`Filter '${filter}' not found.`);
      }
      Object.assign(this.filter, filters[filter]);
    }

    flags.forEach(f => Flags[f](this, engine));

    this.live = engine._live;
    this.path = new Path(this.evaluate, this.context);
  }

  get value() {
    return this.filter.get(this.path.get());
  }

  set value(newVal) {
    this.path.set(this.filter.set(newVal));
  }

  call(...args) {
    this.path.call(...args);
  }

  setDefaultTo(value) {
    return this.path.set(this.filter.set(value), true);
  }

  observe(cb, init = false) {
    const tempValue = this.value;

    if (this.live) {
      new Observer(this, 'value', (changelog)=> {
        cb(this.value, changelog.value);
      });
    }

    if (init) {
      cb(tempValue);
    }
  }
}

export default Expression;
