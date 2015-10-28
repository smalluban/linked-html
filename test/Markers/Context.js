import Engine from '../../src/Engine';
import Context from '../../src/Markers/Context';

describe('Context', ()=> {
  let node, engine;

  beforeEach(()=> {
    node = document.createElement('div');
    node.innerHTML = `<div --text="title">MyTitle</div>`;
    engine = new Engine(document.createElement('div'));
  });

  it('create context for nested markers', ()=> {
    Context(engine, node, 'test');
    expect(engine.state).toEqual({
      test: { title: 'MyTitle' }
    });
  });

  it('updates nested properties', (done)=> {
    Context(engine, node, 'test');
    engine.state.test = { title: 'new Title' };
    window.requestAnimationFrame(()=> {
      expect(node.children[0].textContent).toEqual('new Title');
      done();
    });
  });

  it('unmounts children for falsy context value', (done)=> {
    engine.state.test = false;
    Context(engine, node, 'test');
    window.requestAnimationFrame(()=> {
      expect(node.childNodes.length).toEqual(0);
      done();
    });
  });

  it('unmounts children for falsy context from state change', (done)=> {
    Context(engine, node, 'test');
    engine.state.test = '';

    window.requestAnimationFrame(()=> {
      expect(node.childNodes.length).toEqual(0);
      done();
    });
  });

  it('mounts children for object context', (done)=> {
    Context(engine, node, 'test');
    engine.state.test = { title: 'SuperTitle' };

    window.requestAnimationFrame(()=> {
      expect(node.children[0].textContent).toEqual('SuperTitle');
      done();
    });
  });

  describe('for multiply context', ()=> {
    beforeEach(()=> {
      node.innerHTML = `
        <div --context="inner">
          <div --text="title">MyTitle</div>
        </div>
      `;
      Context(engine, node, 'test');
    });

    it('create nested state', ()=> {
      expect(engine.state).toEqual({
        test: { inner: { title: 'MyTitle' } }
      });
    });

    it('update nested state', (done)=> {
      engine.state.test.inner.title = 'New title';

      window.requestAnimationFrame(()=> {
        expect(node.children[0].children[0].textContent).toEqual('New title');
        done();
      });
    });
  });

});
