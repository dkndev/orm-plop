let core = require('../core')
let newModelGenerator = require('../newModelGenerator')

module.exports = function (plop) {
  core(plop);

  plop.setGenerator('model', newModelGenerator('./api', './app', './admin'));
};