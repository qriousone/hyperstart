const path = require('path');

module.exports = {
  resolve: resolve
};

function resolve() {
  const args = Array.prototype.slice.call(arguments);
  const paths = [].concat([__dirname, '..'], args);
  return path.resolve.apply(path, paths);
}
