const { resolve } = require('./path-helpers');
module.exports = {
  entry: {
    bundle: resolve('src', 'assets', 'index.js')
  },
  output: {
    filename: '[name].js',
    path: resolve('dist')
  }
};
