import Engine from '../../src/Engine';
import Property from '../../src/Markers/Property';

describe('Property', ()=> {
  let node, engine;

  beforeEach(()=> {
    node = document.createElement('div');
    node.title = 'test title';
    node.id = 'test-id';
    engine = new Engine(document.createElement('div'));
  });

  it('set engine state path from node property', ()=> {
    Property(engine, node, 'title: test');
    expect(engine.state.test).toEqual('test title');
  });

  it('set node property from engine state path', ()=> {
    engine.setState({ test: 'new value' });
    Property(engine, node, 'title: test');
    expect(node.title).toEqual('new value');
  });

  it('set node property from engine setState method', (done)=> {
    Property(engine, node, 'title: test');
    engine.setState({test: 'test'});

    window.requestAnimationFrame(()=> {
      expect(node.title).toEqual('test');
      done();
    });
  });

  it('set list of properties', ()=> {
    Property(engine, node, 'title: test1; id: test2');
    expect(engine.state).toEqual({
      test1: 'test title',
      test2: 'test-id'
    });
  });

  describe('fallback', ()=> {

    it('as attribute value', ()=> {
      engine.setState({test: 'test'});
      Property(engine, node, 'some-attr: test');
      expect(node.getAttribute('some-attr')).toEqual('test');
    });

    it('as attribute name for true value', ()=> {
      engine.setState({ test: true });
      Property(engine, node, 'some-attr: test');

      expect(node.getAttribute('some-attr')).toEqual('some-attr');
    });

    it('as removed attribute for false value', ()=> {
      engine.setState({ test: false });
      Property(engine, node, 'some-attr: test');

      expect(node.getAttribute('some-attr')).toEqual(null);
    });
  });
});
