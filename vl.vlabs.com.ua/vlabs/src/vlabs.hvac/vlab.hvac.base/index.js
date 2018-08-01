import * as THREE                   from 'three';

import VlabHVACBaseHeatPump         from './vlabHVACBaseHeatPump';
import VlabHVACBaseAirHandler       from './vlabHVACBaseAirHandler';
import VLabLocator                  from '../../vlabs.core/vlab-locator';
import Settings                     from '../../vlabs.core/settings';
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
            locationChanged: this.locationChanged,
            locationInitialized: this.locationInitialized,
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
        this.locations["HVACBaseHeatPump"]      = undefined;
        // this.locations["HVACBaseAirHandler"]    = undefined;
        this.locations["HVACBaseAirHandler"] = new this.locationInitObjs["HVACBaseAirHandler"].class(this.locationInitObjs["HVACBaseAirHandler"]);


        this.settings = new Settings({
            context: this,
            vLabLocator: this.vLabLocator,
            content: {
                groups: [
                    {
                        title: 'General Settings',
                        items: [
                            {
                                label: 'Resolution',
                                innerHTML: '<input type="range" min="15" max="100" value="100" class="slider" id="SettingsResolutionSlider">'
                            },
                            {
                                label: 'Shadows',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsShadowsCheckbox"><span class="toggleSlider round"></span></label>'
                            }
                        ]
                    },
                    {
                        title: 'Indoor Location Settings',
                        items: [
                            {
                                label: 'Airflow from ceiling ventilation grids',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsCeilingVentGridsCheckbox"><span class="toggleSlider round"></span></label>'
                            },
                            {
                                label: 'Air Handler ambient air flow',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsAirHandlerAirFlowCheckbox"><span class="toggleSlider round"></span></label>'
                            },
                            {
                                label: 'Look through Air Handler service panels',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsAirHandlerLookThroughPanelsCheckbox"><span class="toggleSlider round"></span></label>'
                            },
                            {
                                label: 'Look through Air Handler duct',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsAirHandlerLookThroughDuctCheckbox"><span class="toggleSlider round"></span></label>'
                            }
                        ]
                    },
                    {
                        title: 'Outdoor Location Settings',
                        items: [
                            {
                                label: 'Heat Pump ambient air flow',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsHeatPumpAirFlowCheckbox"><span class="toggleSlider round"></span></label>'
                            },
                            {
                                label: 'Heat Pump refrigerant',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsHeatPumpRefrigerantCheckbox"><span class="toggleSlider round"></span></label>'
                            },
                            {
                                label: 'Heat Pump refrigerant flow direction animation',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsHeatPumpRefrigerantFlowAnimationCheckbox"><span class="toggleSlider round"></span></label>'
                            },
                        ]
                    },
                ]
            },
            onClosed: this.settingsClosed
        });


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

    locationInitialized(initObj) {
        // console.log(initObj.location);
        this.settings.showButton();
        this.tablet.showButton();
    }

    settingsClosed() {
        var SettingsResolutionSlider = document.getElementById('SettingsResolutionSlider');
        var SettingsShadowsCheckbox = document.getElementById('SettingsShadowsCheckbox');
        var SettingsCeilingVentGridsCheckbox = document.getElementById('SettingsCeilingVentGridsCheckbox');
        var SettingsAirHandlerAirFlowCheckbox = document.getElementById('SettingsAirHandlerAirFlowCheckbox');
        var SettingsHeatPumpAirFlowCheckbox = document.getElementById('SettingsHeatPumpAirFlowCheckbox');
        var SettingsHeatPumpRefrigerantCheckbox = document.getElementById('SettingsHeatPumpRefrigerantCheckbox');
        var SettingsHeatPumpRefrigerantFlowAnimationCheckbox = document.getElementById('SettingsHeatPumpRefrigerantFlowAnimationCheckbox');
        var SettingsAirHandlerLookThroughPanelsCheckbox = document.getElementById('SettingsAirHandlerLookThroughPanelsCheckbox');
        var SettingsAirHandlerLookThroughDuctCheckbox = document.getElementById('SettingsAirHandlerLookThroughDuctCheckbox');

        for (var locationName in this.locationInitObjs) {
            if (this.vLabLocator.locations[locationName] !== undefined) {
                /* General Settings -> Resolution */
                this.vLabLocator.locations[locationName].nature.resolutionFactor = (SettingsResolutionSlider.value / 100.0).toFixed(2);
                this.vLabLocator.locations[locationName].resiezeWebGLContainer();
                /* General Settings -> Shadows */
                this.vLabLocator.locations[locationName].nature.useShadows = SettingsShadowsCheckbox.checked;
                if (this.vLabLocator.locations[locationName].shadowsSetup !== undefined) {
                    this.vLabLocator.locations[locationName].shadowsSetup();
                }
                /* Indoor (Air Handler) Location Settings -> Ceiling ventilation grids airflow */
                if (locationName == 'HVACBaseAirHandler') {
                    this.vLabLocator.locations['HVACBaseAirHandler'].nature.ceelingAirVentFlow = SettingsCeilingVentGridsCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseAirHandler'].toggleCeilingVentGridsAirFlow();

                    this.vLabLocator.locations['HVACBaseAirHandler'].nature.airHandlerAirFlow = SettingsAirHandlerAirFlowCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseAirHandler'].toggleAirHandlerAirFlow();

                    this.vLabLocator.locations['HVACBaseAirHandler'].nature.airHandlerCabinetPanelsLookThrough = SettingsAirHandlerLookThroughPanelsCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseAirHandler'].toggleAirHandlerCabinetPanelsLookThrough();

                    this.vLabLocator.locations['HVACBaseAirHandler'].nature.airHandlerDuctLookThrough = SettingsAirHandlerLookThroughDuctCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseAirHandler'].toggleAirHandlerDuctLookThrough();
                }
                /* Outdoor (Heat Pump) Location Settings -> Ceiling ventilation grids airflow */
                if (locationName == 'HVACBaseHeatPump') {
                    this.vLabLocator.locations['HVACBaseHeatPump'].nature.heatPumpAirFlow = SettingsHeatPumpAirFlowCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseHeatPump'].toggleHeatPumpAirFlow();

                    this.vLabLocator.locations['HVACBaseHeatPump'].nature.refrigerantFlow1 = SettingsHeatPumpRefrigerantCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseHeatPump'].toggleRefrigerantFlow1();

                    this.vLabLocator.locations['HVACBaseHeatPump'].nature.directionalRefrigerantFlow = SettingsHeatPumpRefrigerantFlowAnimationCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseHeatPump'].toggleDirectionalRefrigerantFlow();
                }
            } else {
                this.locationInitObjs[locationName]['altNature'] = {};
                /* General Settings -> Resolution */
                this.locationInitObjs[locationName]['altNature']['resolutionFactor'] = (SettingsResolutionSlider.value / 100.0).toFixed(2);
                /* General Settings -> Shadows */
                this.locationInitObjs[locationName]['altNature']['useShadows'] = SettingsShadowsCheckbox.checked;
                /* Indoor Location Settings -> Ceiling ventilation grids airflow */
                if (locationName == 'HVACBaseAirHandler') {
                    this.locationInitObjs['HVACBaseAirHandler']['altNature']['ceelingAirVentFlow'] = SettingsCeilingVentGridsCheckbox.checked;
                    this.locationInitObjs['HVACBaseAirHandler']['altNature']['airHandlerAirFlow'] = SettingsAirHandlerAirFlowCheckbox.checked;
                    this.locationInitObjs['HVACBaseAirHandler']['altNature']['airHandlerCabinetPanelsLookThrough'] = SettingsAirHandlerLookThroughPanelsCheckbox.checked;
                    this.locationInitObjs['HVACBaseAirHandler']['altNature']['airHandlerDuctLookThrough'] = SettingsAirHandlerLookThroughDuctCheckbox.checked;
                }
                if (locationName == 'HVACBaseHeatPump') {
                    this.locationInitObjs['HVACBaseHeatPump']['altNature']['heatPumpAirFlow'] = SettingsHeatPumpAirFlowCheckbox.checked;
                    this.locationInitObjs['HVACBaseHeatPump']['altNature']['refrigerantFlow1'] = SettingsHeatPumpRefrigerantCheckbox.checked;
                    this.locationInitObjs['HVACBaseHeatPump']['altNature']['directionalRefrigerantFlow'] = SettingsHeatPumpRefrigerantFlowAnimationCheckbox.checked;
                }
            }
        }
    }
}

new HVACVLabBase({
    name: "HVAC VLab Base"
});
