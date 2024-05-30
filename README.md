# linkedregistrations-ui

User interface for LinkedRegistrations

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Prerequisites

1. Node 18 (`nvm use`)
1. Yarn
1. Docker

## Development with Docker

To build the project, you will need [Docker](https://www.docker.com/community-edition).

Create .env.local

    cp .env.local.example .env.local

Build the docker image

    docker compose build

Start the container

    docker compose up

The web application is running at http://localhost:3001

## Running production version with Docker

Build the docker image

    DOCKER_TARGET=production docker compose build

Start the container

    docker compose up

The web application is running at http://localhost:3001

## Setting up complete development environment locally with docker

### Install local Linked Events API

Clone the repository (https://github.com/City-of-Helsinki/linkedevents). Follow the instructions for running linkedevents with docker. Before running `docker compose up` use the `env.example` template as base for `/docker/django/.env` and also set the following settings there:

- TOKEN_AUTH_ACCEPTED_AUDIENCE=linkedevents-api-dev
- TOKEN_AUTH_AUTHSERVER_URL=https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus

### Linked Registrations UI

Set the following variables in `.env.local`:

- OIDC_ISSUER=https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus
- OIDC_API_TOKENS_URL=https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus/protocol/openid-connect/token/
- OIDC_CLIENT_ID=linkedregistrations-ui-dev
- OIDC_CLIENT_SECRET=<linkedregistrations-ui client secret>
- OIDC_LINKED_EVENTS_API_SCOPE=linkedevents-api-dev
- NEXT_PUBLIC_LINKED_EVENTS_URL=http://localhost:8080/v1

Run `yarn && yarn dev`

## Running development environment locally without docker

Run `yarn && yarn start`

## Configurable environment variables

Use .env.local for development.

    cp .env.local.example .env.local

| Name                                      | Description                                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| PORT                                      | Port where app is running. Default is 3001                                                                                 |
| NEXT_PUBLIC_LINKED_EVENTS_URL             | linkedevents api base url                                                                                                  |
| NEXT_PUBLIC_ENVIRONMENT                   | Environment used in Sentry. Use local for development                                                                      |
| NEXT_PUBLIC_SENTRY_DSN                    | Sentry DSN.                                                                                                                |
| SENTRY_URL                                | Url of Sentry instance. Default is https://sentry.test.hel.ninja                                                           |
| SENTRY_ORG                                | Sentry organization. Default is city-of-helsinki                                                                           |
| SENTRY_PROJECT                            | Sentry project. Default is linkedregistrations-ui                                                                          |
| SENTRY_AUTH_TOKEN                         | Sentry authentication token.                                                                                               |
| OIDC_ISSUER                               | Keycloak SSO service base url. Default is https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus                          |
| OIDC_API_TOKENS_URL                       | Keycloak api tokens url. Default is https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus/protocol/openid-connect/token/ |
| OIDC_CLIENT_ID                            | Client id. Default is linkedregistrations-ui                                                                               |
| OIDC_CLIENT_SECRET                        | Secret of the oidc client                                                                                                  |
| OIDC_LINKED_EVENTS_API_SCOPE              | Linked Events API scope. Default is linkedevents-api                                                                       |
| NEXT_PUBLIC_MATOMO_URL                    | Base url of the Matomo. Defualt is //matomo.hel.fi/                                                                        |
| NEXT_PUBLIC_MATOMO_SITE_ID                | Site id in the Matomo. Default is 70                                                                                       |
| NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE        | JavaScript tracker file name. Default is matomo.js                                                                         |
| NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE       | PHP tracker file name. Default is matomo.php                                                                               |
| NEXT_PUBLIC_MATOMO_ENABLED                | Flag to enable matomo. Default is false.                                                                                   |
| NEXTAUTH_SECRET                           | next-auth secret                                                                                                           |
| NEXTAUTH_URL                              | Canonical url of the site used by next-auth                                                                                |
| NEXT_ENV                                  | 'development' or 'production'                                                                                              |
| NEXT_PUBLIC_WEB_STORE_INTEGRATION_ENABLED | Flag to enable Tapla integration. Default is false                                                                         |
| NEXT_PUBLIC_WEB_STORE_API_BASE_URL        | Base url for the Tapla endpoints. Default is https://checkout-test-api.test.hel.ninja/v1                                   |

## Url parameters

There are some url parameters which can be used when using signup form in external service:

`iframe`:
e.g. https://linkedregistrations-ui.test.kuva.hel.ninja/fi/registration/22/signup-group/create?iframe=true

This parameter can be used to hide page header. Page header is hidden when iframe=true

`redirect_url`:
e.g. https://linkedregistrations-ui.test.kuva.hel.ninja/fi/registration/22/signup-group/create?redirect_url=https://www.google.com/

This parameter can be used to redirect user automatically to selected url after successful signup. It's important to include also protocol to the url.

## Commit message format

New commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/)
specification, and line length is limited to 72 characters.

[`commitlint`](https://github.com/conventional-changelog/commitlint) checks new commit messages for the correct format.

## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn start`

Runs the built app in the production mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn test:coverage`

Run tests and generate coverage report

## Snyk

Snyk CLI scans and monitors your projects for security vulnerabilities and license issues.

For more information visit the Snyk website https://snyk.io

For details see the CLI documentation https://docs.snyk.io/features/snyk-cli

How to get started

1. Authenticate by running `yarn snyk auth`
2. Test your local project with `yarn snyk test`
3. Get alerted for new vulnerabilities with `yarn snyk monitor`

You can see all available command with `yarn snyk`

You can install Snyk extension for Visual Studio Code from https://marketplace.visualstudio.com/items?itemName=snyk-security.snyk-vulnerability-scanner

## Debugging

### Debugging project in VS Code

To debug in VS Code:

1. Install the "Debugger for Chrome" extension to VS Code
2. Run `yarn dev`
3. Set a breakpoint
4. Run "Chrome" debug configuration in VS Code
5. Reload the project in your browser

### Debugging Tests in VS Code

No plugin is needed.

1. Set a breakpoint
2. Run the "Run tests" debugger configuration

### Debugging Tests in Chrome

We recommend using VS Code's debugger.

1. Place a `debugger;` statement in any test
2. Run yarn `test:debug`
3. Open `about:inspect` in Chrome
4. Select `inspect` on you process, press Play and you're good to go.

See more detailed instructions here:
https://create-react-app.dev/docs/debugging-tests#debugging-tests-in-chrome
