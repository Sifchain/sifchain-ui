#!/bin/bash

# insert args before flags allows us to target specific tests
yarn jest $@ --coverage --runInBand --projects jest-integration.config.js
