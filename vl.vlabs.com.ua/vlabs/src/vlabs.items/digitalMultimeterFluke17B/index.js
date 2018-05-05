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

       this.interactiveElements = [];
       this.interactiveSuppressElements = [];
       this.accessableInteractiveELements = [];

       this.clock = new THREE.Clock();

       this.initialize();
    }

    initialize() {
        var self = this;
        this.context.loadVLabItem("../vlabs.items/digitalMultimeterFluke17B/digitalMultimeterFluke17B.json", "DigitalMultimeterFluke17B").then((loadedScene) => {
            this.model = loadedScene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            this.blackNeedle = this.model.getObjectByName('digitalMultimeterFluke17BProbeBlackNeedle');
            this.redNeedle = this.model.getObjectByName('digitalMultimeterFluke17BProbeRedNeedle');

            if (this.initObj.inventory) {
                this.initObj.inventory.addItem({
                    item: this.model,
                    initObj: this.initObj,
                    vLabItem: this
                });
                console.log("DigitalMultimeterFluke17B added to Inventory");
            } else {

                this.context.defaultCamera.add(this.model);

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

                this.model.remove(this.blackNeedle);
                this.blackNeedle.position.set(0.0, 1.0, 1.0);
                this.context.vLabScene.add(this.blackNeedle);
            }

            this.addVLabEventListeners();

        }).catch(error => {
            console.error(error);
        });
    }

    addVLabEventListeners() {
        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.mousedown[this.name + "vLabSceneMouseDown"] = 
        {
            callback: this.onVLabSceneMouseDown,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchstart[this.name + "vLabSceneTouchStart"] = 
        {
            callback: this.onVLabSceneTouchStart,
            instance: this
        };
        // this.context.webGLContainerEventsSubcribers.mouseup[this.name + "vLabSceneMouseUp"] = 
        // {
        //     callback: this.onVLabSceneMouseUp,
        //     instance: this
        // };
        // this.context.webGLContainerEventsSubcribers.touchend[this.name + "vLabSceneTouchEnd"] = 
        // {
        //     callback: this.onVLabSceneTouchEnd,
        //     instance: this
        // };
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

    onVLabSceneTouchStart(event) {
        this.onVLabSceneMouseDown(event);
    }

    onVLabSceneMouseDown(event) {
        // var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        // this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        // var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);

        // if (interactionObjectIntersects.length > 0) {
        //     if (interactionObjectIntersects[0].object.name.indexOf('bernzomatic') > -1) {
        //         if (interactionObjectIntersects[0].object.mousePressHandler) {
        //             interactionObjectIntersects[0].object.mousePressHandler.call(this);
        //         }
        //     }
        // }
    }
/*
    onVLabSceneTouchEnd(evnet) {
        this.onVLabSceneMouseUp(event);
    }

    onVLabSceneMouseUp(event) {
        this.boschScrewdriverButtonRelease();
    }

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

}