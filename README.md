This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Setup

Install dependencies:

```bash
yarn install
```

### Configure app .env

Copy `.env.example` to `.env.local`

```bash
cp .env.example .env.local
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.ts`. The page auto-updates as you edit the file.

### Production

Build the production ready application:

```bash
npm run build
# or
yarn build
```

Run the build project

```bash
npm run start
# or
yarn start
```

### Run in Docker

First, install [Docker](https://docs.docker.com/get-docker/) and
[Docker Compose](https://docs.docker.com/compose/install/).

Then run the following command to start both the node and client web application.

```bash
./docker_run.sh
```

You can use either the `latest` tag or specific one in the docker-compose configuration.
