#!/usr/bin/env node

/**
 * motion-tier CLI
 *
 * Deterministic Motion Tier & UI Component Stack Generator for create-nww-website.
 * Prints exact package manager and shadcn CLI commands based on the confirmed Motion Tier.
 *
 * Usage:
 *   node skills/create-nww-website/scripts/motion-tier/index.js --tier [disabled|low|medium|high|max|ultra] [--system magicui|cult-ui|kokonutui]
 *   node skills/create-nww-website/scripts/motion-tier/index.js --manifest --tier medium --system magicui
 */

'use strict';

const path = require('node:path');

const SYSTEM_COMPONENTS = {
  magicui: ['@magicui/bento-grid', '@magicui/shimmer-button', '@magicui/marquee'],
  'cult-ui': ['@cult-ui/halo-button', '@cult-ui/gradient-card'],
  kokonutui: ['@kokonutui/card-hover', '@kokonutui/particle-button']
};

// 1. Tier Matrix & Registry Definitions
const TIERS = {
  disabled: {
    code: 'T0',
    name: 'Static',
    description: 'Zero JS animation runtimes. Pure CSS / Tailwind hover transitions only. 100% reduced-motion safe.',
    packages: [],
    systemAllowed: false,
    showpieceAllowed: false,
    showpieceCap: 0,
    skills: [],
    recommendedComponents: []
  },
  low: {
    code: 'T1',
    name: 'Subtle',
    description: 'Lightweight primitives (Motion-Primitives or React Bits CSS). Zero pinning, zero continuous scrubbing.',
    packages: ['clsx', 'tailwind-merge'],
    optionalPackages: ['motion'],
    systemAllowed: false,
    showpieceAllowed: false,
    showpieceCap: 0,
    skills: [],
    recommendedComponents: ['@motion-primitives/text-effect']
  },
  medium: {
    code: 'T2',
    name: 'System (Default)',
    description: 'shadcn/ui base + exactly ONE system layer (Magic UI / Cult UI / Kokonut UI) with coordinated reveals.',
    packages: ['motion', 'clsx', 'tailwind-merge'],
    systemAllowed: true,
    showpieceAllowed: false,
    showpieceCap: 0,
    skills: [
      'https://github.com/greensock/gsap-skills --skill gsap-core',
      'https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger',
      'https://github.com/greensock/gsap-skills --skill gsap-performance',
      'https://github.com/greensock/gsap-skills --skill gsap-timeline'
    ]
  },
  high: {
    code: 'T3',
    name: 'Showpiece (High)',
    description: 'T2 System Layer + smooth scrolling + max 1-2 Aceternity showpieces (Hero or CTA only, lazy-loaded).',
    packages: ['motion', 'lenis/react', 'clsx', 'tailwind-merge'],
    systemAllowed: true,
    showpieceAllowed: true,
    showpieceCap: 2,
    skills: [
      'https://github.com/greensock/gsap-skills --skill gsap-core',
      'https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger',
      'https://github.com/greensock/gsap-skills --skill gsap-performance',
      'https://github.com/greensock/gsap-skills --skill gsap-timeline'
    ],
    recommendedShowpieces: ['@aceternity/sparkles', '@aceternity/lamp']
  },
  max: {
    code: 'T3',
    name: 'Showpiece (Max)',
    description: 'T2 System Layer + 3D perspective cards, inertia skew, and max 1-2 lazy-loaded showpieces.',
    packages: ['motion', 'lenis/react', 'clsx', 'tailwind-merge'],
    systemAllowed: true,
    showpieceAllowed: true,
    showpieceCap: 2,
    skills: [
      'https://github.com/greensock/gsap-skills --skill gsap-core',
      'https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger',
      'https://github.com/greensock/gsap-skills --skill gsap-performance',
      'https://github.com/greensock/gsap-skills --skill gsap-timeline'
    ],
    recommendedShowpieces: ['@aceternity/3d-pin', '@aceternity/card-hover-effect']
  },
  ultra: {
    code: 'T3',
    name: 'Showpiece (Ultra)',
    description: 'T2 System Layer + WebGL canvas / Three.js bridge. Heavy dependencies require explicit Gate sign-off.',
    packages: ['motion', 'lenis/react', 'clsx', 'tailwind-merge'],
    requiresGateApprovalFor: ['three', '@react-three/fiber'],
    systemAllowed: true,
    showpieceAllowed: true,
    showpieceCap: 2,
    skills: [
      'https://github.com/greensock/gsap-skills --skill gsap-core',
      'https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger',
      'https://github.com/greensock/gsap-skills --skill gsap-performance',
      'https://github.com/greensock/gsap-skills --skill gsap-timeline'
    ],
    recommendedShowpieces: ['@aceternity/background-beams-with-collision']
  }
};

const DROPPED_LIBRARIES = {
  'skiper-ui': 'Requires mandatory visible public attribution on free tier; paid key on Pro tier.',
  'origin-ui': 'Stale / merged into Cal.com monorepo with copyleft AGPL-3.0 license risk.'
};

function parseArgs(argv) {
  const options = {
    tier: 'medium',
    system: 'magicui',
    manifest: false,
    mcp: false,
    with21st: false,
    help: false
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--manifest') options.manifest = true;
    else if (arg === '--mcp') options.mcp = true;
    else if (arg === '--with-21st' || arg === '--21st') options.with21st = true;
    else if (arg.startsWith('--tier=')) options.tier = arg.split('=')[1].toLowerCase();
    else if (arg === '--tier' && argv[i + 1]) options.tier = argv[++i].toLowerCase();
    else if (arg.startsWith('--system=')) options.system = arg.split('=')[1].toLowerCase();
    else if (arg === '--system' && argv[i + 1]) options.system = argv[++i].toLowerCase();
  }
  return options;
}

function printHelp() {
  console.log(`
motion-tier CLI — Deterministic Motion & Component Stack Generator

Usage:
  node skills/create-nww-website/scripts/motion-tier/index.js [options]

Options:
  --tier=<tier>        Motion tier: disabled | low | medium | high | max | ultra (default: medium)
  --system=<lib>       System layer for T2/T3: magicui | cult-ui | kokonutui (default: magicui)
  --manifest           Emit JSON schema snippet for site/site.manifest.json
  --mcp                Emit .agents/mcp_config.json configuration for the chosen tier
  --with-21st, --21st  Include 21st.dev component marketplace MCP server
  --help, -h           Show this help message

Examples:
  node skills/create-nww-website/scripts/motion-tier/index.js --tier=disabled
  node skills/create-nww-website/scripts/motion-tier/index.js --tier=medium --system=magicui
  node skills/create-nww-website/scripts/motion-tier/index.js --tier=medium --system=magicui --mcp
  node skills/create-nww-website/scripts/motion-tier/index.js --tier=medium --system=magicui --mcp --with-21st
  node skills/create-nww-website/scripts/motion-tier/index.js --tier=high --manifest
`);
}

function generateCommands(tierKey, systemLayer) {
  const tier = TIERS[tierKey];
  if (!tier) {
    console.error(`✗ Error: Unknown motion tier '${tierKey}'. Valid tiers: ${Object.keys(TIERS).join(', ')}`);
    process.exit(1);
  }

  const validSystems = ['magicui', 'cult-ui', 'kokonutui'];
  if (tier.systemAllowed && !validSystems.includes(systemLayer)) {
    console.error(`✗ Error: Unknown system layer '${systemLayer}'. Valid options: ${validSystems.join(', ')}`);
    process.exit(1);
  }

  const commands = [];

  // Step 1: Base UI shadcn initialization with JavaScript mode (tsx: false)
  commands.push({
    step: '1. Initialize shadcn/ui Foundation (Base UI default, JS mode)',
    cmd: 'pnpm dlx shadcn@latest init --defaults'
  });

  // Step 2: Skill Pre-loading (GSAP)
  if (tier.skills && tier.skills.length > 0) {
    const skillCmds = tier.skills.map(s => `DISABLE_TELEMETRY=1 npx skills add ${s}`);
    commands.push({
      step: '2. Pre-load Approved GSAP Motion Skills',
      cmd: skillCmds.join('\n')
    });
  }

  // Step 3: Package Dependencies
  if (tier.packages && tier.packages.length > 0) {
    commands.push({
      step: '3. Install Package Dependencies',
      cmd: `pnpm add ${tier.packages.join(' ')}`
    });
  }

  // Step 4: System Layer Components (T2 / T3)
  if (tier.systemAllowed) {
    const comps = SYSTEM_COMPONENTS[systemLayer] || [];
    if (comps.length > 0) {
      const addCmds = comps.map(c => `pnpm dlx shadcn@latest add ${c}`);
      commands.push({
        step: `4. Install Approved System Layer Components (${systemLayer})`,
        cmd: addCmds.join('\n')
      });
    }
  }

  // Step 5: Capped Showpiece Components (T3)
  if (tier.showpieceAllowed && tier.recommendedShowpieces) {
    const showpieceCmds = tier.recommendedShowpieces.map(s => `pnpm dlx shadcn@latest add ${s}`);
    commands.push({
      step: `5. Install Capped Showpiece Components (Max ${tier.showpieceCap} — Lazy-load via next/dynamic)`,
      cmd: showpieceCmds.join('\n')
    });
  }

  return { tier, commands };
}

function generateManifestSnippet(tierKey, systemLayer, with21st = false) {
  const tier = TIERS[tierKey] || TIERS.medium;
  const isShowpiece = tier.showpieceAllowed;
  const showpieces = isShowpiece ? (tier.recommendedShowpieces || []) : [];
  const systemComps = tier.systemAllowed ? (SYSTEM_COMPONENTS[systemLayer] || []) : (tier.recommendedComponents || []);

  const mcpServers = [
    {
      id: 'shadcn',
      command: 'npx',
      args: ['shadcn@latest', 'mcp'],
      transport: 'stdio'
    }
  ];

  if (tier.systemAllowed && systemLayer === 'magicui') {
    mcpServers.push({
      id: 'magicuidesign-mcp',
      command: 'npx',
      args: ['-y', '@magicuidesign/mcp@latest'],
      transport: 'stdio'
    });
  }

  if (with21st) {
    mcpServers.push({
      id: 'twenty-first',
      command: 'npx',
      args: ['-y', '@21st-dev/magic@latest'],
      env: {
        API_KEY: '${API_KEY_21ST}'
      },
      transport: 'stdio'
    });
  }

  return {
    tier: tierKey,
    foundation: 'shadcn/ui (Base UI default)',
    systemLayer: tier.systemAllowed ? systemLayer : 'none',
    showpieces: showpieces,
    allowedComponents: [...systemComps, ...showpieces],
    dependencies: tier.packages,
    mcpServers: mcpServers,
    gateApprovalNotes: tier.requiresGateApprovalFor
      ? `Heavy dependencies (${tier.requiresGateApprovalFor.join(', ')}) require explicit Gate sign-off.`
      : `${tier.code} ${tier.name} configuration compliant.`
  };
}

function generateMcpConfig(tierKey, systemLayer, with21st = false) {
  const tier = TIERS[tierKey] || TIERS.medium;
  const config = {
    mcpServers: {
      shadcn: {
        command: 'npx',
        args: ['shadcn@latest', 'mcp']
      }
    }
  };

  if (tier.systemAllowed && systemLayer === 'magicui') {
    config.mcpServers['magicuidesign-mcp'] = {
      command: 'npx',
      args: ['-y', '@magicuidesign/mcp@latest']
    };
  }

  if (with21st) {
    config.mcpServers['twenty-first'] = {
      command: 'npx',
      args: ['-y', '@21st-dev/magic@latest'],
      env: {
        API_KEY: '${API_KEY_21ST}'
      }
    };
  }

  return config;
}

function main() {
  const options = parseArgs(process.argv);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.mcp) {
    const mcpConfig = generateMcpConfig(options.tier, options.system, options.with21st);
    console.log(JSON.stringify(mcpConfig, null, 2));
    process.exit(0);
  }

  if (options.manifest) {
    const snippet = generateManifestSnippet(options.tier, options.system, options.with21st);
    console.log(JSON.stringify({ motionTier: options.tier, motionStack: snippet }, null, 2));
    process.exit(0);
  }

  const { tier, commands } = generateCommands(options.tier, options.system);

  console.log('=================================================================');
  console.log(`  MOTION TIER: ${options.tier.toUpperCase()} [${tier.code} - ${tier.name}]`);
  console.log('=================================================================');
  console.log(`Description: ${tier.description}`);
  console.log(`Rule of One: Exactly ONE foundation (shadcn) + ONE system layer (${tier.systemAllowed ? options.system : 'none'}).`);
  if (tier.showpieceCap > 0) {
    console.log(`Showpiece Cap: Maximum ${tier.showpieceCap} showpieces (Hero or CTA only; lazy-loaded via next/dynamic).`);
  }
  console.log('-----------------------------------------------------------------');

  commands.forEach(c => {
    console.log(`\n# ${c.step}`);
    console.log(c.cmd);
  });

  console.log('\n-----------------------------------------------------------------');
  console.log('Keyframe Invariant: All component keyframes must live in site/tailwind.config.js');
  console.log('Reduced-Motion: Honor prefers-reduced-motion across both CSS and GSAP/Motion.');
  console.log('=================================================================');
}

main();
