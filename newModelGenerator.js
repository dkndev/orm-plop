let newModelPrompts = require('./newModelPrompts')
let newModelActions = require('./newModelActions')

module.exports = function(backend_path, app_path, admin_path) {
  return {
    description: 'Create a new ORM model',
    prompts: newModelPrompts(backend_path, app_path, admin_path),
    actions: newModelActions(backend_path, app_path, admin_path),
  }
}