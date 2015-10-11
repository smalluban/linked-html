import Property from './Property';

class Text extends Property {
  constructor(engine, node, evaluate) {
    super(engine, node, `textContent: ${evaluate}`);
  }
}

export default Text;
