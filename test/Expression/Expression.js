import Expression from '../../src/Expression/Expression';

describe('Expression', ()=> {
  let expr, engine, filter, spyGet, spySet;

  beforeEach(()=> {
    filter = { get: v => v, set: v => v };
    engine = { state: {}, _live: true, _filters: { filter } };
    spyGet = spyOn(filter, 'get').and.callThrough();
    spySet = spyOn(filter, 'set').and.callThrough();
  });

  describe('filter', ()=> {
    beforeEach(()=> {
      expr = new Expression(engine, 'test|filter');
    });

    it('call filter get method', ()=> {
      expr.get();
      expect(spyGet).toHaveBeenCalled();
    });

    it('call filter set method', ()=> {
      expr.set(1);
      expect(spySet).toHaveBeenCalled();
    });
  });

  describe('`!` flag', ()=> {
    beforeEach(()=> {
      expr = new Expression(engine, '!test|filter');
    });

    it('get negative value of target property', ()=> {
      engine.state.test = true;
      expect(expr.get()).toEqual(false);
    });

    it('set negative value to target property', ()=> {
      expr.set(true);
      expect(engine.state.test).toEqual(false);
    });

    it('not change get filter', ()=> {
      expr.get();
      expect(spyGet).toHaveBeenCalled();
    });

    it('not change set filter', ()=> {
      expr.set(1);
      expect(spySet).toHaveBeenCalled();
    });
  });

  describe('`@` flag', ()=> {
    beforeEach(()=> {
      expr = new Expression(engine, '@test');
    });

    it('get from engine target', ()=> {
      engine.test = "test";
      expect(expr.get()).toEqual("test");
    });

    it('set to engine target', ()=> {
      expr.set("test");
      expect(engine.test).toEqual("test");
    });
  });

  describe('`&` flag', ()=> {
    beforeEach(()=> {
      expr = new Expression(engine, '&test');
    });

    it('makes target property readonly', ()=> {
      engine.state.test = 'default value';
      expr.set('new value');
      expect(expr.get()).toEqual('default value');
    });

    it('makes set not working', ()=> {
      expr.set('new value');
      expect(expr.get()).toBeUndefined();
      expect(engine.state.test).toBeUndefined();
    });
  });
});
