# Repository Guidelines

## Mission
- Build a modern song battle app in tournament bracket table style. This will be done using the latest technologies and will have nice modern and sleek design.

## App description
- Stack: Vite, React.js, TypeScript, tailwindcss, pnpm, Biome.js.
- There will be only two screens: Spotify Auth and the tournament itself.
- We will use View Transitions (available in the latest version of `react@experimental`) to transition between screens.

## Rules
- Do not document code and usage in README.md unless asked for.
- Run `pnpm install <package_name>@latest` to install the latest version of a package.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package with TypeScript checks ready.
- Use `@typescript/native-preview` package in lieu of `typescript` for this project. The command changes from `tsc` to `tsgo`.
- Use `react@experimental` and `react-dom@experimental` for this project.
- Do not add a function return type in TypeScript, it can be inferred. This rule can have exceptions.
