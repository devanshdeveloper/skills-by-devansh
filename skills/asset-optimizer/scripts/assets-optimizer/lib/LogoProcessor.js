const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const BaseOptimizer = require('./BaseOptimizer');

class LogoProcessor extends BaseOptimizer {
    constructor(options = {}) {
        super(options);
        // Default logo config if not provided
        this.logoConfig = {
            baseValues: [
                { width: 16, height: 16, name: 'favicon-16x16', format: 'png' },
                { width: 32, height: 32, name: 'favicon-32x32', format: 'png' },
                { width: 192, height: 192, name: 'android-chrome-192x192', format: 'png' },
                { width: 512, height: 512, name: 'android-chrome-512x512', format: 'png' },
                { width: 180, height: 180, name: 'apple-touch-icon', format: 'png' },
                { width: 150, height: 150, name: 'mstile-150x150', format: 'png' },
                { width: 270, height: 270, name: 'mstile-270x270', format: 'png' }, // Windows tile
            ],
            generateIco: true
        };
    }

    async process(logoPath) {
        if (!fs.existsSync(logoPath)) {
            return { success: false, error: `Logo file not found at ${logoPath}` };
        }

        const stats = fs.statSync(logoPath);
        const fileName = path.basename(logoPath, path.extname(logoPath));
        // Use a dedicated directory 'icons' inside outputDir
        const outputBaseDir = path.join(this.options.outputRoot, 'icons');

        if (!fs.existsSync(outputBaseDir)) {
            fs.mkdirSync(outputBaseDir, { recursive: true });
        }

        console.log(`\n🎨 Processing Logo: ${logoPath}`);

        try {
            let pipeline = sharp(logoPath).ensureAlpha();
            pipeline = pipeline.trim({ threshold: 10 });

            const metadata = await pipeline.metadata();
            const buffer = await pipeline.toBuffer();

            const results = [];

            for (const config of this.logoConfig.baseValues) {
                const outName = `${config.name}.${config.format}`;
                const outPath = path.join(outputBaseDir, outName);

                const resized = await sharp(buffer)
                    .resize(config.width, config.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .toFormat(config.format)
                    .toBuffer();

                fs.writeFileSync(outPath, resized);
                results.push(outName);
                console.log(`   ✅ Generated ${outName}`);
            }

            const faviconPath = path.join(this.options.outputRoot, 'favicon.ico');
            const faviconBuffer = await sharp(buffer)
                .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toBuffer();

            fs.writeFileSync(faviconPath, faviconBuffer);
            console.log(`   ✅ Generated favicon.ico (root)`);

            return { success: true, count: results.length };

        } catch (error) {
            console.error('Error processing logo:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = LogoProcessor;

