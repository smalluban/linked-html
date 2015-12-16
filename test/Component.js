import Engine from '../src/Engine';
import { register, map } from '../src/Component';

describe('Component register', ()=> {

  function expectFn(el, done, fn) {
    setTimeout(function() {
      map.get(el).then(engine => {
        fn(engine);
        done();
      });
    });
  }

  function expectState(el, done, state) {
    expectFn(el, done, engine => {
      expect(engine.state).toEqual(state);
    });
  }

  let el;

  beforeEach(()=> {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach((done)=> {
    setTimeout(()=> {
      document.body.removeChild(el);
      done();
    });
  });

  it('set `host` engine property', (done)=> {
    register(Engine, 'ts-host');
    el.innerHTML = `<ts-host></ts-host>`;

    expectFn(el.children[0], done, engine => {
      expect(engine.host).toEqual(el.children[0]);
    });
  });

  describe('constructor _options', ()=> {
    class MyEngine extends Engine {
      constructor(node, options) {
        super(node, options);
        this.test = options.test;
      }
    }
    MyEngine._options = { test: 'my test' };

    it('use from constructor', (done)=> {
      register(MyEngine, 'ts-options-own');
      el.innerHTML = `<ts-options-own></ts-options-own>`;

      expectFn(el.children[0], done, engine => {
        expect(engine.test).toEqual('my test');
      });
    });

    it('overwrite from constructor', (done)=> {
      register(MyEngine, 'ts-options-over', { test: 'new test' });
      el.innerHTML = `<ts-options-over></ts-options-over>`;

      expectFn(el.children[0], done, engine => {
        expect(engine.test).toEqual('new test');
      });
    });
  });

  describe('template option', ()=> {

    it('use host childNodes', (done)=> {
      register(Engine, 'ts-use-childs');

      el.innerHTML = `
        <ts-use-childs>
          <div --text="test1">My test 1</div>
          <div --text="test2">My test 2</div>
        </ts-use-childs>
      `;

      expectState(el.children[0], done, {
        test1: 'My test 1',
        test2: 'My test 2'
      });
    });

    if (typeof HTMLTemplateElement !== 'undefined') {
      it('use template element', (done)=> {
        register(Engine, 'ts-template', { template: true });
        el.innerHTML = `
          <ts-template>
            <template><div --text="test">My test 1</div></template>
          </ts-template>
        `;

        expectFn(el.children[0], done, engine => {
          expect(engine.state).toEqual({
            test: 'My test 1',
          });
          expect(engine.host.innerHTML.trim())
            .toEqual('<div --text="test">My test 1</div>');
        });
      });
    }

    it('use string content', (done)=> {
      register(Engine, 'ts-string', {
        template: '<div --text="test">My test 1</div>'
      });
      el.innerHTML = `<ts-string></ts-string>`;

      expectFn(el.children[0], done, engine => {
        expect(engine.state).toEqual({
          test: 'My test 1',
        });
        expect(engine.host.innerHTML.trim())
          .toEqual('<div --text="test">My test 1</div>');
      });
    });

    it('works with nested components with template', (done)=> {
      register(Engine, 'ts-parent');
      register(Engine, 'ts-child');

      el.innerHTML = `
        <ts-parent>
          <div --text="test1">Title</div>
          <ts-child>
            <div --text="test2">Title</div>
          </ts-child>
        </ts-parent>
      `;

      expectState(el.children[0], ()=> {
        expectState(el.children[0].children[1], done, { test2: 'Title'});
      }, { test1: 'Title' });
    });
  });


  describe('shadow option', ()=> {
    const test = document.createElement('div');
    if (test.attachShadow || test.createShadowRoot) {
      it('use shadow DOM if it is supported', (done)=> {


        register(Engine, 'nt-shadow', { shadow: true });

        el.innerHTML = `<nt-shadow><div --text="test">test</div></nt-shadow>`;
        expectFn(el.children[0], done, engine => {
          expect(engine.host.children.length).toEqual(0);
          expect(engine.state).toEqual({ test: 'test'});
          expect(engine.shadow.innerHTML.trim())
            .toEqual('<div --text="test">test</div>');
        });
      });
    }
  });

  describe('properties option', ()=> {
    register(Engine, 'nt-props', {
      properties: {
        a: 'a',
        b: {
          link: 'bb'
        },
        c: {
          link: 'c',
          attribute: false
        },
        d: {
          link: 'd',
          reflect: true
        }
      }
    });

    it('set attribute value to the same state property', (done)=> {
      el.innerHTML = `<nt-props a="test"></nt-props>`;
      expectFn(el.children[0], done, engine => {
        expect(engine.state.a).toEqual('test');
        el.children[0].a = 'other';
        expect(engine.state.a).toEqual('other');
      });
    });

    it('use property value to the same state property', (done)=> {
      el.innerHTML = `<nt-props></nt-props>`;
      expectFn(el.children[0], done, engine => {
        el.children[0].a = 'other';
        expect(engine.state.a).toEqual('other');
      });
    });

    it('set attribute value to different state property', (done)=> {
      el.innerHTML = `<nt-props b="test"></nt-props>`;
      expectFn(el.children[0], done, engine => {
        expect(engine.state.bb).toEqual('test');
      });
    });

    it('use only property', (done)=> {
      el.innerHTML = `<nt-props c="test"></nt-props>`;
      expectFn(el.children[0], done, engine => {
        expect(engine.state.c).not.toEqual('test');
        el.children[0].c = 'test';
        expect(engine.state.c).toEqual('test');
      });
    });

    it('reflect property change to attribute', (done)=> {
      el.innerHTML = `<nt-props d="test"></nt-props>`;
      expectFn(el.children[0], ()=> {}, engine => {
        expect(engine.state.d).toEqual('test');
        engine.state.d = 'other';

        window.requestAnimationFrame(()=> {
          expect(engine.host.getAttribute('d')).toEqual('other');
          done();
        });
      });
    });
  });

  it('methods option links methods with host', (done)=> {

    class MyEngine extends Engine {
      func1() { }
      func2() { }
    }

    register(MyEngine, 'ts-methods', {
      methods: ['func1', 'func2']
    });

    el.innerHTML = `<ts-methods></ts-methods>`;
    expectFn(el.children[0], done, engine => {
      spyOn(engine, 'func1');
      spyOn(engine, 'func2');

      el.children[0].func1('test');
      el.children[0].func2();

      expect(engine.func1).toHaveBeenCalled();
      expect(engine.func1).toHaveBeenCalledWith('test');
      expect(engine.func2).toHaveBeenCalled();
    });
  });
});
