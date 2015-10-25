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

    it('push value to state', ()=> {
      new Link(engine, node, 'test');
      node.value = 'new value';
      const event = document.createEvent('Event');
      event.initEvent('input', true, false);
      node.dispatchEvent(event);

      expect(engine.state.test).toEqual('new value');
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

    it('push value to state', ()=> {
      new Link(engine, node, 'test');
      node.value = 'new value';
      const event = document.createEvent('Event');
      event.initEvent('input', true, false);
      node.dispatchEvent(event);

      expect(engine.state.test).toEqual('new value');
    });
  });

  describe('radio input', ()=> {
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

    it('push value to state', ()=> {
      document.body.appendChild(node);

      node.children[0].checked = true;
      new Link(engine, node.children[0], 'test');
      new Link(engine, node.children[1], 'test');

      node.children[1].checked = true;

      const event = document.createEvent('Event');
      event.initEvent('change', true, false);

      node.children[0].dispatchEvent(event);
      node.children[1].dispatchEvent(event);

      expect(engine.state.test).toEqual('two');

      node.remove();
    });

  });

  describe('select', ()=> {
    beforeEach(()=> {
      node = document.createElement('div');
      node.innerHTML = `
        <select>
          <option>1</option>
          <option>2</option>
        </select>
      `;
      node = node.children[0];
      node.options[0].selected = true;
    });

    it('set value from view', ()=> {
      new Link(engine, node, 'test');
      expect(engine.state.test).toEqual('1');
    });

    it('get value from state', ()=> {
      engine.state.test = '2';
      new Link(engine, node, 'test');
      expect(node.value).toEqual('2');
    });

    it('push value to state', ()=> {
      new Link(engine, node, 'test');

      node.options[1].selected = true;
      const event = document.createEvent('Event');
      event.initEvent('change', true, false);

      node.dispatchEvent(event);

      expect(engine.state.test).toEqual('2');
    });

    it('refresh select value after options mutation', (done)=> {
      new Link(engine, node, 'test');

      node.options[0].value = '2';
      node.options[1].value = '1';

      window.requestAnimationFrame(()=> {
        expect(node.value).toEqual('1');
        done();
      });

    });
  });

  describe('select with multiple option', ()=> {
    beforeEach(()=> {
      node = document.createElement('div');
      node.innerHTML = `
        <select multiple>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </select>
      `;
      node = node.children[0];
      node.options[0].selected = true;
      node.options[2].selected = true;
    });

    it('set value from view', ()=> {
      new Link(engine, node, 'test');
      expect(engine.state.test).toEqual(['1','3']);
    });

    it('get value from state', ()=> {
      engine.state.test = ['2','4'];
      new Link(engine, node, 'test');
      expect(node.options[1].selected).toEqual(true);
      expect(node.options[3].selected).toEqual(true);
    });

    it('push value to state', ()=> {
      new Link(engine, node, 'test');

      node.options[1].selected = true;
      const event = document.createEvent('Event');
      event.initEvent('change', true, false);

      node.dispatchEvent(event);

      expect(engine.state.test).toEqual(['1','2','3']);
    });

    it('update target object in state', ()=> {
      new Link(engine, node, 'test');

      debugger;

      const target = engine.state.test;

      node.options[1].selected = true;
      const event = document.createEvent('Event');
      event.initEvent('change', true, false);

      node.dispatchEvent(event);

      expect(engine.state.test === target).toEqual(true);
    });

    it('refresh select value after options mutation', (done)=> {
      new Link(engine, node, 'test');

      node.options[0].value = '2';
      node.options[1].value = '1';

      window.requestAnimationFrame(()=> {
        expect(node.value).toEqual('1');
        done();
      });

    });
  });



});
