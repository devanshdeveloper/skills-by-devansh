#!/usr/bin/env node

/**
 * PageSpeed Insights CLI Helper
 * Queries Google's PageSpeed Insights v5 REST API for Core Web Vitals & Lighthouse metrics.
 *
 * Usage:
 *   node pagespeed-check.js --url https://example.com
 *   node pagespeed-check.js --url https://example.com --strategy desktop
 *   node pagespeed-check.js --url https://example.com --json
 *
 * Environment Variables:
 *   PAGESPEED_API_KEY - Optional Google Cloud API key for higher quota. Unauthenticated calls are supported.
 */

'use strict';

function printHelp() {
  console.log(`
PageSpeed Insights CLI Helper (skills-by-devansh)

Usage:
  node pagespeed-check.js --url <target-url> [options]

Options:
  --url <url>           Required. Target URL to analyze.
  --strategy <strategy> 'mobile' (default) or 'desktop'.
  --key <apiKey>        Optional API key (or set PAGESPEED_API_KEY env var).
  --json                Output formatted JSON instead of human-readable text.
  --help                Show this help message.

Examples:
  node pagespeed-check.js --url https://example.com
  node pagespeed-check.js --url https://example.com --strategy desktop
  node pagespeed-check.js --url https://example.com --key $env:PAGESPEED_API_KEY
`);
}

async function run() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  let targetUrl = '';
  let strategy = 'mobile';
  let apiKey = process.env.PAGESPEED_API_KEY || '';
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      targetUrl = args[++i];
    } else if (args[i] === '--strategy' && args[i + 1]) {
      const s = args[++i].toLowerCase();
      if (s === 'mobile' || s === 'desktop') {
        strategy = s;
      } else {
        console.error(`Error: Invalid strategy '${s}'. Must be 'mobile' or 'desktop'.`);
        process.exit(1);
      }
    } else if (args[i] === '--key' && args[i + 1]) {
      apiKey = args[++i];
    } else if (args[i] === '--json') {
      jsonOutput = true;
    }
  }

  if (!targetUrl) {
    console.error('Error: Missing required argument --url <target-url>');
    process.exit(1);
  }

  try {
    new URL(targetUrl);
  } catch (err) {
    console.error(`Error: Invalid URL format: '${targetUrl}'. URL must include http:// or https://`);
    process.exit(1);
  }

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', targetUrl);
  endpoint.searchParams.set('strategy', strategy);
  endpoint.searchParams.append('category', 'performance');
  endpoint.searchParams.append('category', 'seo');
  if (apiKey) {
    endpoint.searchParams.set('key', apiKey);
  }

  if (!jsonOutput) {
    console.log(`Analyzing [${strategy.toUpperCase()}] performance for: ${targetUrl}...`);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const res = await fetch(endpoint.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      let parsedMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        parsedMsg = parsed.error ? parsed.error.message : errText;
      } catch (_) {}
      console.error(`API Error (HTTP ${res.status}): ${parsedMsg}`);
      process.exitCode = 1;
      return;
    }

    const data = await res.json();

    const lighthouse = data.lighthouseResult || {};
    const categories = lighthouse.categories || {};
    const audits = lighthouse.audits || {};
    const loadingExperience = data.loadingExperience || {};
    const cruxMetrics = loadingExperience.metrics || {};

    const perfScore = categories.performance ? Math.round(categories.performance.score * 100) : null;
    const seoScore = categories.seo ? Math.round(categories.seo.score * 100) : null;

    const result = {
      url: targetUrl,
      strategy,
      timestamp: new Date().toISOString(),
      scores: {
        performance: perfScore,
        seo: seoScore
      },
      labMetrics: {
        fcp: audits['first-contentful-paint'] ? audits['first-contentful-paint'].displayValue : 'N/A',
        lcp: audits['largest-contentful-paint'] ? audits['largest-contentful-paint'].displayValue : 'N/A',
        tbt: audits['total-blocking-time'] ? audits['total-blocking-time'].displayValue : 'N/A',
        cls: audits['cumulative-layout-shift'] ? audits['cumulative-layout-shift'].displayValue : 'N/A',
        speedIndex: audits['speed-index'] ? audits['speed-index'].displayValue : 'N/A'
      },
      fieldExperience: {
        overallStatus: loadingExperience.overall_category || 'DATA_UNAVAILABLE',
        cruxLCP: cruxMetrics['LARGEST_CONTENTFUL_PAINT_MS'] ? `${cruxMetrics['LARGEST_CONTENTFUL_PAINT_MS'].percentile} ms (${cruxMetrics['LARGEST_CONTENTFUL_PAINT_MS'].category})` : 'N/A',
        cruxINP: cruxMetrics['INTERACTION_TO_NEXT_PAINT'] ? `${cruxMetrics['INTERACTION_TO_NEXT_PAINT'].percentile} ms (${cruxMetrics['INTERACTION_TO_NEXT_PAINT'].category})` : 'N/A',
        cruxCLS: cruxMetrics['CUMULATIVE_LAYOUT_SHIFT_SCORE'] ? `${(cruxMetrics['CUMULATIVE_LAYOUT_SHIFT_SCORE'].percentile / 100).toFixed(2)} (${cruxMetrics['CUMULATIVE_LAYOUT_SHIFT_SCORE'].category})` : 'N/A'
      }
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n========================================');
      console.log(`  PAGESPEED INSIGHTS AUDIT: ${targetUrl}`);
      console.log(`  Strategy: ${strategy.toUpperCase()} | Time: ${result.timestamp}`);
      console.log('========================================');
      console.log(`Performance Score: ${result.scores.performance !== null ? result.scores.performance + '/100' : 'N/A'}`);
      console.log(`SEO Score:         ${result.scores.seo !== null ? result.scores.seo + '/100' : 'N/A'}`);
      console.log('\n[Lab Diagnostics (Lighthouse)]');
      console.log(`  - Largest Contentful Paint (LCP):  ${result.labMetrics.lcp}`);
      console.log(`  - Cumulative Layout Shift (CLS):   ${result.labMetrics.cls}`);
      console.log(`  - Total Blocking Time (TBT):       ${result.labMetrics.tbt}`);
      console.log(`  - First Contentful Paint (FCP):    ${result.labMetrics.fcp}`);
      console.log('\n[Real-User Field Experience (CrUX 28-day)]');
      console.log(`  - Field Status:  ${result.fieldExperience.overallStatus}`);
      console.log(`  - Field LCP:     ${result.fieldExperience.cruxLCP}`);
      console.log(`  - Field INP:     ${result.fieldExperience.cruxINP}`);
      console.log(`  - Field CLS:     ${result.fieldExperience.cruxCLS}`);
      console.log('========================================\n');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Error: Request timed out after 60 seconds.');
    } else {
      console.error(`Network Error: ${err.message}`);
    }
    process.exit(1);
  }
}

run();
