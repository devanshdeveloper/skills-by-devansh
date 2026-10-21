const fs = require('fs');
const BaseOptimizer = require('./BaseOptimizer');

class PdfOptimizer extends BaseOptimizer {
    constructor(options = {}) {
        super(options);
        this.supportedFormats = ['.pdf'];
    }

    async optimize(fileInfo) {
        const outputPath = this.getOutputPath(fileInfo);

        if (this.options.dryRun) {
            return { success: true, skipped: true, path: outputPath };
        }

        // Check availability to skip
        if (!this.options.recreateOutputFolder && fs.existsSync(outputPath)) {
            return { success: true, skipped: true, path: outputPath, note: 'Already processed' };
        }

        try {
            // Current implementation: Copy file

            fs.copyFileSync(fileInfo.path, outputPath);

            return {
                success: true,
                originalSize: fileInfo.size,
                newSize: fileInfo.size,
                savings: 0,
                savingsPercent: 0,
                outputPath: outputPath,
                note: 'Passthrough copy (optimization not implemented)'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = PdfOptimizer;
