class List {
  constructor(engine, node, evaluate) {
    this.engine = engine;

    evaluate.split(';').forEach(v => {
      const [name, value] = v.split(':');

      if (!name || !value) {
        throw new SyntaxError(`'${v}': Invalid list element.`);
      }

      this.link(node, name.trim(), value.trim());
    });
  }
}

export default List;
