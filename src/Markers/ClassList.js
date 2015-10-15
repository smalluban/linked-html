import List from './List';

class ClassList extends List {
  link(node, className, evaluate) {
    const cb = function(val) {
      if (val) {
        node.classList.add(className);
      } else {
        node.classList.remove(className);
      }
    };

    this.engine._link(evaluate, {
      value: node.classList.contains(className),
      observe: cb
    });
  }
}

export default ClassList;
