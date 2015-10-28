import Engine from '../../src/Engine';
import Text from '../../src/Markers/Text';

describe('Text', ()=> {
  let engine, node;

  beforeEach(()=> {
    node = document.createElement('div');
    node.textContent = 'This is simple text';
    engine = new Engine(document.createElement('div'));
    Text(engine, node, 'test');
  });

  it('get textContent property from node', ()=> {
    expect(engine.state.test).toEqual('This is simple text');
  });

  it('set textContent property to node', (done)=> {
    engine.state.test = 'My title';

    window.requestAnimationFrame(()=> {
      expect(node.textContent).toEqual('My title');
      done();
    });
  });
});
