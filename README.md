# Mkrecord

node --max_old_space_size=2048 ./node_modules/@angular/cli/bin/ng serve

## Graphify

This project uses [graphify](https://www.npmjs.com/package/@sentropic/graphify) — a knowledge-graph CLI wired into Claude Code (`.claude/settings.json` hooks + `.claude/skills/graphify/`). It lets the AI assistant query code relationships directly instead of reading/grepping files one by one, which saves a lot of tokens on codebase questions.

It's **not** a project dependency — it's a global dev tool, install it once per machine:

```bash
pnpm add -g @sentropic/graphify
```

`.graphify/` (the actual graph data) is gitignored — it's machine-generated and not portable across machines yet. Build it locally after cloning:

```bash
pnpm graphify   # runs `graphify update .`
```

Without graphify installed, nothing breaks — Claude Code just falls back to normal file reading (a bit slower/more expensive on architecture questions).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.9.

## Todo

### Styles

- [ ] https://css-tricks.com/grainy-gradients/
      Main background black

```

  /* filter: contrast(100%) brightness(1000%); */
  background: linear-gradient(44deg, rgba(0, 0, 0, 1), rgba(19, 17, 17, 0.329)),
    url(/assets/background/noise.svg);

```

- [ ] Make a column of gif on menu item:hover for a whole page

### MK-visit

- [ ] Run MK-visit and film instersting moments shortly

## Links

Projects:
https://www.figma.com/proto/gPi3fSlgJnr0WUnnwo0KWn/MK?page-id=0%3A1&node-id=102-4&viewport=241%2C48%2C0.13&scaling=scale-down&starting-point-node-id=138%3A2

Styles:
https://animate.style/
https://speckyboy.com/css-border-effects/

Diagonal rectangle
https://stackoverflow.com/questions/44373416/divide-a-rectangle-into-2-triangles-along-diagonal-using-css

https://formspree.io/plans
https://www.emailjs.com/docs/user-guide/adding-captcha-verification/

VIDEO
https://github.com/ganatan/angular-ssr
