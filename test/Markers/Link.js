import Engine from '../../src/Engine';
import Link from '../../src/Markers/Link';

describe('Link', ()=> {
  let engine, node;

  beforeEach(()=> {
    engine = new Engine(document.createElement('div'));
  });

  describe('text input', ()=> {
    beforeEach(()=> {
      node = document.createElement('input');
      node.type = 'text';
      node.value = 'test';
    });

    it('set value from view', ()=> {
      new Link(engine, node, 'test');
      expect(engine.state.test).toEqual('test');
    });

    it('get value from state', (done)=> {
      engine.state.test = 'abc';
      new Link(engine, node, 'test');

      window.requestAnimationFrame(()=> {
        expect(node.value).toEqual('abc');
        done();
      });
    });
  });

  describe('textarea', ()=> {
    beforeEach(()=> {
      node = document.createElement('textarea');
      node.value = 'test';
    });

    it('set value from view', ()=> {
      new Link(engine, node, 'test');
      expect(engine.state.test).toEqual('test');
    });

    it('get value from state', (done)=> {
      engine.state.test = 'abc';
      new Link(engine, node, 'test');

      window.requestAnimationFrame(()=> {
        expect(node.value).toEqual('abc');
        done();
      });
    });
  });

  describe('radio and checkbox input', ()=> {
    let node;

    beforeEach(()=> {
      node = document.createElement('div');
      node.innerHTML = `
        <input type="radio" name="test" value="one" />
        <input type="radio" name="test" value="two" />
      `;
    });

    it('set first input checked property', ()=> {
      engine.state.test = 'one';
      new Link(engine, node.children[0], 'test');
      new Link(engine, node.children[1], 'test');

      expect(node.children[0].checked).toEqual(true);
    });

    it('set second input checked property', ()=> {
      engine.state.test = 'two';
      new Link(engine, node.children[0], 'test');
      new Link(engine, node.children[1], 'test');

      expect(node.children[1].checked).toEqual(true);
    });

    it('get value from first checked input', ()=> {
      node.children[0].checked = true;

      new Link(engine, node.children[0], 'test');
      new Link(engine, node.children[1], 'test');

      expect(engine.state.test).toEqual('one');
    });

    it('get value from first checked input', ()=> {
      node.children[1].checked = true;

      new Link(engine, node.children[0], 'test');
      new Link(engine, node.children[1], 'test');

      expect(engine.state.test).toEqual('two');
    });
  });

});
