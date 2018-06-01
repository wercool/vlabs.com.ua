#!/bin/bash

#MISC
#gulp --vlab vlab.base --mode prod
#gulp --vlab vlab.preview --mode prod

#gulp --vlab vlab.apartment --mode prod
#gulp --vlab vlab.kitchen --mode prod

#HVAC
gulp --vlab vlabs.hvac/vlab.hvac.base --mode prod
gulp --vlab vlabs.hvac/vlab.hvac.heat-pump --mode prod
gulp --vlab vlabs.hvac/vlab.hvac.air-handler --mode prod
gulp --vlab vlabs.hvac/vlab.hvac.scrollCompressorZP25K5E --mode prod
gulp --vlab vlabs.hvac/vlab.hvac.fluke17B --mode prod
gulp --vlab vlabs.hvac/vlab.hvac.bernzomaticTS8000 --mode prod
gulp --vlab vlabs.hvac/vlab.hvac.boschScrewdriverIXOIII --mode prod
