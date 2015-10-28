import Template from './Template/Template';
import Expression from '../Expression/Expression';

export default function Context(engine, node, evaluate) {
  if (!node.children[0]) {
    throw new Error('No children elements.');
  }

  const template = new Template(
    Array.from(node.childNodes)
      .filter(n => n.nodeType === Node.ELEMENT_NODE),
    engine
  );

  const expr = new Expression(engine, evaluate);

  expr.set({}, true);
  expr.observe(state => {
    if (!state) {
      template.remove();
    } else {
      if (typeof state !== 'object') {
        throw new TypeError('Invalid context target.');
      }
      template.setState(state).append();
    }
  }, true, true);
}

Context._options = {
  breakCompile: true
};
