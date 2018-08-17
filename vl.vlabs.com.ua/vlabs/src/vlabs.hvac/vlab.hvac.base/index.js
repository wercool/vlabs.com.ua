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

        this.activatedMode = 'off';
        this.ambientDefaultRoomTemperature = 73.0;
        this.HeatPumpACPower = true;

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
            beforeLocationChanged: this.beforeLocationChanged,
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
        // this.locations["HVACBaseAirHandler"]    = undefined;

        this.locations["HVACBaseHeatPump"]      = undefined;
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
                            },
                            {
                                label: 'Sounds',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsSoundsCheckbox" checked><span class="toggleSlider round"></span></label>'
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
                                label: 'Heat Pump refrigerant animated',
                                innerHTML: '<label class="switch"><input type="checkbox" id="SettingsHeatPumpRefrigerantAnimatedCheckbox"><span class="toggleSlider round"></span></label>'
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
                                                <li>Thermostat is located inside the apartment <br><img src="resources/assistant/img/step1_0.png" style="vertical-align: middle;"></li>\
                                                <li>Click <img src="resources/assistant/img/step1_1.png" style="vertical-align: middle;"> (yellow curved arrow)</li>\
                                                <li>Click <img src="resources/assistant/img/step1_2.png" style="vertical-align: middle;"> (magnifying glass)</li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Set up COOL MODE',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Set mode to Cool <br><img src="resources/assistant/img/step2_1.png" style="vertical-align: middle;"></li>\
                                                <li>Tap / click the thermostat screen <br><img src="resources/assistant/img/step2_2.png" style="vertical-align: middle;"></li>\
                                                <li>Select COOL TO <br><img src="resources/assistant/img/step2_3.png" style="vertical-align: middle;"></li>\
                                                <li>Set COOL TO temperature to 3° below shown indoor temperature <br><img src="resources/assistant/img/step2_4.png" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Acknowledge yourself that: \
                                            <p style="font-size: 12pt;">1) Control voltage is applied to Heat Pump Control Board from the Air Handler Control Board.</p>\
                                            <p style="font-size: 12pt;">2) Control voltage is applied to Air Handler Control Board from the Thermostat.</p> \
                                            <p style="font-size: 12pt;">3) Hight voltage is applied to Air Handler.</p>',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Exit Zoom Mode <br><img src="resources/assistant/img/step3_1.png" style="vertical-align: middle;"> (click / tap the icon)</li>\
                                                <li>Turn left <br><img src="resources/assistant/img/step3_2.png" style="vertical-align: middle;"> (press left mouse button / tap and drag left)</li>\
                                                <li>Click <img src="resources/assistant/img/step3_3.png" style="vertical-align: middle;"> (location in front of the nish door where Air Handler is installed)</li>\
                                                <li>Click left mouse button / tap the middle of the screen and drag to the bottom until door sill is visible <br><img src="resources/assistant/img/step3_4.png" style="vertical-align: middle;"></li>\
                                                <li>Open the nish door by clicking <br><img src="resources/assistant/img/step3_5.png" style="vertical-align: middle;"></li>\
                                                <li>Acknowledge applied control voltages <br><img src="resources/assistant/img/step3_6.png" style="vertical-align: middle;"></li>\
                                                <li>Be careful, high voltage is applied to the Air Handler <br><img src="resources/assistant/img/step3_7.png" style="vertical-align: middle;"></li>\
                                                <li>Close the nish door, be nice. <br><img src="resources/assistant/img/step3_8.png" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            }
                        ],
                        setModeCallBack: this.setNormalOperatonMode
                    },
                    {
                        title: 'Short to ground demo',
                        items: [
                            {
                                shortDesc: 'Approach the thermostat',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Thermostat is located inside the apartment <br><img src="resources/assistant/img/step1_0.png" style="vertical-align: middle;"></li>\
                                                <li>Click <img src="resources/assistant/img/step1_1.png" style="vertical-align: middle;"> (yellow curved arrow)</li>\
                                                <li>Click <img src="resources/assistant/img/step1_2.png" style="vertical-align: middle;"> (magnifying glass)</li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Set up COOL MODE',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Set mode to Cool <br><img src="resources/assistant/img/step2_1.png" style="vertical-align: middle;"></li>\
                                                <li>Tap / click the thermostat screen <br><img src="resources/assistant/img/step2_2.png" style="vertical-align: middle;"></li>\
                                                <li>Select COOL TO <br><img src="resources/assistant/img/step2_3.png" style="vertical-align: middle;"></li>\
                                                <li>Set COOL TO temperature to 3° below shown indoor temperature <br><img src="resources/assistant/img/step2_4.png" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Go to the outside (Heat Pump) location',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Click / tap <br><img src="resources/assistant/img/shortToGround/step_1_0.jpg" style="vertical-align: middle;"></li>\
                                                <li>At the Heat Pump (outside) location click / tap <br><img src="resources/assistant/img/shortToGround/step_1_1.jpg" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Compressor windings are shorted to ground and sparking',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Compressor windings sparking <br><img src="resources/assistant/img/shortToGround/step_1_2.jpg" style="vertical-align: middle;"></li>\
                                            </ul>',
                                started: false,
                                completed: false
                            },
                            {
                                shortDesc: 'Take off Heat Pump service panel',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Click / tap <br><img src="resources/assistant/img/shortToGround/step_1_3.jpg" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Zoom to Heat Pump compressor contactor',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Click / tap <br><img src="resources/assistant/img/shortToGround/step_1_4.jpg" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            },
                            {
                                shortDesc: 'Heat Pump contactor produces sparks during commutations when scroll compressor is shorted to ground',
                                detailDesc: '<ul style="padding-left: 20px;">\
                                                <li>Wait until indoor temperature reached Cool Setpoint</li>\
                                                <li>Contactor spark <br><img src="resources/assistant/img/shortToGround/step_1_5.jpg" style="vertical-align: middle;"></li>\
                                            </ul>',
                                completed: false
                            },
                        ],
                        setModeCallBack: this.setShortToGroundMode
                    },
                    {
                        title: 'Advanced mode',
                        items: [
                        ],
                        setModeCallBack: this.setAdvancedMode
                    }
                ]
            }
        });
    }

    beforeLocationChanged() {
        this.settings.hideButton();
        this.tablet.hideButton();
    }

    locationChanged(transientLocationName) {
        if(transientLocationName == 'HVACBaseHeatPump') {
            this.ambientSound.volume = 0.5;
        }
        if(transientLocationName == 'HVACBaseAirHandler') {
            this.ambientSound.volume = 0.1;
        }

        if (!this.settings.isActive() && !this.tablet.isActive()) {
            this.settings.showButton();
            this.tablet.showButton();
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
        var SettingsSoundsCheckbox = document.getElementById('SettingsSoundsCheckbox');
        var SettingsCeilingVentGridsCheckbox = document.getElementById('SettingsCeilingVentGridsCheckbox');
        var SettingsAirHandlerAirFlowCheckbox = document.getElementById('SettingsAirHandlerAirFlowCheckbox');
        var SettingsHeatPumpAirFlowCheckbox = document.getElementById('SettingsHeatPumpAirFlowCheckbox');
        var SettingsHeatPumpRefrigerantCheckbox = document.getElementById('SettingsHeatPumpRefrigerantCheckbox');
        var SettingsHeatPumpRefrigerantFlowAnimationCheckbox = document.getElementById('SettingsHeatPumpRefrigerantFlowAnimationCheckbox');
        var SettingsAirHandlerLookThroughPanelsCheckbox = document.getElementById('SettingsAirHandlerLookThroughPanelsCheckbox');
        var SettingsAirHandlerLookThroughDuctCheckbox = document.getElementById('SettingsAirHandlerLookThroughDuctCheckbox');
        var SettingsHeatPumpRefrigerantAnimatedCheckbox = document.getElementById('SettingsHeatPumpRefrigerantAnimatedCheckbox');

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
                /* General Settings -> Sounds */
                this.vLabLocator.locations[locationName].nature.sounds = SettingsSoundsCheckbox.checked;
                if (this.vLabLocator.locations[locationName].toggleSounds !== undefined) {
                    this.vLabLocator.locations[locationName].toggleSounds();
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

                    this.vLabLocator.locations['HVACBaseHeatPump'].nature.refrigerantFlow1Animated = SettingsHeatPumpRefrigerantAnimatedCheckbox.checked;
                    if (this.vLabLocator.locations['HVACBaseHeatPump'].nature.refrigerantFlow1Animated) {
                        this.vLabLocator.locations['HVACBaseHeatPump'].gasFlow.startAnimation();
                    } else {
                        this.vLabLocator.locations['HVACBaseHeatPump'].gasFlow.stopAnimation();
                    }

                    this.vLabLocator.locations['HVACBaseHeatPump'].nature.directionalRefrigerantFlow = SettingsHeatPumpRefrigerantFlowAnimationCheckbox.checked;
                    this.vLabLocator.locations['HVACBaseHeatPump'].toggleDirectionalRefrigerantFlow();
                }
            } else {
                this.locationInitObjs[locationName]['altNature'] = {};
                /* General Settings -> Resolution */
                this.locationInitObjs[locationName]['altNature']['resolutionFactor'] = (SettingsResolutionSlider.value / 100.0).toFixed(2);
                /* General Settings -> Shadows */
                this.locationInitObjs[locationName]['altNature']['useShadows'] = SettingsShadowsCheckbox.checked;
                /* General Settings -> Sounds */
                this.locationInitObjs[locationName]['altNature']['sounds'] = SettingsSoundsCheckbox.checked;
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
                    this.locationInitObjs['HVACBaseHeatPump']['altNature']['refrigerantFlow1Animated'] = SettingsHeatPumpRefrigerantAnimatedCheckbox.checked;
                }
            }
        }
    }

    resetProcessors() {
        if (this.normalModeOperationProcessorTimeOut) clearTimeout(this.normalModeOperationProcessorTimeOut);
        if (this.shortToGroundOperationProcessorTimeOut) clearTimeout(this.shortToGroundOperationProcessorTimeOut);
        if (this.advancedModeOperationProcessorTimeOut) clearTimeout(this.advancedModeOperationProcessorTimeOut);

    }

    resetSettingsToDefault() {
        document.getElementById('SettingsCeilingVentGridsCheckbox').checked = false;
        document.getElementById('SettingsAirHandlerAirFlowCheckbox').checked = false;
        document.getElementById('SettingsHeatPumpAirFlowCheckbox').checked = false;
        document.getElementById('SettingsHeatPumpRefrigerantCheckbox').checked = false;
        document.getElementById('SettingsHeatPumpRefrigerantFlowAnimationCheckbox').checked = false;
        document.getElementById('SettingsAirHandlerLookThroughPanelsCheckbox').checked = false;
        document.getElementById('SettingsAirHandlerLookThroughDuctCheckbox').checked = false;
        document.getElementById('SettingsHeatPumpRefrigerantAnimatedCheckbox').checked = false;
        this.settingsClosed();
    }

    setNormalOperatonMode(forced) {
        console.log('Normal Operaton Mode');

        if (forced == undefined) {
            if (document.getElementById('SettingsSoundsCheckbox').checked) {
                let audio = new Audio('./resources/assistant/snd/normal-operation-demo-activated.mp3');
                audio.play();
            }
        }

        this.resetSettingsToDefault();
        this.resetProcessors();

        this.tablet.resetTabContentItems();

        this.locationInitObjs['HVACBaseAirHandler']['altNature'] = {};
        this.locationInitObjs['HVACBaseHeatPump']['altNature'] = {};

        this.vLabLocator.activateVLabLocation('HVACBaseAirHandler', { auto: true });

        if (this.vLabLocator.locations['HVACBaseAirHandler'] !== undefined) {
            this.vLabLocator.locations['HVACBaseAirHandler'].resetNormalOperaionDefaults();
            if (this.vLabLocator.locations['HVACBaseAirHandler'].zoomMode) {
                this.vLabLocator.locations['HVACBaseAirHandler'].resetView();
            }
            this.vLabLocator.locations['HVACBaseAirHandler'].initialPosition.moveToPosition();
            this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.setDefaultState();
            if (!this.vLabLocator.locations['HVACBaseAirHandler'].nishDoorClosed) {
                this.vLabLocator.locations['HVACBaseAirHandler'].nishDoorOpenOrClose();
            }
            this.activatedMode = 'off';
            this.vLabLocator.locations['HVACBaseAirHandler'].stoptAirBlower(true);
        }
        if (this.vLabLocator.locations['HVACBaseHeatPump'] !== undefined) {
            this.vLabLocator.locations['HVACBaseHeatPump'].heatPumpFrameServicePanelTakeOutInteractor.deactivate();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetView();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetHeatPumpFrameServicePanel();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetHeatPumpFrameCap();
            this.vLabLocator.locations['HVACBaseHeatPump'].stopFanMotor();
            this.vLabLocator.locations['HVACBaseHeatPump'].stopScrollCompressor();
            this.vLabLocator.locations['HVACBaseHeatPump'].shortToGroundEffectOff();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetACDisconnect();
        }
        this.locationInitObjs['HVACBaseHeatPump']['altNature']['heatPumpFrameServicePanelTakeOutInteractor'] = false;
    }


    setShortToGroundMode() {
        console.log('Short To Ground Mode');
        if (document.getElementById('SettingsSoundsCheckbox').checked) {
            let audio = new Audio('./resources/assistant/snd/shortToGround/short-to-ground-demo-activated.mp3');
            audio.play();
        }
        this.resetSettingsToDefault();
        this.resetProcessors();

        this.tablet.resetTabContentItems();

        this.locationInitObjs['HVACBaseAirHandler']['altNature'] = {};
        this.locationInitObjs['HVACBaseHeatPump']['altNature'] = {};

        this.vLabLocator.activateVLabLocation('HVACBaseAirHandler', { auto: true });

        if (this.vLabLocator.locations['HVACBaseAirHandler'] !== undefined) {
            this.vLabLocator.locations['HVACBaseAirHandler'].resetNormalOperaionDefaults();
            if (this.vLabLocator.locations['HVACBaseAirHandler'].zoomMode) {
                this.vLabLocator.locations['HVACBaseAirHandler'].resetView();
            }
            this.vLabLocator.locations['HVACBaseAirHandler'].initialPosition.moveToPosition();
            this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.setDefaultState();
            if (!this.vLabLocator.locations['HVACBaseAirHandler'].nishDoorClosed) {
                this.vLabLocator.locations['HVACBaseAirHandler'].nishDoorOpenOrClose();
            }
            this.activatedMode = 'off';
            this.vLabLocator.locations['HVACBaseAirHandler'].stoptAirBlower(true);
        }
        if (this.vLabLocator.locations['HVACBaseHeatPump'] !== undefined) {
            this.vLabLocator.locations['HVACBaseHeatPump'].heatPumpFrameServicePanelTakeOutInteractor.deactivate();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetView();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetHeatPumpFrameServicePanel();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetHeatPumpFrameCap();
            this.vLabLocator.locations['HVACBaseHeatPump'].stopFanMotor();
            this.vLabLocator.locations['HVACBaseHeatPump'].stopScrollCompressor();
            this.vLabLocator.locations['HVACBaseHeatPump'].shortToGroundEffectOff();
            this.vLabLocator.locations['HVACBaseHeatPump'].resetACDisconnect();
        }
        this.locationInitObjs['HVACBaseHeatPump']['altNature']['heatPumpFrameServicePanelTakeOutInteractor'] = false;
    }

    setAdvancedMode() {
        if (document.getElementById('SettingsSoundsCheckbox').checked) {
            let audio = new Audio('./resources/assistant/snd/advanced-mode-activated.mp3');
            audio.play();
        }
        this.setNormalOperatonMode(true);
        if (this.vLabLocator.locations['HVACBaseHeatPump'] !== undefined) {
            this.vLabLocator.locations['HVACBaseHeatPump'].heatPumpFrameServicePanelTakeOutInteractor.activate();
        } else {
            this.locationInitObjs['HVACBaseHeatPump']['altNature']['heatPumpFrameServicePanelTakeOutInteractor'] = true;
        }
    }

    normalModeOperationProcessor() {
        var roomTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
            tempId: 'roomTemperature',
            format: 'F'
        });
        var coolToTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
            tempId: 'coolToTemperature',
            format: 'F'
        });
        if (roomTemperature < coolToTemperature) {
            if (this.normalModeOperationProcessorTimeOut) clearTimeout(this.normalModeOperationProcessorTimeOut);
            console.log('Preset "cool to" temperature is reached. Normal operation demo is completed.');
            if (document.getElementById('SettingsSoundsCheckbox').checked) {
                let audio = new Audio('./resources/assistant/snd/normal-operation-demo-completed.mp3');
                audio.play();
            }
            this.normalModeOperationProcessorTimeOut = setTimeout(this.setNormalOperatonMode.bind(this), 8000);
        } else {
            this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.curState['roomTemperature'] -= 0.1;
            this.normalModeOperationProcessorTimeOut = setTimeout(this.normalModeOperationProcessor.bind(this), 5000);
        }
    }

    shortToGroundOperationProcessor() {
        if (this.tablet.initObj.content.tabs[1].items[3].started == true) {
            this.tablet.initObj.content.tabs[1].items[3].started = false;
            this.tablet.initObj.content.tabs[1].items[3].completed = true;
            this.vLabLocator.locations['HVACBaseHeatPump'].bryantB225B_heatPumpCompressorZoomHelper.reset();
            this.vLabLocator.locations['HVACBaseHeatPump'].shortToGroundEffectOff();
            this.tablet.stepCompletedAnimation();
            this.vLabLocator.locations['HVACBaseHeatPump'].heatPumpFrameServicePanelTakeOutInteractor.activate();
        }
        if (this.tablet.initObj.content.tabs[1].items[2].completed === true) {
            if (this.tablet.initObj.content.tabs[1].items[3].completed === false) {
                let finalTarget = this.vLabLocator.locations['HVACBaseHeatPump'].vLabScene.getObjectByName('scrollCompressorZP25K5EStatorDamagedWires').position.clone();
                finalTarget.x += 0.05;
                finalTarget.z += 0.05;
                this.vLabLocator.locations['HVACBaseHeatPump'].bryantB225B_heatPumpCompressorZoomHelper.activate({
                    finalTarget: finalTarget,
                    backFromViewButtonHidden: true
                });
                clearTimeout(this.shortToGroundOperationProcessorTimeOut);
                var self = this;
                setTimeout(() => {
                    self.tablet.initObj.content.tabs[1].items[3].started = true;
                    self.vLabLocator.locations['HVACBaseHeatPump'].shortToGroundEffectOn();
                    self.shortToGroundOperationProcessorTimeOut = setTimeout(self.shortToGroundOperationProcessor.bind(self), 7000);
                }, 750);
                return;
            }
        }
        var roomTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
            tempId: 'roomTemperature',
            format: 'F'
        });
        var coolToTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
            tempId: 'coolToTemperature',
            format: 'F'
        });
        if (roomTemperature < coolToTemperature) {
            if (this.shortToGroundOperationProcessorTimeOut) clearTimeout(this.shortToGroundOperationProcessorTimeOut);
            console.log('Preset "cool to" temperature is reached. Short To Ground demo is completed.');
            if (document.getElementById('SettingsSoundsCheckbox').checked) {
                let audio = new Audio('./resources/assistant/snd/shortToGround/short-to-ground-demo-completed.mp3');
                audio.play();
            }
            this.shortToGroundOperationProcessorTimeOut = setTimeout(this.setShortToGroundMode.bind(this), 8000);
        } else {
            this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.curState['roomTemperature'] -= 0.1;
            this.shortToGroundOperationProcessorTimeOut = setTimeout(this.shortToGroundOperationProcessor.bind(this), 5000);
        }
    }

    advancedModeOperationProcessor() {
        var roomTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
            tempId: 'roomTemperature',
            format: 'F'
        });
        var coolToTemperature = this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.getTemperature({
            tempId: 'coolToTemperature',
            format: 'F'
        });
// console.log('advancedModeOperationProcessor', this.activatedMode, roomTemperature.toFixed(2), this.ambientDefaultRoomTemperature.toFixed(2));
// console.log('this.HeatPumpACPower', this.HeatPumpACPower);
        if (roomTemperature < coolToTemperature && this.activatedMode == 'cool' && this.HeatPumpACPower == true) {
            console.log('Preset "cool to" temperature is reached.');

            this.activatedMode = 'cool-suspend';
            this.vLabLocator.locations['HVACBaseAirHandler'].stoptAirBlower(true);
            if (this.vLabLocator.currentLocationVLab == this.vLabLocator.locations['HVACBaseAirHandler']) {
                this.vLabLocator.locations['HVACBaseAirHandler'].onVLabResumeAndShow();
            }
            if (this.vLabLocator.locations['HVACBaseHeatPump'] !== undefined) {
                this.vLabLocator.locations['HVACBaseHeatPump'].shortToGroundEffectOff();
                if (this.vLabLocator.currentLocationVLab == this.vLabLocator.locations['HVACBaseHeatPump']) {
                    this.vLabLocator.locations['HVACBaseHeatPump'].stopFanMotor();
                    this.vLabLocator.locations['HVACBaseHeatPump'].stopScrollCompressor(true);
                    this.vLabLocator.locations['HVACBaseHeatPump'].onVLabResumeAndShow();
                } else {
                    this.vLabLocator.locations['HVACBaseHeatPump'].fanMotorStarted = false;
                    this.vLabLocator.locations['HVACBaseHeatPump'].scrollCompressorStarted = false;
                }
            }
            this.advancedModeOperationProcessorTimeOut = setTimeout(this.advancedModeOperationProcessor.bind(this), 5000);
        } else {
            if (this.HeatPumpACPower) {
                if (this.activatedMode == 'cool') {
                    this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.curState['roomTemperature'] -= 0.1;
                } else {
                    if (roomTemperature < this.ambientDefaultRoomTemperature) {
                        this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.curState['roomTemperature'] += 0.1;
                    } else {
                        this.activatedMode = 'cool';
                        if (this.vLabLocator.currentLocationVLab == this.vLabLocator.locations['HVACBaseAirHandler']) {
                            this.vLabLocator.locations['HVACBaseAirHandler'].startAirBlower();
                        } else {
                            this.vLabLocator.locations['HVACBaseAirHandler'].airBlowerStarted = true;
                            if (this.vLabLocator.locations['HVACBaseHeatPump'] !== undefined) {
                                this.vLabLocator.locations['HVACBaseHeatPump'].onVLabResumeAndShow({
                                    autoResume: true
                                });
                            }
                        }
                    }
                }
            } else {
                if (roomTemperature < this.ambientDefaultRoomTemperature) {
                    this.vLabLocator.locations['HVACBaseAirHandler'].carrierTPWEM01.curState['roomTemperature'] += 0.1;
                }
                if (this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.color.b > 0.0) {
                    this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.color = new THREE.Color(this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.color.r + 0.1, 0.0, this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.color.b - 0.1);
                    if (this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.opacity > 0.2) {
                        this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.opacity -= 0.1;
                    }
                    this.vLabLocator.locations['HVACBaseAirHandler'].airHandlerAirFlow.material.needsUpdate = true;
                }
                if (this.vLabLocator.locations['HVACBaseAirHandler'].ceelingAirVentFlow.material.color.b > 0.0) {
                    this.vLabLocator.locations['HVACBaseAirHandler'].ceelingAirVentFlow.material.color = new THREE.Color(this.vLabLocator.locations['HVACBaseAirHandler'].ceelingAirVentFlow.material.color.r + 0.1, 0.0, this.vLabLocator.locations['HVACBaseAirHandler'].ceelingAirVentFlow.material.color.b - 0.1);
                    if (this.vLabLocator.locations['HVACBaseAirHandler'].ceelingAirVentFlow.material.opacity > 0.2) {
                        this.vLabLocator.locations['HVACBaseAirHandler'].ceelingAirVentFlow.material.opacity -= 0.1;
                    }
                    this.vLabLocator.locations['HVACBaseAirHandler'].ceelingAirVentFlow.material.needsUpdate = true;
                }
            }
            this.advancedModeOperationProcessorTimeOut = setTimeout(this.advancedModeOperationProcessor.bind(this), 5000);
        }
    }
}

new HVACVLabBase({
    name: "HVAC VLab Base"
});
