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

  static queue(cb) {
    if (!this._request) {
      State.now();

      this._callbacks = new Set().add(cb);
      this._request = window.requestAnimationFrame(()=> {
        this._callbacks.forEach(cb => cb());
        this._request = this._callbacks = undefined;
      });
    } else {
      this._callbacks.add(cb);
    }

    return cb;
  }

  constructor(engine, evaluate) {
    if(!evaluate || typeof evaluate !== 'string') {
      throw new TypeError(`'${evaluate}': Invalid input type.`);
    }

    const [flags, expr, filter] = Expression.parse(evaluate.trim());

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

    this.filter = { get: v => v, set: v => v };

    if (filter) {
      if (!engine._filters[filter]) {
        throw new ReferenceError(`Filter '${filter}' not found.`);
      }
      Object.assign(this.filter, engine._filters[filter]);
    }

    flags.forEach(f => Flags[f](this, engine));

    this.path = new Path(expr, this.context);

    Engine.exprs(engine).add(this);
  }

  get() {
    return this.filter.get(this.path.get());
  }

  set(value, onlyDefaults) {
    this.cache = this.path.set(this.filter.set(value), onlyDefaults);
    return this.cache;
  }

  call(...args) {
    this.path.call(...args);
  }

  check() {
    if (!this.checkFn) {
      this.checkFn = Expression.queue(()=> {
        const newVal = this.get();

        if (this.state && this.state.isChanged()) {
          this.cb(newVal, this.state.changelog.value);
        } else if (!State.is(newVal, this.cache)) {
          this.cb(newVal);
        }

        this.checkFn = null;
      });
    }
  }

  observe(cb, init = false, deep = false) {
    if (this.cb) {
      throw new Error('Observe callback already set.');
    }
    this.cb = cb;

    if (deep) {
      const target = Object.defineProperty({}, 'value', {
        get: this.get.bind(this),
        configurable: true,
        enumerable: true
      });

      this.state = new State(target);
    }

    if (init) {
      this.cb(this.get());
    }
  }
}
