import { State } from 'papillon/papillon';

import Link from './Markers/Link';
import ClassList from './Markers/ClassList';
import Context from './Markers/Context';
import EventListener from './Markers/EventListener';
import Foreach from './Markers/Foreach';
import Property from './Markers/Property';
import Reference from './Markers/Reference';
import Text from './Markers/Text';

const Markers = {
  link: Link,
  class: ClassList,
  context: Context,
  on: EventListener,
  foreach: Foreach,
  prop: Property,
  ref: Reference,
  text: Text
};

const Filters = {
  int: { set: v => parseInt(v, 10), get: String },
  bool: { set: Boolean, get: String }
};

const watchers = new WeakMap();
const configs = new WeakMap();
const states = new WeakMap();

export default class Engine {
  static watch(engine, cb) {
    let e = watchers.get(engine);
    if (!e) {
      e = new Set();
      watchers.set(engine, e);
    }
    e.add(cb);
  }

  static config(engine) {
    let c = configs.get(engine.root);
    if (!c) {
      c = {};
      configs.set(engine, c);
    }
    return c;
  }

  static queue(engine) {
    if (!this._request) {
      State.now();

      this._engines = new Set().add(engine);
      this._request = window.requestAnimationFrame(()=> {
        this._engines.forEach(e => {
          const set = watchers.get(e);
          if (set) {
            set.forEach(cb => cb());
          }
        });
        this._request = this._engines = undefined;
      });
    } else {
      this._engines.add(engine);
    }
  }

  static spawn(engine, nodeList, state) {
    const config = Engine.config(engine);
    const childEngine = Object.create(engine);

    Object.defineProperty(childEngine, 'parent', { value: engine });
    childEngine.state = state;

    nodeList.forEach(
      node => compile(node, childEngine, config.prefix, config.markers)
    );

    return childEngine;
  }

  constructor(node, {state, markers, filters, prefix, live} = {}) {
    if (!node) {
      throw new TypeError('Invalid first argument.');
    }

    if (state && Object(state) !== state) {
      throw new TypeError(`Invalid 'state' option, object required.`);
    }

    const config = Object.defineProperties(Engine.config(this), {
      markers: { value: Object.assign({}, Markers, markers) },
      filters: { value: Object.assign({}, Filters, filters) },
      prefix: { value: (prefix || '-') + '-' },
      live: { value: live === undefined ? true : live }
    });

    Object.defineProperty(this, 'root', { value: this });
    this.state = state || {};

    if(node.nodeType === Node.ELEMENT_NODE) {
      compile(node, this, config.prefix, config.markers);
    } else {
      Array.from(node.children || node).forEach(
        n => compile(n, this, config.prefix, config.markers)
      );
    }
  }

  get state() {
    const s = states.get(this);
    if ((typeof s === 'object') && s !== null) {
      Engine.queue(this);
    }
    return s;
  }

  set state(value) {
    states.set(this, value);
    Engine.queue(this);
  }
}

function compile(node, engine, prefix, markers) {
  const prefixLength = prefix.length;
  const compileChilds = Array.from(node.attributes)
    .filter(a => a.name.substr(0, prefixLength) === prefix)
    .reduce((acc, attr) => {
      const id = attr.name.substr(prefixLength)
        .replace(/-([a-z])/g, g => g[1].toUpperCase());

      const marker = markers[id];

      try {
        if (!marker) {
          throw new ReferenceError(`marker '${id}' not found.`);
        }
        marker(engine, node, attr.value);
      } catch(e) {
        const nodeText = node.outerHTML.match(/^<[^<]+>/i);
        e.message = `: ${e.message}\n'${id}' -> ${nodeText}`;
        throw e;
      }

      if (marker._options && marker._options.breakCompile) {
        return false;
      }

      return acc;
    }, true);

  if (compileChilds && node.children.length) {
    Array.from(node.children).forEach(
      node => compile(node, engine, prefix, markers)
    );
  }
}
