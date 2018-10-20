import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';
import VLab                 from '../../vlabs.core/vlab';
import Inventory            from '../../vlabs.core/inventory';
import deepmerge            from 'deepmerge'
import ExtrudedPath         from '../../vlabs.items/extruded-path';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');
var WebFont                 = require('webfontloader');


export default class TrueRMSMultimeterHS36 {
/*
initObj {
    "context": VLab,
    "initPos": THREE.Vector3,
    "name": optional name
}
*/
    constructor(initObj) {
        this.initObj = initObj;
        this.context = initObj.context;

        this.name = this.initObj.name;

        this.initObj.standAloneMode = true;

        this.attachedToMesh = undefined;

        this.interactiveElements = [];
        this.interactiveSuppressElements = [];
        this.accessableInteractiveELements = [];

        this.continutiyResitanceThershold = 5.0;
        this.continutiyBeep = false;

        var textureLoader = new THREE.TextureLoader();

        return new Promise((resolve, reject) => {
            Promise.all([
                textureLoader.load('../vlabs.items/trueRMSMultimeterHS36/sprites/probe.png'),
                textureLoader.load('../vlabs.items/trueRMSMultimeterHS36/sprites/rotate-left.png'),
                textureLoader.load('../vlabs.items/trueRMSMultimeterHS36/sprites/rotate-right.png'),
                textureLoader.load('../vlabs.items/trueRMSMultimeterHS36/sprites/hv-splash.png'),
                textureLoader.load('../vlabs.items/trueRMSMultimeterHS36/sprites/beep-splash.png'),
            ])
            .then((result) => {
                this.probeSpriteTexture = result[0];
    
                this.probeSpriteMaterial = new THREE.SpriteMaterial({
                    map: this.probeSpriteTexture,
                    color: 0xffffff,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 1.0,
                    rotation: 0.0,
                    depthTest: true,
                    depthWrite: true
                });

                this.rotateLeftSpriteTexture = result[1];
                this.rotateLeftSpriteMaterial = new THREE.SpriteMaterial({
                    map: this.rotateLeftSpriteTexture,
                    color: 0xffffff,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.75,
                    rotation: 0.0,
                    depthTest: true,
                    depthWrite: true
                });
                this.rotateRightSpriteTexture = result[2];
                this.rotateRightSpriteMaterial = new THREE.SpriteMaterial({
                    map: this.rotateRightSpriteTexture,
                    color: 0xffffff,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.75,
                    rotation: 0.0,
                    depthTest: true,
                    depthWrite: true
                });

                this.hvSplashSpriteTexture = result[3];
                this.hvSplashSpriteMaterial = new THREE.SpriteMaterial({
                    map: this.hvSplashSpriteTexture,
                    color: 0xffffff,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.75,
                    rotation: 0.0,
                    depthTest: false,
                    depthWrite: false
                });

                this.beepSplashSpriteTexture = result[4];
                this.beepSplashSpriteMaterial = new THREE.SpriteMaterial({
                    map: this.beepSplashSpriteTexture,
                    color: 0xffffff,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.75,
                    rotation: 0.0,
                    depthTest: false,
                    depthWrite: false
                });

                WebFont.load({
                    custom: {
                      families: ['DigitalFont'],
                      urls: ['../vlabs.items/trueRMSMultimeterHS36/assets/styles.css']
                    }
                });

                this.initialize().then(() => {
                    resolve(this);
                });
            });
        });
    }

    initialize() {
        var self = this;
        return new Promise((resolve, reject) => {
            this.context.loadVLabItem("../vlabs.items/trueRMSMultimeterHS36/trueRMSMultimeterHS36.json", "TrueRMSMultimeterHS36").then((loadedScene) => {
                this.model = loadedScene.children[0];
                if (this.initObj.name) {
                    this.model.name = this.initObj.name;
                }

                this.initialModelQuaternion = this.model.quaternion.clone();

                if (this.context.nature.objectMenus) {
                    this.context.nature.objectMenus[this.model.name] = {
                        "en": [{
                                "title": "Pick",
                                "icon": "fa fa-hand-rock",
                                "click": "takeObject",
                                "args": { 
                                    "resetscale": true,
                                    "resetquat": this.initialModelQuaternion,
                                    "callback": this.takenHandler
                                }
                            }, {
                                "title": "To Inventory",
                                "icon": "toolboxMenuIcon",
                                "click": "takeObjectToInventory",
                                "args": { 
                                    "resetscale": true,
                                    "resetquat": this.initialModelQuaternion,
                                    "callback": this.takenToInventory
                                }
                            }, {
                            "title": "Info",
                            "icon": ["fa fa-info"],
                            "click": "showInfo",
                            "args": {   "title": "True RMS Multimeter HS36",
                                        "html": ' \
                                            <div style="color: white;"> \
                                                <b>Expandable True RMS Stick Multimeter with Backlight - Designed for HVACR Field Service - HS36</b> \
                                                <br/> \
                                                Our top of the line Stick Meter, the HS36 includes the ranges you use everyday for HVACR field service plus includes a bright blue backlight and True RMS. Like the rest of the HS30 series, the HS36 comes equipped with a magnetic hanger, along with detachable silicone test leads and alligator clip probe tips for remote and easy one-handed testing, as well as the full set of built-in safety features.  This auto-ranging stick meter also includes a bar graph on the LCD for an analog feel. Technicians who prefer our expandable stick meters tell us this is the best digital multimeter for HVACR field service. \
                                                <br/> \
                                                The HS meter series is unlike any other found in HVACR. We incorporate a number of safety features, both those you can and can’t see, into our meters.  In addition, the HS series accepts modular test instrument accessory heads, so you have more testing capabilities without buying a lot of expensive instruments.  And it\'s packed with the features HVACR technicians need: <br>\
                                                Non-contact Voltage <br/>\
                                                High Voltage and Continuity Indicators <br/>\
                                                Microamps <br/>\
                                                Capacitance <br/>\
                                                MIN/MAX <br/>\
                                                Temperature <br/>\
                                                Silicone Leads with Detachable Probe Tips <br/>\
                                                Rugged ABS case with rubberized bumpers <br/>\
                                                Built-in magnetic hanger allows you to test with one hand or no-hands <br/>\
                                                Built-in lead storage <br/>\
                                                Ergonomic shape fits naturally in your hand <br/>\
                                                Auto power-off (APO) to conserve battery life <br/>\
                                        '}
                            }, {
                            "disabled": true
                            }, {
                            "disabled": true
                            }, {
                            "disabled": true
                            }],
                    };
                }


                this.trueRMSMultimeterHS36 = {
                    'switch': {
                        curPos: 0,
                        altPos: [
                            { title: 'OFF',         angle: 0.0 },
                            { title: 'Continuity',  angle: -30.0 },
                            { title: 'VAuto',       angle: -60.0 },
                            { title: 'V4000m',      angle: -90.0 },
                            { title: 'V400m',       angle: -120.0 },
                            { title: '400MFD',      angle: -150.0 },
                            { title: 'T1000',       angle: -180.0 },
                            { title: 'T400',        angle: -210.0 },
                            { title: 'uADC',        angle: -240.0 },
                            { title: 'R',           angle: -270.0 },
                            { title: 'Hz',          angle: -300.0 },
                            { title: 'VADC',        angle: -330.0 },
                        ]
                    },
                    'backLight': false
                };

                this.probesElectricConditions = {};


                this.probes = {
                    redProbe:               this.model.getObjectByName('trueRMSMultimeterHS36ProbeRed'),
                    redPlug:                this.model.getObjectByName('trueRMSMultimeterHS36ProbeRedMale'),
                    redNeedle:              this.model.getObjectByName('trueRMSMultimeterHS36ProbeRedNeedle'),
                    blackProbe:             this.model.getObjectByName('trueRMSMultimeterHS36ProbeBlack'),
                    blackPlug:              this.model.getObjectByName('trueRMSMultimeterHS36ProbeBlackMale'),
                    blackNeedle:            this.model.getObjectByName('trueRMSMultimeterHS36ProbeBlackNeedle'),
                    defaultRedWire:         this.model.getObjectByName('trueRMSMultimeterHS36RedWire'),
                    defaultBlackWire:       this.model.getObjectByName('trueRMSMultimeterHS36BlackWire'),
                    redNeedleInitialPos:    this.model.getObjectByName('trueRMSMultimeterHS36ProbeRedNeedle').position.clone(),
                    blackNeedleInitialPos:  this.model.getObjectByName('trueRMSMultimeterHS36ProbeBlackNeedle').position.clone(),
                    initialRedProbe:        {},
                    initialBlackProbe:      {},
                };

                this.probes.redProbe.userData['needle'] = this.probes.redNeedle;
                this.probes.blackProbe.userData['needle'] = this.probes.blackNeedle;

                this.probes.redProbe.userData['testPoint'] = undefined;
                this.probes.blackProbe.userData['testPoint'] = undefined;

                // Sounds
                this.trueRMSMultimeterHS36SwitchSound = new THREE.Audio(this.context.defaultAudioListener);

                var audioLoader = new THREE.AudioLoader();
                audioLoader.load('../vlabs.items/trueRMSMultimeterHS36/sounds/switch.mp3', function(buffer) {
                    self.trueRMSMultimeterHS36SwitchSound.setBuffer(buffer);
                    self.trueRMSMultimeterHS36SwitchSound.setVolume(1.0);
                });

                this.beepSound = new THREE.Audio(this.context.defaultAudioListener);
                audioLoader.load('../vlabs.items/trueRMSMultimeterHS36/sounds/beep.mp3', function(buffer) {
                    self.beepSound.setBuffer(buffer);
                    self.beepSound.setVolume(1.0);
                });

                this.ncvSound = new THREE.Audio(this.context.defaultAudioListener);
                audioLoader.load('../vlabs.items/trueRMSMultimeterHS36/sounds/ncv.mp3', function(buffer) {
                    self.ncvSound.setBuffer(buffer);
                    self.ncvSound.setVolume(0.25);
                    self.ncvSound.setLoop(true);
                });

                this.model.mousePressHandler = this.modelPressed;
                this.interactiveElements.push(this.model);

                this.probes.redProbe.mousePressHandler = this.probePressed;
                this.interactiveElements.push(this.probes.redProbe);
                this.probes.blackProbe.mousePressHandler = this.probePressed;
                this.interactiveElements.push(this.probes.blackProbe);

                this.trueRMSMultimeterHS36Screen = this.model.getObjectByName('trueRMSMultimeterHS36Screen');
                this.screenMaterial = this.trueRMSMultimeterHS36Screen.material;
                this.screenMaterialTextureImage = this.screenMaterial.map.image;
                this.screenMaterial.map.needsUpdate = true;
                this.screenMaterial.map.wrapS = this.trueRMSMultimeterHS36Screen.material.map.wrapT = THREE.RepeatWrapping; 
                this.screenMaterial.map.repeat.set(1, 1);

                this.screenCanvas = document.createElement('canvas');
                this.screenCanvas.id = 'trueRMSMultimeterHS36ScreenCanvas';
                this.screenCanvas.height = 512;
                this.screenCanvas.width = 512;
                this.screenCanvas.style.display = 'none';
                document.body.appendChild(this.screenCanvas);
                this.screenCanvasContext = this.screenCanvas.getContext('2d');

                this.switch = this.model.getObjectByName('trueRMSMultimeterHS36Switch');
                this.switch.mousePressHandler = this.switchPressed;
                this.interactiveElements.push(this.switch);

                this.rotateLeftHelperSprite = new THREE.Sprite(this.rotateLeftSpriteMaterial);
                this.rotateLeftHelperSprite.name = this.switch.name + '_RotateLeftHelperSprite';
                this.rotateLeftHelperSprite.scale.multiplyScalar(0.02);
                this.rotateLeftHelperSprite.position.add(new THREE.Vector3(-0.015, -0.125, 0.02));
                this.rotateLeftHelperSprite.mousePressHandler = function(rotateLeftHelperSprite) {
                    this.changeSwitchState(true);
                };
                this.model.add(this.rotateLeftHelperSprite);
                this.interactiveElements.push(this.rotateLeftHelperSprite);
                this.rotateLeftHelperSprite.visible = false;

                this.rotateRightHelperSprite = new THREE.Sprite(this.rotateRightSpriteMaterial);
                this.rotateRightHelperSprite.name = this.switch.name + '_RotateRightHelperSprite';
                this.rotateRightHelperSprite.scale.multiplyScalar(0.02);
                this.rotateRightHelperSprite.position.add(new THREE.Vector3(0.015, -0.125, 0.02));
                this.rotateRightHelperSprite.mousePressHandler = function(rotateRightHelperSprite) {
                    this.changeSwitchState(false);
                };
                this.model.add(this.rotateRightHelperSprite);
                this.interactiveElements.push(this.rotateRightHelperSprite);
                this.rotateRightHelperSprite.visible = false;

                this.trueRMSMultimeterHS36HiVLightBulb = this.model.getObjectByName('trueRMSMultimeterHS36HiVLightBulb');
                this.hvSplashSprite = new THREE.Sprite(this.hvSplashSpriteMaterial);
                this.hvSplashSprite.name = this.switch.name + '_HVSplachSprite';
                this.hvSplashSprite.scale.multiplyScalar(0.025);
                this.hvSplashSprite.position.add(new THREE.Vector3(0.0, 0.0, 0.0));
                this.trueRMSMultimeterHS36HiVLightBulb.add(this.hvSplashSprite);
                this.hvSplashSprite.visible = false;

                this.trueRMSMultimeterHS36ContinuityLightBulb = this.model.getObjectByName('trueRMSMultimeterHS36ContinuityLightBulb');
                this.beepSplashSprite = new THREE.Sprite(this.beepSplashSpriteMaterial);
                this.beepSplashSprite.name = this.switch.name + '_BeepSplachSprite';
                this.beepSplashSprite.scale.multiplyScalar(0.025);
                this.beepSplashSprite.position.add(new THREE.Vector3(0.0, 0.0, 0.0));
                this.trueRMSMultimeterHS36ContinuityLightBulb.add(this.beepSplashSprite);
                this.beepSplashSprite.visible = false;

                this.trueRMSMultimeterHS36NCVLightBulb = this.model.getObjectByName('trueRMSMultimeterHS36NCVLightBulb');
                this.NCVSplashSprite = new THREE.Sprite(this.hvSplashSpriteMaterial);
                this.NCVSplashSprite.name = this.switch.name + '_NCVSplashSprite';
                this.NCVSplashSprite.scale.multiplyScalar(0.025);
                this.NCVSplashSprite.position.add(new THREE.Vector3(0.0, 0.0, 0.0));
                this.trueRMSMultimeterHS36NCVLightBulb.add(this.NCVSplashSprite);
                this.NCVSplashSprite.visible = false;


                this.trueRMSMultimeterHS36LightButton = this.model.getObjectByName('trueRMSMultimeterHS36LightButton');
                this.trueRMSMultimeterHS36LightButton.mousePressHandler = function(){
                    this.trueRMSMultimeterHS36LightButton.translateZ(-0.05);
                    setTimeout(()=>{ this.trueRMSMultimeterHS36LightButton.translateZ(0.05); }, 250);
                    if (this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].title == 'OFF') return;
                    if (this.trueRMSMultimeterHS36['backLight']) {
                        this.screenMaterial.map.offset.y = 0.0;
                        this.screenMaterial.emissive = new THREE.Color(0.0, 0.0, 0.0);
                        this.trueRMSMultimeterHS36['backLight'] = false;
                    } else {
                        if (this.continutiyBeep == false) this.beepSound.play();
                        this.trueRMSMultimeterHS36ContinuityLightBulb.material.emissive = new THREE.Color(0.0, 1.0, 0.0);
                        this.beepSplashSprite.visible = true;
                        setTimeout(()=>{
                            self.trueRMSMultimeterHS36ContinuityLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
                            self.beepSplashSprite.visible = false;
                            if (this.continutiyBeep == false) self.beepSound.stop();
                        }, 300);
                        this.screenMaterial.map.offset.y = -0.335;
                        this.screenMaterial.emissive = new THREE.Color(0.21, 0.57, 1.0);
                        this.trueRMSMultimeterHS36['backLight'] = true;
                    }
                    this.refreshScreen();
                };
                this.interactiveElements.push(this.trueRMSMultimeterHS36LightButton);


                this.trueRMSMultimeterHS36NCVButton = this.model.getObjectByName('trueRMSMultimeterHS36NCVButton');
                this.trueRMSMultimeterHS36NCVButton.userData['pressed'] = false;
                this.trueRMSMultimeterHS36NCVButton.mousePressHandler = function(){
                    if (!this.trueRMSMultimeterHS36NCVButton.userData['pressed']) {
                        this.trueRMSMultimeterHS36NCVButton.translateZ(-0.001);
                        this.trueRMSMultimeterHS36NCVButton.userData['pressed'] = true;
                    } else {
                        this.trueRMSMultimeterHS36NCVButton.translateZ(0.001);
                        this.trueRMSMultimeterHS36NCVButton.userData['pressed'] = false;
                    }
                    this.NCVProcessor();
                };
                this.interactiveElements.push(this.trueRMSMultimeterHS36NCVButton);


                this.accessableInteractiveELements = this.interactiveElements.concat(this.interactiveSuppressElements);
                this.addVLabEventListeners();

                if (this.initObj.inventory) {
                    this.initObj.inventory.addItem({
                        item: this.model,
                        initObj: this.initObj,
                        vLabItem: this
                    });
                    console.log("TrueRMSMultimeterHS36 added to Inventory");
                } else {
                    this.activate();
                }

                this.initProbes();


                if (this.initObj.devMode) {
                    this.model_manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
                    this.model_manipulationControl.setSize(0.5);
                    this.context.vLabScene.add(this.model_manipulationControl);
                    this.model_manipulationControl.attach(this.model);
                    this.model_manipulationControl.setRotationSnap(THREE.Math.degToRad(1.0));

                    document.addEventListener("keydown", (event)=>{
                        switch (event.keyCode) {
                            case 77: // m
                                if (this.model_manipulationControl.getMode() === 'translate') {
                                    this.model_manipulationControl.setMode('rotate');
                                } else {
                                    this.model_manipulationControl.setMode('translate');
                                }
                            break;
                            case 13: // Enter
                                console.log('TrueRMSMultimeterHS36');
                                console.log('position (m): ' + this.model.position.x.toFixed(3) + ', ' + this.model.position.y.toFixed(3) + ', ' + this.model.position.z.toFixed(3));
                                console.log('rotation (d): ' + THREE.Math.radToDeg(this.model.rotation.x).toFixed(3) + ', ' + THREE.Math.radToDeg(this.model.rotation.y).toFixed(3) + ', ' + THREE.Math.radToDeg(this.model.rotation.z).toFixed(3));
                            break;

                        }
                    }, false);
                }

                resolve(this);

            }).catch(error => {
                console.error(error);
            });
        });
    }

    activate(activationObj = {}) {

        if (activationObj.attachedToMesh !== undefined) {
            this.attachedToMesh = activationObj.attachedToMesh;
        } else {
            return;
        }

        if (this.initObj.pos) {
            this.model.position.copy(this.initObj.pos);
        }
        if (this.initObj.rotation) {
            this.model.rotation.set(this.initObj.rotation.x, this.initObj.rotation.y, this.initObj.rotation.z);
        }
        if (this.initObj.scale) {
            this.model.scale.set(this.initObj.scale, this.initObj.scale, this.initObj.scale);
        }

        if (activationObj.pos) {
            this.model.position.copy(activationObj.pos);
        }
        if (activationObj.rot) {
            this.model.rotation.set(activationObj.rot.x, activationObj.rot.y, activationObj.rot.z);
        }

        if (this.initObj.standAloneMode) {
            this.context.vLabScene.add(this.model);
        } else {
            this.context.defaultCamera.add(this.model);
        }

        this.probes.defaultRedWire.visible = false;
        this.probes.defaultBlackWire.visible = false;

        this.activated = true;

        if (this.refreshScreenInterval !== undefined) clearInterval(this.refreshScreenInterval);
        if (this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].title !== 'OFF') {
            this.refreshScreenInterval = setInterval(this.setProbesElectricConditions.bind(this), 500);
        }
    }

    addVLabEventListeners() {
        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.mouseup[this.name + "vLabSceneMouseUp"] = 
        {
            callback: this.onVLabSceneMouseUp,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchend[this.name + "vLabSceneTouchEnd"] = 
        {
            callback: this.onVLabSceneTouchEnd,
            instance: this
        };
    }

    deleteVLabEventListeners() {
        //VLab events subscribers
        delete this.context.webGLContainerEventsSubcribers.mouseup[this.name + "vLabSceneMouseUp"];
        delete this.context.webGLContainerEventsSubcribers.touchend[this.name + "vLabSceneTouchEnd"]
        delete this.context.webGLContainerEventsSubcribers.renderframe[this.name + "vLabSceneRenderFrame"];
        delete this.context.webGLContainerEventsSubcribers.resetview[this.name + "vLabSceneResetView"];
        this.context.cursorPointerControlFromVLabItem = false;
    }

    onVLabSceneTouchEnd(evnet) {
        this.onVLabSceneMouseUp(event);
    }

    onVLabSceneMouseUp(event) {
        if (!this.activated) return;
        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);
        // var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(this.accessableInteractiveELements);

        if (interactionObjectIntersects.length > 0) {
            if (interactionObjectIntersects[0].object.userData['TrueRMSMultimeterHS36'] && interactionObjectIntersects[0].object == this.attachedToMesh) {
                this.showTestPointsHelpers(interactionObjectIntersects[0].object);
            }
            if (interactionObjectIntersects[0].object.name.indexOf('trueRMSMultimeterHS36') > -1) {
                if (interactionObjectIntersects[0].object.mousePressHandler) {
                    interactionObjectIntersects[0].object.mousePressHandler.call(this, interactionObjectIntersects[0].object);
                    event.stopPropagation();
                    return;
                }
            }
            if (this.context.interactivesSuppressorsObjects.indexOf(interactionObjectIntersects[0].object) > -1) {
                this.probePressed();
                event.stopPropagation();
            }
        } else {
            this.probePressed();
        }
    }

    takenToInventory() {
        if (this === undefined) return;
        this.activated = false;
        this.reset();
        this.context.resetAllSelections();
        this.context.defaultCameraControls.resetState();
    }

    takenHandler() {
        this.activated = false;
        this.reset();
        this.context.defaultCameraControls.resetState();
        this.context.nature.interactiveObjects.push(this.model.name);
        this.context.setInteractiveObjects();
    }

    reset() {
        this.model.getObjectByName('trueRMSMultimeterHS36Clamp').rotation.x = 0.0;
        this.resetProbes();
    }

    addResponsiveObject(responsiveObj) {
        responsiveObj.mesh.userData['TrueRMSMultimeterHS36'] = responsiveObj.testPoints;
        this.interactiveElements.push(responsiveObj.mesh);

        var lineMaterial = new THREE.LineDashedMaterial( {
            color: 0xffffff,
            dashSize: 0.002,
            gapSize:  0.001,
            transparent: true,
            opacity: 0.5,
            depthTest: true
        });
        responsiveObj.mesh.userData['TrueRMSMultimeterHS36'].forEach((testPoint) => {
            var helperSprite = new THREE.Sprite(this.probeSpriteMaterial);
            helperSprite.userData['testPoint'] = testPoint;
            helperSprite.name = testPoint.name + '_trueRMSMultimeterHS36HelperSprite';
            helperSprite.scale.multiplyScalar(testPoint.spriteScale);
            helperSprite.position.copy(testPoint.target.clone().add(testPoint.spritePosDeltas));
            if (testPoint.spriteRotation > 0.0) {
                var rotatedMaterial = this.probeSpriteMaterial.clone();
                rotatedMaterial.rotation = testPoint.spriteRotation; 
                helperSprite.material = rotatedMaterial;
            }
            helperSprite.mousePressHandler = function(helperSprite) {
                if (!this.activated) return;
                if (!this.preselectedProbe) return;
                if (this.probes.redNeedle.position.equals(helperSprite.userData['testPoint'].target) || this.probes.blackNeedle.position.equals(helperSprite.userData['testPoint'].target)) return;
                console.log(helperSprite.name);
                this.preselectedProbe.userData['needle'].position.copy(helperSprite.userData['testPoint'].target)
                if(this.preselectedProbe.userData['needle'].name.indexOf('Red') > -1) {
                    if (helperSprite.userData['testPoint'].redProbeOrientation) {
                        this.preselectedProbe.userData['needle'].rotation.set(helperSprite.userData['testPoint'].redProbeOrientation.x, helperSprite.userData['testPoint'].redProbeOrientation.y, helperSprite.userData['testPoint'].redProbeOrientation.z);
                        this.probes.redProbe.userData['testPoint'] = helperSprite.userData['testPoint'].name;
                    } else 
                    {
                        console.error('Red Probe Orientation is not set');
                        this.preselectedProbe.userData['needle'].rotation.set(0.0, 0.0, 0.0);
                    }
                } else {
                    if (helperSprite.userData['testPoint'].blackProbeOrientation) {
                        this.preselectedProbe.userData['needle'].rotation.set(helperSprite.userData['testPoint'].blackProbeOrientation.x, helperSprite.userData['testPoint'].blackProbeOrientation.y, helperSprite.userData['testPoint'].blackProbeOrientation.z);
                        this.probes.blackProbe.userData['testPoint'] = helperSprite.userData['testPoint'].name;
                    } else  {
                        console.error('Black Probe Orientation is not set');
                        this.preselectedProbe.userData['needle'].rotation.set(0.0, 0.0, 0.0);
                    }
                }
                this.model.remove(this.preselectedProbe.userData['needle']);
                helperSprite.parent.remove(this.preselectedProbe.userData['needle']);
                helperSprite.parent.add(this.preselectedProbe.userData['needle']);
                this.preselectedProbe.userData['needle'].userData['probeAttachedTo'] = helperSprite.parent;

                this.setProbes({
                    probeWiresPathes: helperSprite.userData['testPoint'].probeWiresPathes,
                    probeSelected: this.preselectedProbe
                });
                this.probePressed();
            };

            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(
                testPoint.target,
                helperSprite.position
            );
            var spriteLine = new THREE.Line(lineGeometry, lineMaterial);
            try { spriteLine.computeLineDistances(); } catch (e) {};
            responsiveObj.mesh.add(spriteLine);
            responsiveObj.mesh.add(helperSprite);

            testPoint.spriteLine = spriteLine;
            testPoint.helperSprite = helperSprite;

            testPoint.spriteLine.visible = false;
            testPoint.helperSprite.visible = false;

            this.interactiveElements.push(helperSprite);
        });
        this.accessableInteractiveELements = this.interactiveElements.concat(this.interactiveSuppressElements);
    }

    initProbes() {
        this.trueRMSMultimeterHS36RedProbeWire = new ExtrudedPath({
            name: 'trueRMSMultimeterHS36RedProbeWire',
            context: this.context,
            color: 0xff0000,
            side: THREE.DoubleSide
        });
        this.trueRMSMultimeterHS36BlackProbeWire = new ExtrudedPath({
            name: 'trueRMSMultimeterHS36BlackProbeWire',
            context: this.context,
            color: 0x202020,
            side: THREE.DoubleSide
        });
    }

    setProbes(setupProbesObj = {}) {
        if (setupProbesObj.initialLocation) {
            this.probes.redNeedle.position.add(setupProbesObj.initialLocation.redNeedleShift);
            this.probes.blackNeedle.position.add(setupProbesObj.initialLocation.blackNeedleShift);

            this.probes['initialRedProbe']['needlePosition'] = this.probes.redNeedle.position.clone();
            this.probes['initialRedProbe']['needleRotation'] = this.probes.redNeedle.rotation.clone();
            this.probes['initialRedProbe']['wirePath'] = setupProbesObj.probeWiresPathes.redWire;

            this.probes['initialBlackProbe']['needlePosition'] = this.probes.blackNeedle.position.clone();
            this.probes['initialBlackProbe']['needleRotation'] = this.probes.blackNeedle.rotation.clone();
            this.probes['initialBlackProbe']['wirePath'] = setupProbesObj.probeWiresPathes.blackWire;
        }

        if (setupProbesObj.resetInitialProbeState) {
            if (!setupProbesObj.resetInitialProbeState.probe.userData['probeAttachedTo']) return;
            setupProbesObj.resetInitialProbeState.probe.userData['probeAttachedTo'].remove(setupProbesObj.resetInitialProbeState.probe);
            this.model.add(setupProbesObj.resetInitialProbeState.probe);
            setupProbesObj.resetInitialProbeState.probe.userData['probeAttachedTo'] = undefined;
            setupProbesObj['probeSelected'] = undefined;
            setupProbesObj['probeWiresPathes'] = {};
            if (setupProbesObj.resetInitialProbeState.red) {
                this.probes.redNeedle.position.copy(this.probes['initialRedProbe']['needlePosition']);
                this.probes.redNeedle.rotation.copy(this.probes['initialRedProbe']['needleRotation']);
                setupProbesObj['probeWiresPathes']['redWire'] = this.probes['initialRedProbe']['wirePath'];
                this.probes.redProbe.userData['testPoint'] = undefined;
            }
            if (setupProbesObj.resetInitialProbeState.black) {
                this.probes.blackNeedle.position.copy(this.probes['initialBlackProbe']['needlePosition']);
                this.probes.blackNeedle.rotation.copy(this.probes['initialBlackProbe']['needleRotation']);
                setupProbesObj['probeWiresPathes']['blackWire'] = this.probes['initialBlackProbe']['wirePath'];
                this.probes.blackProbe.userData['testPoint'] = undefined;
            }
        }

        var redWirePath = false;
        var blackWirePath = false;

        var redWirePathDevMode = false;
        var blackWirePathDevMode = false;

        if (setupProbesObj.probeWiresPathes) {
            if (setupProbesObj.probeSelected === undefined) {
                redWirePath = (setupProbesObj.probeWiresPathes.redWire !== undefined);
                blackWirePath = (setupProbesObj.probeWiresPathes.blackWire !== undefined);
            } else {
                redWirePath = (setupProbesObj.probeSelected.name.indexOf('Red') > -1) && (setupProbesObj.probeWiresPathes.redWire !== undefined)
                blackWirePath = (setupProbesObj.probeSelected.name.indexOf('Black') > -1) && (setupProbesObj.probeWiresPathes.blackWire !== undefined)

                redWirePathDevMode = (setupProbesObj.probeSelected.name.indexOf('Red') > -1) && (setupProbesObj.probeWiresPathes.redWire === undefined);
                blackWirePathDevMode = (setupProbesObj.probeSelected.name.indexOf('Black') > -1) && (setupProbesObj.probeWiresPathes.blackWire === undefined);
            }
        } else {
            if (setupProbesObj.probeSelected !== undefined) {
                redWirePathDevMode = (setupProbesObj.probeSelected.name.indexOf('Red') > -1);
                blackWirePathDevMode = (setupProbesObj.probeSelected.name.indexOf('Black') > -1);
            }
        }

        if (redWirePath) {
            this.trueRMSMultimeterHS36RedProbeWire.clearDev();
            this.trueRMSMultimeterHS36RedProbeWire.setPath({ path: setupProbesObj.probeWiresPathes.redWire });
        }
        if (blackWirePath) {
            this.trueRMSMultimeterHS36BlackProbeWire.clearDev();
            this.trueRMSMultimeterHS36BlackProbeWire.setPath({ path: setupProbesObj.probeWiresPathes.blackWire });
        }

        if (setupProbesObj.devMode || redWirePathDevMode) {
            this.trueRMSMultimeterHS36RedProbeWire.devPath({
                startPos: this.getWorldPosition(this.probes.redPlug),
                endPos: this.getWorldPosition(this.probes.redProbe),
                waypointsNum: 4
            });

            if (this.redNeedle_manipulationControl === undefined) {
                this.redNeedle_manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
                this.redNeedle_manipulationControl.setSize(0.5);
                this.context.vLabScene.add(this.redNeedle_manipulationControl);
                this.redNeedle_manipulationControl.attach(this.probes.redNeedle);
                this.redNeedle_manipulationControl.setRotationSnap(THREE.Math.degToRad(1.0));
                this.redNeedle_manipulationControl.setMode('rotate');

                document.addEventListener("keydown", (event)=>{
                    switch (event.keyCode) {
                        case 77: // m
                            if (this.redNeedle_manipulationControl.getMode() === 'translate') {
                                this.redNeedle_manipulationControl.setMode('rotate');
                            } else {
                                this.redNeedle_manipulationControl.setMode('translate');
                            }
                        break;
                        case 13: // Enter
                            if (event.ctrlKey) {
                                this.trueRMSMultimeterHS36RedProbeWire.devPath({
                                    startPos: this.getWorldPosition(this.probes.redPlug),
                                    endPos: this.getWorldPosition(this.probes.redProbe),
                                    waypointsNum: 4
                                });
                            }
                            console.log('TrueRMSMultimeterHS36 Red Probe Needle');
                            console.log('position (m): ' + this.probes.redNeedle.position.x.toFixed(3) + ', ' + this.probes.redNeedle.position.y.toFixed(3) + ', ' + this.probes.redNeedle.position.z.toFixed(3));
                            console.log('rotation (d): ' + this.probes.redNeedle.rotation.x.toFixed(5) + ', ' + this.probes.redNeedle.rotation.y.toFixed(5) + ', ' + this.probes.redNeedle.rotation.z.toFixed(5));
                        break;

                    }
                }, false);
            }
        }
        if (setupProbesObj.devMode || blackWirePathDevMode) {
            this.trueRMSMultimeterHS36BlackProbeWire.devPath({
                startPos: this.getWorldPosition(this.probes.blackPlug),
                endPos: this.getWorldPosition(this.probes.blackProbe),
                waypointsNum: 4
            });

            if (this.blackNeedle_manipulationControl === undefined) {
                this.blackNeedle_manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
                this.blackNeedle_manipulationControl.setSize(0.5);
                this.context.vLabScene.add(this.blackNeedle_manipulationControl);
                this.blackNeedle_manipulationControl.attach(this.probes.blackNeedle);
                this.blackNeedle_manipulationControl.setRotationSnap(THREE.Math.degToRad(1.0));
                this.blackNeedle_manipulationControl.setMode('rotate');

                document.addEventListener("keydown", (event)=>{
                    switch (event.keyCode) {
                        case 77: // m
                            if (this.blackNeedle_manipulationControl.getMode() === 'translate') {
                                this.blackNeedle_manipulationControl.setMode('rotate');
                            } else {
                                this.blackNeedle_manipulationControl.setMode('translate');
                            }
                        break;
                        case 13: // Enter
                            if (event.ctrlKey) {
                                this.trueRMSMultimeterHS36BlackProbeWire.devPath({
                                    startPos: this.getWorldPosition(this.probes.blackPlug),
                                    endPos: this.getWorldPosition(this.probes.blackProbe),
                                    waypointsNum: 4
                                });
                            }
                            console.log('TrueRMSMultimeterHS36 Black Probe Needle');
                            console.log('position (m): ' + this.probes.blackNeedle.position.x.toFixed(3) + ', ' + this.probes.blackNeedle.position.y.toFixed(3) + ', ' + this.probes.blackNeedle.position.z.toFixed(3));
                            console.log('rotation (d): ' + this.probes.blackNeedle.rotation.x.toFixed(5) + ', ' + this.probes.blackNeedle.rotation.y.toFixed(5) + ', ' + this.probes.blackNeedle.rotation.z.toFixed(5));
                        break;

                    }
                }, false);
            }
        }
    }

    resetProbes() {
        this.probePressed();
        this.setProbes({
            resetInitialProbeState: {
                red: true,
                black: false,
                probe: this.probes.redProbe.userData['needle']
            }
        });
        this.setProbes({
            resetInitialProbeState: {
                red: false,
                black: true,
                probe: this.probes.blackProbe.userData['needle']
            }
        });

        if (this.trueRMSMultimeterHS36RedProbeWire.mesh) {
            this.trueRMSMultimeterHS36RedProbeWire.mesh.visible = false;
        }
        if (this.trueRMSMultimeterHS36BlackProbeWire.mesh) {
            this.trueRMSMultimeterHS36BlackProbeWire.mesh.visible = false;
        }

        this.probes.redNeedle.position.copy(this.probes.redNeedleInitialPos);
        this.probes.blackNeedle.position.copy(this.probes.blackNeedleInitialPos);
        this.probes.defaultRedWire.visible = true;
        this.probes.defaultBlackWire.visible = true;

        if (this.refreshScreenInterval !== undefined) clearInterval(this.refreshScreenInterval);
        this.refreshScreen();
    }

    showTestPointsHelpers(object) {
        object.userData['TrueRMSMultimeterHS36'].forEach((testPoint) => {
            testPoint.helperSprite.visible = true;
            testPoint.spriteLine.visible = true;

            testPoint.helperSprite.material.opacity = 1.0;
            testPoint.spriteLine.material.opacity = 0.75;

            if (testPoint.helperSprite.tween) testPoint.helperSprite.tween.stop();

            testPoint.helperSprite.tween = new TWEEN.Tween(testPoint.helperSprite.material)
            .to({ opacity: 0.0 }, 5000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                testPoint.spriteLine.material.opacity = testPoint.helperSprite.material.opacity * 0.75;
            })
            .onComplete(() => {
                testPoint.helperSprite.visible = false;
                testPoint.spriteLine.visible = false;
            })
            .start();

        });
    }

    probePressed(preselectedProbe) {
        if (this.preselectedProbe || preselectedProbe === undefined) { 
            if (!this.preselectedProbe) return;
            this.preselectedProbe.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.trueRMSMultimeterHS36RedProbeWire.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.trueRMSMultimeterHS36BlackProbeWire.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            if (preselectedProbe === undefined) {
                this.preselectedProbe = undefined;
                return;
            }
        }
        if (this.preselectedProbe === preselectedProbe) {
            this.setProbes({
                resetInitialProbeState: {
                    red: (preselectedProbe.name.indexOf('Red') > -1),
                    black: (preselectedProbe.name.indexOf('Black') > -1),
                    probe: preselectedProbe.userData['needle']
                }
            });
            this.probePressed();
        }
        this.preselectedProbe = preselectedProbe;
        preselectedProbe.material.emissive = new THREE.Color(0.75, 0.75, 0.75);
        if (preselectedProbe.name.indexOf('Red') > -1) {
            this.trueRMSMultimeterHS36RedProbeWire.material.emissive = new THREE.Color(0.75, 0.75,0.75);
        }
        if (preselectedProbe.name.indexOf('Black') > -1) {
            this.trueRMSMultimeterHS36BlackProbeWire.material.emissive = new THREE.Color(0.75, 0.75, 0.75);
        }
    }

    getWorldPosition(obj) {
        var worldPosition = new THREE.Vector3();

        this.context.vLabScene.updateMatrixWorld();
        obj.updateMatrixWorld();
        worldPosition.setFromMatrixPosition(obj.matrixWorld);

        return worldPosition;
    }

    modelPressed(reset) {
        if (!this.activated) return;
        var self = this;
        if (this.context.selectedObject != this.model) {
            this.modelSelectionTimout = setTimeout(()=>{
                self.context.selectedObject = undefined;
            }, 1000);
            this.context.selectedObject = this.model;
        } else {
            clearTimeout(this.modelSelectionTimout);

            this.context.selectedObject = this.model;
            this.context.showObjectSpecificCircularMenu({'positionDeltas': { x: 0.0, y: 0.0 }});
            setTimeout(() => {
                self.context.resetAllSelections();
                self.context.defaultCameraControls.resetState();
            }, 2500);
        }
    }

    switchPressed() {
        this.rotateLeftSpriteMaterial.opacity = 1.0;
        this.rotateRightSpriteMaterial.opacity = 1.0;

        if (this.rotateSwitchTween) this.rotateSwitchTween.stop();

        this.rotateLeftHelperSprite.visible = true;
        this.rotateRightHelperSprite.visible = true;

        this.rotateSwitchTween = new TWEEN.Tween(this.rotateLeftSpriteMaterial)
        .to({ opacity: 0.0 }, 5000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(() => {
            this.rotateRightSpriteMaterial.opacity = this.rotateLeftSpriteMaterial.opacity;
        })
        .onComplete(() => {
            this.rotateLeftHelperSprite.visible = false;
            this.rotateRightHelperSprite.visible = false;
        })
        .start();
        this.refreshScreen();
    }

    changeSwitchState(leftDir) {
        var self = this;
        var positionChanged = false;
        if (leftDir) {
            if (this.trueRMSMultimeterHS36['switch'].curPos > 0) {
                this.trueRMSMultimeterHS36['switch'].curPos--;
            } else {
                this.trueRMSMultimeterHS36['switch'].curPos = 11;
            }
        } else {
            if (this.trueRMSMultimeterHS36['switch'].curPos < 11) {
                this.trueRMSMultimeterHS36['switch'].curPos++;
            } else {
                this.trueRMSMultimeterHS36['switch'].curPos = 0;
            }
        }
        if (this.trueRMSMultimeterHS36SwitchSound.isPlaying) this.trueRMSMultimeterHS36SwitchSound.stop();
        this.trueRMSMultimeterHS36SwitchSound.play();
        this.switch.rotation.z = THREE.Math.degToRad(this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].angle);

        switch (this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].title) {
            case 'VADC':
                this.beepSound.play();
                this.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(1.0, 0.0, 0.0);
                this.hvSplashSprite.visible = true;
                setTimeout(()=>{
                    self.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
                    self.hvSplashSprite.visible = false;
                }, 300);
            break;
        }

        if (this.refreshScreenInterval !== undefined) clearInterval(this.refreshScreenInterval);
        if (this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].title !== 'OFF') {
            this.refreshScreenInterval = setInterval(this.setProbesElectricConditions.bind(this), 500);
        } else {
            this.refreshScreen();
        }
    }

    refreshScreen() {
        this.screenCanvasContext.drawImage(this.screenMaterialTextureImage, 0, 0);

        if (this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].title != 'OFF') {

            switch (this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].title) {
                case 'Continuity':
                    this.refreshContinuityScreen();
                break;
                case 'VADC':
                    this.refreshVADCScreen();
                break;
            }
        } else {
            this.screenMaterial.map.offset.y = 0.0;
            this.screenMaterial.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.trueRMSMultimeterHS36['backLight'] = false;

            this.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.hvSplashSprite.visible = false;

            this.trueRMSMultimeterHS36ContinuityLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.beepSplashSprite.visible = false;
            if (this.beepSound) {
                this.beepSound.setLoop(false);
                if (this.beepSound.isPlaying) {
                    this.beepSound.stop();
                }
            }
        }

        this.screenMaterial.map = new THREE.Texture(this.screenCanvas);
        this.screenMaterial.map.needsUpdate = true;
    }

    refreshContinuityScreen() {
        let reading = Infinity;
        let hv = 0.0;

        this.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
        this.hvSplashSprite.visible = false;

        if (this.probes.redProbe.userData['testPoint'] !== undefined && this.probes.blackProbe.userData['testPoint'] !== undefined && this.trueRMSMultimeterHS36['switch'].altPos[this.trueRMSMultimeterHS36['switch'].curPos].title != 'OFF') {
            if (this.probesElectricConditions.CONT != undefined) {
                this.probesElectricConditions.CONT.forEach((probeCombination) => {
                    if (probeCombination.testPoints.indexOf(this.probes.redProbe.userData['testPoint']) > -1 
                    &&  probeCombination.testPoints.indexOf(this.probes.blackProbe.userData['testPoint']) > -1 ) {
                        reading = probeCombination.reading;
                        hv = probeCombination.hv;
                    }
                });
            }
        }

        this.screenCanvasContext.font = 'bold 100px DigitalFont';
        if (reading == Infinity) {
            this.screenCanvasContext.fillText('0L.', 110, 130);
            this.trueRMSMultimeterHS36ContinuityLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.beepSplashSprite.visible = false;
            if (this.beepSound) {
                this.beepSound.setLoop(false);
                if (this.beepSound.isPlaying) {
                    this.beepSound.stop();
                    this.continutiyBeep = false;
                }
            }
        } else {
            if (reading != 'HV') {
                this.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
                this.hvSplashSprite.visible = false;
                if (reading < this.continutiyResitanceThershold && reading > 0) {
                    if (this.beepSound) {
                        if (!this.beepSound.isPlaying) {
                            this.continutiyBeep = true;
                            this.beepSound.setLoop(true);
                            this.beepSound.play();
                        }
                        this.trueRMSMultimeterHS36ContinuityLightBulb.material.emissive = new THREE.Color(0.0, 1.0, 0.0);
                        this.beepSplashSprite.visible = true;
                    } else {
                        if (this.beepSound) {
                            this.beepSound.setLoop(false);
                            if (this.beepSound.isPlaying) {
                                this.beepSound.stop();
                                this.continutiyBeep = false;
                            }
                        }
                        this.trueRMSMultimeterHS36ContinuityLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
                        this.beepSplashSprite.visible = false;
                    }
                }
                reading = reading.toFixed(1);
            } else {
                reading = '----';
                if (hv > 50.0) {
                    this.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(1.0, 0.0, 0.0);
                    this.hvSplashSprite.visible = true;
                    if (this.beepSound) {
                        if (this.beepSound.isPlaying) this.beepSound.stop();
                    }
                    this.trueRMSMultimeterHS36ContinuityLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
                    this.beepSplashSprite.visible = false;
                }
            }
            this.screenCanvasContext.fillText(reading, 110, 130);
        }
    }

    refreshVADCScreen() {
        this.screenCanvasContext.font = 'bold 26px DigitalFont';
        this.screenCanvasContext.fillText('AC', 15, 45);
        let reading = 0.0;
        if (this.probes.redProbe.userData['testPoint'] !== undefined && this.probes.blackProbe.userData['testPoint'] !== undefined) {
            if (this.probesElectricConditions.VADC != undefined) {
                this.probesElectricConditions.VADC.forEach((probeCombination) => {
                    if (probeCombination.testPoints.indexOf(this.probes.redProbe.userData['testPoint']) > -1 
                    &&  probeCombination.testPoints.indexOf(this.probes.blackProbe.userData['testPoint']) > -1 ) {
                        reading = probeCombination.reading;
                    }
                });
            }
        }
        reading += (Math.random() / 10.0) * ((Math.random() > 0.5) ? 1 : -1);
        if (reading > 1.0) {
            this.screenCanvasContext.font = 'bold 26px DigitalFont';
            this.screenCanvasContext.fillText('V', 130, 160);
        } else {
            reading *= 100;
            this.screenCanvasContext.font = 'bold 26px DigitalFont';
            this.screenCanvasContext.fillText('mV', 130, 160);
        }

        if (reading > 10.0) {
            reading += Math.floor(Math.random() * 2) * ((Math.random() > 0.5) ? 1 : -1);
        }
        if (reading > 50.0) {
            reading += Math.floor(Math.random() * 3) * ((Math.random() > 0.5) ? 1 : -1);
        }
        if (reading > 100.0) {
            reading += Math.floor(Math.random() * 4) * ((Math.random() > 0.5) ? 1 : -1);
        }
        if (reading > 200.0) {
            reading += Math.floor(Math.random() * 5) * ((Math.random() > 0.5) ? 1 : -1);
        }
        reading = reading.toFixed(1);
        this.screenCanvasContext.font = 'bold 100px DigitalFont';
        this.screenCanvasContext.fillText(reading, 20, 130);

        if (reading > 100.0) {
            if (this.hvSplashSprite.visible == false) {
                this.beepSound.play();
                this.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(1.0, 0.0, 0.0);
                this.hvSplashSprite.visible = true;
            }
        } else {
            this.trueRMSMultimeterHS36HiVLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.hvSplashSprite.visible = false;
        }
    }

    setProbesElectricConditions(conditionObj) {
        if (conditionObj !== undefined) {
            if (conditionObj.resetAll == true) this.probesElectricConditions = {};
            // this.probesElectricConditions = Object.assign(this.probesElectricConditions, conditionObj);
            this.probesElectricConditions = deepmerge(this.probesElectricConditions, conditionObj);
            // console.log('Probes Electric Conditions set: ', conditionObj, this.probesElectricConditions);
        }
        this.refreshScreen();
        // console.log(this.probesElectricConditions);
        // console.log('redProbe testPoint: ', this.probes.redProbe.userData['testPoint']);
        // console.log('blackProbe testPoint: ', this.probes.blackProbe.userData['testPoint']);
    }

    NCVProcessor() {
        if (this.trueRMSMultimeterHS36NCVButton.userData['pressed'] == true) {

            if (this.probesElectricConditions.NCV == true) {
                if (this.ncvSound && this.context.nature.sounds) {
                    if (!this.ncvSound.isPlaying) this.ncvSound.play();
                } 
                this.NCVSplashSprite.visible = true;
                this.trueRMSMultimeterHS36NCVLightBulb.material.emissive = new THREE.Color(1.0, 0.0, 0.0);
            } else {
                if (this.ncvSound) {
                    if (this.ncvSound.isPlaying) this.ncvSound.stop();
                }
                this.NCVSplashSprite.visible = false;
                this.trueRMSMultimeterHS36NCVLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            }

            setTimeout(this.NCVProcessor.bind(this), 500);
        } else {
            if (this.ncvSound) {
                if (this.ncvSound.isPlaying) this.ncvSound.stop();
            }
            this.NCVSplashSprite.visible = false;
            this.trueRMSMultimeterHS36NCVLightBulb.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
        }
    }
}