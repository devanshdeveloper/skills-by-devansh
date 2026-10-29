'use strict';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchText(targetUrl, timeoutMs = 0) {
  const options = {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  };
  if (timeoutMs > 0) options.signal = AbortSignal.timeout(timeoutMs);

  const res = await fetch(targetUrl, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

async function fetchBuffer(targetUrl, timeoutMs = 15000) {
  const options = {
    headers: { 'User-Agent': USER_AGENT, 'Accept': '*/*' }
  };
  if (timeoutMs > 0) options.signal = AbortSignal.timeout(timeoutMs);

  const res = await fetch(targetUrl, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const ab = await res.arrayBuffer();
  return {
    buffer: Buffer.from(ab),
    contentType: res.headers.get('content-type') || ''
  };
}

module.exports = {
  fetchText,
  fetchBuffer
};
