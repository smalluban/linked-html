import Link from './Markers/Link';
import ClassList from './Markers/ClassList';
import Context from './Markers/Context';
import EventListener from './Markers/EventListener';
import Foreach from './Markers/Foreach';
import Property from './Markers/Property';
import Text from './Markers/Text';

const Markers = {
  link: Link,
  class: ClassList,
  context: Context,
  on: EventListener,
  foreach: Foreach,
  prop: Property,
  text: Text
};

const Filters = {
  int: { set: v => parseInt(v, 10), get: String },
  bool: { set: Boolean, get: String }
};

const configMap = new WeakMap();
const exprsMap = new WeakMap();

export default class Engine {
  static config(engine) {
    let config = configMap.get(engine.root);
    if (!config) {
      config = {};
      configMap.set(engine, config);
    }
    return config;
  }

  static exprs(engine) {
    let exprs = exprsMap.get(engine);
    if (!exprs) {
      exprs = new Set();
      exprsMap.set(engine, exprs);
    }
    return exprs;
  }

  constructor(node, {state, markers, filters, prefix, live} = {}) {
    if (state && Object(state) !== state) {
      throw TypeError(`Invalid 'state' option, object required.`);
    }

    const config = Object.defineProperties(Engine.config(this), {
      markers: { value: Object.assign({}, Markers, markers) },
      filters: { value: Object.assign({}, Filters, filters) },
      prefix: { value: (prefix || '-') + '-' },
      live: { value: live === undefined ? true : live }
    });

    Object.defineProperties(this, {
      root: { value: this }, state: { value: state || {} }
    });

    switch(node.nodeType) {
      case Node.ELEMENT_NODE:
        compile(node, this, config.prefix, config.markers);
        break;
      case Node.DOCUMENT_FRAGMENT_NODE:
        Array.from(node.children).forEach(
          node => compile(node, this, config.prefix, config.markers)
        );
        break;
      default:
        throw new TypeError('Element or DocumentFragment required.');
    }

    this.setState();
  }

  setState(fnOrProps) {
    if (fnOrProps) {
      if (typeof fnOrProps === 'function') {
        fnOrProps.call(this, this.state);
      } else {
        Object.assign(this.state, fnOrProps);
      }
    }

    Engine.exprs(this).forEach(expr => expr.check());
  }
}

export function compile(node, engine, prefix, markers) {
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
