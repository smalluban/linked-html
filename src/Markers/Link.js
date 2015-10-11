class Wrapper {
  constructor(node) {
    this.node = node;
  }

  get() {
    return this.node.value;
  }

  set(value) {
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
  observe(cb) {
    this.node.addEventListener('change', cb);
  }
}

class MultiSelectWrapper extends SelectWrapper {
  get() {
    return Array.from(this.node.selectedOptions).map(o => o.value);
  }

  set(values) {
    if (!Array.isArray(values)) {
      throw new Error('Invalid values. Array instance required.');
    }

    const options = Array.from(this.node.options);

    values.forEach(v => {
      const [node] = options.filter(o => o.value === v);
      if (!node) {
        throw new Error(`No option found with '${v}' value.`);
      }
      node.selected = true;
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

    const expr = engine.link(evaluate, {
      value: wrapper.get(),
      observe: value => wrapper.set(value)
    });

    wrapper.observe(()=> {
      engine.root.setState(()=> {
        expr.value = wrapper.value;
      });
    });
  }
}

export default Link;
