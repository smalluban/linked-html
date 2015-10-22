import { Observer } from 'papillon/papillon';
import Path from './Path';
import Flags from './Flags';

const EXPR_MATCH = new RegExp(
  '^([\\' + Object.keys(Flags).join('\\') + ']*)([^|]+)(\\|([^|]+))?$');

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

    const [flags, expr, filter] = Expression.parse(evaluate.trim());

    this.filter = { get: v => v, set: v => v };

    if (filter) {
      if (!filters[filter]) {
        throw new ReferenceError(`Filter '${filter}' not found.`);
      }
      Object.assign(this.filter, filters[filter]);
    }

    this.evaluate = expr;

    this.context = ()=> {
      if (engine.state === undefined) {
        engine.state = {};
      }
      return engine.state;
    };

    flags.forEach(f => Flags[f](this, engine));

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

    new Observer(this, 'value', (changelog)=> {
      cb(this.value, changelog.value);
    });

    if (init) {
      cb(tempValue);
    }
  }
}

export default Expression;
