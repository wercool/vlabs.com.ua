import * as THREE                   from 'three';

import VlabHVACBaseHeatPump         from './vlabHVACBaseHeatPump';
import VlabHVACBaseAirHandler       from './vlabHVACBaseAirHandler';
import VLabLocator                  from '../../vlabs.core/vlab-locator';

class HVACVLabBase {
    constructor(initObj = {}) {
        console.log(initObj.name);

        this.locationInitObjs = {};
        this.locations = {};

        this.vLabLocator = new VLabLocator({
            context: this,
            transientLocationsMap: {
                "HVACBaseHeatPump": {
                    "HVACBaseAirHandler": {
                        pos: new THREE.Vector3(1.0, 0.1, -1.5),
                        scale: new THREE.Vector3(0.25, 0.25, 0.25),
                    }
                },
                "HVACBaseAirHandler": {
                    "HVACBaseHeatPump": {
                        pos: new THREE.Vector3(1.6, 0.15, 1.5),
                        scale: new THREE.Vector3(0.25, 0.25, 0.25),
                    }
                }
            }
        });

        this.locationInitObjs["HVACBaseHeatPump"] = {
            class: VlabHVACBaseHeatPump,
            name: "HVACBaseHeatPump",
            natureURL: "./resources/heat-pump-nature.json",
            webGLRendererClearColor: 0xb7b7b7,
            vLabLocator: this.vLabLocator
        };

        this.locationInitObjs["HVACBaseAirHandler"] = {
            class: VlabHVACBaseAirHandler,
            name: "HVACBaseAirHandler",
            natureURL: "./resources/air-handler-nature.json",
            webGLRendererClearColor: 0xb7b7b7,
            vLabLocator: this.vLabLocator
        };

        this.locations["HVACBaseHeatPump"]      = new this.locationInitObjs["HVACBaseHeatPump"].class(this.locationInitObjs["HVACBaseHeatPump"]);
        this.locations["HVACBaseAirHandler"]    = undefined;
// this.locations["HVACBaseAirHandler"]    = new this.locationInitObjs["HVACBaseAirHandler"].class(this.locationInitObjs["HVACBaseAirHandler"]);
    }
}

new HVACVLabBase({
    name: "HVAC VLab Base"
});
