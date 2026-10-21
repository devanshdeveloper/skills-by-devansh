const fs = require('fs');
const path = require('path');
const config = require('./config');

class BaseOptimizer {
    constructor(options = {}) {
        this.options = { ...config, ...options };
    }

    async optimize(fileInfo) {
        throw new Error('optimize() must be implemented by subclass');
    }

    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    getOutputPath(fileInfo, extension = null) {
        const ext = extension || fileInfo.ext;

        // Calculate relative path from input root to maintain structure
        const relativePath = path.relative(this.options.inputRoot, path.dirname(fileInfo.path));
        const outputDir = path.join(this.options.outputRoot, relativePath);

        this.ensureDir(outputDir);

        const outputName = fileInfo.name.replace(fileInfo.ext, ext);
        return path.join(outputDir, outputName);
    }

    formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
}

module.exports = BaseOptimizer;
