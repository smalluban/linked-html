import { compile } from '../../Engine';

export default class Template {
  constructor(nodes, engine, host) {
    this.nodes = [].concat(nodes);
    this.host = host || this.nodes[0].parentElement;
    this.parentEngine = engine;

    if (!this.host) {
      throw new Error('Invalid host for template.');
    }

    if (!this.nodes[0].parentElement) {
      this.hidden = true;
    }
  }

  spawn(engine, nodeList, state, properties) {
    const child = Object.create(engine);

    Object.defineProperties(child, {
      state: { value: state, writable: true },
      parent: { value: engine }
    });

    if (properties) {
      Object.assign(child, properties);
    }

    nodeList.forEach(node => compile(child, node));
    child.setState();

    return child;
  }

  setState(state) {
    if (!this.engine) {
      this.engine = this.spawn(this.parentEngine, this.nodes, state);
    } else {
      this.engine.setState(function() {
        this.state = state;
      });
    }

    return this;
  }

  getState() {
    if (!this.engine) {
      throw new Error('Template does not fully initalized.');
    }

    return this.engine.state;
  }

  append(forceAppend = false, insertBefore = null) {
    if (this.hidden || forceAppend) {
      this.nodes.forEach(node => {
        this.host.insertBefore(node, insertBefore);
      });
      this.hidden = false;
    }

    return this;
  }

  remove() {
    if (!this.hidden) {
      const fragment = document.createDocumentFragment();
      this.nodes.forEach(node => fragment.appendChild(node));
      this.hidden = true;
    }

    return this;
  }

  clone() {
    return new this.constructor(
      this.nodes.map(node => node.cloneNode(true)),
      this.parentEngine,
      this.host
    );
  }
}
