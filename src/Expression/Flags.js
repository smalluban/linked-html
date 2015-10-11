const Flags = {
  '!': function(expr) {
    const filter = expr.filter;
    expr.filter = {
      get: v => filter.get(!v), set: v => filter.set(!v)
    };
  },
  '@': function(expr, engine) {
    expr.context = ()=> engine;
  },
  '&': function(expr) {
    const proto = Object.getPrototypeOf(expr);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');

    desc.set = ()=> {};
    Object.defineProperty(expr, 'value', desc);
    Object.defineProperty(expr, 'setDefaultTo', { value: ()=> {} });
  }
};

export default Flags;
