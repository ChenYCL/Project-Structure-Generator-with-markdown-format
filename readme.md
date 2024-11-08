# Project Structure Generator with markdown format

A command-line tool that generates project directory structures from markdown-style tree representations.

## Features

- Create directory structures from markdown tree format
- Support for files and directories
- Configurable file content templates
- Visual feedback during generation
- Overwrite protection with optional override

## Usage

Modify `run.js`

```Javascript
const ProjectStructureGenerator = require("./main");

// Define your project structure in markdown tree format
const structure = `
my-project/
├── package.json
├── src/
│   ├── controllers/
│   │   └── main.js
│   ├── models/
│   │   └── user.js
│   └── utils/
│       └── helper.js
└── test/
    └── index.js
`;

// Generate the structure
ProjectStructureGenerator.fromString(structure, {
  overwrite: true,  // Optional: overwrite existing files
  verbose: true     // Optional: show creation progress
});
```

```
node run.js
```

## Result

You will get

```Markdown
my-project
├── package.json
├── src
│   ├── controllers
│   │   └── main.js
│   ├── models
│   │   └── user.js
│   └── utils
│       └── helper.js
└── test
    └── index.js
```