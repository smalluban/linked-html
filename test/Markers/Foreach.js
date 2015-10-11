import Engine from '../../src/Engine';
import Foreach from '../../src/Markers/Foreach';

describe('Foreach', ()=> {
  let engine, node;

  beforeEach(()=> {
    node = document.createElement('ul');
    engine = new Engine(document.createElement('div'));
  });

  it('create array content of primitive values', ()=> {
    node.innerHTML = `
      <li --text="@state">Title1</li>
      <li --text="@state">Title2</li>
    `;
    new Foreach(engine, node, 'test');
    expect(engine.state.test).toEqual(["Title1", "Title2"]);
  });

  it('create array content of objects', ()=> {
    node.innerHTML = `
      <li --text="test">Title1</li>
      <li --text="test">Title2</li>
    `;

    new Foreach(engine, node, 'test');
    expect(engine.state.test).toEqual([
      { test: "Title1" },
      { test: "Title2" }
    ]);
  });

  it('removes children for empty array', ()=> {
    node.innerHTML = `
      <li --text="test">Title1</li>
      <li --text="test">Title2</li>
    `;
    engine.setState({ test: [] });
    new Foreach(engine, node, 'test');

    expect(node.children.length).toEqual(0);
  });

  it('create array of primitives from constructor', ()=> {
    node.innerHTML = `
      <li --text="@state">Title1</li>
    `;

    engine.setState({
      test: [undefined, 'two', 'three']
    });

    new Foreach(engine, node, 'test');

    expect(node.children[0].textContent).toEqual('Title1');
    expect(node.children[1].textContent).toEqual('two');
    expect(node.children[2].textContent).toEqual('three');
  });

  it('create array of objects from constructor', ()=> {
    node.innerHTML = `
      <li --text="test">Title1</li>
    `;

    engine.setState({
      test: [undefined, { test: 'two'}, { test: 'three'}]
    });

    new Foreach(engine, node, 'test');

    expect(node.children[0].textContent).toEqual('Title1');
    expect(node.children[1].textContent).toEqual('two');
    expect(node.children[2].textContent).toEqual('three');
  });

  describe('when manipulate array', ()=> {
    let foreach;

    beforeEach(()=> {
      node.innerHTML = `
        <li --text="@state">Title2</li>
        <li --text="@state">Title1</li>
        <li --text="@state">Title3</li>
      `;
      foreach = new Foreach(engine, node, 'test');
    });

    it('adds new element', (done)=> {
      engine.setState(state => {
        state.test.push('Title3');
      });

      window.requestAnimationFrame(()=> {
        expect(node.children.length).toEqual(4);
        done();
      });
    });

    it('removes element', (done)=> {
      engine.setState(state => {
        state.test.shift();
      });

      window.requestAnimationFrame(()=> {
        expect(node.children.length).toEqual(2);
        done();
      });
    });

    it('updates one value', (done)=> {
      engine.setState(state => {
        state.test[0] = 'new state';
      });

      window.requestAnimationFrame(()=> {
        expect(node.children[0].textContent).toEqual('new state');
        done();
      });
    });

    it('updates many values', (done)=> {
      engine.setState(state => {
        state.test.sort();
      });

      window.requestAnimationFrame(()=> {
        expect(node.children[0].textContent).toEqual('Title1');
        expect(node.children[1].textContent).toEqual('Title2');
        expect(node.children[2].textContent).toEqual('Title3');
        done();
      });
    });

    it('relocate elements', (done)=> {
      const node0 = node.children[0];
      const node1 = node.children[1];
      const node2 = node.children[2];

      engine.setState(state => {
        state.test.sort();
      });

      window.requestAnimationFrame(()=> {
        expect(node.children[0]).toEqual(node1);
        expect(node.children[1]).toEqual(node0);
        expect(node.children[2]).toEqual(node2);
        done();
      });
    });

    it('for multiply changes', (done) => {
      engine.setState(state => {
        state.test.sort();
        state.test[2] = 'New Title';
        state.test[3] = 'Title3';
      });

      window.requestAnimationFrame(()=> {
        expect(node.children[0].textContent).toEqual('Title1');
        expect(node.children[1].textContent).toEqual('Title2');
        expect(node.children[2].textContent).toEqual('New Title');
        expect(node.children[3].textContent).toEqual('Title3');
        done();
      });
    });

    it('creates new items collection', (done) => {
      engine.setState(state => {
        state.test.sort();
        state.test[2] = 'New Title';
        state.test[3] = 'Title3';
      });

      window.requestAnimationFrame(()=> {
        const items = foreach.items.map(i => {
          return i.nodes[0];
        });

        expect(foreach.items.length).toEqual(4);
        expect(Array.from(node.children)).toEqual(items);
        done();
      });
    });
  });

  describe('when set new array', ()=> {
    let foreach;

    beforeEach(()=> {
      node.innerHTML = `
        <li --text="@state">Title2</li>
        <li --text="@state">Title1</li>
        <li --text="@state">Title3</li>
      `;
      foreach = new Foreach(engine, node, 'test');
    });

    it('replace elements', (done)=> {
      const newArray = ['one', 'two', 'three'];
      engine.setState({test: newArray});

      window.requestAnimationFrame(()=> {
        let values = Array.from(node.children).map(n => n.textContent);
        expect(values).toEqual(newArray);
        done();
      });
    });

    it('add new elements', (done)=> {
      const newArray = ['one', 'two', 'three', 'four'];
      engine.setState({ test: newArray });

      window.requestAnimationFrame(()=> {
        let values = Array.from(node.children).map(n => n.textContent);
        expect(values).toEqual(newArray);
        done();
      });
    });

    it('removes elements', (done)=> {
      const newArray = ['one'];
      engine.setState({ test: newArray });

      window.requestAnimationFrame(()=> {
        let values = Array.from(node.children).map(n => n.textContent);
        expect(values).toEqual(newArray);
        done();
      });
    });

    it('updates items collection', (done)=> {
      const newArray = ['one'];
      engine.setState({ test: newArray });

      window.requestAnimationFrame(()=> {
        let nodes = foreach.items.map(i => i.nodes[0]);
        expect(nodes).toEqual(Array.from(node.children));
        done();
      });
    });
  });

  describe('`index` computed property', ()=> {
    let foreach;

    beforeEach(()=> {
      node.innerHTML = `
        <li --prop="title: @index" --text="@state">a</li>
        <li --prop="title: @index" --text="@state">b</li>
      `;

      foreach = new Foreach(engine, node, 'test');
    });

    it('is set from constructor', (done)=> {
      window.requestAnimationFrame(()=> {
        const items = Array.from(node.children).map(i => i.title);
        expect(items).toEqual(["0", "1"]);
        done();
      });
    });

    it('is changed when updated', (done)=> {
      engine.setState({ test: ['a','b','c']});

      window.requestAnimationFrame(()=> {
        const items = Array.from(node.children).map(i => i.title);
        expect(items).toEqual(["0", "1", "2"]);
        done();
      });
    });

    it('is changed when relocated', (done)=> {
      engine.setState((state)=> {
        state.test[0] = 'b';
        state.test[1] = 'a';
      });

      window.requestAnimationFrame(()=> {
        const items = Array.from(node.children).map(i => i.title);
        expect(items).toEqual(["0", "1"]);
        done();
      });
    });
  });

  describe('`length` computed property', ()=> {
    let foreach;

    beforeEach(()=> {
      node.innerHTML = `
        <li --prop="title: @length" --text="@state">a</li>
        <li --prop="title: @length" --text="@state">b</li>
      `;

      foreach = new Foreach(engine, node, 'test');
    });

    it('is set from constructor', (done)=> {
      window.requestAnimationFrame(()=> {
        const items = Array.from(node.children).map(i => i.title);
        expect(items).toEqual(["2", "2"]);
        done();
      });
    });

    it('is changed when updated', (done)=> {
      engine.setState({ test: ['a','b','c']});

      window.requestAnimationFrame(()=> {
        const items = Array.from(node.children).map(i => i.title);
        expect(items).toEqual(["3", "3", "3"]);
        done();
      });
    });
  });
});
