module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/core-js/client/core.js',
      'node_modules/document-register-element/build/document-register-element.js', // jshint ignore:line
      { pattern: 'test/**/*.js', watched: false }
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['webpack']
    },
    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel?presets[]=es2015' }
        ]
      },
      devtool: "#inline-source-map"
    },
    webpackMiddleware: {
      noInfo: true
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
