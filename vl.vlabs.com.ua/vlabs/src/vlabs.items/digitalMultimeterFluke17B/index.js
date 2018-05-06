import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';
import VLab                 from '../../vlabs.core/vlab';
import Inventory            from '../../vlabs.core/inventory';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

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

        this.activated = false;

        this.initObj.pos = new THREE.Vector3(-0.065, -0.06, -0.11);
        this.initObj.quaternion = new THREE.Vector4(0.4, 0.2, 1.75, -0.1);
        this.initObj.scale = 0.075;

        this.interactiveElements = [];
        this.interactiveSuppressElements = [];
        this.accessableInteractiveELements = [];

        this.clock = new THREE.Clock();

        var textureLoader = new THREE.TextureLoader();

        return new Promise((resolve, reject) => {
            Promise.all([
                textureLoader.load('../vlabs.items/digitalMultimeterFluke17B/sprites/probe.png'),
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

            this.model.mousePressHandler = this.modelPressed;
            this.interactiveElements.push(this.model);

            this.switch = this.model.getObjectByName('digitalMultimeterFluke17BSwitch');
            this.switch.mousePressHandler = this.switchPressed;
            this.interactiveElements.push(this.switch);

            this.onOffButton = this.model.getObjectByName('digitalMultimeterFluke17BOnOffButton');
            this.onOffButton.mousePressHandler = this.onOffButtonPressed;
            this.interactiveElements.push(this.onOffButton);

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
                this.activate();
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
            this.model.scale.multiplyScalar(this.initObj.scale);
        }
        this.context.defaultCamera.add(this.model);
        this.onVLabSceneWebGLContainerResized();
        this.activated = true;
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
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);

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
        this.animate();
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
            opacity: 0.5
        });
        responsiveObj.mesh.userData['DigitalMultimeterFluke17B'].forEach((testPoint) => {
            var helperSprite = new THREE.Sprite(this.probeSpriteMaterial);
            helperSprite.userData['testPoint'] = testPoint;
            helperSprite.name = testPoint.name + '_digitalMultimeterFluke17BHelperSprite';
            helperSprite.scale.multiplyScalar(testPoint.spriteScale);
            helperSprite.position.copy(testPoint.target.clone().add(testPoint.spritePosDeltas));
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
            spriteLine.computeLineDistances();
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

    refreshScreen() {
        this.screenCanvasContext.drawImage(this.screenMaterialTextureImage, 0, 0);

        this.screenMaterial.map = new THREE.Texture(this.screenCanvas);
        this.screenMaterial.map.needsUpdate = true;
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
        console.log('switchPressed');
    }

    onOffButtonPressed() {
        console.log('onOffButtonPressed');
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
        if (!this.activated) return;
        this.context.selectedObject = this.model;
        this.context.showObjectSpecificCircularMenu({'positionDeltas': { x: 0.0, y: -this.context.webGLContainer.clientHeight / 2 }});
        var self = this;
        setTimeout(() => {
            self.context.resetAllSelections();
            self.context.defaultCameraControls.resetState();
        }, 2500);
    }
}