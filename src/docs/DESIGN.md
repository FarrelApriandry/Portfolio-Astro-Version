# Portfolio Website — Design Specification

## 1. Project Overview

Design and build a modern personal portfolio website for **Farrel Apriandry**, positioned primarily as a:

> **Full-Stack TypeScript / Software Engineer**

The portfolio should communicate that Farrel is interested in building complete software systems — from frontend interfaces and backend APIs to databases, infrastructure, networking, and developer tools.

Game development, AI experiments, mobile development, and other projects should remain visible as supporting evidence of technical breadth, but they must **not dominate the site's identity**.

### Primary perception

When a visitor opens the website for the first time, they should immediately think:

> "This person builds software systems."

Not:

> "This person makes portfolio websites."

---

# 2. Design Direction

## Design Concept

### Editorial Engineering

Combine the visual language of:

* Linear
* Vercel
* GitHub
* modern developer documentation
* technical editorial websites
* premium software engineering portfolios

The website should feel:

* technical
* mature
* precise
* minimal
* information-dense
* confident
* professional
* slightly experimental

Avoid making it feel:

* corporate
* generic SaaS
* gaming-themed
* overly futuristic
* overly animated
* template-like

---

# 3. Visual Philosophy

The design should follow this principle:

> **Content and engineering credibility come before decoration.**

Every visual element should serve one of these purposes:

1. establish identity
2. communicate technical capability
3. explain projects
4. demonstrate engineering thinking
5. make navigation effortless

Do not add visual effects simply because they look impressive.

---

# 4. Color System

Use a dark-first visual system.

### Primary

```text
Background:       #0A0A0A
Surface:          #111111
Surface Elevated: #161616
Border:           #262626

Primary Text:     #F5F5F5
Secondary Text:   #A1A1A1
Muted Text:       #737373

Accent:           #7DD3A7
Accent Dark:      #3F8F70
```

The accent color should be used sparingly.

Use it for:

* links
* active states
* small indicators
* status dots
* selected navigation
* important metadata

Do NOT use the accent as a large background or gradient.

---

# 5. Typography

Primary font:

```text
Inter
```

Alternative:

```text
Geist
```

Monospace:

```text
JetBrains Mono
```

Use the monospace font only for:

* technical metadata
* project tags
* system information
* code-like labels
* timestamps
* status indicators

### Typography hierarchy

```text
Display
64–80px

H1
48–64px

H2
32–40px

H3
20–24px

Body
16–18px

Secondary
14px

Technical metadata
12–13px
```

Typography should remain highly readable.

Avoid excessively thin font weights.

---

# 6. Layout System

Use a centered content container.

```text
max-width: 1200–1280px
```

Desktop horizontal padding:

```text
32–48px
```

Mobile horizontal padding:

```text
20–24px
```

Use a consistent spacing system based on multiples of 4 or 8.

Large sections should have generous vertical spacing.

---

# 7. Navigation

Desktop navigation should be minimal.

Suggested structure:

```text
Farrel Apriandry

Work
Engineering
Notes
About

GitHub
LinkedIn
```

Navigation should remain visible without dominating the viewport.

Possible behavior:

* sticky header
* subtle background blur
* thin bottom border
* no oversized navbar
* no giant logo animation

On mobile:

```text
Farrel
                    ☰
```

Use a clean mobile navigation drawer.

---

# 8. Hero Section

The hero is the first major identity statement.

Do NOT use generic copy such as:

> "Hi, I'm Farrel, a passionate developer..."

Instead:

```text
FARREL APRIANDRY

Software & Systems Engineer

I build scalable web platforms, backend systems,
and developer tools with TypeScript.
```

Include a compact action row:

```text
[ GitHub ]
[ LinkedIn ]
[ Email ]
[ Resume ]
```

---

## Hero System Panel

Add a compact technical status panel somewhere within the hero.

Example:

```text
CURRENTLY

Building
Personal HomeLab

Stack
TypeScript / Node.js / PostgreSQL

Focus
Full-Stack Systems

Exploring
Networking / IoT / Infrastructure
```

This should feel like a small engineering dashboard, not a decorative terminal.

---

# 9. Hero Visual Treatment

The hero should remain mostly typographic.

Possible subtle visual elements:

* grid lines
* technical coordinate marks
* tiny status indicators
* monospace labels
* subtle noise texture
* thin borders

Avoid:

* 3D models
* animated planets
* giant gradients
* particle explosions
* excessive terminal animations

The goal is:

> **technical atmosphere without visual noise.**

---

# 10. Selected Work

This is the most important content section after the hero.

Section heading:

```text
SELECTED WORK
```

Supporting text:

```text
Projects I've built across software,
systems, interactive experiences, and tooling.
```

Do NOT display every project with equal visual weight.

Use a hierarchy:

### Featured project

One large project.

### Supporting projects

2–4 smaller projects.

---

# 11. Featured Project Layout

Featured projects should behave like case-study previews.

Example:

```text
┌─────────────────────────────────────────────┐
│                                             │
│             PROJECT VISUAL                  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ NUSANTARA: PASAR BUBRAH                     │
│ Unreal Engine · C++ · Blender               │
│                                             │
│ Horror exploration game developed as part   │
│ of Merantaw Studio.                         │
│                                             │
│ [ Case Study ]   [ Steam ]                  │
└─────────────────────────────────────────────┘
```

The visual area can contain:

* screenshot
* project artwork
* UI
* architecture diagram
* technical visualization

Do not use random stock imagery.

---

# 12. Project Information

Every project card should communicate:

```text
Project name
Category
Technology
One-sentence description
Role
Relevant links
```

Example:

```text
Gesture Playground

Computer Vision · Web

TypeScript · Next.js · TensorFlow.js

Experimental browser-based gesture interaction
using real-time webcam input.

Role
Developer

[View Project]
[GitHub]
```

---

# 13. Project Categories

Projects can be grouped into:

```text
Software Engineering
Systems & Infrastructure
Developer Tools
AI / Computer Vision
Interactive Software
Game Development
Experiments
```

Do not create a complicated filtering interface unless there are enough projects to justify it.

If filtering is implemented, keep it simple:

```text
All
Web
Systems
AI
Tools
Game
```

---

# 14. Engineering Section

Create a dedicated section called:

```text
ENGINEERING
```

The purpose is to communicate technical depth without using skill-bar ratings.

Never use:

```text
React      █████████ 90%
Node.js    ████████  80%
Python     ██████    60%
```

Instead use structured technical groups.

---

## Engineering Stack

```text
LANGUAGES

TypeScript
JavaScript
Python
Kotlin
C++
```

```text
FRONTEND

React
Next.js
Astro
Svelte
Tailwind CSS
```

```text
BACKEND

Node.js
Express
REST APIs
PostgreSQL
MySQL
Firebase
Supabase
```

```text
INFRASTRUCTURE

Linux
Docker
Git
Bash
Networking
Self-hosting
```

```text
EXPLORING

Redis
MongoDB
MQTT
IoT
Cloud infrastructure
Distributed systems
```

The "Exploring" category is important.

It communicates growth without pretending mastery.

---

# 15. Engineering Philosophy

Add a short statement that communicates how Farrel approaches software.

Example:

```text
I prefer understanding the system behind the interface.

From APIs and databases to networking and infrastructure,
I enjoy building software as a complete system rather than
treating the frontend as an isolated product.
```

Keep this concise.

---

# 16. Engineering Notes

Create a section:

```text
ENGINEERING NOTES
```

This acts as a technical journal / lightweight blog.

Example:

```text
01
Designing a Self-Hosted HomeLab
Linux · Docker · Networking

02
Building a Real-Time System Monitoring Dashboard
Node.js · WebSocket · System Metrics

03
Structuring TypeScript Backend Services
Architecture · API · PostgreSQL

04
What I Learned Building Nusantara
Unreal Engine · Game Systems · Production
```

The section should communicate:

> "This developer understands and thinks about the engineering decisions behind their projects."

---

# 17. Notes UI

Use a compact editorial list rather than blog cards with huge images.

Example:

```text
┌────┬───────────────────────────────────────┬──────────┐
│ 01 │ Designing a Self-Hosted HomeLab       │ 2026     │
├────┼───────────────────────────────────────┼──────────┤
│ 02 │ Building a Monitoring Dashboard       │ 2026     │
├────┼───────────────────────────────────────┼──────────┤
│ 03 │ TypeScript Backend Architecture       │ 2026     │
└────┴───────────────────────────────────────┴──────────┘
```

Hover state:

* subtle background change
* accent arrow
* slight translation
* no exaggerated animation

---

# 18. Currently Building

Add a dynamic-looking section:

```text
CURRENTLY BUILDING
```

Example:

```text
01
Personal HomeLab
Linux · Docker · Networking

02
System Monitoring Platform
TypeScript · Node.js · WebSockets

03
Full-Stack TypeScript Projects
React · PostgreSQL · REST
```

This section makes the portfolio feel alive and continuously evolving.

---

# 19. About Section

Keep the About section short.

Example structure:

```text
ABOUT

I'm a Software Engineering student interested in building
reliable software systems — from interfaces and APIs to
the infrastructure running behind them.
```

Then:

```text
EDUCATION

Universitas Tidar
Information Technology
```

Then:

```text
INTERESTS

Software Engineering
Distributed Systems
Networking
Developer Tools
Infrastructure
IoT
```

Do not turn this into a long personal biography.

---

# 20. Career Positioning

The website should consistently reinforce:

```text
Primary
Full-Stack TypeScript / Software Engineer

Secondary
Systems / Infrastructure

Supporting
AI / Computer Vision
Game Development
Mobile
Technical Experiments
```

Game development should NOT be the first thing users see.

Do not use:

```text
Game Developer
AI Developer
Web Developer
Mobile Developer
Backend Developer
```

as equal-level identities.

This creates positioning ambiguity.

---

# 21. Micro-interactions

Animations should be subtle.

Allowed:

* opacity transitions
* translateY 2–6px
* border color transitions
* hover background transitions
* smooth navigation
* subtle reveal-on-scroll

Animation duration:

```text
150–300ms
```

Avoid:

* huge parallax
* cursor-following objects
* spinning 3D elements
* excessive spring animations
* scroll hijacking
* long intro animations

The website must feel fast.

---

# 22. Responsive Design

The design must be mobile-first.

### Desktop

Use:

```text
12-column grid
```

### Tablet

Use:

```text
8-column grid
```

### Mobile

Use:

```text
4-column conceptual grid
```

Featured projects should collapse into a vertical layout.

Engineering categories should become stacked sections.

Navigation becomes a mobile menu.

Typography should scale smoothly using `clamp()`.

---

# 23. Accessibility

Implement:

* semantic HTML
* proper heading hierarchy
* keyboard navigation
* visible focus states
* sufficient contrast
* descriptive alt text
* reduced-motion support
* accessible buttons
* accessible mobile navigation

Respect:

```css
prefers-reduced-motion
```

---

# 24. Performance

The portfolio itself is part of the engineering demonstration.

Prioritize:

* fast initial load
* optimized images
* lazy loading
* minimal JavaScript
* no unnecessary libraries
* semantic HTML
* efficient CSS
* responsive images

Avoid adding dependencies only for visual effects.

The website should feel noticeably fast on mid-range hardware and mobile devices.

---

# 25. Content Density

The site should be **information-dense but not cluttered**.

Use:

* small metadata
* structured lists
* technical labels
* dividers
* grids
* compact descriptions

Avoid:

* giant empty spaces everywhere
* enormous cards
* excessive decorative elements

The intended feeling is:

> **A well-designed engineering workspace.**

Not:

> **A landing page for a startup.**

---

# 26. Visual Language

Use recurring visual primitives:

```text
Thin borders
Small labels
Monospace metadata
Technical status indicators
Editorial grids
Dense information blocks
Large typography
Subtle accent color
```

Example metadata:

```text
2026 / WEB / TYPESCRIPT
```

or:

```text
STATUS  ● ACTIVE
```

or:

```text
STACK
TS · React · Node · PostgreSQL
```

These small details create the engineering character of the site.

---

# 27. Things to Avoid

Do NOT use:

### Excessive gradients

No:

```text
purple → blue
green → cyan
pink → orange
```

### Glassmorphism everywhere

Avoid:

```text
backdrop-blur + translucent cards
```

as the primary visual language.

### Skill bars

Do not use percentage-based skill indicators.

### Generic developer copy

Avoid:

```text
Passionate developer
Problem solver
Tech enthusiast
Turning ideas into reality
```

unless there is a very specific reason.

### Excessive emojis

Keep the visual language professional.

### Fake terminal interfaces

Do not create a fake terminal just to make the portfolio look technical.

### Over-engineered animations

Do not sacrifice usability for spectacle.

---

# 28. Recommended Page Structure

Final page order:

```text
01  Navigation

02  Hero
    Identity
    Positioning
    Technical status

03  Selected Work
    Featured project
    Supporting projects

04  Engineering
    Stack
    Engineering philosophy

05  Engineering Notes
    Technical writing

06  Currently Building
    Active projects
    Current learning

07  About
    Short bio
    Education
    Interests

08  Contact / Footer
```

---

# 29. Overall Visual Hierarchy

Priority should be:

```text
IDENTITY
    ↓
WHAT I BUILD
    ↓
PROOF
    ↓
HOW I ENGINEER
    ↓
HOW I THINK
    ↓
WHAT I'M BUILDING NOW
    ↓
ABOUT
```

This hierarchy is more important than decorative design.

---

# 30. Final Design Goal

The finished website should communicate the following within approximately 10 seconds:

> **Farrel Apriandry is a software engineer who builds real software systems, understands the technology behind them, and is actively expanding into infrastructure, networking, and systems engineering.**

The design should feel like a **developer's professional workspace**, not a generic portfolio template.

The core visual principle:

> **Less decoration. More signal.**
