# linkedregistrations-ui

User interface for LinkedRegistrations

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Prerequisites

1. Node 16 (`nvm use`)
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

### Set tunnistamo and linkedevents hostname

Add the following lines to your hosts file (`/etc/hosts` on mac and linux):

    127.0.0.1 tunnistamo-backend
    127.0.0.1 linkedevents-backend

### Create a new OAuth app on GitHub

Go to https://github.com/settings/developers/ and add a new app with the following settings:

- Application name: can be anything, e.g. local tunnistamo
- Homepage URL: http://tunnistamo-backend:8000
- Authorization callback URL: http://tunnistamo-backend:8000/accounts/github/login/callback/

Save. You'll need the created **Client ID** and **Client Secret** for configuring tunnistamo in the next step.

### Install local tunnistamo

Clone https://github.com/City-of-Helsinki/tunnistamo/.

Follow the instructions for setting up tunnistamo locally. Before running `docker-compose up` set the following settings in tunnistamo roots `docker-compose.env.yaml`:

- SOCIAL_AUTH_GITHUB_KEY: **Client ID** from the GitHub OAuth app
- SOCIAL_AUTH_GITHUB_SECRET: **Client Secret** from the GitHub OAuth app

After you've got tunnistamo running locally, ssh to the tunnistamo docker container:

`docker-compose exec django bash`

and execute the following commands inside your docker container:

```bash
./manage.py add_oidc_client -n linkedregistrations-ui -t "code" -u "http://localhost:3001/api/auth/callback/tunnistamo" -i linkedregistrations-ui -m github -s dev -c
./manage.py add_oidc_client -n linkedevents -t "code" -u http://linkedevents-backend:8080/accounts/helsinki/login/callback -i https://api.hel.fi/auth/linkedevents -m github -s dev -c
./manage.py add_oidc_api -n linkedevents -d https://api.hel.fi/auth -s email,profile -c https://api.hel.fi/auth/linkedevents
./manage.py add_oidc_api_scope -an linkedevents -c https://api.hel.fi/auth/linkedevents -n "Linked events" -d"Lorem ipsum"
./manage.py add_oidc_client_to_api_scope -asi https://api.hel.fi/auth/linkedevents -c linkedregistrations-ui
```

### Install local Linked Events API

Clone the repository (https://github.com/City-of-Helsinki/linkedevents). Follow the instructions for running linkedevents with docker. Before running `docker-compose up` set the following variables in `/docker/django/.env`:

- ALLOWED_HOSTS=\*
- APPLY_MIGRATIONS=false
- CREATE_SUPERUSER=true
- DATABASE_URL=postgres://linkedevents:linkedevents@linkedevents-db/linkedevents
- DEBUG=true
- DEV_SERVER=true
- MEMCACHED_URL=linkedevents-memcached:11211
- RUNSERVER_ADDRESS=0.0.0.0:8080
- SEAT_RESERVATION_DURATION=15
- WAIT_FOR_IT_ADDRESS=linkedevents-db:5432
- TOKEN_AUTH_AUTHSERVER_URL=http://tunnistamo-backend:8000/openid
- TOKEN_AUTH_ACCEPTED_AUDIENCE=https://api.hel.fi/auth/linkedevents
- TOKEN_AUTH_REQUIRE_SCOPE_PREFIX=False
- SOCIAL_AUTH_TUNNISTAMO_OIDC_ENDPOINT=http://tunnistamo-backend:8000/openid
- SOCIAL_AUTH_TUNNISTAMO_KEY=linkedevents
- SOCIAL_AUTH_TUNNISTAMO_SECRET<linkedevents client secret>

### Linked Registrations UI

Set the following variables in `.env.local`:

- OIDC_ISSUER=http://tunnistamo-backend:8000/openid
- OIDC_API_TOKENS_URL=http://tunnistamo-backend:8000/api-tokens/
- OIDC_CLIENT_ID=linkedregistrations-ui
- OIDC_CLIENT_SECRET=<linkedregistrations-ui client secret>
- OIDC_LINKED_EVENTS_API_SCOPE=https://api.hel.fi/auth/linkedevents
- OIDC_TOKEN_URL=http://tunnistamo-backend:8000/openid/token/
- NEXT_PUBLIC_LINKED_EVENTS_URL=http://linkedevents-backend:8080/v1

Run `yarn && yarn dev`

## Running development environment locally without docker

Run `yarn && yarn start`

## Configurable environment variables

Use .env.local for development.

    cp .env.local.example .env.local

| Name                          | Description                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| PORT                          | Port where app is running. Default is 3001                                  |
| NEXT_PUBLIC_LINKED_EVENTS_URL | linkedevents api base url                                                   |
| NEXT_PUBLIC_ENVIRONMENT       | Environment used in Sentry. Use local for development                       |
| NEXT_PUBLIC_SENTRY_DSN        | Sentry DSN.                                                                 |
| SENTRY_AUTH_TOKEN             | Sentry authentication token.                                                |
| OIDC_ISSUER                   | Tunnistamo SSO service base url. Default is https://api.hel.fi/sso          |
| OIDC_API_TOKENS_URL           | Tunnistamo api tokens url. Default is https://api.hel.fi/sso/api-tokens/    |
| OIDC_CLIENT_ID                | Client id. Default is linkedcomponents-ui-test                              |
| OIDC_CLIENT_SECRET            | Secret of the oidc client                                                   |
| OIDC_LINKED_EVENTS_API_SCOPE  | Linked Events API scope. Default is https://api.hel.fi/auth/linkedeventsdev |
| OIDC_TOKEN_URL                | Tunnistamo token endpoint url. Default is https://api.hel.fi/sso/token/     |
| NEXTAUTH_SECRET               | next-auth secret                                                            |
| NEXTAUTH_URL                  | Canonical url of the site used by next-auth                                 |
| NEXT_ENV                      | 'development' or 'production'                                               |

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
