class Template {
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

  setState(state) {
    if (!this.engine) {
      this.engine = this.parentEngine._spawn(
        this.nodes.filter(n => n.nodeType === Node.ELEMENT_NODE),
        state
      );
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
    const nodes = this.nodes.map(
      node => document.importNode(node, true)
    );

    return new this.constructor(nodes, this.parentEngine, this.host);
  }
}

export default Template;
