import Template from './Template';

const map = new WeakMap();

function extendEngine(engine) {
  if (map.has(engine)) {
    return map.get(engine);
  } else {
    const extended = Object.defineProperties(Object.create(engine), {
      number: { get: function() { return this.index + 1; }},
      odd: { get: function() { return this.number % 2 !== 0; }},
      even: { get: function() { return this.number % 2 === 0; }},
      first: { get: function() { return this.index === 0; }},
      last: { get: function() { return this.length === this.number; }}
    });

    map.set(engine, extended);

    return extended;
  }
}

export default class IndexedTemplate extends Template {
  constructor(nodes, engine, host) {
    super(nodes, extendEngine(engine), host);
  }

  setState(state, {index, length}) {
    super.setState(state);
    Object.assign(this.engine, {index, length});

    return this;
  }
}
