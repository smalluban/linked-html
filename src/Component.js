import { PropertyObserver } from 'papillon/papillon';
import Expression from './Expression/Expression';

export const map = new WeakMap();

export function register(constructor, name, customOptions) {
  const contrOpts = Object.assign({}, constructor._options, customOptions);
  const options = extractOptions(
    contrOpts, ['template', 'properties', 'methods', 'shadow', 'prototype']
  );
  const prototype = Object.create(options.prototype || HTMLElement.prototype);
  const { template, properties } = options;

  if (template && template !== true) {
    options.template = resolveTemplate(template);
  }

  if(properties) {
    for (let key in properties) {
      if (typeof properties[key] === 'string') {
        properties[key] = { link: options.properties[key], attribute: true };
      } else if (Object(properties[key]) === properties[key]) {
        if (properties[key].attribute === undefined) {
          properties[key].attribute = true;
        }
      } else {
        throw new TypeError(`Invalid '${key}' property description.`);
      }
    }
  }

  Object.defineProperty(prototype, 'createdCallback', {
    value: function() {
      map.set(this, compile(constructor, this, options, contrOpts));
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

  return document.registerElement(name, { prototype });
}

function compile(constructor, host, options, constrOpts) {
  let { template, properties, methods } = options;
  const shadow = options.shadow && resolveShadow(host);
  const target = shadow || document.createDocumentFragment();

  if (template) {
    if (template === true) {
      if (!(host.children[0] && host.children[0].content)) {
        throw new Error('Template element required.');
      }
      template = host.children[0].content;
      host.removeChild(host.children[0]);
    }

    target.appendChild(document.importNode(template, true));
  } else {
    Array.from(host.childNodes).forEach(n => {
      target.appendChild(n);
    });
  }

  return new Promise((resolve)=> {
    window.requestAnimationFrame(()=> {
      const engine = new constructor(target, constrOpts);
      Object.defineProperty(engine, 'host', { value: host });

      if (!shadow) {
        host.insertBefore(target, host.childNodes[0]);
      } else {
        Object.defineProperty(engine, 'shadow', { value: target });
      }

      if (properties) {
        for (let key in properties) {
          const { link, attribute, reflect } = properties[key];
          const expr = new Expression(engine, link);

          new PropertyObserver(host, key).observe(
            ()=> expr.get(),
            val => expr.set(val)
          );

          if (attribute) {
            const attr = attribute !== true ? attribute : camelToDash(key);
            if (host.hasAttribute(attr)) {
              expr.set(host.getAttribute(attr));
            }
            if (reflect) {
              expr.observe((val)=> {
                host.setAttribute(attr, val);
              });
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

      resolve(engine);
    });
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
    return template.content;
  } else {
    return content.content || content;
  }
}

function camelToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
