import Expression from '../Expression/Expression';
import {list} from './List';

export default function Property(engine, node, evaluate) {
  list(evaluate, (name, value)=> {
    const accessor = resolveProperty(node, name);
    const expr = new Expression(engine, value);

    expr.set(accessor.get(), true);
    expr.observe(accessor.set, true);
  });
}

function resolveProperty(node, name) {
  if (name in node) {
    return {
      get: ()=> node[name],
      set: (value)=> node[name] = value
    };
  } else {
    return {
      get: ()=> {
        const val = node.getAttribute(name);
        return val ? val : undefined;
      },
      set: (value)=> {
        if (value === false || value === undefined || value === null) {
          node.removeAttribute(name);
        } else {
          node.setAttribute(name, value === true ? name : value);
        }
      }
    };
  }
}
