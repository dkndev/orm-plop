let _ = require('lodash')
let collect = require('collect.js')
let pluralize = require('pluralize')
let getMigrationTimestamp = require('./getMigrationTimestamp')

_.mixin({ 'pascalCase': _.flow(_.camelCase, _.upperFirst) });

module.exports = (backend_path, app_path, admin_path) => {
  return (context) => {
    context.modelNamePlural = pluralize(_.lowerCase(context.modelName))
  
    context.barOpen = "{"
    context.barClose = "}"
  
    context.timestampFields = collect(context.fields)
      .filter(field => field.type == 'timestamp')
      .all()
  
    context.fields = context.fields.map(field => {
        // set field.hasDecimals
      if(["float", "double", "decimal"].includes(field.type)) {
        field.hasDecimals = true
      } else {
        field.hasDecimals = false
      }
      // set field.isNumber
      if([
        "float", "double", "decimal",
        "tinyInteger", "smallInteger", "mediumInteger", "integer", "bigInteger",
      ].includes(field.type)) {
        field.isNumber = true
      } else {
        field.isNumber = false
      }
      // make it easy to check field type
      field[`is${_.upperFirst(field.type)}`] = true
      // Set a component name for each field
      // Timestamp
      // 
      field.componentName = `${_.pascalCase(context.modelName)}${_.pascalCase(field.name)}Input`
  
      return field
    })
  
    context.hasDates = !!context.fields.find(field => field.type == 'timestamp')
  
    // Map Admin Access
    if(context.adminAccess) {
      let adminAccess = context.adminAccess
  
      context.adminAccess.forEach(item => {
        adminAccess[item] = true
      })
    
      context.adminAccess = adminAccess
  
      context.adminFullAccess = (
        adminAccess.create && adminAccess.index && adminAccess.read
        && adminAccess.update && adminAccess.delete
      )
    }
  
    // Map Client Access
    if(context.clientAccess) {
      let clientAccess = context.clientAccess
    
      context.clientAccess.forEach(item => {
        clientAccess[item] = true
      })
    
      context.clientAccess = clientAccess
  
      if(!context.adminFiles) context.adminFiles = []
      if(!context.clientFiles) context.clientFiles = []
      if(!context.backendFiles) context.backendFiles = []
    }
  
    return [
      // Model
      {
        type: 'add',
        path: `${backend_path}/app/{{pascalCase modelName}}.php`,
        templateFile: 'plop/templates/Model.php',
        skip() {
          if(!context.backendFiles.includes('model')) return 'not selected'
        }
      },
      // Migration
      {
        type: 'add',
        path: `${backend_path}/database/migrations/${getMigrationTimestamp()}_create_{{snakeCase modelNamePlural}}_table.php`,
        templateFile: 'plop/templates/create_model_table_migration.php',
        skip() {
          if(!context.backendFiles.includes('migration')) return 'not selected'
        }
      },
      // Factory
      {
        type: 'add',
        path: `${backend_path}/database/factories/{{pascalCase modelName}}Factory.php`,
        templateFile: 'plop/templates/ModelFactory.php',
        skip() {
          if(!context.backendFiles.includes('factory')) return 'not selected'
        }
      },
      // Routes
      {
        type: 'add',
        path: `${backend_path}/app/Http/Routes/{{pascalCase modelName}}Routes.php`,
        templateFile: 'plop/templates/modelRoutes.php',
        skip() {
          if(!context.backendFiles.includes('routes')) return 'not selected'
        }
      },
      // Controller
      {
        type: 'add',
        path: `${backend_path}/app/Http/Controllers/{{pascalCase modelName}}Controller.php`,
        templateFile: 'plop/templates/ModelController.php',
        skip() {
          if(!context.backendFiles.includes('controller')) return 'not selected'
        }
      },
      // API Tests
      {
        type: 'add',
        path: `${backend_path}/tests/Feature/API/{{pascalCase modelName}}Test.php`,
        templateFile: 'plop/templates/ModelApiTest.php',
        skip() {
          if(!context.backendFiles.includes('apiTests')) return 'not selected'
        }
      },
      // Unit Tests
      {
        type: 'add',
        path: `${backend_path}/tests/Unit/{{pascalCase modelName}}Test.php`,
        templateFile: 'plop/templates/ModelUnitTest.php',
        skip() {
          if(!context.backendFiles.includes('unitTests')) return 'not selected'
        }
      },
      // Policy
      {
        type: 'add',
        path: `${backend_path}/app/Policies/{{pascalCase modelName}}Policy.php`,
        templateFile: 'plop/templates/ModelPolicy.php',
        skip() {
          if(!context.backendFiles.includes('policy')) return 'not selected'
        }
      },
      // Observer
      {
        type: 'add',
        path: `${backend_path}/app/Observers/{{pascalCase modelName}}Observer.php`,
        templateFile: 'plop/templates/ModelObserver.php',
        skip() {
          if(!context.backendFiles.includes('observer')) return 'not selected'
        }
      },
      // Seeder
      {
        type: 'add',
        path: `${backend_path}/database/seeds/{{pascalCase modelName}}Seeder.php`,
        templateFile: 'plop/templates/ModelSeeder.php',
        skip() {
          if(!context.backendFiles.includes('seeder')) return 'not selected'
        }
      },
    
      // Admin VuexORM Class
      {
        type: 'add',
        path: `${admin_path}/src/store/classes/{{pascalCase modelName}}.js`,
        templateFile: 'plop/templates/ModelClass.js',
        skip() {
          if(!context.adminFiles.includes('vuexOrmClass')) return 'not selected'
        }
      },
      // Admin Create Button (Includes Form and Modal)
      {
        type: 'add',
        path: `${admin_path}/src/components/Create{{pascalCase modelName}}Button.vue`,
        templateFile: 'plop/templates/CreateModelButton.vue',
        skip() {
          if(!context.adminFiles.includes('createButton')) return 'not selected'
        }
      },
      // Admin Create Button (Includes Form and Modal)
      {
        type: 'add',
        path: `${admin_path}/src/components/Update{{pascalCase modelName}}Button.vue`,
        templateFile: 'plop/templates/UpdateModelButton.vue',
        skip() {
          if(!context.adminFiles.includes('updateButton')) return 'not selected'
        }
      },
      // Admin Form
      {
        type: 'add',
        path: `${admin_path}/src/components/{{pascalCase modelName}}Form.vue`,
        templateFile: 'plop/templates/ModelForm.vue',
        skip() {
          if(
            !context.adminFiles.includes('form')
            && !context.adminFiles.includes('createButton')
            && !context.adminFiles.includes('updateButton')
          ) return 'not selected'
        }
      },
      // Admin Fields
      ...context.fields.map(field => {
        return {
          type: 'add',
          data: { field },
          path: `${admin_path}/src/components/{{pascalCase modelName}}${_.upperFirst(_.camelCase(field.name))}Input.vue`,
          templateFile: 'plop/templates/ModelFieldInput.vue',
          skip() {
            if(!context.adminFiles.includes('inputFieldComponents')) return 'not selected'
          }
        }
      }),
      // Admin Update Button (Includes Form and Modal)
      // Admin Editable Table
      // Admin Viewable Table
    
      // Client VuexORM Class
      {
        type: 'add',
        path: `${app_path}/src/store/classes/{{pascalCase modelName}}.js`,
        templateFile: 'plop/templates/ModelClass.js',
        skip() {
          if(!context.clientFiles.includes('vuexOrmClass')) return 'not selected'
        }
      },
      // Client Create Button (Includes Form and Modal)
      {
        type: 'add',
        path: `${app_path}/src/components/Create{{pascalCase modelName}}Button.vue`,
        templateFile: 'plop/templates/CreateModelButton.vue',
        skip() {
          if(!context.clientFiles.includes('createButton')) return 'not selected'
        }
      },
      // Client Update Button (Includes Form and Modal)
      {
        type: 'add',
        path: `${app_path}/src/components/Update{{pascalCase modelName}}Button.vue`,
        templateFile: 'plop/templates/UpdateModelButton.vue',
        skip() {
          if(!context.clientFiles.includes('updateButton')) return 'not selected'
        }
      },
      // Client Form
      {
        type: 'add',
        path: `${app_path}/src/components/{{pascalCase modelName}}Form.vue`,
        templateFile: 'plop/templates/ModelForm.vue',
        skip() {
          if(!context.clientFiles.includes('form')) return 'not selected'
        }
      },
      // Client Fields
      ...context.fields.map(field => {
        return {
          type: 'add',
          data: { field },
          path: `${app_path}/src/components/{{pascalCase modelName}}${_.upperFirst(_.camelCase(field.name))}Input.vue`,
          templateFile: 'plop/templates/ModelFieldInput.vue',
          skip() {
            if(!context.clientFiles.includes('inputFieldComponents')) return 'not selected'
          }
        }
      }),
    
      // Add to api.php routes file
      {
        type: 'append',
        path: `${backend_path}/routes/api.php`,
        pattern: '\/\/ RESTful routes',
        template: "    require ($routes_dir.'{{pascalCase modelName}}Routes.php');",
        skip() {
          if(!context.backendFiles.includes('routes')) return 'not selected'
        }
      },
      // Append VuexORM Class import Admin
      {
        type: 'append',
        path: `${admin_path}/src/store/database.js`,
        pattern: '\/\/ Import Classes',
        template: "import {{pascalCase modelName}} from 'classes/{{pascalCase modelName}}'",
        skip() {
          if(!context.adminFiles.includes('vuexOrmClass')) return 'not selected'
        }
      },
      // Append VuexORM Database import Admin
      {
        type: 'append',
        path: `${admin_path}/src/store/database.js`,
        pattern: '\/\/ Register Classes',
        template: "database.register({{pascalCase modelName}})",
        skip() {
          if(!context.adminFiles.includes('vuexOrmClass')) return 'not selected'
        }
      },
      // Append VuexORM Class import Client
      {
        type: 'append',
        path: `${app_path}/src/store/database.js`,
        pattern: '\/\/ Import Classes',
        template: "import {{pascalCase modelName}} from 'classes/{{pascalCase modelName}}'",
        skip() {
          if(!context.clientFiles.includes('vuexOrmClass')) return 'not selected'
        }
      },
      // Append VuexORM Database import Client
      {
        type: 'append',
        path: `${app_path}/src/store/database.js`,
        pattern: '\/\/ Register Classes',
        template: "database.register({{pascalCase modelName}})",
        skip() {
          if(!context.clientFiles.includes('vuexOrmClass')) return 'not selected'
        }
      },
    ]
  }
}