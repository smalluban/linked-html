import List from './List';

class EventListener extends List {
  link(node, name, value) {
    const expr = this.engine.link(value);
    node.addEventListener(name, (e)=> expr.call(e));
  }
}

export default EventListener;
