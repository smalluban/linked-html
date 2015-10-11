module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      { pattern: 'test/**/*.js', watched: false }
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['webpack']
    },
    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel' },
          { test: /\.html$/, loader: 'html' }
        ]
      },
      devtool: "#inline-source-map"
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
