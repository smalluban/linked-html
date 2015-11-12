# Linked HTML [![Build Status](https://travis-ci.org/smalluban/linked-html.svg?branch=master)](https://travis-ci.org/smalluban/linked-html)

Linked HTML is a library for creating dynamic user interfaces from static html content.

* **Fastboot data model:** Initial data model is extracted from static html generated by any server-side language or template engine.
* **Safe and simple syntax:** Links between html and data model are marked only by custom attributes. This ensures no conflict with template engines syntax.
* **Data binding**: Library uses one-way data binding with flexible control over primitive values, arrays and objects.
* **Superfast rendering**: Initial state is pre-rendered - bootstrapping library usually takes no DOM changes. Mutated state re-use existing html nodes as much as possible.
* **Small and simple API**: The architecture covers only three simple concepts.

## Documentation
The latest documentation is available at project [Wiki](https://github.com/smalluban/linked-html/wiki).

## Contribute
Feel free to contribute! Fork project, install node dependencies and run:

```
npm run develop
```

Please provide tests before creating pull request.

### License
Linked HTML is released under the [MIT License](https://github.com/smalluban/linked-html/blob/master/LICENSE).
