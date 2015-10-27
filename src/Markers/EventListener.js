import Expression from '../Expression/Expression';
import {list} from './List';

export default function EventListener(engine, node, evaluate) {
  list(evaluate, (name, value)=> {
    const expr = new Expression(engine, value);
    node.addEventListener(name, (e)=> expr.call(e));
  });
}
