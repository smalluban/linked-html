import Expression from '../../src/Expression/Expression';

describe('Expression', ()=> {
  let expr, engine;

  beforeEach(()=> {
    engine = { state: {} };
  });

  describe('value', ()=> {
    beforeEach(()=> {
      expr = new Expression("test", { engine });
    });

    it('gets target property', ()=> {
      expect(expr.value).toEqual(undefined);
      engine.state.test = 1;
      expect(expr.value).toEqual(1);
    });

    it('sets not defined target property', ()=> {
      expect(engine.state.test).toEqual(undefined);
      expr.setDefaultTo(1);
      expect(engine.state.test).toEqual(1);
    });

    it('doesn`t set defined target property', ()=> {
      engine.state.test = 'mytest';
      expr.setDefaultTo(1);
      expect(engine.state.test).toEqual('mytest');
    });
  });

  describe('filter', ()=> {
    let filter, spyGet, spySet;

    beforeEach(()=> {
      filter = { get: v => v, set: v => v };
      spyGet = spyOn(filter, 'get').and.callThrough();
      spySet = spyOn(filter, 'set').and.callThrough();
      expr = new Expression('test|filter', {
        engine, filters: { filter }
      });
    });

    it('call filter get method', ()=> {
      expr.value;
      expect(spyGet).toHaveBeenCalled();
    });

    it('call filter set method', ()=> {
      expr.value = 1;
      expect(spySet).toHaveBeenCalled();
    });
  });

  describe('`!` flag', ()=> {
    beforeEach(()=> {
      expr = new Expression('!test', { engine });
    });

    it('get negative value of target property', ()=> {
      engine.state.test = true;
      expect(expr.value).toEqual(false);
    });

    it('set negative value to target property', ()=> {
      expr.value = true;
      expect(engine.state.test).toEqual(false);
    });

    it('not change get filter', ()=> {
      const spyGet = spyOn(expr.filter, 'get').and.callThrough();
      expr.value;
      expect(spyGet).toHaveBeenCalled();
    });

    it('not change set filter', ()=> {
      const spyGet = spyOn(expr.filter, 'set').and.callThrough();
      expr.value = 1;
      expect(spyGet).toHaveBeenCalled();
    });
  });

  describe('`@` flag', ()=> {
    beforeEach(()=> {
      expr = new Expression('@test', { engine });
    });

    it('get from engine target', ()=> {
      engine.test = "test";
      expect(expr.value).toEqual("test");
    });

    it('set to engine target', ()=> {
      expr.value = "test";
      expect(engine.test).toEqual("test");
    });
  });

  describe('`&` flag', ()=> {
    beforeEach(()=> {
      expr = new Expression('&test', { engine });
    });

    it('makes target property readonly', ()=> {
      engine.state.test = 'default value';
      expr.value = 'new value';
      expect(expr.value).toEqual('default value');
      expect(engine.state.test).toEqual('default value');
    });

    it('makes defaultTo not working', ()=> {
      expr.setDefaultTo('new value');
      expect(expr.value).toBeUndefined();
      expect(engine.state.test).toBeUndefined();
    });
  });

  describe('observe method', ()=> {
    let spy;

    beforeEach(()=> {
      expr = new Expression('test', { engine });
      spy = jasmine.createSpy('callback');
      expr.observe(spy);
    });

    it('not call when is no change', (done)=> {
      const spy2 = jasmine.createSpy('callback2');
      expr.observe(spy2);
      window.requestAnimationFrame(()=> {
        expect(spy.calls.count()).toEqual(0);
        expect(spy2.calls.count()).toEqual(0);
        done();
      });
    });

    it('call callback with new value', (done)=> {
      expr.value = 1;
      window.requestAnimationFrame(()=> {
        expect(spy.calls.count()).toEqual(1);
        expect(spy).toHaveBeenCalledWith(
          1, { type: 'set', oldValue: undefined });
        done();
      });
    });
  });
});
