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

            if (this.initObj.inventory) {
                this.initObj.inventory.addItem({
                    item: this.model,
                    initObj: this.initObj,
                    vLabItem: this
                });
                console.log("DigitalMultimeterFluke17B added to Inventory");
                return;
            } else {

                this.context.defaultCamera.add(this.model);

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

                this.model.quaternion.set(0.0, 0.0, 0.0, 0.0);
                if (this.initObj.pos) {
                    this.model.position.copy(this.initObj.pos);
                }
                if (this.initObj.quaternion) {
                    this.model.quaternion.copy(this.initObj.quaternion);
                }
                if (this.initObj.scale) {
                    this.model.scale.multiplyScalar(this.initObj.scale);
                }

            }

            this.screenMaterial = this.model.getObjectByName('digitalMultimeterFluke17BScreen').material;
            this.screenMaterialTextureImage = this.screenMaterial.map.image;

            this.screenCanvas = document.createElement('canvas');
            this.screenCanvas.id = 'digitalMultimeterFluke17BScreenCanvas';
            this.screenCanvas.height = 512;
            this.screenCanvas.width = 512;
            this.screenCanvas.style.display = 'none';
            document.body.appendChild(this.screenCanvas);
            this.screenCanvasContext = this.screenCanvas.getContext('2d');

            this.onVLabSceneWebGLContainerResized();

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

        }).catch(error => {
            console.error(error);
        });
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
        // this.context.webGLContainerEventsSubcribers.mousemove[this.name + "vLabSceneMouseMove"] = 
        // {
        //     callback: this.onVLabSceneMouseMove,
        //     instance: this
        // };
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
    }
/*
    deleteVLabEventListeners() {
        //VLab events subscribers
        delete this.context.webGLContainerEventsSubcribers.mousedown[this.name + "vLabSceneMouseDown"]; 
        delete this.context.webGLContainerEventsSubcribers.touchstart[this.name + "vLabSceneTouchStart"];
        delete this.context.webGLContainerEventsSubcribers.mouseup[this.name + "vLabSceneMouseUp"];
        delete this.context.webGLContainerEventsSubcribers.touchend[this.name + "vLabSceneTouchEnd"]
        delete this.context.webGLContainerEventsSubcribers.mousemove[this.name + "vLabSceneMouseMove"];
        delete this.context.webGLContainerEventsSubcribers.renderframe[this.name + "vLabSceneRenderFrame"];
        this.context.cursorPointerControlFromVLabItem = false;
    }

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

    mouseUpHandler(event) {
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
        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);

        if (interactionObjectIntersects.length > 0) {
            if (interactionObjectIntersects[0].object.userData['DigitalMultimeterFluke17B']) {
                this.showTestPointsHelpers(interactionObjectIntersects[0].object);
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
/*
    onVLabSceneMouseMove() {
        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        this.context.webGLContainer.style.cursor = 'auto';

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);
        if (interactionObjectIntersects.length > 0) {
            if (this.interactiveElements.indexOf(interactionObjectIntersects[0].object) > -1) {
                this.context.cursorPointerControlFromVLabItem = true;
                this.context.webGLContainer.style.cursor = 'pointer';
            }
        }
    }
*/
    onVLabRedererFrameEvent(event) {
        this.animate();
    }

    // bernzomaticTS800TorchLockButtonPress() {
    //     if (!this.bernzomaticTS800TorchLockButtonPressed) {
    //         this.bernzomaticTS800TorchLockButtonPressed = true;
    //         this.model.getObjectByName("bernzomaticTS800TorchLockButton").translateZ(-0.003);
    //         // this.boschScrewdriverButtonPressSoundTime = 0;
    //         // this.boschScrewdriverButtonPressSound.offset = 0;
    //         // this.boschScrewdriverButtonPressSound.play();
    //         // if (this.boschScrewdriverBitHolderStopTween) this.boschScrewdriverBitHolderStopTween.stop();
    //         // this.boschScrewdriverBitHolderSpeed = 0.6;
    //     } else {
    //         this.bernzomaticTS800TorchLockButtonPressed = false;
    //         this.model.getObjectByName("bernzomaticTS800TorchLockButton").translateZ(0.003);
    //     }
    // }

    // bernzomaticTS800TorchButtonPress() {
    //     if (this.bernzomaticTS800TorchButtonHanlderHideTween) this.bernzomaticTS800TorchButtonHanlderHideTween.stop();
    //     if (!this.bernzomaticTS800TorchFlameOn) this.lockUnlockSprite.visible = true;
    //     if (!this.bernzomaticTS800TorchButtonLocked) this.flameOnOffSprite.visible = true;
    //     this.lockUnlockSpriteMaterial.opacity = this.flameOnOffSpriteMaterial.opacity = this.handlersSpriteMaterialOpacity = 0.5;

    //     this.bernzomaticTS800TorchButtonHanlderHideTween = new TWEEN.Tween(this)
    //     .to({ handlersSpriteMaterialOpacity: 0.0 }, 5000)
    //     .easing(TWEEN.Easing.Linear.None)
    //     .onUpdate(() => {
    //         this.lockUnlockSpriteMaterial.opacity = this.flameOnOffSpriteMaterial.opacity = this.handlersSpriteMaterialOpacity;
    //     })
    //     .onComplete(() => {
    //         this.lockUnlockSprite.visible = false;
    //         this.flameOnOffSprite.visible = false;
    //     })
    //     .start();
    // }

    // bernzomaticTS800TorchRegulatorPress() {
    //     if (this.bernzomaticTS800TorchRegulatorHanlderHideTween) this.bernzomaticTS800TorchRegulatorHanlderHideTween.stop();
    //     this.flamePlusSprite.visible = true;
    //     this.flameMinusSprite.visible = true;
    //     this.flamePlusSpriteMaterial.opacity = this.flameMinusSpriteMaterial.opacity = this.flameRegulatorHandlersSpriteMaterialOpacity = 0.5;

    //     this.bernzomaticTS800TorchRegulatorHanlderHideTween = new TWEEN.Tween(this)
    //     .to({ flameRegulatorHandlersSpriteMaterialOpacity: 0.0 }, 5000)
    //     .easing(TWEEN.Easing.Linear.None)
    //     .onUpdate(() => {
    //         this.flamePlusSpriteMaterial.opacity = this.flameMinusSpriteMaterial.opacity = this.flameRegulatorHandlersSpriteMaterialOpacity;
    //     })
    //     .onComplete(() => {
    //         this.flamePlusSprite.visible = false;
    //         this.flameMinusSprite.visible = false;
    //     })
    //     .start();
    // }

    animate(time) {
        // if (this.bernzomaticTS800TorchFlameOn) {
        //     this.bernzomaticTS800TorchFlameSoundTime += (this.clock.getDelta() - this.prevTime);
        //     var delta = this.clock.getDelta() * 1000;
        //     this.currentDisplayTime += delta;

        //     if (this.currentDisplayTime > this.tileDisplayDuration)
        //     {
        //         this.currentDisplayTime = 0;
    
        //         this.currentTile++;
        //         if (this.currentTile == this.numberOfTiles) this.currentTile = 0;
        //         var currentColumn = this.currentTile % this.tilesHorizontal;
    
        //         // // var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
    
        //         this.bernzomaticTS800TorchFlameMap.offset.x = currentColumn / this.tilesHorizontal;
        //         // this.bernzomaticTS800TorchFlameMap.offset.y = 0;//currentRow / this.tilesVertical;
        //     }

        //     this.model.getObjectByName("bernzomaticTS800TorchFlame").rotateX((1.5 + Math.random()) * (Math.random() < 0.5 ? -1 : 1));

        //     if (this.bernzomaticTS800TorchFlameSoundTime > 4.0) {
        //         this.bernzomaticTS800TorchFlameSound.stop();
        //         this.bernzomaticTS800TorchFlameSound.offset = 1.0;
        //         this.bernzomaticTS800TorchFlameSound.play();
        //         this.bernzomaticTS800TorchFlameSoundTime = 0;
        //     }
        // }

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
}