# linkedregistrations-ui

User interface for LinkedRegistrations

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Prerequisites

1. Node 16 (`nvm use`)
1. Yarn
1. Docker

## Development with Docker

To build the project, you will need [Docker](https://www.docker.com/community-edition).

Build the docker image

    docker compose build

Start the container

    docker compose up

The web application is running at http://localhost:3000

## Running production version with Docker

Build the docker image

    DOCKER_TARGET=production docker compose build

Start the container

    docker compose up

The web application is running at http://localhost:3000

## Running development environment locally without docker

Run `yarn && yarn start`

## Configurable environment variables

Use .env.local for development.

    cp .env.local.example .env.local

| Name                          | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| PORT                          | Port where app is running. Default is 3000            |
| NEXT_PUBLIC_LINKED_EVENTS_URL | linkedevents api base url                             |
| NEXT_PUBLIC_ENVIRONMENT       | Environment used in Sentry. Use local for development |
| NEXT_PUBLIC_SENTRY_DSN        | Sentry DSN.                                           |
| SENTRY_AUTH_TOKEN             | Sentry authentication token.                          |
| NEXT_PUBLIC_OIDC_AUTHORITY    | https://api.hel.fi/sso                                |
| NEXT_PUBLIC_OIDC_CLIENT_ID    | linkedcomponents-ui-test                              |
| NEXT_PUBLIC_OIDC_API_SCOPE    | https://api.hel.fi/auth/linkedeventsdev               |

## Url parameters

There are some url parameters which can be used when using enrolment form in external service:

`iframe`:
e.g. https://linkedregistrations-ui.test.kuva.hel.ninja/fi/registration/22/enrolment/create?iframe=true

This parameter can be used to hide page header. Page header is hidden when iframe=true

`redirect_url`:
e.g. https://linkedregistrations-ui.test.kuva.hel.ninja/fi/registration/22/enrolment/create?redirect_url=https://www.google.com/

This parameter can be used to redirect user automatically to selected url after successful enrolment. It's important to include also protocol to the url.

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
