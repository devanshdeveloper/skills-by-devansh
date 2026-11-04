const https = require('node:https');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

// HTTP request helper with redirect following
function requestJson(targetUrl, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(targetUrl);
        const transport = parsed.protocol === 'http:' ? http : https;

        const req = transport.request(targetUrl, { method: 'GET', headers }, (res) => {
            // Handle redirects
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                const nextUrl = new URL(res.headers.location, targetUrl).toString();
                return resolve(requestJson(nextUrl, headers));
            }

            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        resolve({ status: res.statusCode, data: json, headers: res.headers });
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON response: ${e.message}`));
                    }
                } else {
                    reject({
                        status: res.statusCode,
                        message: `HTTP ${res.statusCode} ${res.statusMessage || ''}`.trim(),
                        headers: res.headers,
                        bodyPreview: data.slice(0, 200)
                    });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Download binary file to disk following redirects
function downloadFile(targetUrl, destPath) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(targetUrl);
        const transport = parsed.protocol === 'http:' ? http : https;

        const req = transport.get(targetUrl, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                const nextUrl = new URL(res.headers.location, targetUrl).toString();
                return resolve(downloadFile(nextUrl, destPath));
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`Download failed with HTTP ${res.statusCode}`));
            }

            const dir = path.dirname(destPath);
            fs.mkdirSync(dir, { recursive: true });

            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close(() => resolve(destPath));
            });

            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        });

        req.on('error', reject);
    });
}

// Trigger Unsplash download endpoint (required by API guidelines)
async function triggerUnsplashDownload(downloadLocationUrl, accessKey) {
    try {
        const parsed = new URL(downloadLocationUrl);
        const headers = {
            'Authorization': `Client-ID ${accessKey}`
        };
        await requestJson(parsed.toString(), headers);
        return true;
    } catch (err) {
        console.warn(`[WARN] Unsplash download trigger failed: ${err.message || err.status || 'unknown error'}`);
        return false;
    }
}

module.exports = {
    requestJson,
    downloadFile,
    triggerUnsplashDownload
};

