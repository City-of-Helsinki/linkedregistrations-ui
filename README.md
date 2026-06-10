# linkedregistrations-ui

User interface for LinkedRegistrations

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Prerequisites

1. Node 24 (`nvm use`)
1. pnpm
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

Run `pnpm i && pnpm dev`

## Running development environment locally without docker

Run `pnpm i && pnpm dev`

## Configurable environment variables

Use .env.local for development.

    cp .env.local.example .env.local

| Name                                            | Description                                                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| PORT                                            | Port where app is running. Default is 3001                                                                                 |
| NEXT_PUBLIC_LINKED_EVENTS_URL                   | linkedevents api base url                                                                                                  |
| NEXT_PUBLIC_SENTRY_ENVIRONMENT                  | Environment used in Sentry. Default is local which should be used for local development.                                   |
| NEXT_PUBLIC_SENTRY_DSN                          | Sentry DSN.                                                                                                                |
| NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE           | Controls the traces sample rate for Sentry performance monitoring. Default is 0 (disabled).                                |
| NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS    | Comma-separated list of URLs or patterns for trace propagation.                                                            |
| NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE  | Controls the session sample rate for Sentry session replays. Default is 0 (disabled).                                      |
| NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE | Controls the sample rate for Sentry replays on errors. Default is 0 (disabled).                                            |
| NEXT_PUBLIC_SENTRY_RELEASE                      | Sentry release version.                                                                                                    |
| SENTRY_PROJECT                                  | Sentry project. Default is linkedregistrations-ui                                                                          |
| OIDC_ISSUER                                     | Keycloak SSO service base url. Default is https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus                          |
| OIDC_API_TOKENS_URL                             | Keycloak api tokens url. Default is https://tunnistus.hel.fi/auth/realms/helsinki-tunnistus/protocol/openid-connect/token/ |
| OIDC_CLIENT_ID                                  | Client id. Default is linkedregistrations-ui                                                                               |
| OIDC_CLIENT_SECRET                              | Secret of the oidc client                                                                                                  |
| OIDC_LINKED_EVENTS_API_SCOPE                    | Linked Events API scope. Default is linkedevents-api                                                                       |
| NEXT_PUBLIC_MATOMO_URL                          | Base url of the Matomo. Defualt is //matomo.hel.fi/                                                                        |
| NEXT_PUBLIC_MATOMO_SITE_ID                      | Site id in the Matomo. Default is 70                                                                                       |
| NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE              | JavaScript tracker file name. Default is matomo.js                                                                         |
| NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE             | PHP tracker file name. Default is matomo.php                                                                               |
| NEXT_PUBLIC_MATOMO_ENABLED                      | Flag to enable matomo. Default is false.                                                                                   |
| NEXTAUTH_SECRET                                 | next-auth secret                                                                                                           |
| NEXTAUTH_URL                                    | Canonical url of the site used by next-auth                                                                                |
| NEXT_ENV                                        | 'development' or 'production'                                                                                              |
| NEXT_PUBLIC_WEB_STORE_INTEGRATION_ENABLED       | Flag to enable Tapla integration. Default is false                                                                         |
| NEXT_PUBLIC_WEB_STORE_API_BASE_URL              | Base url for the Tapla endpoints. Default is https://checkout-test-api.test.hel.ninja/v1                                   |
| NEXT_PUBLIC_ATTENDANCE_LIST_LOGIN_METHODS       | Login methods to use for attendance list viewing/editing. Default is suomi_fi                                              |
| NEXT_PUBLIC_SIGNUPS_LOGIN_METHODS               | Login methods to use for signup viewing/editing. Default is helsinki-tunnus and helsinkiad                                 |
| NEXT_CSP_POLICY                                 | Content Security Policy header value. If not set, no CSP headers will be added.                                            |
| NEXT_CSP_REPORT_ONLY                            | Set to 'false' to enforce CSP, otherwise defaults to report-only mode. Default is true.                                    |
| NEXT_CSP_REPORTING_ENDPOINTS                    | Optional reporting endpoints for CSP violations.                                                                           |
| NEXT_PUBLIC_USE_IMAGE_PROXY                     | Enable image proxy to return proxied URLs for CSP compliance. Default is false.                                            |

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

### `pnpm dev`

Runs the app in the development mode.<br />
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `pnpm build`

Builds the app for production to the `build` folder.

### `pnpm start`

Runs the built app in the production mode.<br />
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### `pnpm test`

Launches the test runner in the interactive watch mode.

### `pnpm test:coverage`

Run tests and generate coverage report

### `pnpm update-runtime-env`

Generates `public/env-config.js` (and in test mode `public/test-env-config.js`) from runtime environment variables.
This is run automatically by `pnpm dev`, `pnpm start`, `pnpm test`, and `pnpm test:coverage`, but can also be run manually when needed.

### `pnpm fix-hds-shim`

Workaround for a packaging issue in `hds-core@6.x`: generates a missing `cookieConsent.js` file that `hds-react` expects but the package does not ship.
This is run automatically by `pnpm dev` and `pnpm build`. Run it manually if you encounter a `MODULE_NOT_FOUND` error for `hds-core/lib/components/cookie-consent/cookieConsent` after installing dependencies.
Can be removed once HDS publishes a fixed release.

## Debugging

### Debugging project in VS Code

To debug in VS Code:

1. Run `pnpm dev`
2. Use one of the provided Next.js debug configurations in VS Code
3. Set a breakpoint
4. Reload the project in your browser

### Debugging Tests in VS Code

No plugin is needed.

1. Set a breakpoint
2. Run the "Run tests" debugger configuration
