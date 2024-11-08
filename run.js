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
  overwrite: true, // Optional: overwrite existing files
  verbose: true, // Optional: show creation progress
});
