# Codebase

- [ ] Rudi will flesh out all of the services/usecases services
- [ ] Will slim up that folder dir, just leaving as a point of reference

## Folder Structure

```
ui
├── app
│   ├── dist
│   │   ├── images
│   │   ├── img
│   │   └── js
│   ├── public
│   │   └── images
│   └── src
│       ├── assets
│       ├── components
│       ├── hooks
│       ├── router
│       ├── scss
│       └── views
│           └── utils
├── chains
│   ├── eth
│   │   ├── contracts
│   │   ├── migrations
│   │   ├── scripts
│   │   └── test
│   ├── peggy
│   ├── sif
│   └── snapshots
├── core
│   ├── data
│   ├── lib
│   │   ├── actions
│   │   │   ├── clp
│   │   │   ├── peg
│   │   │   │   └── utils
│   │   │   └── utils
│   │   ├── api
│   │   │   ├── ClpService
│   │   │   ├── EthbridgeService
│   │   │   │   └── utils
│   │   │   ├── EthereumService
│   │   │   │   └── utils
│   │   │   ├── EventBusService
│   │   │   ├── SifService
│   │   │   └── utils
│   │   │       └── SifClient
│   │   │           └── x
│   │   │               ├── clp
│   │   │               └── ethbridge
│   │   ├── entities
│   │   │   ├── fraction
│   │   │   └── utils
│   │   ├── hooks
│   │   ├── services
│   │   │   ├── ClpService
│   │   │   ├── EthbridgeService
│   │   │   │   └── utils
│   │   │   ├── EthereumService
│   │   │   │   └── utils
│   │   │   ├── EventBusService
│   │   │   ├── SifService
│   │   │   └── utils
│   │   │       └── SifClient
│   │   │           └── x
│   │   │               ├── clp
│   │   │               └── ethbridge
│   │   ├── store
│   │   ├── test
│   │   │   └── utils
│   │   ├── usecases
│   │   │   ├── clp
│   │   │   │   └── calculators
│   │   │   ├── peg
│   │   │   │   └── utils
│   │   │   ├── utils
│   │   │   └── wallet
│   │   └── utils
│   ├── scripts
│   └── src
│       ├── entities
│       │   ├── fraction
│       │   └── utils
│       ├── services
│       │   ├── ClpService
│       │   ├── EthbridgeService
│       │   │   └── utils
│       │   ├── EthereumService
│       │   │   └── utils
│       │   ├── EventBusService
│       │   ├── SifService
│       │   └── utils
│       │       └── SifClient
│       │           └── x
│       │               ├── clp
│       │               └── ethbridge
│       ├── store
│       ├── test
│       │   └── utils
│       ├── usecases
│       │   ├── clp
│       │   │   └── calculators
│       │   ├── peg
│       │   │   └── utils
│       │   ├── utils
│       │   └── wallet
│       └── utils
├── docs
│   └── decisions
├── docs2
│   └── docs
├── e2e
│   ├── coverage
│   │   └── lcov-report
│   ├── downloads
│   ├── extensions
├── scripts
└── test

```

## Components

- Smart / Dumb
- Where do we put them
- When to use JSX and when to use templates
- Storybook
- Unit tests

## Core

## Seed scripts

- How they work and how to edit them
