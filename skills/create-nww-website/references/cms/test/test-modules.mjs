#!/usr/bin/env node

/**
 * Multi-Module CMS Verification Suite
 *
 * Verifies all 25 modules defined in WebsiteModules against the live NWW CMS backend.
 * Uses discovered and verified route mappings (e.g. `website-` prefix conventions and
 * singular collection slugs).
 *
 * Usage:
 *   node test-modules.mjs [--single <module-key>] [--cooldown-wait]
 */

import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment from .env.local
const envFile = path.join(__dirname, '.env.local');
try {
  process.loadEnvFile(envFile);
  console.log('✓ Loaded environment from .env.local');
} catch (err) {
  console.error(`✗ Failed to load ${envFile}: ${err.message}`);
  process.exit(1);
}

const SERVER_URL = (process.env.SERVER_URL || '').replace(/\/+$/, '');
const CMS_SITE_KEY = process.env.CMS_SITE_KEY || process.env.CMS_TOKEN;

if (!SERVER_URL || !CMS_SITE_KEY) {
  console.error('✗ Missing SERVER_URL or CMS_SITE_KEY/CMS_TOKEN in .env.local');
  process.exit(1);
}

export const WebsiteModules = {
  Dashboard: "Dashboard",
  Article: "Article",
  CaseStudy: "Case Study",
  ContactUs: "Contact Us",
  WebsiteEvent: "Website Event",
  WebsitePlan: "Website Plan",
  Gallery: "Gallery",
  Industry: "Industry",
  WebsiteJob: "Website Job",
  Portfolio: "Portfolio",
  Service: "Service",
  Blog: "Blog",
  Testimonials: "Testimonials",
  Features: "Features",
  Documentation: "Documentation",
  Faqs: "FAQs",
  PrivacyPolicy: "Privacy Policy",
  TermsAndConditions: "Terms & Conditions",
  RefundPolicy: "Refund Policy",
  Users: "Users",
  Roles: "Roles",
  Tickets: "Tickets",
  LiveSupport: "Live Support",
  FeatureRequests: "Feature Requests",
  Settings: "Settings",
};

/**
 * Exact verified route slug mapping for NWW CMS backend.
 */
export const MODULE_ROUTE_MAP = {
  // Public Marketing & Content Entities (website- prefix)
  Article: 'website-article',
  CaseStudy: 'website-case-study',
  ContactUs: 'website-contact-us',
  WebsiteEvent: 'website-event',
  WebsitePlan: 'website-plan',
  Gallery: 'website-gallery',
  Industry: 'website-industry',
  WebsiteJob: 'website-job',
  Service: 'website-service',
  PrivacyPolicy: 'website-privacy-policy',
  TermsAndConditions: 'website-terms-and-conditions',
  RefundPolicy: 'website-refund-policy',

  // Core Content Collections
  Portfolio: 'project',
  Blog: 'blog',
  Testimonials: 'testimonial',
  Features: 'feature',
  Documentation: 'documentation',
  Faqs: 'faq',

  // Operational & Admin Entities
  Users: 'user',
  Roles: 'role',
  Tickets: 'ticket',
  FeatureRequests: 'feature-request',

  // Operational / Singleton Endpoints
  LiveSupport: 'website-live-support',
  Settings: 'website-settings',
  Dashboard: 'dashboard',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('=================================================================');
  console.log('     NWW CMS MULTI-MODULE COMPREHENSIVE VERIFICATION SUITE       ');
  console.log('=================================================================');
  console.log(`Backend Server: ${new URL(SERVER_URL).host}`);
  console.log(`Total Modules: ${Object.keys(WebsiteModules).length}`);
  console.log('-----------------------------------------------------------------');

  let remaining = 100;
  let resetTimestamp = null;
  const results = [];

  for (const [key, name] of Object.entries(WebsiteModules)) {
    const slug = MODULE_ROUTE_MAP[key] || key.toLowerCase();
    const endpoint = `/api/${slug}/paginate?page=1&limit=1`;
    process.stdout.write(`• Testing [${key}] (${name}) -> ${endpoint}... `);

    try {
      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${CMS_SITE_KEY}`,
          'x-site-key': CMS_SITE_KEY,
        },
      });

      const remHeader = res.headers.get('x-ratelimit-remaining');
      if (remHeader !== null) remaining = parseInt(remHeader, 10);
      const rstHeader = res.headers.get('x-ratelimit-reset');
      if (rstHeader !== null) resetTimestamp = parseInt(rstHeader, 10);

      if (res.status === 200) {
        const data = await res.json().catch(() => ({}));
        const items = data?.data?.items || data?.items || [];
        const total = data?.pagination?.totalDocuments ?? items.length;
        console.log(`✓ 200 OK (Docs: ${total}, Rem: ${remaining})`);
        results.push({ key, name, slug, status: 200, total, verified: true });
      } else if (res.status === 429) {
        console.log('⚠ RATE LIMIT EXCEEDED (429)');
        const retryAfter = resetTimestamp ? resetTimestamp - Math.floor(Date.now() / 1000) : 900;
        console.log(`  Rate limit active. Window resets in ~${Math.max(0, retryAfter)}s.`);
        results.push({ key, name, slug, status: 429, note: 'Rate limited' });
        break;
      } else {
        console.log(`[HTTP ${res.status}] ${res.statusText}`);
        results.push({ key, name, slug, status: res.status });
      }

      await sleep(600); // 600ms pacing
    } catch (err) {
      console.log(`✗ ERROR: ${err.message}`);
      results.push({ key, name, slug, status: 500, error: err.message });
    }
  }

  console.log('\n-----------------------------------------------------------------');
  console.log('                       EXECUTION SUMMARY                         ');
  console.log('-----------------------------------------------------------------');
  const passed = results.filter((r) => r.status === 200);
  console.log(`Passed: ${passed.length} / ${results.length} tested`);
  console.log(`Remaining Rate Limit Calls: ${remaining}`);
  if (resetTimestamp) {
    const diff = resetTimestamp - Math.floor(Date.now() / 1000);
    console.log(`Window Reset In: ~${Math.max(0, diff)} seconds`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
