import Engine from '../../src/Engine';
import ClassList from '../../src/Markers/ClassList';

describe('ClassList', ()=> {
  let engine, node;

  beforeEach(()=> {
    node = document.createElement('div');
    engine = new Engine(document.createElement('div'));
  });

  it('set state property to `true`', ()=> {
    node.className = 'myClass';
    ClassList(engine, node, 'myClass: test');
    expect(engine.state.test).toEqual(true);
  });

  it('set state property to `false`', ()=> {
    ClassList(engine, node, 'myClass: test');
    expect(engine.state.test).toEqual(false);
  });

  it('set `myClass` class', (done)=> {
    ClassList(engine, node, 'myClass: test');
    engine.setState({ test: true });

    window.requestAnimationFrame(()=> {
      expect(node.classList.contains('myClass')).toEqual(true);
      done();
    });
  });

  it('unset `myClass` class', (done)=> {
    node.className = 'myClass';
    ClassList(engine, node, 'myClass: test');
    engine.setState({ test: false });

    window.requestAnimationFrame(()=> {
      expect(node.classList.contains('myClass')).toEqual(false);
      done();
    });
  });

  it('use class list', ()=> {
    node.setAttribute('class', 'a b c');
    ClassList(engine, node, 'a: test1; b: test2; d: test3');

    expect(engine.state).toEqual({
      test1: true,
      test2: true,
      test3: false
    });
  });
});
