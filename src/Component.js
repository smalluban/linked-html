import Expression from './Expression/Expression';

export const map = new WeakMap();

export function register(constructor, name, customOptions) {
  const constrOpts = Object.assign({}, constructor._options, customOptions);
  const options = extractOptions(
    constrOpts, ['template', 'properties', 'methods', 'shadow', 'prototype']
  );
  const prototype = Object.create(options.prototype || HTMLElement.prototype);
  const { template, properties } = options;

  if (template && template !== true) {
    options.template = resolveTemplate(template);
  }

  if(properties) {
    for (let key of Object.keys(properties)) {
      if (typeof properties[key] === 'string') {
        properties[key] = {
          link: options.properties[key],
          attribute: camelToDash(key)
        };
      } else if (Object(properties[key]) === properties[key]) {
        if (properties[key].attribute === undefined) {
          properties[key].attribute = camelToDash(key);
        }
      } else {
        throw new TypeError(`Invalid '${key}' property description.`);
      }
    }
  }

  Object.defineProperty(prototype, 'createdCallback', {
    value: function() {
      map.set(this, compile(constructor, this, options, constrOpts));
    }
  });

  if (typeof constructor.prototype.attached === 'function') {
    Object.defineProperty(prototype, 'attachedCallback', {
      value: function() {
        map.get(this).then(engine => {
          engine.attached();
        });
      }
    });
  }

  if (typeof constructor.prototype.detached === 'function') {
    Object.defineProperty(prototype, 'detachedCallback', {
      value: function() {
        map.get(this).then(engine => {
          engine.detached();
        });
      }
    });
  }

  if (typeof constructor.prototype.attributeChanged === 'function') {
    Object.defineProperty(prototype, 'attributeChangedCallback', {
      value: function(attrName, oldVal, newVal) {
        map.get(this).then(engine => {
          engine.attributeChanged(attrName, oldVal, newVal);
        });
      }
    });
  }

  return document.registerElement(name, { prototype });
}

function compile(constructor, host, options, constrOpts) {
  let { template, properties, methods } = options;
  const shadow = options.shadow && resolveShadow(host);
  const target = shadow || document.createDocumentFragment();

  if (template) {
    if (template === true) {
      template = host.children[0];
      if (!(template && template.localName === 'template')) {
        throw new Error('Template element required.');
      }
      host.removeChild(template);

      if (template.content) {
        target.appendChild(template.content);
      } else {
        Array.from(template.childNodes).forEach(n => {
          target.appendChild(n);
        });
      }
    } else {
      target.appendChild(document.importNode(template, true));
    }
  } else {
    Array.from(host.childNodes).forEach(n => {
      target.appendChild(n);
    });
  }

  return Promise.resolve().then(()=> {
    const engine = new constructor(target, constrOpts);
    Object.defineProperty(engine, 'host', { value: host });

    if (!shadow) {
      host.insertBefore(target, host.childNodes[0]);
    } else {
      Object.defineProperty(engine, 'shadow', { value: target });
    }

    if (properties) {
      for (let key of Object.keys(properties)) {
        const { link, attribute, reflect } = properties[key];
        const expr = new Expression(engine, link);

        Object.defineProperty(host, key, {
          get: ()=> expr.get(),
          set: (val)=> expr.set(val)
        });

        if (attribute) {
          if (host.hasAttribute(attribute)) {
            expr.set(host.getAttribute(attribute));
          }
          if (reflect) {
            expr.observe((val)=> {
              if (val === undefined) {
                host.removeAttribute(attribute);
              } else {
                if (val === true) {
                  host.setAttribute(attribute, '');
                } else {
                  host.setAttribute(attribute, val);
                }
              }
            }, true);
          }
        }
      }
    }

    if (methods) {
      [].concat(methods).forEach(method => {
        Object.defineProperty(host, method, {
          writable: true,
          value: (...args)=> engine[method](...args)
        });
      });
    }

    return engine;
  });
}

function extractOptions(options, list = []) {
  const temp = {};
  for (let key of list) {
    temp[key] = options[key];
    delete options[key];
  }

  return temp;
}

function resolveShadow(host) {
  if (typeof host.attachShadow === 'function') {
    return host.attachShadow({mode: "closed"});
  } else if (typeof host.createShadowRoot === 'function') {
    return host.createShadowRoot();
  }
}

function resolveTemplate(content) {
  if (typeof content === 'string') {
    const template = document.createElement('template');
    template.innerHTML = content;

    if (!template.content) {
      const fragment = document.createDocumentFragment();
      Array.from(template.childNodes).forEach(n => {
        fragment.appendChild(n);
      });
      return fragment;
    } else {
      return template.content;
    }
  } else {
    return content.content || content;
  }
}

function camelToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
