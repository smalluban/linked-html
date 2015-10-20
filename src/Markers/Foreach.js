import IndexedTemplate from './Template/IndexedTemplate';

class Foreach {
  constructor(engine, node, evaluate) {
    if (!node.children[0]) {
      throw new Error('No children elements.');
    }

    this.engine = engine;
    this.node = node;

    const expr = engine._link(evaluate);
    let list = expr.value;
    let createFromView = false;

    if(list === undefined) {
      list = expr.setDefaultTo([]);
      createFromView = true;
    }

    if (!Array.isArray(list)) {
      throw new TypeError('Invalid foreach target.');
    }

    if (createFromView) {
      this.items = this.createFromView(list);
      this.template = this.items[this.items.length -1].clone();
    } else {
      this.items = this.createFromList(list);

      if (this.items.length) {
        this.template = this.items[this.items.length - 1].clone();
      } else {
        this.template = new IndexedTemplate(node.children[0], this.engine);
      }

      this.clear(list);
    }

    expr.observe(this.render.bind(this));
  }

  createFromView(list) {
    const length = this.node.children.length;

    return Array.from(this.node.children).map((child, index) => {
      const temp = new IndexedTemplate(child, this.engine);

      list[index] = temp
        .setState(list[index], { index, length })
        .getState();

      return temp;
    });
  }

  createFromList(list) {
    const length = list.length;
    let temp;

    return list.map((item, index) => {
      if (this.node.children[index]) {
        temp = new IndexedTemplate(this.node.children[index], this.engine)
          .setState(list[index], { index, length });
      } else {
        temp = temp
          .clone()
          .setState(list[index], { index, length })
          .append(true);
      }

      list[index] = temp.getState();

      return temp;
    });
  }

  clear(list) {
    const index = list.length;
    const max = this.node.children.length;
    for (let i = index; i < max; i++) {
      this.node.removeChild(this.node.children[index]);
    }
  }

  render(list, { type, changelog } = {}) {
    if (!Array.isArray(list)) {
      throw new TypeError('Invalid foreach target.');
    }

    const length = list.length;

    switch(type) {
      case 'modify':
        Object.assign(this.items, Object.keys(changelog)
          .reduce((items, key) => {
            const { type, oldKey, newKey } = changelog[key];

            if (type === 'delete') {
              if (this.items[key]) {
                this.items[key].remove();
              }
            } else {
              const index = parseInt(key, 10);
              let temp = this.items[oldKey || key];
              let append = false;

              if (oldKey) {
                if (this.items[key]) {
                  this.items[key].remove();
                }
                this.items[oldKey] = null;
              }

              if (!temp || (newKey && !oldKey)) {
                temp = this.template.clone();
                append = true;
              }

              temp.setState(list[key], { index, length });

              if (append || oldKey) {
                temp.append(true, this.node.children[index]);
              }

              items[key] = temp;
            }

            return items;
          }, {})
        );

        this.items.length = list.length;

        break;

      case 'set':
        const itemsLength = this.items.length;
        const items = list.map((item, index) => {
          let temp;

          if (index < itemsLength) {
            temp = this.items[index];
          } else {
            temp = this.template.clone().append(true);
          }

          temp.setState(item, { index, length });

          return temp;
        });

        for(let i = length; i < itemsLength; i++) {
          this.items[i].remove();
        }

        this.items = items;
    }
  }
}

Foreach._options = {
  breakCompile: true
};

export default Foreach;
