# AGENT.md

Instructions for AI agents (Claude Code, Copilot, Cursor, etc.) working in this repository.

## Teaching Comments — Mandatory

Every code change that replaces a legacy/suboptimal pattern with a modern API **must** include a comment that teaches the developer **what** to use and **why**.

### Format

```ts
// use <API> because <reason>
```

### Examples

```ts
// use toSignal() because async pipe adds CommonModule dependency and doesn't integrate with zoneless change detection
protected quality = toSignal(interval(3000).pipe(…), { initialValue: '…' });

// use afterNextRender() because it's SSR-safe by design — no manual isBrowser guard needed
constructor() {
  afterNextRender(() => { … });
}

// use computed() because the value is derived from another signal — no imperative subscribe() needed
protected readonly icon = computed(() => icons[this.tick() ? 2 : 3]);

// use signal() because with zoneless change detection, plain mutable fields don't trigger view updates
disabledLeft = signal(true);
```

### When to write teaching comments

1. **Replacing a pattern** — when you swap a legacy API for a modern one (e.g., `ngOnInit` → `afterNextRender`, `@HostListener` → `host`, `subscribe()` → `toSignal()`)
2. **Annotating existing code for future migration** — when you mark code that should be changed later with a reference to `docs/todo/angular-modern-api.md`
3. **Choosing a non-obvious approach** — when the "why" isn't self-evident from the code alone

### When NOT to write teaching comments

- Standard idiomatic code that any Angular developer would recognize
- Code that already has a `// see docs/todo` reference explaining the issue
- Simple variable assignments, imports, or boilerplate

### Goal

The project owner is actively learning modern Angular patterns. Comments like `// use X because Y` turn every code review and diff into a micro-lesson. The comment stays in the code until the pattern becomes second nature, then it can be removed.

## Other Rules

All other coding rules are in [`CLAUDE.md`](CLAUDE.md). Both files are mandatory reading before any code change.
