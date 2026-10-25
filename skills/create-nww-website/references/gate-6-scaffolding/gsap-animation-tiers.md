# GSAP Animation Tiers & Creative Motion Reference

This reference specifies the 6-tier motion architecture for client websites built with `create-nww-website` and `nww`. It defines rules for conditional skill loading, Next.js App Router dependency isolation, and provides production-ready code examples for high, max, and ultra creative tiers.

---

## 1. The 6-Tier Motion Matrix

| Tier | Name | Skills Pre-Loaded | Next.js Dependencies | Scaffolding & Site Behavior | Core Motion Capabilities |
|:---:|:---|:---|:---|:---|:---|
| **0** | `disabled` | **None** (zero GSAP skill loads) | Pure CSS / Tailwind only (no `gsap`, no `@gsap/react`) | `site/lib/motion.js` exports pure CSS tokens; landing page built with zero GSAP imports; static layouts | Purely static layouts with optional native CSS / Tailwind transitions on hover/focus. |
| **1** | `low` | `greensock/gsap-skills` (core, scrolltrigger, performance, timeline) | `gsap`, `@gsap/react` | `site/lib/motion.js` exports dual tokens; subtle micro-interactions | Subtle micro-interactions, hover scale, gentle scroll fades (15–20px translateY), standard stagger delay (0.05s). Zero pinning, zero continuous scrubbing. |
| **2** | `medium` *(Default)* | `greensock/gsap-skills` | `gsap`, `@gsap/react` | Standard agency site motion; max 1 bold section | Coordinated section reveals, `ScrollTrigger.batch()` entrance, sticky navbar backdrop blur, animated counter numbers, accordion/tab tweens. |
| **3** | `high` | `greensock/gsap-skills` | `gsap`, `@gsap/react`, `lenis/react` | Award-winning marketing site; pinned track + smooth scroll | Pinned horizontal scroll section (`ScrollTrigger.pin`, dynamic `scrollWidth`), scrubbed ScrollTrigger timelines, SplitText masked character reveals (`overflow: hidden`, `yPercent: 100`), magnetic buttons (`contextSafe`), Lenis smooth scroll ticker sync. |
| **4** | `max` | `greensock/gsap-skills` | `gsap`, `@gsap/react`, `lenis/react` | Narrative immersive experience; 3D perspective + canvas bridge | Multi-stage pinned narrative scroll, layered 3D perspective card peeling (`transformPerspective: 1000`, `rotationX`), 60fps 3D card tilt via `quickTo`, velocity-aware inertia skew (`self.getVelocity()`), Canvas 2D / SVG path morph scrubbing. |
| **5** | `ultra` | `greensock/gsap-skills` | `gsap`, `@gsap/react`, `lenis/react`, `three` (if 3D active) | Experiential WebGL / 3D Awwwards SOTD / FWA tier | Full-screen WebGL / Three.js canvas architecture decoupled from DOM, camera flight through 3D scene driven by master GSAP ScrollTrigger timeline, custom GLSL shader uniform animation on scroll velocity, infinite jelly spiral carousels with `Observer`, strict 120fps GPU compositing budget. |

---

## 2. Next.js App Router Architecture Rules

Regardless of the tier selected (when motion is active), all GSAP animations must adhere to these foundational Next.js App Router rules:

1. **Client Component Isolation (`'use client'`):**
   - GSAP mutates the browser DOM and accesses `window` and `document`. Keep route `page.js` and server layouts as React Server Components (RSC).
   - Isolate animated sections into dedicated client components under `_components/` marked with `'use client'` at line 1.
2. **Mandatory `@gsap/react` `useGSAP()` Hook:**
   - Never use raw `useEffect()` for GSAP animations. Always import and use `useGSAP()` from `@gsap/react`.
   - Pass `{ scope: containerRef }` to scope all GSAP selector queries strictly to the component root, preventing cross-component DOM pollution.
   - `useGSAP()` handles automatic cleanup, reverting tweens and killing ScrollTriggers on unmount.
3. **Event Listener Safety with `contextSafe()`:**
   - For user-triggered animations (e.g. `onClick`, `onMouseEnter`, `onMouseMove`), wrap the handler in `contextSafe()` returned by `useGSAP()`.
4. **Accessibility Guardrail (`prefers-reduced-motion`):**
   - Wrap animations in `gsap.matchMedia()`:
     ```javascript
     const mm = gsap.matchMedia();
     mm.add("(prefers-reduced-motion: no-preference)", () => {
       // Run animations
     });
     ```
5. **No Layout Property Animations:**
   - Strictly animate GPU-accelerated compositor properties: `x`, `y`, `scale`, `rotation`, `opacity`.
   - Never animate `top`, `left`, `width`, or `height` inside scroll scrub loops.

---

## 3. Tier 0: `disabled` Guidelines

When the client chooses `disabled`:
1. **Pre-scaffolding:** The agent must **NOT** execute `npx skills add greensock/gsap-skills`.
2. **Dependencies:** Do **NOT** install `gsap` or `@gsap/react` in `site/package.json`.
3. **Motion Tokens (`site/lib/motion.js`):** Export pure CSS / Tailwind string tokens:
   ```javascript
   // site/lib/motion.js - Disabled Tier (Pure CSS Fallback)
   export const motion = {
     duration: {
       fast: '150ms',
       normal: '250ms',
       slow: '400ms',
     },
     ease: {
       default: 'cubic-bezier(0.16, 1, 0.3, 1)',
       inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
     },
     transition: {
       default: 'transition-all duration-200 ease-out',
       transform: 'transition-transform duration-200 ease-out',
       opacity: 'transition-opacity duration-200 ease-out',
     }
   };
   ```
4. **Layout:** Build all pages and components with clean static HTML and CSS. Use Tailwind utility classes (`transition`, `duration-200`, `hover:scale-[1.02]`) for interactive feedback.

---

## 4. Tier 1 (`low`) & Tier 2 (`medium`) Guidelines

### Tier 1: `low` (Subtle Micro-Interactions)
- **Goal:** Tasteful, understated polish for conservative corporate or financial clients.
- **Rules:**
  - Micro-interactions only: hover scale on buttons (`scale: 1.02`), gentle scroll reveals (`y: 20`, `opacity: 0`, `duration: 0.6`).
  - Stagger delays capped at `0.05s`.
  - Zero pinned sections. Zero continuous scroll scrubbing.
- **Example:**
  ```jsx
  'use client';
  import { useRef } from 'react';
  import gsap from 'gsap';
  import { useGSAP } from '@gsap/react';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  export default function SubtleCardGrid({ items }) {
    const container = useRef(null);

    useGSAP(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from('.card-item', {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container.current,
            start: 'top 85%',
            once: true,
          }
        });
      });
    }, { scope: container });

    return (
      <div ref={container} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="card-item p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-neutral-400">{item.description}</p>
          </div>
        ))}
      </div>
    );
  }
  ```

### Tier 2: `medium` (Standard Agency Polish)
- **Goal:** Modern tech and agency website aesthetic with coordinated entrance pacing.
- **Rules:**
  - Hero section coordinated reveal (headline & CTA staggered, backdrop image scale from `1.08` to `1.0`).
  - Scroll-triggered reveals via `ScrollTrigger.batch()`.
  - Number counter ticker on statistics sections.
  - Sticky navbar backdrop blur and height transition on scroll pass `100px`.
  - At most **one** bold moment per page.

---

## 5. Tier 3: `high` (Awwwards Marketing Tier)

### Key Features
1. **Pinned Horizontal Scroll:** A horizontal track of cards/projects that translates along the X-axis while the viewport remains pinned vertically.
2. **Masked Text Reveal (`SplitText`):** Lines or words sliding up from an invisible clipping mask (`overflow: hidden`).
3. **Magnetic Buttons:** Interactive magnetic cursor attraction.
4. **Lenis Smooth Scroll:** Synchronized frame-by-frame with GSAP's ticker.

### Production Code Examples

#### A. Pinned Horizontal Showcase Component (`HorizontalShowcase.jsx`)
```jsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalShowcase({ projects }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const section = sectionRef.current;
      const track = trackRef.current;

      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1, // 1s catch-up lag for smooth momentum
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          invalidateOnRefresh: true, // Recalculates dynamically on window resize
          anticipatePin: 1,
        }
      });

      // Optional child parallax inside panels
      gsap.utils.toArray('.panel-image').forEach((img) => {
        gsap.to(img, {
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            containerAnimation: tween,
            scrub: true,
          }
        });
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-neutral-950">
      <div className="px-8 pt-12 pb-6 max-w-7xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Portfolio</span>
        <h2 className="mt-2 text-3xl font-bold text-white">Featured Architecture</h2>
      </div>

      <div ref={trackRef} className="flex gap-8 px-8 pb-16 will-change-transform w-fit">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="w-[80vw] md:w-[45vw] lg:w-[35vw] flex-shrink-0 rounded-2xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-800">
              <div
                className="panel-image absolute inset-0 bg-cover bg-center will-change-transform"
                style={{ backgroundImage: `url(${proj.image})` }}
              />
            </div>
            <div className="mt-6">
              <span className="text-xs font-mono text-neutral-500">0{idx + 1}</span>
              <h3 className="text-xl font-bold text-white mt-1">{proj.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{proj.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

#### B. Masked SplitText Reveal (`TextReveal.jsx`)
```jsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TextReveal({ text, className = '' }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Manual word-splitting to avoid proprietary club plugin requirements
      const words = containerRef.current.querySelectorAll('.word-inner');

      gsap.from(words, {
        yPercent: 120,
        opacity: 0,
        duration: 0.9,
        stagger: 0.03,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        }
      });
    });
  }, { scope: containerRef });

  const wordList = text.split(' ');

  return (
    <h2 ref={containerRef} className={`flex flex-wrap gap-x-2 gap-y-1 ${className}`}>
      {wordList.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden py-0.5">
          <span className="word-inner inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </h2>
  );
}
```

#### C. Magnetic Button Component (`MagneticButton.jsx`)
```jsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function MagneticButton({ children, className = '', onClick }) {
  const btnRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: btnRef });

  const handleMouseMove = contextSafe((e) => {
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    // Pull toward cursor by 35% of distance
    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  const handleMouseLeave = contextSafe(() => {
    // Snap back with elastic ease
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.4)',
    });
  });

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-medium will-change-transform ${className}`}
    >
      {children}
    </button>
  );
}
```

#### D. Lenis + GSAP Ticker Synchronization Provider (`SmoothScrollProvider.jsx`)
```jsx
'use client';

import { useEffect } from 'react';
import ReactLenis from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    // Forward Lenis scroll ticks to GSAP ScrollTrigger
    const update = () => {
      ScrollTrigger.update();
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0); // Prevents jumpy scrolls under heavy frame loads

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
```

---

## 6. Tier 4: `max` (Immersive Narrative & 3D Physics Tier)

### Key Features
1. **Multi-Stage Narrative Pinned Card Stacking:** Sequential cards pinning and peeling back in 3D perspective (`rotationX`, `scale`).
2. **60fps 3D Card Tilt via `quickTo`:** Smooth interpolation without memory thrashing.
3. **Velocity-Aware Inertia Skewing:** Dynamically reads `ScrollTrigger.getVelocity()` to skew elements proportionally to scrolling speed.

### Production Code Examples

#### A. 3D Perspective Card Stacking Component (`StackingCardSection.jsx`)
```jsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function StackingCardSection({ cards }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const cardElements = gsap.utils.toArray('.stack-card');

      cardElements.forEach((card, i) => {
        if (i === cardElements.length - 1) return; // Last card stays visible

        ScrollTrigger.create({
          trigger: card,
          start: 'top top+=80',
          endTrigger: containerRef.current,
          end: 'bottom bottom',
          pin: true,
          pinSpacing: false,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            // 3D fold-away effect
            gsap.set(card, {
              transformPerspective: 1000,
              rotationX: progress * 15,
              scale: 1 - progress * 0.08,
              opacity: 1 - progress * 0.4,
            });
          }
        });
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative py-24 px-6 max-w-5xl mx-auto">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="stack-card mb-12 h-[75vh] w-full rounded-3xl border border-neutral-700 bg-neutral-900/90 backdrop-blur-xl p-10 flex flex-col justify-between shadow-2xl will-change-transform"
          style={{ zIndex: idx + 10 }}
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-sm text-emerald-400">0{idx + 1} / Phase</span>
            <span className="text-xs uppercase tracking-wider text-neutral-400">{card.category}</span>
          </div>
          <div className="my-auto">
            <h3 className="text-4xl md:text-5xl font-bold text-white">{card.title}</h3>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">{card.body}</p>
          </div>
          <div className="text-sm font-mono text-neutral-500">Scroll to advance timeline</div>
        </div>
      ))}
    </section>
  );
}
```

#### B. 60fps 3D Cursor Tilt with `gsap.quickTo` (`TiltCard.jsx`)
```jsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);

  useGSAP(() => {
    const card = cardRef.current;

    // Use quickTo for buttery 60fps performance without garbage collection thrashing
    const setRotateX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
    const setRotateY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });
    const setScale = gsap.quickTo(card, 'scale', { duration: 0.4, ease: 'power2.out' });

    gsap.set(card, { transformPerspective: 1000, transformStyle: 'preserve-3d' });

    const onMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setRotateX(-y * 20); // Max 20deg tilt
      setRotateY(x * 20);
      setScale(1.03);
    };

    const onMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
      setScale(1);
    };

    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, { scope: cardRef });

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-xl will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
```

---

## 7. Tier 5: `ultra` (Awwwards SOTD / Experiential WebGL Tier)

### Architectural Pattern
To achieve award-winning WebGL fluidity without lag or layout shifts:
1. **The HTML Layout Track:** Transparent, full-height sections (`min-height: 100vh`) act as the physical scroll track and accessibility anchor.
2. **The Smooth Scroll Engine (Lenis):** Eliminates mousewheel jitter and provides linear scroll momentum.
3. **The GSAP ScrollTrigger Core:** Maps scroll progress (`scrub: 1` or `self.progress`) directly to 3D scene properties and shader uniforms.
4. **The Three.js Canvas Layer:** A fixed, full-viewport WebGL canvas sits behind the transparent HTML track, executing its render loop inside `gsap.ticker`.

### Production Code Example: Decoupled Three.js Canvas + GSAP ScrollTrigger

```jsx
'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function UltraExperientialHero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Scene, Camera, Renderer Setup
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Torus Knot Mesh with Custom Lighting
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const light = new THREE.PointLight(0xffffff, 15, 50);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // 3. Drive 3D Object Transform via Master GSAP ScrollTrigger Scrub
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      }
    });

    tl.to(mesh.rotation, { x: Math.PI * 2, y: Math.PI * 4, ease: 'none' }, 0)
      .to(mesh.position, { z: 1.5, x: 1.2, ease: 'power1.inOut' }, 0)
      .to(material, { roughness: 0.8, ease: 'none' }, 0.5);

    // 4. Render loop hooked to GSAP Ticker for perfect synchronization
    const renderTick = () => {
      renderer.render(scene, camera);
    };
    gsap.ticker.add(renderTick);

    // 5. Responsive Resize Handling
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      gsap.ticker.remove(renderTick);
      window.removeEventListener('resize', onResize);
      tl.kill();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative bg-neutral-950 text-white">
      {/* Fixed Fullscreen WebGL Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Transparent Narrative Scroll Sections */}
      <section className="relative z-10 h-screen flex flex-col justify-center px-12 max-w-4xl">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Stage 01</span>
        <h1 className="mt-4 text-5xl md:text-7xl font-extrabold tracking-tight">Kinetic Architecture.</h1>
        <p className="mt-4 text-lg text-neutral-400 max-w-md">Experience spatial storytelling synchronized with GPU-driven WebGL shaders.</p>
      </section>

      <section className="relative z-10 h-screen flex flex-col justify-center items-end px-12 max-w-7xl mx-auto text-right">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Stage 02</span>
        <h2 className="mt-4 text-4xl md:text-6xl font-extrabold">Continuous Geometry.</h2>
        <p className="mt-4 text-lg text-neutral-400 max-w-md">Dynamic lighting and mesh interpolation react to real-time scroll momentum.</p>
      </section>

      <section className="relative z-10 h-screen flex flex-col justify-center px-12 max-w-4xl">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Stage 03</span>
        <h2 className="mt-4 text-4xl md:text-6xl font-extrabold">Peak Immersion.</h2>
        <p className="mt-4 text-lg text-neutral-400 max-w-md">Engineered for seamless 120fps display refresh cycles.</p>
      </section>
    </div>
  );
}
```

---

## 8. Summary Checklist for Code Reviews

- [ ] If `disabled`, zero GSAP skills are pre-loaded and `gsap` is omitted from `package.json`.
- [ ] If motion is enabled, all animations are wrapped in `@gsap/react` `useGSAP({ scope: containerRef })`.
- [ ] `prefers-reduced-motion` is honored via `gsap.matchMedia()`.
- [ ] All child animations inside pinned horizontal tracks use `containerAnimation`.
- [ ] SplitText or character-split wrappers include `split.revert()` in their cleanup callback.
- [ ] Smooth scrolling with Lenis updates `ScrollTrigger.update()` on every frame.
- [ ] Zero animations target `top`, `left`, `width`, or `height` inside scroll loops.
