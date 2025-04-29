"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Helper script to create a new model and its migration
 *
 * Usage: ts-node src/utils/createModel.ts ModelName field1:type field2:type
 *
 * Example: ts-node src/utils/createModel.ts Product name:string price:decimal
 */
function createModel() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: ts-node src/utils/createModel.ts ModelName field1:type field2:type');
        process.exit(1);
    }
    const modelName = args[0];
    const attributes = args.slice(1);
    const modelNameLower = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    console.log(`Creating model ${modelName} with attributes: ${attributes.join(', ')}`);
    // Use sequelize-cli to generate migration
    try {
        // Create migration using sequelize-cli
        const attributesStr = attributes.map(attr => `--attributes ${attr}`).join(' ');
        const command = `cd ../../ && npx sequelize-cli model:generate --name ${modelName} ${attributesStr}`;
        console.log(`Running command: ${command}`);
        (0, child_process_1.execSync)(command, { stdio: 'inherit' });
        console.log('Migration created successfully');
        // Now create a TypeScript model file
        const modelTemplate = generateModelTemplate(modelName, attributes);
        const modelPath = path_1.default.resolve(__dirname, '../../models', `${modelNameLower}.ts`);
        fs_1.default.writeFileSync(modelPath, modelTemplate);
        console.log(`Model file created at: ${modelPath}`);
        // Remind user to update index.ts
        console.log('\nNext steps:');
        console.log('1. Review and modify the model and migration files as needed');
        console.log('2. Update models/index.ts to import and initialize your new model');
        console.log('3. Run migrations with: npx sequelize-cli db:migrate');
        console.log('4. Or use syncModels.ts to sync the database');
    }
    catch (error) {
        console.error('Error creating model:', error);
        process.exit(1);
    }
}
function generateModelTemplate(modelName, attributes) {
    const modelNameLower = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    // Parse attributes
    const attrs = attributes.map(attr => {
        const [name, type] = attr.split(':');
        let sequelizeType;
        switch (type.toLowerCase()) {
            case 'string':
                sequelizeType = 'DataTypes.STRING';
                break;
            case 'integer':
            case 'int':
                sequelizeType = 'DataTypes.INTEGER';
                break;
            case 'boolean':
            case 'bool':
                sequelizeType = 'DataTypes.BOOLEAN';
                break;
            case 'date':
                sequelizeType = 'DataTypes.DATE';
                break;
            case 'decimal':
            case 'float':
                sequelizeType = 'DataTypes.DECIMAL';
                break;
            case 'text':
                sequelizeType = 'DataTypes.TEXT';
                break;
            default:
                sequelizeType = `DataTypes.${type.toUpperCase()}`;
        }
        return { name, type: sequelizeType };
    });
    // Generate attributes for interface
    const interfaceAttrs = attrs.map(({ name, type }) => {
        return `  ${name}: ${type === 'DataTypes.INTEGER' ? 'number' :
            type === 'DataTypes.BOOLEAN' ? 'boolean' :
                type === 'DataTypes.DATE' ? 'Date' :
                    type === 'DataTypes.DECIMAL' ? 'number' : 'string'};`;
    }).join('\n');
    // Generate attributes for model definition
    const modelAttrs = attrs.map(({ name, type }) => {
        return `    ${name}: {
      type: ${type},
      allowNull: false
    }`;
    }).join(',\n');
    return `import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface ${modelName} extends Model<InferAttributes<${modelName}>, InferCreationAttributes<${modelName}>> {
  id?: number;
${interfaceAttrs}
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const ${modelName}Factory = (sequelize: Sequelize) => {
  const ${modelName} = sequelize.define<${modelName}>('${modelName}', {
${modelAttrs}
  }, {
    tableName: '${modelName}s'
  });

  return ${modelName};
};
`;
}
// Run the create function if this file is executed directly
if (require.main === module) {
    createModel();
}
exports.default = createModel;
