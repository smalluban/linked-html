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
    expr.set = ()=> {};
  },
  '*': function(expr) {
    expr.deep = true;
  }
};

export default Flags;
