export function list(evaluate, cb) {
  evaluate.split(';').forEach(v => {
    const [name, value] = v.split(':');

    if (!name || !value) {
      throw new SyntaxError(`'${v}': Invalid list element.`);
    }

    cb(name.trim(), value.trim());
  });
}
