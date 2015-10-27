import Expression from '../Expression/Expression';
import {list} from './List';

export default function ClassList(engine, node, evaluate) {
  list(evaluate, (name, value)=> {
    const expr = new Expression(engine, value);

    expr.set(node.classList.contains(name), true);
    expr.observe(val => {
      if (val) {
        node.classList.add(name);
      } else {
        node.classList.remove(name);
      }
    }, true);
  });
}
