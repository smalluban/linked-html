import Expression from '../Expression/Expression';

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

    new MutationObserver(()=> {
      this.set(this.value);
    }).observe(node, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  set(value) {
    this.value = value;

    Array.from(this.node.options).some(o => {
      if (o.value === value) {
        o.selected = true;
        return true;
      }
    });
  }

  observe(cb) {
    this.node.addEventListener('change', cb);
  }
}

class MultiSelectWrapper extends SelectWrapper {
  get() {
    const values = this.value || [];
    const newValues = Array.from(this.node.selectedOptions).map(o => o.value);

    Object.assign(values, newValues);
    values.length = newValues.length;

    return values;
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

export default function Link(engine, node, evaluate) {
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

  const expr = new Expression(engine, evaluate);

  expr.set(wrapper.get(), true);
  expr.observe(wrapper.set.bind(wrapper), true, false);
  wrapper.observe(()=> expr.set(wrapper.get()));
}
