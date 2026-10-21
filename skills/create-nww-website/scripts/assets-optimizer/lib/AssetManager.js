const fs = require('fs');
const path = require('path');
const config = require('./config');
const ImageOptimizer = require('./ImageOptimizer');
const VideoOptimizer = require('./VideoOptimizer');
const PdfOptimizer = require('./PdfOptimizer');
const LogoProcessor = require('./LogoProcessor');

class AssetManager {
    constructor(options = {}) {
        this.options = { ...config, ...options };

        // Resolve paths immediately
        this.options.inputRoot = path.resolve(this.options.inputDir);
        this.options.outputRoot = path.resolve(this.options.outputDir);
        this.options.manifestDir = path.resolve(this.options.manifestDir || this.options.outputDir);

        // Initialize optimizers
        this.imageOptimizer = new ImageOptimizer(this.options);
        this.videoOptimizer = new VideoOptimizer(this.options);
        this.pdfOptimizer = new PdfOptimizer(this.options);
        this.logoProcessor = new LogoProcessor(this.options);
    }

    getOptimizer(ext) {
        if (this.options.imageFormats.includes(ext)) return this.imageOptimizer;
        if (this.options.videoFormats.includes(ext)) return this.videoOptimizer;
        if (this.options.pdfFormats.includes(ext)) return this.pdfOptimizer;
        return null;
    }

    scanDirectory(dir, fileList = []) {
        if (!fs.existsSync(dir)) return fileList;

        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && this.options.recursive) {
                this.scanDirectory(fullPath, fileList);
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                const optimizer = this.getOptimizer(ext);

                // Add all files, even if no optimizer found
                fileList.push({
                    path: fullPath,
                    name: item,
                    ext: ext,
                    size: stat.size,
                    optimizer: optimizer
                });
            }
        }

        return fileList;
    }

    async processAll() {
        this.options.inputRoot = path.resolve(this.options.inputDir);
        this.options.outputRoot = path.resolve(this.options.outputDir);

        console.log(`\n🚀 Assets Optimizer Started`);
        console.log(`📂 Input:  ${this.options.inputRoot}`);
        console.log(`📂 Output: ${this.options.outputRoot}`);
        if (this.options.strictMaxSize) console.log(`📏 Strict Max Size: ${this.formatSize(this.options.strictMaxSize)}`);
        console.log(`⚡ Concurrency: ${this.options.concurrency || 1}`);

        // Handle recreateOutputFolder
        if (this.options.recreateOutputFolder && fs.existsSync(this.options.outputRoot)) {
            console.log(`🧹 Cleaning output directory...`);
            fs.rmSync(this.options.outputRoot, { recursive: true, force: true });
        }

        if (!fs.existsSync(this.options.inputRoot)) {
            console.warn(`⚠️  Input directory not found: ${this.options.inputDir}`);
            return;
        }

        // Special Task: Logo Processing
        if (this.options.processLogo && this.options.logoPath) {
            console.log(`\n🔹 Starting Logo Processing Tasks...`);
            const logoResult = await this.logoProcessor.process(this.options.logoPath);
            if (logoResult.success) {
                console.log(`✅ Logo processing completed. Generated ${logoResult.count} variants.`);
            } else {
                console.error(`❌ Logo processing failed: ${logoResult.error}`);
            }
        }

        const files = this.scanDirectory(this.options.inputRoot);

        if (files.length === 0) {
            console.log('📭 No assets found to process.');
            return;
        }

        console.log(`📸 Found ${files.length} assets. Processing...\n`);

        let stats = {
            total: files.length,
            success: 0,
            failed: 0,
            originalSize: 0,
            newSize: 0
        };

        let manifest = {};

        // Helper for parallel processing with concurrency limit
        const processFile = async (file, index) => {
            const relativePath = path.relative(this.options.inputRoot, file.path).replace(/\\/g, '/');

            try {
                let result;

                if (file.optimizer) {
                    result = await file.optimizer.optimize(file);
                } else {
                    // Handle unsupported files: Copy them
                    const outputDir = path.dirname(path.join(this.options.outputRoot, relativePath));
                    const outputPath = path.join(this.options.outputRoot, relativePath);

                    // Ensure output dir exists
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }

                    // Check if we should skip
                    if (!this.options.recreateOutputFolder && fs.existsSync(outputPath)) {
                        result = {
                            success: true,
                            skipped: true,
                            path: outputPath,
                            note: 'Already processed (Unsupported Format)'
                        };
                    } else {
                        // Copy file
                        try {
                            fs.copyFileSync(file.path, outputPath);
                            const newStat = fs.statSync(outputPath);
                            result = {
                                success: true,
                                originalSize: file.size,
                                newSize: newStat.size,
                                savings: 0,
                                savingsPercent: 0,
                                outputPath: outputPath,
                                note: 'Copied (Unsupported Format)'
                            };
                        } catch (copyErr) {
                            result = { success: false, error: copyErr.message };
                        }
                    }
                }

                // Log result (atomic log per line)
                if (result.success) {
                    let log = `[${index + 1}/${files.length}] ${relativePath} ... ✅ Done`;
                    if (result.skipped) log += ' (Skipped)';
                    else {
                        if (result.savingsPercent !== undefined) log += `. Saved ${result.savingsPercent}%`;
                        if (result.note) log += ` (${result.note})`;
                    }
                    if (result.finalQuality) log += ` [Quality reduced to ${result.finalQuality}]`;
                    console.log(log);

                    if (result.skipped) {
                        stats.success++;
                    } else {
                        stats.success++;
                        stats.originalSize += (result.originalSize || 0);
                        stats.newSize += (result.newSize || 0);
                    }

                    // Add to manifest if variants exist
                    if (result.variants) {
                        manifest[relativePath] = result.variants;
                    } else if (result.outputPath) {
                        // Fallback for non-image assets or original size only
                        const rel = path.relative('public', result.outputPath).replace(/\\/g, '/');
                        const relOutput = rel.startsWith('..') 
                            ? '/' + rel.split('/').filter(part => part !== '..').join('/')
                            : '/' + rel;
                        manifest[relativePath] = { original: relOutput };
                    }
                } else {
                    console.log(`[${index + 1}/${files.length}] ${relativePath} ... ❌ Failed: ${result.error}`);
                    stats.failed++;
                }
            } catch (e) {
                console.log(`[${index + 1}/${files.length}] ${relativePath} ... ❌ Error: ${e.stack}`);
                stats.failed++;
            }
        };

        // Simple concurrency pool
        const concurrency = this.options.concurrency || 1;
        const queue = [...files];
        const totalFiles = files.length;

        const worker = async () => {
            while (queue.length > 0) {
                const file = queue.shift();
                // Calculate index for logging (approximate)
                const index = totalFiles - queue.length - 1;
                await processFile(file, index);
            }
        };

        const workers = [];
        for (let i = 0; i < Math.min(concurrency, files.length); i++) {
            workers.push(worker());
        }

        await Promise.all(workers);

        // Write manifest
        if (Object.keys(manifest).length > 0) {
            if (!fs.existsSync(this.options.manifestDir)) {
                fs.mkdirSync(this.options.manifestDir, { recursive: true });
            }
            const manifestPath = path.join(this.options.manifestDir, this.options.manifestName || 'manifest.json');
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            console.log(`\n📝 Manifest generated at: ${manifestPath}`);
        }

        this.printSummary(stats);
    }

    formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    printSummary(stats) {
        const savedBytes = stats.originalSize - stats.newSize;
        const savedMB = (savedBytes / (1024 * 1024)).toFixed(2);

        console.log('\n' + '═'.repeat(40));
        console.log('🎉 Optimization Complete');
        console.log('═'.repeat(40));
        console.log(`✅ Success: ${stats.success}`);
        if (stats.failed > 0) console.log(`❌ Failed:  ${stats.failed}`);
        console.log(`📦 Processed Size: ${(stats.originalSize / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`💾 Final Size:     ${(stats.newSize / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`📉 Total Saved:    ${savedMB} MB\n`);
    }
}

module.exports = AssetManager;
