#!/bin/bash

gulp --gulpfile ./src/vlab.apartment/gulpfile.js build
gulp --gulpfile ./src/vlab.base/gulpfile.js build
gulp --gulpfile ./src/vlab.kitchen/gulpfile.js build

#HVAC
gulp --gulpfile ./src/vlabs.hvac/vlab.hvac.base/gulpfile.js build