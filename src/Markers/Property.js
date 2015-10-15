import List from './List';

class Property extends List {
  link(node, name, value) {
    const accessor = this.resolveProperty(node, name);

    this.engine._link(value, {
      value: accessor.get(),
      observe: accessor.set
    });
  }

  resolveProperty(node, name) {
    if (name in node) {
      return {
        get: ()=> node[name],
        set: (value)=> node[name] = value
      };
    } else {
      return {
        get: ()=> {
          const val = node.getAttribute(name);
          return val ? val : undefined;
        },
        set: (value)=> {
          if (value === false || value === undefined || value === null) {
            node.removeAttribute(name);
          } else {
            node.setAttribute(name, value === true ? name : value);
          }
        }
      };
    }
  }
}

export default Property;



