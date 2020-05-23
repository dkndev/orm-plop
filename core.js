let _ = require('lodash')
let pluralize = require('pluralize')
let inquirerRecursive = require('inquirer-recursive')

module.exports = function (plop) {
  plop.setPrompt('recursive', inquirerRecursive)

  plop.setHelper('pluralizeSnakeCase', function (text) {
    return pluralize(_.lowerCase(text))
  });
};