const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const readline = require('node:readline');

function writeMailtoPortal(projRoot, recipient, subject, bodyText) {
  const mailtoUrl = `mailto:${encodeURIComponent(recipient || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const outDir = path.join(projRoot, 'client-context');
  if (!fs.existsSync(outDir)) {
    try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) {}
  }
  const htmlPath = path.join(outDir, 'send-email.html');
  const escapeHtml = str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Send Email: ${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 760px; margin: 40px auto; padding: 24px; background: #0f172a; color: #f8fafc; line-height: 1.6; }
    .card { background: #1e293b; border-radius: 12px; padding: 28px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; font-size: 22px; color: #38bdf8; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 12px; margin-bottom: 24px; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background: #0369a1; }
    .meta { background: #0f172a; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #334155; font-size: 14px; }
    .copy-box { background: #0f172a; padding: 16px; border-radius: 8px; border: 1px solid #334155; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; margin: 12px 0; max-height: 380px; overflow-y: auto; color: #cbd5e1; }
    .copy-btn { background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
    .copy-btn:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Milestone Email Dispatcher</h1>
    <div class="meta">
      <div><strong>To:</strong> ${escapeHtml(recipient || '[Recipient Email Needed]')}</div>
      <div style="margin-top: 6px;"><strong>Subject:</strong> ${escapeHtml(subject)}</div>
    </div>
    <a class="btn" href="${mailtoUrl}">Open in Desktop Mail App (Outlook / Mail)</a>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; color: #94a3b8; font-size: 14px;">Webmail Quick Copy (Gmail / Outlook Web):</h3>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('body-text').innerText); this.innerText='Copied to Clipboard!'; setTimeout(() => this.innerText='Copy Email Body', 2000);">Copy Email Body</button>
    </div>
    <div id="body-text" class="copy-box">${escapeHtml(bodyText)}</div>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html, 'utf-8');
  return htmlPath;
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function sendViaResend(apiKey, from, to, subject, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from,
      to: [to],
      subject,
      text
    });

    const req = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Resend API returned ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function recordNotificationInRouterState(projDocs, stage, gate, recipient, subject) {
  const routerPath = path.join(projDocs, 'router-state.md');
  if (!fs.existsSync(routerPath)) return;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const logEntry = `\n- **${timestamp}** — Sent milestone notification for **${gate}** to \`${recipient}\`: *"${subject}"*`;

  let content = fs.readFileSync(routerPath, 'utf-8');
  if (content.includes('## Client Notifications Log')) {
    content = content.replace(/(## Client Notifications Log[\s\S]*?)(\n##|$)/, `$1${logEntry}$2`);
  } else {
    content += `\n\n## Client Notifications Log\n${logEntry}\n`;
  }

  fs.writeFileSync(routerPath, content, 'utf-8');
  console.log(`✓ Notification logged to router-state.md`);
}

function openDispatcherInBrowser(htmlPortalPath) {
  try {
    // Lazily invoke OS command to open local HTML dispatcher
    const { exec } = require('node:child_process');
    if (process.platform === 'win32') {
      exec(`powershell -command "Start-Process '${htmlPortalPath}'"`);
    } else if (process.platform === 'darwin') {
      exec(`open "${htmlPortalPath}"`);
    } else {
      exec(`xdg-open "${htmlPortalPath}"`);
    }
    console.log(`\n✓ Automatically opened email dispatcher in your default browser.`);
  } catch (e) {}
}

module.exports = {
  writeMailtoPortal,
  promptUser,
  sendViaResend,
  recordNotificationInRouterState,
  openDispatcherInBrowser
};

