# PnklFrontend

#### - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

If first time run app after updating deps to the latest version with Angular 12

1. Node version `16.13.0`
2. NPM version `8.1.0`
3. Delete `node_modules` and `package-lock.json`
4. Install with `npm install`
5. Start the app

If just update node_modules because someone add new modules and change package-lock.json

1. Node version `16.13.0`
2. NVM version `8.1.0`
3. Delete `node_modules`
4. Install with `npm ci`
5. Start the app

#### - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

This project was generated using [Nx](https://nx.dev).

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/nx-logo.png" width="450"></p>

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## Quick Start & Documentation

[Nx Documentation](https://nx.dev/angular)

[10-minute video showing all Nx features](https://nx.dev/angular/getting-started/what-is-nx)

[Interactive Tutorial](https://nx.dev/angular/tutorial/01-create-application)

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are some plugins which you can add to your workspace:

- [Angular](https://angular.io)
  - `ng add @nrwl/angular`
- [React](https://reactjs.org)
  - `ng add @nrwl/react`
- Web (no framework frontends)
  - `ng add @nrwl/web`
- [Nest](https://nestjs.com)
  - `ng add @nrwl/nest`
- [Express](https://expressjs.com)
  - `ng add @nrwl/express`
- [Node](https://nodejs.org)
  - `ng add @nrwl/node`

## Generate an application

Run `ng g @nrwl/angular:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `ng g @nrwl/angular:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are sharable across libraries and applications. They can be imported from `@pnkl-frontend/mylib`.

## Development server

Run `ng serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng g component my-component --project=my-app` to generate a new component.

## Build

Run `ng build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev/angular) to learn more.

## Major Updates

Develop branch pipeline changed with the latest:
LTS - Node.Js version `16.13.0` & NPM `8.1.0`. Versions should be compatible. Check here: [Node.Js](https://nodejs.org/en/download/releases/).

List of scripts:

  - Install Node.js.

  - Install npm & cli.
    - *NOTE: install compatible npm version and the same version of Angular CLI that project uses.*

  - Install dependencies.
    - *NOTE: use clean install to install (npm ci) dependencies from package-lock.json file. For sure node_modules folder should be deleted.*

  - Linting project files.

  - Build project in prod mode.
