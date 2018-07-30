import * as THREE                   from 'three';

import VlabHVACBaseHeatPump         from './vlabHVACBaseHeatPump';
import VlabHVACBaseAirHandler       from './vlabHVACBaseAirHandler';
import VLabLocator                  from '../../vlabs.core/vlab-locator';
import Tablet                       from '../../vlabs.core/tablet';

class HVACVLabBase {
    constructor(initObj = {}) {
        console.log(initObj.name);

        this.name = initObj.name;

        this.locationInitObjs = {};
        this.locations = {};

        this.ambientSound = new Audio('./resources/sounds/ambient.mp3');
        this.ambientSound.volume = 0.1;
        this.ambientSound.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        this.ambientSound.play();

        this.vLabLocator = new VLabLocator({
            context: this,
            transientLocationsMap: {
                "HVACBaseHeatPump": {
                    "HVACBaseAirHandler": {
                        pos: new THREE.Vector3(1.0, 0.5, -1.5),
                        scale: new THREE.Vector3(0.5, 0.5, 0.5),
                    }
                },
                "HVACBaseAirHandler": {
                    "HVACBaseHeatPump": {
                        pos: new THREE.Vector3(1.6, 0.5, 1.5),
                        scale: new THREE.Vector3(0.5, 0.5, 0.5),
                        visible: true
                    }
                }
            },
            locationChanged: this.locationChanged
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

        // this.locations["HVACBaseHeatPump"]      = new this.locationInitObjs["HVACBaseHeatPump"].class(this.locationInitObjs["HVACBaseHeatPump"]);
        this.locations["HVACBaseHeatPump"]      = undefined;//new this.locationInitObjs["HVACBaseHeatPump"].class(this.locationInitObjs["HVACBaseHeatPump"]);
        // this.locations["HVACBaseAirHandler"]    = undefined;
        this.locations["HVACBaseAirHandler"] = new this.locationInitObjs["HVACBaseAirHandler"].class(this.locationInitObjs["HVACBaseAirHandler"]);

        this.tablet = new Tablet({
            context: this,
            vLabLocator: this.vLabLocator,
            content: {
                header: 'HelpClip Assistant',
                tabs: [
                    {
                        title: 'Normal operation demo',
                        items: [
                            {
                                shortDesc: 'Approach the thermostat',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Thermostat is located inside the apartment <img src="resources/assistant/img/step1_0.png" style="vertical-align: middle;"></li>\
                                                <li>Click <img src="resources/assistant/img/step1_1.png" style="vertical-align: middle;"> (yellow curved arrow)</li>\
                                                <li>Click <img src="resources/assistant/img/step1_2.png" style="vertical-align: middle;"> (magnifying glass)</li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Set up COOL MODE',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Set mode to Cool <img src="resources/assistant/img/step2_1.png" style="vertical-align: middle;"></li>\
                                                <li>Tap / click the thermostat screen <img src="resources/assistant/img/step2_2.png" style="vertical-align: middle;"></li>\
                                                <li>Select COOL TO <img src="resources/assistant/img/step2_3.png" style="vertical-align: middle;"></li>\
                                                <li>Set COOL TO temperature to 3° below shown indoor temperature <img src="resources/assistant/img/step2_4.png" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Acknowledge yourself that: \
                                            <p>1) Control voltage is applied to Heat Pump Control Board from the Air Handler Control Board.</p>\
                                            <p>2) Control voltage is applied to Air Handler Control Board from the Thermostat.</p>',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Exit Zoom Mode <img src="resources/assistant/img/step3_1.png" style="vertical-align: middle;"> (click / tap the icon)</li>\
                                                <li>Turn left <img src="resources/assistant/img/step3_2.png" style="vertical-align: middle;"> (press left mouse button / tap and drag left)</li>\
                                                <li>Click <img src="resources/assistant/img/step3_3.png" style="vertical-align: middle;"> (location in front of the nish door where Air Handler is installed)</li>\
                                                <li>Click left mouse button / tap the middle of the screen and drag to the bottom until door sill is visible <img src="resources/assistant/img/step3_4.png" style="vertical-align: middle;"></li>\
                                                <li>Open the nish door by clicking <img src="resources/assistant/img/step3_5.png" style="vertical-align: middle;"></li>\
                                                <li>Acknowledge applied control voltages <img src="resources/assistant/img/step3_6.png" style="vertical-align: middle;"></li>\
                                                <li>Be careful, high voltage is applied to the Air Handler <img src="resources/assistant/img/step3_7.png" style="vertical-align: middle;"></li>\
                                                <li>Close the nish door, be nice. <img src="resources/assistant/img/step3_8.png" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            }
                        ]
                    },
                    {
                        title: 'Short to ground demo'
                    },
                    {
                        title: 'Free mode'
                    }
                ]
            }
        });
    }

    locationChanged(transientLocationName) {
        if(transientLocationName == 'HVACBaseHeatPump') {
            this.ambientSound.volume = 0.5;
        }
        if(transientLocationName == 'HVACBaseAirHandler') {
            this.ambientSound.volume = 0.1;
        }
    }
}

new HVACVLabBase({
    name: "HVAC VLab Base"
});
