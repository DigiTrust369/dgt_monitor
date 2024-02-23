# DigiTrust monitor funding allocation

## Requirements

 - [Node v7.6+](https://nodejs.org/en/download/current/) or [Docker](https://www.docker.com/)
 - [Yarn](https://yarnpkg.com/en/docs/install)

## Getting Started

Install yarn:

```bash
npm install -g yarn
```

Install dependencies:

```bash
yarn
```

Set environment variables:

```bash
cp .env.example .env
```

Run environment tool to create keys, then copy result to .env
```bash
yarn env
```

## Running Locally

```bash
yarn dev
```

## Running in Production

```bash
yarn start
```

## Lint

```bash
# lint code with ESLint
yarn lint

# try to fix ESLint errors
yarn lint:fix
```

## Test

```bash
# run all tests with Mocha
yarn test
```

## Validate

```bash
# run lint and tests
yarn validate
```

## Logs

```bash
# show logs in production
pm2 logs
```

## Documentation

```bash
# generate and open api documentation
yarn docs
```

## Docker

```bash
# local docker
docker-compose -f docker-compose.yml up

# run tests
docker-compose -f docker-compose.yml -f docker-compose.test.yml up
```

## Deploy

Set your server ip:

```bash
DEPLOY_SERVER=127.0.0.1
```

Replace my Docker username with yours:

```bash
nano deploy.sh
```

Run deploy script:

```bash
yarn deploy
or
sh ./deploy.sh
```

## Faucet Address
```
// ETH Kovan network
addr: 0xb87bd5e30d05be9d8fdb1d208982933705af6cf4
priv: 393d24d9e70548db264c3797512b6943020dfb4c38c42d37b1a59c284b1b93c8
token: 0xfab46e002bbf0b4509813474841e0716e6730136
```
