# Documentation Structure

This directory contains all architectural decisions, best practices audit, technical debt tracking, and improvement proposals.

---

## 🚀 Quick Start

**New to the codebase?** Read in this order:

1. **[best-practices.md](best-practices.md)** — Comprehensive Angular 21 audit: what's working, what's missing, implementation roadmap
2. **[architecture.md](architecture.md)** — System design, component hierarchy, data flow
3. **[todo/index.md](todo/index.md)** — Priority-ranked issues (P0/P1/P2, FSD/CQRS/Architecture violations)

**Contributing?** Check:
- **[CLAUDE.md](../CLAUDE.md)** — Coding rules, patterns, architecture methodology
- **[todo/tech-debt.md](todo/tech-debt.md)** — SSR safety, singleton violations, change detection issues
- **[todo/angular-modern-api.md](todo/angular-modern-api.md)** — Modern Angular APIs with before/after examples

---

## 📂 Directory Structure

### `/best-practices.md` — Angular 21 Best Practices Audit
Comprehensive analysis of what's working and what needs fixing:
- ✅ What's implemented well (signals, OnPush, standalone, DI, testing)
- ⚠️ What's missing (HTTP interceptors, lazy routes, e2e tests)
- 🔴 Critical issues (P0/P1) with actionable fixes
- 🟡 Medium-priority improvements (P2)
- Implementation roadmap with phases

**Start here if:** You want a bird's-eye view of the codebase health.

---

### `/architecture.md`
System design overview:
- Component hierarchy
- Data flow diagrams
- Tech stack and library choices
- Feature-Sliced Design (FSD) layers
- CQRS patterns (queries/commands)

**Read if:** You're new to the project or refactoring architecture.

---

### `/todo/` — Issue Tracking
Priority-ranked issues, each linked to detailed docs:

#### `index.md` — Master Priority List
Quick reference table of ALL issues:
- **P0 — Critical** (crashes SSR): 6 items
- **P1 — High** (architecture bugs): 7 items
- **P2 — Medium** (best practices): 10 items
- **FSD violations**: 2 items
- **CQRS violations**: 5 items
- **Dead code inventory**: See `deprecated.md`

**Read if:** You're picking up a task or need issue context.

#### `tech-debt.md` — Detailed Explanations
In-depth breakdown of architectural and safety issues:
- SSR safety violations (document/window guards)
- Platform Service implementation gap
- Change detection missing OnPush
- Singleton pattern violations
- CQRS / State ownership violations
- FSD layer violations
- CI/CD improvements

**Read if:** You're fixing a P0/P1 issue and need context.

#### `angular-modern-api.md` — Modern API Migrations
Step-by-step guide for modernizing code patterns:
- A: `toSignal()` — eliminate `async` pipe
- B: `afterNextRender()` — replace lifecycle hooks
- C: Constructor subscriptions — move from `ngOnInit`
- D: `host` property — replace `@HostListener`
- E: `toSignal()` + `computed()` — replace imperative subscriptions
- H: Signal-based forms (wait for stabilization)
- I: `effect()` + `untracked()` pattern

Each section shows **why**, **before**, and **after** code.

**Read if:** You're refactoring code and want to apply modern patterns.

#### `deprecated.md` — Dead Code Inventory
Complete list of unused signals, methods, console.logs, commented blocks:
- 11 files with unused code
- 11 files with console.log spam
- 2 files with spurious attributes

**Read if:** You're cleaning up code or need a dead code reference.

#### `tools-to-use.md` — Tooling Roadmap
Recommended tools and configurations:
- angular-eslint (catch architecture violations)
- TypeScript strict flags (noUnusedLocals, noUnusedParameters)
- Path aliases (@app/*, @shared/*)
- Playwright (e2e testing)
- source-map-explorer (bundle analysis)

**Read if:** You're setting up development tooling.

#### `ui.md` — Visual Issues
UI/UX problems reported (non-blocking):
- Desktop layout issues (12 items)
- Mobile layout issues (7 items)
- Navigation, contact form, legal sections

**Read if:** You're working on visual polish.

---

### `/improvements/` — Enhancement Proposals
Non-blocking best-practice upgrades:

#### `index.md` — Enhancement Roadmap
Suggestions for architectural improvements:
1. Angular Signal APIs (resource, linkedSignal usage)
2. PlatformService implementation ✅ DONE
3. Camera components consolidation
4. Video preloading strategy
5. Virtual scrolling for portfolio
6. Loading skeletons for videos
7. CSS architecture modernization (@layer, container queries)
8. Contacts form backend wiring
9. HTTP interceptors & typed API service
10. Route lazy loading
11. ESLint rules
12. Bundle monitoring
13. Virtual scroll & IntersectionObserver
14. Advanced TypeScript config
15. E2E testing with Playwright

**Read if:** You want to propose or work on enhancements.

---

## 🎯 Issue Naming Convention

Every issue comment in source code follows this format:

```ts
// see docs/todo — P# #N: brief description
```

Examples:
```ts
// see docs/todo — P0 #3: SSR safety — guard document access with PlatformService
const element = document.getElementById('vid');

// see docs/todo — P1 #10: missing ChangeDetectionStrategy.OnPush
@Component({ template: '...' })
export class MyComponent { }

// see docs/todo — P2 #17: add catchError to observable chains
observable.pipe(map(…)).subscribe(…);
```

This links code directly to documentation for context.

---

## 📊 Statistics

| Category | Count | Status |
|----------|-------|--------|
| Total Issues | 23 | Being addressed |
| P0 (Critical) | 6 | See tech-debt.md |
| P1 (High) | 7 | See tech-debt.md |
| P2 (Medium) | 10 | See tech-debt.md |
| Dead Code Files | 11 | See deprecated.md |
| Test Files | 4 | 25 tests passing |
| Components | ~40 | All standalone |

---

## 🔄 Workflow

### When You Start a Task
1. Read [best-practices.md](best-practices.md) for context
2. Check [todo/index.md](todo/index.md) for priority
3. Read detailed explanation in the relevant `todo/*.md` file
4. Look for `// see docs/todo` comments in the source code

### When You Fix an Issue
1. Update the relevant source file
2. Add/remove `// see docs/todo` comment as appropriate
3. Mark the issue as done in this documentation
4. Reference the issue in your git commit

### When You Add a Feature
1. Document it in [improvements/index.md](improvements/index.md) or create new section
2. Reference best practices where applicable
3. Update component comments with architecture patterns

---

## 📚 Related Files

- **[../CLAUDE.md](../CLAUDE.md)** — Project rules, coding patterns, architecture methodology
- **[../package.json](../package.json)** — Dependencies, build scripts
- **[../tsconfig.json](../tsconfig.json)** — TypeScript configuration
- **[../angular.json](../angular.json)** — Angular CLI configuration

---

## 🔗 External References

- [Angular 21 Documentation](https://angular.dev)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Angular Signals RFC](https://github.com/angular/angular/discussions/49685)

---

## Last Updated
**2026-03-22** — After Angular 21 upgrade, vitest setup, comprehensive best practices audit
