const path = require('path');

module.exports = {
    // Directories
    inputDir: 'original-assets-backup',
    outputDir: 'assets',

    // Supported formats
    imageFormats: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tiff', '.tif', '.bmp'],
    videoFormats: ['.mp4', '.mov', '.webm', '.avi', '.mkv'],
    pdfFormats: ['.pdf'],

    // Output settings
    imageOutputFormat: 'webp', // Options: 'original' (or remove), 'webp', 'avif', 'jpeg', 'png'
    videoOutputFormat: 'mp4', // Options: 'original' (or remove), 'mp4', 'webm'
    recreateOutputFolder: false, // If true, clears the output directory before starting

    // Responsive Image Settings
    getResponsiveSizes: false, // If true, generates responsive sizes
    responsiveSizes: [480, 768, 1200, 1600], // Widths for responsive variants
    manifestDir: 'assets', // Directory to output the manifest.json
    manifestName: 'manifest.json',

    // Favicon Settings
    processLogo: false, // If true, generates favicons
    logoPath: '', // Path or URL to the input logo for favicons

    // Optimization settings
    quality: 90,
    maxSize: 1024 * 1024 * 2, // 1MB (Warning threshold)
    strictMaxSize: 1024 * 1024,  // 1MB Strict limit (Try to compress below this)
    concurrency: 4,       // Parallel processing limit

    // Feature flags
    overwrite: false,
    recursive: true,
    dryRun: false,
};
