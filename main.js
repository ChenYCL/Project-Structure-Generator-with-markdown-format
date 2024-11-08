const fs = require("fs").promises;
const path = require("path");

class ProjectStructureGenerator {
  constructor(options = {}) {
    this.options = {
      indentSize: 2,
      supportedPrefixes: ["├── ", "└── ", "│   "],
      defaultFileContent: {
        ".js": "// Custom JavaScript content\n",
        ".json": `{
  "name": "wallet-tracker",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}\n`,
      },
      overwrite: false,
      verbose: true,
      ...options,
    };
  }

  cleanLine(line) {
    let cleaned = line.trim();
    // 移除所有前缀字符
    for (const prefix of this.options.supportedPrefixes) {
      cleaned = cleaned.replace(
        new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ""
      );
    }
    cleaned = cleaned.replace(/│/g, "").trim();
    return cleaned.replace(/\/$/, "");
  }

  getIndentLevel(line) {
    // 计算缩进级别
    const indent = line.match(/^[│\s]*/)[0];
    return Math.floor(indent.length / 4); // 每个级别是4个空格或一个│加3个空格
  }

  isFile(item) {
    return path.extname(item) !== "";
  }

  buildStructure(lines) {
    const root = {
      name: this.cleanLine(lines[0]),
      children: [],
      isFile: false,
      level: -1,
    };

    let stack = [root];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const level = this.getIndentLevel(line);
      const name = this.cleanLine(line);
      const node = {
        name,
        children: [],
        isFile: this.isFile(name),
        level,
      };

      // 找到正确的父节点
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      parent.children.push(node);

      if (!node.isFile) {
        stack.push(node);
      }
    }

    return root;
  }

  async createStructure(node, currentPath) {
    const fullPath = path.join(currentPath, node.name);

    try {
      if (node.isFile) {
        await this.createFile(fullPath);
      } else {
        await this.createDirectory(fullPath);
        for (const child of node.children) {
          await this.createStructure(child, fullPath);
        }
      }
    } catch (err) {
      console.error(`Error processing ${fullPath}:`, err);
      throw err;
    }
  }

  async createDirectory(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
      if (this.options.verbose) {
        console.log(`Created directory: ${dir}`);
      }
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
  }

  async createFile(filePath) {
    try {
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (exists && !this.options.overwrite) {
        if (this.options.verbose) {
          console.log(`Skipped existing file: ${filePath}`);
        }
        return;
      }

      const ext = path.extname(filePath);
      const content = this.options.defaultFileContent[ext] || "";
      await fs.writeFile(filePath, content);

      if (this.options.verbose) {
        console.log(`Created file: ${filePath}`);
      }
    } catch (err) {
      console.error(`Error creating file ${filePath}:`, err);
      throw err;
    }
  }

  async parseAndCreate(content, basePath = process.cwd()) {
    const lines = content.split("\n").filter((line) => line.trim());
    const structure = this.buildStructure(lines);
    await this.createStructure(structure, basePath);
  }

  static fromString(content, options) {
    const generator = new ProjectStructureGenerator(options);
    return generator.parseAndCreate(content);
  }
}

module.exports = ProjectStructureGenerator;
