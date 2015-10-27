import Property from './Property';

export default function Text(engine, node, evaluate) {
  Property(engine, node, `textContent: ${evaluate}`);
}
