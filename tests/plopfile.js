let newModelGenerator = require('../newModelGenerator')

module.exports = function (plop) {
  plop.setGenerator('model', newModelGenerator);
};