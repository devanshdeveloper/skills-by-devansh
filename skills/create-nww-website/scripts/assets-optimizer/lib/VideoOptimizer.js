const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const BaseOptimizer = require('./BaseOptimizer');

// Set the ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

class VideoOptimizer extends BaseOptimizer {
    constructor(options = {}) {
        super(options);
        this.supportedFormats = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
    }

    async optimize(fileInfo) {
        const outputPath = this.getOutputPath(fileInfo);

        if (this.options.dryRun) {
            return { success: true, skipped: true, path: outputPath };
        }

        // Check availability to skip
        if (!this.options.recreateOutputFolder && fs.existsSync(outputPath)) {
            return { success: true, skipped: true, path: outputPath, note: 'Already optimized' };
        }

        try {
            // Check if output exists and delete it to prevent ffmpeg overwrite prompts issues
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }

            // Create output directory if it doesn't exist (handled by BaseOptimizer usually, but double check)
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            let processingNote = 'Optimized (CRF 23)';

            // Promise wrapper for ffmpeg
            await new Promise((resolve, reject) => {
                let command = ffmpeg(fileInfo.path)
                    .output(outputPath)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .addOption('-movflags', '+faststart') // Web optimization

                // If strict max size is defined, calculate target bitrate
                if (this.options.strictMaxSize) {
                    // We need to probe the file first to get duration
                    ffmpeg.ffprobe(fileInfo.path, (err, metadata) => {
                        if (err) {
                            // Fallback to CRF if probe fails
                            command.addOption('-crf', '23');
                            command.on('end', resolve).on('error', reject).run();
                            return;
                        }

                        const duration = metadata.format.duration;
                        const sizeLimitBits = this.options.strictMaxSize * 8; // Convert bytes to bits
                        const dataDuration = duration * 0.95; // Safety margin for meta data etc. assuming audio+video take up most 

                        // Target bitrate in bits per second
                        const targetBitrate = Math.floor(sizeLimitBits / duration);
                        const videoBitrate = Math.floor(targetBitrate * 0.8); // 80% to video
                        const audioBitrate = Math.min(128000, Math.floor(targetBitrate * 0.2)); // 20% to audio, max 128k

                        // Min bitrate safeguard (e.g., don't go below 500k unless really necessary)
                        // If file is very short, bitrate might be huge, so cap it? No, cap is implicit by file size.

                        processingNote = `Optimized (Target Bitrate for < ${this.options.strictMaxSize / 1024 / 1024}MB)`;

                        command
                            .videoBitrate(videoBitrate)
                            .audioBitrate(audioBitrate)
                            // 2-pass is better for size targeting but slower. Single pass for now.
                            .on('end', resolve)
                            .on('error', reject)
                            .run();
                    });
                } else {
                    // Default optimization: CRF 23
                    command
                        .addOption('-crf', '23')
                        .addOption('-preset', 'medium')
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                }
            });

            const newStats = fs.statSync(outputPath);
            const savings = fileInfo.size - newStats.size;

            return {
                success: true,
                originalSize: fileInfo.size,
                newSize: newStats.size,
                savings: savings,
                savingsPercent: (savings / fileInfo.size) * 100,
                outputPath: outputPath,
                note: processingNote
            };

        } catch (error) {
            // Copy original on failure
            try {
                fs.copyFileSync(fileInfo.path, outputPath);
                return {
                    success: true,
                    outputPath: outputPath,
                    note: `Optimization failed (${error.message}), copied original`,
                    originalSize: fileInfo.size,
                    newSize: fileInfo.size,
                    savings: 0,
                    savingsPercent: 0
                };
            } catch (copyError) {
                return { success: false, error: `${error.message} -> Fallback copy failed: ${copyError.message}` };
            }
        }
    }
}

module.exports = VideoOptimizer;
