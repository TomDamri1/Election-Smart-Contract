#!/bin/bash

truffle compile
truffle migrate --reset
cd client
npm i
npm start
