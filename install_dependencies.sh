#!/bin/bash
BASEDIR=$(dirname "$0")
cd $BASEDIR
npm update -g serverless
npm install serverless-step-functions
npm install serverless-pseudo-parameters
npm i @teleology/fp
npm i dateformat