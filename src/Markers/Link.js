class Wrapper {
  constructor(node) {
    this.node = node;
  }

  get() {
    return this.node.value;
  }

  set(value) {
    this.value = value;

    if (this.node.value !== value) {
      this.node.value = value;
    }
  }

  observe(cb) {
    this.node.addEventListener('input', cb);
  }
}

class CheckWrapper extends Wrapper {
  get() {
    return this.node.checked ? this.node.value : undefined;
  }

  set(value) {
    if (this.node.value === value) {
      this.node.checked = true;
    } else {
      this.node.checked = false;
    }
  }

  observe(cb) {
    this.node.addEventListener('change', cb);
  }
}

class SelectWrapper extends Wrapper {
  constructor(node) {
    super(node);

    new MutationObserver(()=> this.set(this.value)).observe(node, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
      attributeFilter: ['value']
    });
  }

  observe(cb) {
    this.node.addEventListener('change', cb);
  }
}

class MultiSelectWrapper extends SelectWrapper {
  get() {
    return Array.from(this.node.selectedOptions).map(o => o.value);
  }

  set(values) {
    this.value = values;

    if (!Array.isArray(values)) {
      throw new Error('Invalid values. Array instance required.');
    }

    Array.from(this.node.options).forEach(o => {
      o.selected = values.some(v => v === o.value);
    });
  }
}

class Link {
  constructor(engine, node, evaluate) {
    let wrapper;

    switch(node.type) {
      case "checkbox":
      case "radio":
        wrapper = new CheckWrapper(node);
        break;

      case "select-one":
        wrapper = new SelectWrapper(node);
        break;

      case "select-multiple":
        wrapper = new MultiSelectWrapper(node);
        break;

      default:
        wrapper = new Wrapper(node);
    }

    const expr = engine._link(evaluate, {
      value: wrapper.get(),
      observe: wrapper.set.bind(wrapper)
    });

    wrapper.observe(()=> {
      engine.root.setState(()=> {
        expr.value = wrapper.get();
      });
    });
  }
}

export default Link;
