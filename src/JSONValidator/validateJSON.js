// Import the Ajv library
const Ajv = require('ajv');

// Define the JSON schema
const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "type": "number"
    },
    "city": {
      "type": "string"
    }
  },
  "required": ["name", "age"]
};

// Define the JSON object
const data = {
  "name": "John Doe",
  "age": 30,
  "city": "New York"
};

// Create a new Ajv instance
const ajv = new Ajv();

// Compile the schema
const validate = ajv.compile(schema);

// Validate the data
const valid = validate(data);

// Check if the data is valid
if (!valid) {
  console.log(validate.errors);
} else {
  console.log("JSON is valid");
}