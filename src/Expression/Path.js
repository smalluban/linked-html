export default class Path {
  constructor(evaluate, context) {
    if (!evaluate) {
      throw new TypeError('Path cannot be empty.');
    }

    this.evaluate = evaluate;
    this.context = context;
    this.path = this.parse(evaluate);
  }

  parse(path) {
    let result = [];

    const property = path.split('').reduce(
      (acc, char)=> {
        switch(char) {
          case ".":
            result.push({property: acc, proto: Object});
            return "";
          case "[":
            result.push({property: acc, proto: Array});
            return "";
          case "]":
            return acc;
        }

        return acc + char;
      }, "");

    result.push({property});

    return result;
  }

  getContext() {
    const context = this.context();
    if (Object(context) !== context) {
      throw new TypeError('Object required as path context.');
    }
    return context;
  }

  get() {
    let result = this.getContext();

    if (result) {
      this.path.every(({property, proto})=> {
        result = result[property];

        if(result && proto && !(result instanceof Object)) {
          throw new TypeError(
            `'${property}' in '${this.evaluate}': Object instance required.`);
        }

        return result;
      });
    }

    return result;
  }

  set(newVal, check = false) {
    const {context, property} = this.path.reduce((acc, {property, proto})=> {
      if (proto) {
        if (!acc.context[property]) {
          acc.context[property] = proto();
        } else if(!(acc.context[property] instanceof Object)) {
          throw new TypeError(
            `'${property}' in '${this.evaluate}': Object instance required.`);
        }

        acc.context = acc.context[property];
      } else {
        acc.property = property;
      }

      return acc;
    }, { context: this.getContext() });

    if (!check || context[property] === undefined) {
      context[property] = newVal;
    }

    return context[property];
  }

  call(...args) {
    const { context, property } = this.path.reduce((acc, {property, proto})=> {
      if (proto) {
        acc.context = acc.context[property];
        if(!(acc.context instanceof Object)) {
          throw new TypeError(
            `'${property}' in '${this.evaluate}': Object instance required.`);
        }
      } else {
        acc.property = property;
      }

      return acc;
    }, { context: this.getContext() });

    if (typeof context[property] !== 'function') {
      throw new TypeError(`'${this.evaluate}': Function required.`);
    }

    return context[property](...args);
  }

  delete() {
    let context = this.getContext();
    let result = { context, property: this.path[0].property };

    this.path.some(({property}) => {
      if (!context.hasOwnProperty(property)) {
        return true;
      }

      if (Object.keys(context).length > 1) {
        result = { context, property };
      }

      context = context[property];
    });

    delete result.context[result.property];
  }
}
