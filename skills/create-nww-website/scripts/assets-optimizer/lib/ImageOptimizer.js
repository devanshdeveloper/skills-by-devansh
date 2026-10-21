const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const BaseOptimizer = require('./BaseOptimizer');

class ImageOptimizer extends BaseOptimizer {
    constructor(options = {}) {
        super(options);
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tiff', '.tif'];
    }

    async optimize(fileInfo) {
        const outputFormat = this.determineOutputFormat(fileInfo.ext);
        const outputExt = outputFormat === 'jpeg' ? '.jpg' : `.${outputFormat}`;
        const outputPath = this.getOutputPath(fileInfo, outputExt);
        const parsedPath = path.parse(outputPath);

        const makeRelative = (p) => {
            const rel = path.relative('public', p).replace(/\\/g, '/');
            if (rel.startsWith('..')) return '/' + rel.split('/').filter(part => part !== '..').join('/');
            return '/' + rel;
        };

        if (this.options.dryRun) {
            return { success: true, skipped: true, path: outputPath };
        }

        // Check if we should skip
        if (!this.options.recreateOutputFolder && !this.options.overwrite && fs.existsSync(outputPath)) {
            let variants = { original: makeRelative(outputPath) };
            
            // Reconstruct responsive variants
            const sizesToGenerate = this.options.getResponsiveSizes ? (this.options.responsiveSizes || []) : [];
            for (const width of sizesToGenerate) {
                const sizePath = path.join(parsedPath.dir, `${parsedPath.name}-${width}${outputExt}`);
                if (fs.existsSync(sizePath)) {
                    variants[width] = makeRelative(sizePath);
                }
            }

            return {
                success: true,
                skipped: true,
                outputPath: outputPath,
                variants: variants,
                note: 'Already optimized'
            };
        }

        try {
            const resize = this.parseResize(this.options.resize);
            let currentQuality = this.options.quality || 80;
            let finalQuality = currentQuality;
            const minQuality = 10;
            const qualityStep = 15; // Increased step to reduce iterations

            let inputBuffer = fs.readFileSync(fileInfo.path);

            if (this.options.blurBottomRight) {
                const image = sharp(inputBuffer);
                const meta = await image.metadata();
                const width = meta.width;
                const height = meta.height;

                const areaW = Math.floor(width * 0.3);
                const areaH = Math.floor(height * 0.15);
                const left = width - areaW;
                const top = height - areaH;

                const region = await image.clone()
                    .extract({ left, top, width: areaW, height: areaH })
                    .blur(15)
                    .toBuffer();

                inputBuffer = await image
                    .composite([{ input: region, top, left }])
                    .toBuffer();
            }

            const compressBuffer = async (q, targetWidth) => {
                let pipeline = sharp(inputBuffer);

                if (targetWidth) {
                    pipeline = pipeline.resize(targetWidth, null, {
                        withoutEnlargement: true,
                    });
                } else if (resize) {
                    pipeline = pipeline.resize(resize.width, resize.height, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    });
                }

                switch (outputFormat) {
                    case 'jpeg': pipeline = pipeline.jpeg({ quality: q, mozjpeg: true }); break;
                    case 'png': pipeline = pipeline.png({ quality: q, compressionLevel: 9, palette: true }); break;
                    case 'webp': pipeline = pipeline.webp({ quality: q, effort: 4 }); break;
                    case 'avif': pipeline = pipeline.avif({ quality: q, effort: 4 }); break;
                    case 'tiff': pipeline = pipeline.tiff({ quality: q, compression: 'lzw' }); break;
                    case 'gif': pipeline = pipeline.gif(); break;
                }
                return pipeline.toBuffer();
            }

            let variants = {};
            let totalNewSize = 0;

            // Initial compression over base image
            let origBuffer = await compressBuffer(currentQuality, null);

            // Strict Max Size Check Loop
            if (this.options.strictMaxSize && origBuffer.length > this.options.strictMaxSize) {
                while (origBuffer.length > this.options.strictMaxSize && currentQuality > minQuality) {
                    currentQuality -= qualityStep;
                    if (currentQuality < minQuality) currentQuality = minQuality;
                    origBuffer = await compressBuffer(currentQuality, null);
                    finalQuality = currentQuality;
                }
            }

            const exceededStrict = this.options.strictMaxSize && origBuffer.length > this.options.strictMaxSize;
            let note = exceededStrict ? `⚠️ Exceeded strict limit at min quality ${finalQuality}` : undefined;

            // Save original optimized output
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, origBuffer);
            variants.original = makeRelative(outputPath);
            totalNewSize += origBuffer.length;

            // Generate responsive sizes
            const sizesToGenerate = this.options.getResponsiveSizes ? (this.options.responsiveSizes || []) : [];
            const metaInfo = await sharp(inputBuffer).metadata();
            for (const width of sizesToGenerate) {
                if (width >= metaInfo.width) continue; // Skip sizes larger than original
                const sizePath = path.join(parsedPath.dir, `${parsedPath.name}-${width}${outputExt}`);
                const sizeBuffer = await compressBuffer(finalQuality, width);
                fs.writeFileSync(sizePath, sizeBuffer);
                variants[width] = makeRelative(sizePath);
                totalNewSize += sizeBuffer.length;
            }

            const savings = fileInfo.size - totalNewSize;
            const savingsPercent = ((savings / fileInfo.size) * 100).toFixed(1);

            return {
                success: true,
                originalSize: fileInfo.size,
                newSize: totalNewSize,
                savings: savings,
                savingsPercent: savingsPercent,
                outputPath: outputPath,
                variants: variants,
                finalQuality: finalQuality !== (this.options.quality || 80) ? finalQuality : undefined,
                note: note
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    determineOutputFormat(originalExt) {
        // Prioritize global imageOutputFormat if set
        if (this.options.imageOutputFormat && this.options.imageOutputFormat !== 'original') {
            return this.options.imageOutputFormat;
        }

        if (this.options.format && this.options.format !== 'keep') {
            return this.options.format;
        }

        const formatMap = {
            '.jpg': 'jpeg',
            '.jpeg': 'jpeg',
            '.png': 'png',
            '.webp': 'webp',
            '.avif': 'avif',
            '.gif': 'gif',
            '.tiff': 'tiff',
            '.tif': 'tiff',
            '.bmp': 'png',
        };

        return formatMap[originalExt] || 'jpeg';
    }

    parseResize(resizeStr) {
        if (typeof resizeStr !== 'string') return null;
        if (resizeStr.includes('x')) {
            const [width, height] = resizeStr.split('x').map(Number);
            return { width, height };
        }
        return { width: parseInt(resizeStr, 10) };
    }
}

module.exports = ImageOptimizer;
