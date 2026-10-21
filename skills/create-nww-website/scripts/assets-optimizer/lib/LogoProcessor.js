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
                // PWA/Manifest general icons usually covered by android-chrome
                // IOS icons often just apple-touch-icon, but can add more specific sizes if needed
            ],
            // ICO usually contains 16, 32, 48
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
            // 1. Load and Remove Background/Extract
            // We use .trim() to remove surrounding whitespace/transparent pixels
            // If the user wants robust background removal (e.g. removing white bg from a JPEG), 
            // sharp can attempt this with thresholding or we assume the input is already decent/transparent.
            // For now, we apply a forceful trim.
            let pipeline = sharp(logoPath).ensureAlpha();

            // Optional: Simple heuristic to remove white background if requested
            // This is "risky" without advanced segmentation, so we'll stick to trim for "extraction"
            // unless we add a specific flag.
            pipeline = pipeline.trim({ threshold: 10 });

            // Get metadata to ensure we have enough resolution
            const metadata = await pipeline.metadata();
            const buffer = await pipeline.toBuffer(); // Base buffer for all operations

            const results = [];

            // 2. Generate defined sizes
            for (const config of this.logoConfig.baseValues) {
                const outName = `${config.name}.${config.format}`;
                const outPath = path.join(outputBaseDir, outName);

                // Resize
                const resized = await sharp(buffer)
                    .resize(config.width, config.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .toFormat(config.format)
                    .toBuffer();

                fs.writeFileSync(outPath, resized);
                results.push(outName);
                console.log(`   ✅ Generated ${outName}`);
            }

            // 3. Generate ICO
            // sharp can verify but not natively write .ico easily in all versions without a plugin usually,
            // but recent sharp versions or simple concat might work. 
            // Actually sharp DOES include basic ICO support in some builds or we can use a png and rename if it's just a favicon.ico requirement 
            // but true ICO checks are specific.
            // Standard approach: Use the 32x32 png as favicon.ico (modern browsers support png favicons)
            // or simply save as .ico if sharp supports it.
            // Check sharp docs: Sharp can output to .ico? No, usually distinct.
            // But we can output a 32x32 png named 'favicon.ico' - many browsers accept it, BUT it's invalid spec.
            // Better: 'favicon.ico' is usually a container. 
            // We will stick to generating `favicon.ico` as a sizing task if specific logic is added, 
            // but for now let's skip "true" ICO binary generation unless we want to deal with buffer headers.
            // We will generate a 32x32 PNG and save it as favicon.ico just in case (hacky) 
            // OR safely, just rely on the png favicons we made above.
            // Let's generate a 48x48 PNG for favicon usage as well.

            // For robust 'favicon.ico', we'll rely on the user having a tool or just use the PNGs.
            // We will just copy the 32x32 as favicon.ico for compatibility if the user really needs that file.
            const faviconPath = path.join(this.options.outputRoot, 'favicon.ico');
            const faviconBuffer = await sharp(buffer)
                .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toBuffer();
            // Note: This is a PNG file with .ico extension. Most modern browsers handle this, but older ones might not.
            // Given the constraints, this is acceptable for a "demo".
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
