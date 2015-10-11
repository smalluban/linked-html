import Expression from './Expression/Expression';

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
  string: { set: String },
  int: { set: v => parseInt(v, 10) },
  bool: { set: Boolean }
};

class Engine {
  constructor(node, {state, markers, filters, prefix} = {}) {
    if (state && Object(state) !== state) {
      throw TypeError(`Invalid 'state' option, object required.`);
    }

    Object.defineProperties(this, {
      root: { value: this },
      state: { value: state || {} },
      _markers: { value: Object.assign({}, Markers, markers) },
      _filters: { value: Object.assign({}, Filters, filters) },
      _prefix: { value: (prefix || '-') + '-' },
      _exprs: { value: new Set() }
    });

    switch(node.nodeType) {
      case Node.ELEMENT_NODE:
        this._compile(node);
        break;
      case Node.DOCUMENT_FRAGMENT_NODE:
        Array.from(node.children).forEach(n => this._compile(n));
        break;
      default:
        throw new TypeError('Element or DocumentFragment required.');
    }
  }

  setState(fnOrProps) {
    if (fnOrProps) {
      if (typeof fnOrProps === 'function') {
        fnOrProps.call(this, this.state);
      } else {
        Object.assign(this.state, fnOrProps);
      }
    }

    this._exprs.forEach(expr => expr.value);
  }

  link(evaluate, {value, observe} = {}) {
    const expr = new Expression(evaluate, {
      engine: this, filters: this._filters
    });

    if (value !== undefined) {
      expr.setDefaultTo(value);
    }

    if (observe) {
      expr.observe(observe, true);
    }

    this._exprs.add(expr);

    return expr;
  }

  _compile(node, refresh = true) {
    const prefixLength = this._prefix.length;
    const compileChilds = Array.from(node.attributes)
      .filter(a => a.name.substr(0, prefixLength) === this._prefix)
      .reduce((acc, attr) => {
        const id = attr.name.substr(prefixLength)
          .replace(/-([a-z])/g, g => g[1].toUpperCase());

        const Marker = this._markers[id];

        try {
          if (!Marker) {
            throw new ReferenceError(`Marker '${id}' not found.`);
          }
          new Marker(this, node, attr.value);
        } catch(e) {
          const nodeText = node.outerHTML.match(/^<[^<]+>/i);
          e.message = `: ${e.message}\n'${id}' -> ${nodeText}`;
          throw e;
        }

        if (Marker._options && Marker._options.breakCompile) {
          return false;
        }

        return acc;
      }, true);

    if (compileChilds && node.children.length) {
      Array.from(node.children)
        .forEach(child => this._compile(child, false));
    }

    if (refresh) {
      this.setState();
    }
  }

  _spawn(nodes, state, properties) {
    const child = Object.create(this);

    Object.defineProperties(child, {
      state: { value: state, writable: true },
      parent: { value: this },
      _exprs: { value: new Set() }
    });

    Object.assign(child, properties);

    [].concat(nodes).forEach(n => child._compile(n));

    return child;
  }
}

export default Engine;
