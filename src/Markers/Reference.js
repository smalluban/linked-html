import Expression from '../Expression/Expression';

export default function Reference(engine, node, evaluate) {
  const expr = new Expression(engine, evaluate);
  expr.set(node, true);
}
