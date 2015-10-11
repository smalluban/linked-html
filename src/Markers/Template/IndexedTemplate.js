import Template from './Template';

const map = new WeakMap();

function extendEngine(engine) {
  if (map.has(engine)) {
    return map.get(engine);
  }

  return Object.defineProperties(Object.create(engine), {
    number: { get: function() { return this.index + 1; }},
    odd: { get: function() { return this.number % 2 !== 0; }},
    even: { get: function() { return this.number % 2 === 0; }},
    first: { get: function() { return this.index === 0; }},
    last: { get: function() { return this.length === this.number; }}
  });
}

class IndexedTemplate extends Template {
  constructor(nodes, engine, host) {
    super(nodes, extendEngine(engine), host);
  }

  setState(state, {index, length}) {
    if (!this.engine) {
      this.engine = this.parentEngine._spawn(
        this.nodes.filter(n => n.nodeType === Node.ELEMENT_NODE),
        state, {index, length}
      );
    } else {
      this.engine.setState(function() {
        Object.assign(this, { state, index, length });
      });
    }

    return this;
  }
}

export default IndexedTemplate;
