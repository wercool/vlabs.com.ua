import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';
import VLab                 from '../../vlabs.core/vlab';
import Inventory            from '../../vlabs.core/inventory';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');
var WebFont                 = require('webfontloader');

export default class DigitalMultimeterFluke17B {
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

        this.activated = false;

        if (!this.initObj.standAloneMode) {
            this.initObj.pos = this.initObj.pos ? this.initObj.pos : new THREE.Vector3(-0.065, -0.06, -0.11);
            this.initObj.quaternion = new THREE.Vector4(0.4, 0.2, 1.75, -0.1);
            this.initObj.scale = 0.075;
        }

        this.interactiveElements = [];
        this.interactiveSuppressElements = [];
        this.accessableInteractiveELements = [];

        this.clock = new THREE.Clock();

        var textureLoader = new THREE.TextureLoader();

        return new Promise((resolve, reject) => {
            Promise.all([
                textureLoader.load('../vlabs.items/digitalMultimeterFluke17B/sprites/probe.png'),
                textureLoader.load('../vlabs.items/digitalMultimeterFluke17B/sprites/rotate-left.png'),
                textureLoader.load('../vlabs.items/digitalMultimeterFluke17B/sprites/rotate-right.png'),
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
                    depthTest: false,
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

                WebFont.load({
                    custom: {
                      families: ['DigitalFont'],
                      urls: ['../vlabs.items/digitalMultimeterFluke17B/assets/styles.css']
                    }
                });

                resolve(this);

                this.initialize();
            });
        });
    }

    initialize() {
        var self = this;
        this.context.loadVLabItem("../vlabs.items/digitalMultimeterFluke17B/digitalMultimeterFluke17B.json", "DigitalMultimeterFluke17B").then((loadedScene) => {
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
                        "args": {   "title": "Fluke 17B Digital Multimeter",
                                    "html": '<a href="http://www.fluke.com/fluke/inen/digital-multimeters/fluke-17b.htm?pid=75002#" style="color: #c2daff;" target="_blank"><h2>SEE MORE</h2></a>'}
                        }, {
                        "disabled": true
                        }, {
                        "disabled": true
                        }, {
                        "disabled": true
                        }],
                    "ru": [{
                            "title": "Взять",
                            "icon": "fa fa-hand-rock",
                            "click": "takeObject",
                            "args": { 
                                "resetscale": true,
                                "resetquat": this.initialModelQuaternion,
                                "callback": this.takenHandler
                            }
                        }, {
                            "title": "В Инвенторию",
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
                        "args": {   "title": "Fluke 17B Цифровой Мультиметр",
                        "html": '<a href="http://www.fluke.com/fluke/inen/digital-multimeters/fluke-17b.htm?pid=75002#" style="color: #c2daff;" target="_blank"><h2>Детальная информация</h2></a>'}
                        }, {
                        "disabled": true
                        }, {
                        "disabled": true
                        }, {
                        "disabled": true
                        }],
                };
            }


            this.fluke17BCurrentState = {
                'switch': {
                    curPos: 0,
                    altPos: [
                        { title: 'OFF', angle: -155.27 },
                        { title: 'V~',  angle: -177.08 },
                        { title: 'V=',  angle: -200.78 },
                        { title: 'mV=', angle: -222.41 },
                        { title: 'Ohm', angle: -247.91 },
                        { title: 'C',   angle: -270.11 },
                        { title: 'A=',  angle: -293.15 },
                        { title: 'mA=', angle: -316.64 },
                        { title: 'uA=', angle: -339.36 },
                        { title: 't',   angle: -361.98 }
                    ]
                },
                'sndFnButton': false
            };

            // Sounds
            this.fluke17BSwitchSound = new THREE.Audio(this.context.defaultAudioListener);

            var audioLoader = new THREE.AudioLoader();
            audioLoader.load('../vlabs.items/digitalMultimeterFluke17B/sounds/switch.mp3', function(buffer) {
                self.fluke17BSwitchSound.setBuffer(buffer);
                self.fluke17BSwitchSound.setVolume(1.0);
            });


            this.model.mousePressHandler = this.modelPressed;
            this.interactiveElements.push(this.model);



            this.switch = this.model.getObjectByName('digitalMultimeterFluke17BSwitch');
            this.switch.mousePressHandler = this.switchPressed;
            this.interactiveElements.push(this.switch);

            this.rotateLeftHelperSprite = new THREE.Sprite(this.rotateLeftSpriteMaterial);
            this.rotateLeftHelperSprite.name = this.switch.name + '_RotateLeftHelperSprite';
            this.rotateLeftHelperSprite.scale.multiplyScalar(0.02);
            this.rotateLeftHelperSprite.position.add(new THREE.Vector3(0.018, -0.065, 0.034));
            this.rotateLeftHelperSprite.mousePressHandler = function(rotateLeftHelperSprite) {
                this.changeSwitchState(true);
            };
            this.model.add(this.rotateLeftHelperSprite);
            this.interactiveElements.push(this.rotateLeftHelperSprite);
            this.rotateLeftHelperSprite.visible = false;

            this.rotateRightHelperSprite = new THREE.Sprite(this.rotateRightSpriteMaterial);
            this.rotateRightHelperSprite.name = this.switch.name + '_RotateRightHelperSprite';
            this.rotateRightHelperSprite.scale.multiplyScalar(0.02);
            this.rotateRightHelperSprite.position.add(new THREE.Vector3(-0.015, -0.065, 0.034));
            this.rotateRightHelperSprite.mousePressHandler = function(rotateRightHelperSprite) {
                this.changeSwitchState(false);
            };
            this.model.add(this.rotateRightHelperSprite);
            this.interactiveElements.push(this.rotateRightHelperSprite);
            this.rotateRightHelperSprite.visible = false;



            this.sndFnButton = this.model.getObjectByName('digitalMultimeterFluke17BSecondaryFunctionButton');
            this.sndFnButton.mousePressHandler = this.sndFnButtonPressed;
            this.interactiveElements.push(this.sndFnButton);

            this.blackNeedle = this.model.getObjectByName('digitalMultimeterFluke17BProbeBlackNeedle');
            this.redNeedle = this.model.getObjectByName('digitalMultimeterFluke17BProbeRedNeedle');

            this.probeBlack = this.model.getObjectByName('digitalMultimeterFluke17BProbeBlack');
            this.probeRed = this.model.getObjectByName('digitalMultimeterFluke17BProbeRed');

            this.probeBlackPlug = this.blackNeedle.clone();
            this.probeBlackPlug.name += 'PlugNeedle';
            this.probeBlackPlug.children[0].name += 'PlugHandle';
            this.probeRedPlug = this.redNeedle.clone();
            this.probeRedPlug.name += 'PlugNeedle';
            this.probeRedPlug.children[0].name += 'PlugHandle';

            this.probeBlack.userData['plug'] = this.probeBlackPlug;
            this.probeRed.userData['plug'] = this.probeRedPlug;

            this.screen = this.model.getObjectByName('digitalMultimeterFluke17BScreen');
            this.screen.mousePressHandler = this.modelPressed;
            this.interactiveElements.push(this.screen);
            this.screenMaterial = this.screen.material;
            this.screenMaterialTextureImage = this.screenMaterial.map.image;

            this.screenCanvas = document.createElement('canvas');
            this.screenCanvas.id = 'digitalMultimeterFluke17BScreenCanvas';
            this.screenCanvas.height = 512;
            this.screenCanvas.width = 512;
            this.screenCanvas.style.display = 'none';
            document.body.appendChild(this.screenCanvas);
            this.screenCanvasContext = this.screenCanvas.getContext('2d');

            this.staticBlackWire = this.model.getObjectByName('digitalMultimeterFluke17BBlackWire');
            this.staticRedWire = this.model.getObjectByName('digitalMultimeterFluke17BRedWIre');

            this.probeBlack.mousePressHandler = this.probePressed;
            this.probeRed.mousePressHandler = this.probePressed;
            this.interactiveElements.push(this.probeBlack);
            this.interactiveElements.push(this.probeRed);

            this.probeBlackPlug.children[0].mousePressHandler = this.probePlugPressed;
            this.probeRedPlug.children[0].mousePressHandler = this.probePlugPressed;
            this.interactiveElements.push(this.probeBlackPlug.children[0]);
            this.interactiveElements.push(this.probeRedPlug.children[0]);

            this.accessableInteractiveELements = this.interactiveElements.concat(this.interactiveSuppressElements);

            this.addVLabEventListeners();

            if (this.initObj.inventory) {
                this.initObj.inventory.addItem({
                    item: this.model,
                    initObj: this.initObj,
                    vLabItem: this
                });
                console.log("DigitalMultimeterFluke17B added to Inventory");
                return;
            } else {
                this.activate(true);
            }

        }).catch(error => {
            console.error(error);
        });
    }

    activate() {
        if (this.initObj.pos) {
            this.model.position.copy(this.initObj.pos);
        }
        if (this.initObj.quaternion) {
            this.model.quaternion.copy(this.initObj.quaternion);
        }
        if (this.initObj.scale) {
            this.model.scale.set(this.initObj.scale, this.initObj.scale, this.initObj.scale);
        }

        if (this.initObj.standAloneMode) {
            this.context.vLabScene.add(this.model);
        } else {
            this.context.defaultCamera.add(this.model);
        }

        this.activated = true;
        this.onVLabSceneWebGLContainerResized();
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
        this.context.webGLContainerEventsSubcribers.renderframe[this.name + "vLabSceneRenderFrame"] = 
        {
            callback: this.onVLabRedererFrameEvent,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.webglcontainerresized[this.name + "vLabSceneWebGLContainerResized"] = 
        {
            callback: this.onVLabSceneWebGLContainerResized,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.zoommodeout[this.name + "vLabSceneZoomModeOut"] = 
        {
            callback: this.reset,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.resetview[this.name + "vLabSceneResetView"] = 
        {
            callback: this.reset,
            instance: this
        };
    }

    deleteVLabEventListeners() {
        //VLab events subscribers
        delete this.context.webGLContainerEventsSubcribers.mouseup[this.name + "vLabSceneMouseUp"];
        delete this.context.webGLContainerEventsSubcribers.touchend[this.name + "vLabSceneTouchEnd"]
        delete this.context.webGLContainerEventsSubcribers.renderframe[this.name + "vLabSceneRenderFrame"];
        delete this.context.webGLContainerEventsSubcribers.webglcontainerresized[this.name + "vLabSceneWebGLContainerResized"];
        delete this.context.webGLContainerEventsSubcribers.zoommodeout[this.name + "vLabSceneZoomModeOut"];
        delete this.context.webGLContainerEventsSubcribers.resetview[this.name + "vLabSceneResetView"];
        this.context.cursorPointerControlFromVLabItem = false;
    }
/*
    redererInventoryFrameEventHandler(time) {

        var self = this;

        self.initObj.inventory.iteractionRaycaster.setFromCamera(self.initObj.inventory.mouseCoordsRaycaster, self.initObj.inventory.defaultCamera);
        var interactionObjectIntersects = self.initObj.inventory.iteractionRaycaster.intersectObjects(self.accessableInteractiveELements);
        if (interactionObjectIntersects.length > 0) {
            self.hoveredObject = interactionObjectIntersects[0].object;
            if (self.hoveredObject.mousePressHandler) {
                self.initObj.inventory.webGLContainer.style.cursor = 'pointer';
                if (self.initObj.inventory.mouseDown) {
                    self.hoveredObject.mousePressHandler.call(self);
                }
            }
        } else {
            self.initObj.inventory.webGLContainer.style.cursor = 'auto';
        }
        this.animate(time);
    }

    inventoryMouseUpHandler(event) {
        this.boschScrewdriverButtonRelease();
    }
*/

    onVLabSceneWebGLContainerResized() {
        if (!this.activated) return;
        var cameraAspectOffset = ((this.context.defaultCamera.aspect < 1.4) ? 0.03 : -0.01) / this.context.defaultCamera.aspect;
        this.model.position.x = this.initObj.pos.x + cameraAspectOffset;
    }

    onVLabSceneTouchEnd(evnet) {
        this.onVLabSceneMouseUp(event);
    }

    onVLabSceneMouseUp(event) {
        if (!this.activated) return;
        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        // var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(this.accessableInteractiveELements);

        if (interactionObjectIntersects.length > 0) {
            if (this.context.zoomMode) {
                if (interactionObjectIntersects[0].object.userData['DigitalMultimeterFluke17B']) {
                    this.showTestPointsHelpers(interactionObjectIntersects[0].object);
                }
            }
            if (interactionObjectIntersects[0].object.name.indexOf('digitalMultimeterFluke17B') > -1) {
                if (interactionObjectIntersects[0].object.mousePressHandler) {
                    interactionObjectIntersects[0].object.mousePressHandler.call(this, interactionObjectIntersects[0].object);
                }
            }
        } else {
            this.probePressed();
        }
    }

    onVLabRedererFrameEvent(event) {
        if (this.activated) this.animate();
    }

    animate(time) {
        // TWEEN.update(time);
        this.prevTime = this.clock.getDelta();
    }

    addResponsiveObject(responsiveObj) {
        responsiveObj.mesh.userData['DigitalMultimeterFluke17B'] = responsiveObj.testPoints;
        this.interactiveElements.push(responsiveObj.mesh);

        var lineMaterial = new THREE.LineDashedMaterial( {
            color: 0xffffff,
            dashSize: 0.005,
            gapSize: 0.0025,
            transparent: true,
            opacity: 0.5,
            depthTest: false
        });
        responsiveObj.mesh.userData['DigitalMultimeterFluke17B'].forEach((testPoint) => {
            var helperSprite = new THREE.Sprite(this.probeSpriteMaterial);
            helperSprite.userData['testPoint'] = testPoint;
            helperSprite.name = testPoint.name + '_digitalMultimeterFluke17BHelperSprite';
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
                this.preselectedProbe.visible = false;
                this.preselectedProbe.parent.visible = false;
                this.preselectedProbe.userData['plug'].position.copy(helperSprite.userData['testPoint'].target)
                this.preselectedProbe.userData['plug'].rotation.set(helperSprite.userData['testPoint'].orientation.x, helperSprite.userData['testPoint'].orientation.y, helperSprite.userData['testPoint'].orientation.z);
                helperSprite.parent.remove(this.preselectedProbe.userData['plug']);
                helperSprite.parent.add(this.preselectedProbe.userData['plug']);
                this.preselectedProbe.userData['plug'].visible = true;
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

    showTestPointsHelpers(object) {
        object.userData['DigitalMultimeterFluke17B'].forEach((testPoint) => {
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
            this.staticBlackWire.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            this.staticRedWire.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            if (preselectedProbe === undefined) {
                this.preselectedProbe = undefined;
                return;
            }
        }
        this.preselectedProbe = preselectedProbe;
        preselectedProbe.material.emissive = new THREE.Color(0.75, 0.75, 0.75);
        if (preselectedProbe.name.indexOf('Black') > -1) {
            this.staticBlackWire.material.emissive = new THREE.Color(0.75, 0.75, 0.75);
        }
        if (preselectedProbe.name.indexOf('Red') > -1) {
            this.staticRedWire.material.emissive = new THREE.Color(0.75, 0.75,0.75);
        }
    }

    probePlugPressed(pressedProbePlug) {
        if (pressedProbePlug.name.indexOf('Black') > -1) {
            this.probeBlack.parent.visible = true;
            this.probeBlack.visible = true;
            this.probePressed(this.probeBlack);
        }
        if (pressedProbePlug.name.indexOf('Red') > -1) {
            this.probeRed.parent.visible = true;
            this.probeRed.visible = true;
            this.probePressed(this.probeRed);
        }
        pressedProbePlug.parent.visible = false;
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
    }

    changeSwitchState(leftDir) {
        var positionChanged = false;
        if (leftDir) {
            if (this.fluke17BCurrentState['switch'].curPos > 0) {
                this.fluke17BCurrentState['switch'].curPos--;
                this.switch.rotation.z = THREE.Math.degToRad(this.fluke17BCurrentState['switch'].altPos[this.fluke17BCurrentState['switch'].curPos].angle);
                positionChanged = true;
            }
        } else {
            if (this.fluke17BCurrentState['switch'].curPos < 9) {
                this.fluke17BCurrentState['switch'].curPos++;
                this.switch.rotation.z = THREE.Math.degToRad(this.fluke17BCurrentState['switch'].altPos[this.fluke17BCurrentState['switch'].curPos].angle);
                positionChanged = true;
            }
        }
        if (positionChanged) {
            this.fluke17BSwitchSound.play();
            this.refreshScreen();
        }
    }

    sndFnButtonPressed() {
        this.fluke17BCurrentState['sndFnButton'] = !this.fluke17BCurrentState['sndFnButton'];
        this.sndFnButton.position.z = (this.fluke17BCurrentState['sndFnButton']) ? 0.013 : 0.0132794;
        this.refreshScreen();
    }

    takenToInventory() {
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
        this.resetProbes();
    }

    resetProbes() {
        this.probeBlack.parent.visible = true;
        this.probeBlack.visible = true;

        this.probeRed.parent.visible = true;
        this.probeRed.visible = true;

        this.probeBlackPlug.visible = false;
        this.probeRedPlug.visible = false;

        this.probeBlack.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
        this.probeRed.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
        this.staticBlackWire.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
        this.staticRedWire.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
    }

    modelPressed() {
        if (!this.activated || this.initObj.standAloneMode) return;
        this.context.selectedObject = this.model;
        this.context.showObjectSpecificCircularMenu({'positionDeltas': { x: 0.0, y: -this.context.webGLContainer.clientHeight / 2 }});
        var self = this;
        setTimeout(() => {
            self.context.resetAllSelections();
            self.context.defaultCameraControls.resetState();
        }, 2500);
    }




    refreshScreen() {
        this.screenCanvasContext.drawImage(this.screenMaterialTextureImage, 0, 0);

        if (this.fluke17BCurrentState['switch'].altPos[this.fluke17BCurrentState['switch'].curPos].title != 'OFF') {
            this.screenCanvasContext.font = '170px DigitalFont';
            this.screenCanvasContext.fillText(' 0.000', -10, 180);
    
            this.screenCanvasContext.font = 'bold 26px Arial';
            this.screenCanvasContext.fillText('Auto Range', 170, 220);

            this.screenCanvasContext.font = 'bold 34px Arial';
            switch (this.fluke17BCurrentState['switch'].altPos[this.fluke17BCurrentState['switch'].curPos].title) {
                case 'V~':
                    this.screenCanvasContext.fillText('V', 460, 110);
                    this.screenCanvasContext.fillText('AC', 430, 150);
                break;
                case 'V=':
                    this.screenCanvasContext.fillText('V', 460, 110);
                    this.screenCanvasContext.fillText('DC', 410, 150);
                break;
                case 'mV=':
                    this.screenCanvasContext.fillText('m V', 420, 110);
                    this.screenCanvasContext.fillText('DC', 410, 150);
                break;
                case 'Ohm':
                    this.screenCanvasContext.fillText('Ω', 435, 180);
                break;
                case 'C':
                    this.screenCanvasContext.fillText('µF', 435, 95);
                break;
                case 'A=':
                    this.screenCanvasContext.fillText('A', 430, 110);
                    if (this.fluke17BCurrentState['sndFnButton']) {
                        this.screenCanvasContext.fillText('AC', 430, 150);
                    } else {
                        this.screenCanvasContext.fillText('DC', 410, 150);
                    }
                break;
                case 'mA=':
                    this.screenCanvasContext.fillText('mA', 405, 110);
                    if (this.fluke17BCurrentState['sndFnButton']) {
                        this.screenCanvasContext.fillText('AC', 430, 150);
                    } else {
                        this.screenCanvasContext.fillText('DC', 410, 150);
                    }
                break;
                case 'uA=':
                    this.screenCanvasContext.fillText('mA', 405, 110);
                    if (this.fluke17BCurrentState['sndFnButton']) {
                        this.screenCanvasContext.fillText('AC', 430, 150);
                    } else {
                        this.screenCanvasContext.fillText('DC', 410, 150);
                    }
                break;
                case 't':
                    this.screenCanvasContext.fillText('°C', 405, 60);
                break;
            }
        }

        this.screenMaterial.map = new THREE.Texture(this.screenCanvas);
        this.screenMaterial.map.needsUpdate = true;
    }
}