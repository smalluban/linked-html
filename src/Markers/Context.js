import Template from './Template/Template';

class Context {
  constructor(engine, node, evaluate) {
    if (!node.children[0]) {
      throw new Error('No children elements.');
    }

    const template = new Template(Array.from(node.childNodes), engine);

    engine._link(evaluate, {
      value: {},
      observe: state => {
        if (!state) {
          template.remove();
        } else {
          if (Object(state) !== state) {
            throw new TypeError('Invalid context target.');
          }
          template.setState(state).append();
        }
      }
    });
  }
}

Context._options = {
  breakCompile: true
};

export default Context;
