# Repository Guidelines

## Mission
- Build a modern song battle app in tournament bracket table style. This will be done using the latest technologies and will have nice modern and sleek design.

## App description
- Stack: Vite, React.js, TypeScript, tailwindcss, pnpm, Biome.js.
- There will be only two screens: Spotify Auth and the tournament itself.
- We will use View Transitions (available in the latest version of `react@experimental`) to transition between screens.

## Rules
- Do not document code and usage in README.md unless asked for.
- Run `pnpm install <package_name>@latest` to install the latest version of a package. The only exceptions are experimental packages listed below
- This project uses lots of experimental packages, don't try to replace them with stable versions or otherwise modify their version without permission. Namely, the following packages are:
    - Vite: `rolldown-vite`,
    - React: `react@experimental`,
    - React DOM: `react-dom@experimental`,
    - ESLint Plugin React Hooks: `eslint-plugin-react-hooks` (including the patched version).
- Do not add a function return type in TypeScript, it can be inferred. This rule can have exceptions.
