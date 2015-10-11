import Path from '../../src/Expression/Path';

describe('Path', ()=> {
  let context, obj;

  describe('get method', ()=> {
    beforeEach(()=> {
      obj = {
        one: { two: { three: "four" }},
        arr: [1,{two: ['three']}]
      };
      context = ()=> obj;
    });

    it('returns path value', ()=> {
      const path1 = new Path('one.two.three', context);
      const path2 = new Path('arr[1].two[0]', context);
      expect(path1.get()).toEqual('four');
      expect(path2.get()).toEqual('three');
    });

    it('not create path for undefined property', ()=> {
      const path = new Path('two.three.four', context);
      expect(path.get()).toEqual(undefined);
      expect(context.two).toEqual(undefined);
    });

    it('throws for invalid type of property path', ()=> {
      const path = new Path('one.two.three.four', context);
      expect(()=> path.get()).toThrow();
    });

  });

  describe('set method', ()=> {
    beforeEach(()=> {
      obj = { asd: {}, qwe: 123 };
      context = ()=> obj;
    });

    it('create property path', ()=> {
      let path = new Path('asd.dsa.qwe', context);
      path.set('new Value');

      expect(context().asd.dsa.qwe).toEqual('new Value');
    });

    it('not create property path when already set', ()=> {
      let path = new Path('qwe', context);
      path.set('new Value', true);

      expect(context().qwe).toEqual(123);
    });

    it('set property path when force', ()=> {
      let path = new Path('qwe', context);
      path.set('new Value');

      expect(context().qwe).toEqual('new Value');
    });

    it('throws for invalid type of property path', ()=> {
      let path = new Path('qwe.value', context);
      expect(()=> path.set('test')).toThrow();
    });
  });

  describe('call method', ()=> {
    let path, obj, spy;

    beforeEach(()=> {
      spy = jasmine.createSpy('callback');
      obj = {
        a: 'string',
        b: spy
      };
    });

    it('throws for not function', ()=> {
      path = new Path('a', ()=> obj);
      const fn = ()=> path.call();
      expect(fn).toThrow();
    });

    it('calls function with proper context', ()=> {
      path = new Path('b', ()=> obj);
      path.call('test1', 'test2');
      expect(spy.calls.mostRecent().object).toEqual(obj);
      expect(spy.calls.mostRecent().args).toEqual(['test1', 'test2']);
    });
  });

  describe('delete method', ()=> {
    beforeEach(()=> {
      const obj = {
        a: { b: { c: 'test' } },
        e: {
          f: 'test',
          g: { h: 'test' }
        }
      };
      context = ()=> obj;
    });

    it('removes path with one key in chain', ()=> {
      let path = new Path('a.b.c', context);
      path.delete();

      expect(context().a).toBeUndefined();
    });

    it('not removes path when more keys are in chain', ()=> {
      let path = new Path('e.g.h', context);
      path.delete();

      expect(context().e).toEqual({ f: 'test' });
    });
  });
});
