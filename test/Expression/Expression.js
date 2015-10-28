import Expression from '../../src/Expression/Expression';
import Engine from '../../src/Engine';

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

  describe('`*` flag', ()=> {
    let spy;

    beforeEach(()=> {
      engine = new Engine(document.createElement('div'), {
        state: { test: {} }
      });
      spy = jasmine.createSpy('callback');
      expr = new Expression(engine, '*test');
    });

    it('makes observe deep option default to true', (done)=> {
      expr.observe(spy);
      engine.state.test.some = 'other';

      window.requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('observe', ()=> {
    let spy;

    beforeEach(()=> {
      engine = new Engine(document.createElement('div'));
      expr = new Expression(engine, 'test');
      spy = jasmine.createSpy('callback');
    });

    it('call when expression changed', (done)=> {
      engine.state.test = 'value';
      expr.observe(spy);

      engine.state.test = 'new value';

      window.requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledWith('new value');
        done();
      });
    });

    it('call when initialized', (done)=> {
      engine.state.test = 'value';
      expr.observe(spy, true);

      window.requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledWith('value');
        done();
      });
    });

    it('not observe deep properties of object', (done)=> {
      engine.state.test = {};
      expr.observe(spy);
      engine.state.test.some = 'value';

      window.requestAnimationFrame(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });

    it('observe deep properties of object', (done)=> {
      engine.state.test = {};
      expr.observe(spy, false, true);
      engine.state.test.some = 'value';

      window.requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledWith(engine.state.test, {
          type: 'modify', changelog: { 'some': { type: 'set' }}
        });
        done();
      });
    });
  });
});
