import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';
import VLab                 from '../../vlabs.core/vlab';
import Inventory            from '../../vlabs.core/inventory';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

export default class BernzomaticTS8000Torch {
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
       this.pos = initObj.pos;

       this.interactiveElements = [];
       this.interactiveSuppressElements = [];
       this.accessableInteractiveELements = [];

       this.tilesHorizontal = 9;
       this.tilesVertical = 1;
       this.numberOfTiles = 9;
       this.tileDisplayDuration = 5;
       this.currentDisplayTime = 0;
       this.currentTile = 0;

       this.clock = new THREE.Clock();

       this.prevTime = 0;

       /* Bernzomatic Torch state */
       this.bernzomaticTS800TorchLockButtonPressed = false;
       this.bernzomaticTS800TorchButtonLocked = true;
       this.bernzomaticTS800TorchFlameOn = false;
       this.handlersSpriteMaterialOpacity = 0.5;
       this.flameRegulatorHandlersSpriteMaterialOpacity = 0.5;
       this.flameStrength = 0.5;
       this.bernzomaticTS800TorchFlameSound = new THREE.Audio(this.context.defaultAudioListener);
       this.bernzomaticTS800TorchFlameSoundTime = 0.0;

       var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.items/bernzomaticTS8000Torch/sprites/lock.png'),
            textureLoader.load('../vlabs.items/bernzomaticTS8000Torch/sprites/unlock.png'),
            textureLoader.load('../vlabs.items/bernzomaticTS8000Torch/sprites/flame-on.png'),
            textureLoader.load('../vlabs.items/bernzomaticTS8000Torch/sprites/flame-off.png'),
            textureLoader.load('../vlabs.items/bernzomaticTS8000Torch/sprites/plus.png'),
            textureLoader.load('../vlabs.items/bernzomaticTS8000Torch/sprites/minus.png')
        ])
        .then((result) => {
            this.lockSpriteTexture = result[0];
            this.unlockSpriteTexture = result[1];
            this.flameOnSpriteTexture = result[2];
            this.flameOffSpriteTexture = result[3];
            this.flamePlusSpriteTexture = result[4];
            this.flameMinusSpriteTexture = result[5];

            this.initialize();
        });
    }

    initialize() {
        var self = this;
        this.context.loadVLabItem("../vlabs.items/bernzomaticTS8000Torch/bernzomaticTS8000Torch.json", "BernzomaticTS8000Torch").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            var bernzomaticTS800TorchFlameMaterial = this.model.getObjectByName("bernzomaticTS800TorchFlame").material;
            bernzomaticTS800TorchFlameMaterial.blending = THREE.AdditiveBlending;
            this.bernzomaticTS800TorchFlameMap = bernzomaticTS800TorchFlameMaterial.map;
            this.model.getObjectByName("bernzomaticTS800TorchFlame").visible = false;
            this.model.getObjectByName("bernzomaticTS800TorchFlame").scale.x = this.flameStrength;

            this.interactiveElements.push(this.model.getObjectByName("bernzomaticTS800TorchLockButton"));
            this.interactiveElements.push(this.model.getObjectByName("bernzomaticTS800TorchButton"));
            this.interactiveElements.push(this.model.getObjectByName("bernzomaticTS800TorchRegulator"));

            this.model.getObjectByName("bernzomaticTS800TorchLockButton").mousePressHandler = this.bernzomaticTS800TorchLockButtonPress;
            this.model.getObjectByName("bernzomaticTS800TorchButton").mousePressHandler = this.bernzomaticTS800TorchButtonPress;
            this.model.getObjectByName("bernzomaticTS800TorchRegulator").mousePressHandler = this.bernzomaticTS800TorchRegulatorPress;

            this.interactiveSuppressElements.push(this.model);

            this.accessableInteractiveELements = this.interactiveElements.concat(this.interactiveSuppressElements);

            // Sounds
            var audioLoader = new THREE.AudioLoader();
            audioLoader.load('../vlabs.items/bernzomaticTS8000Torch/sounds/sound1.mp3', function(buffer) {
                self.bernzomaticTS800TorchFlameSound.setBuffer(buffer);
                self.bernzomaticTS800TorchFlameSound.setVolume(self.flameStrength);
            });

            /* Add handlers */
            this.lockUnlockSpriteMaterial = new THREE.SpriteMaterial({
                map: this.unlockSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.lockUnlockSprite = new THREE.Sprite(this.lockUnlockSpriteMaterial);
            this.lockUnlockSprite.name = "bernzomaticTS8000TorchLockUnlockSprite";
            this.lockUnlockSprite.scale.set(0.025, 0.025, 0.025);
            this.lockUnlockSprite.position.x = 0.03;
            this.lockUnlockSprite.position.y = -0.03;
            this.lockUnlockSprite.position.z = 0.0;
            this.lockUnlockSprite.mousePressHandler = function() {
                if (this.bernzomaticTS800TorchButtonLocked) {
                    this.bernzomaticTS800TorchButtonLocked = false;
                    this.lockUnlockSpriteMaterial.map = this.lockSpriteTexture;
                    this.model.getObjectByName("bernzomaticTS800TorchButton").rotateX(THREE.Math.degToRad(30.0));
                    this.flameOnOffSprite.visible = true;
                } else {
                    this.bernzomaticTS800TorchButtonLocked = true;
                    this.lockUnlockSpriteMaterial.map = this.unlockSpriteTexture;
                    this.model.getObjectByName("bernzomaticTS800TorchButton").rotateX(THREE.Math.degToRad(-30.0));
                    this.flameOnOffSprite.visible = false;
                }
            };
            this.lockUnlockSprite.visible = false;
            this.model.getObjectByName("bernzomaticTS800TorchButton").add(this.lockUnlockSprite);
            this.accessableInteractiveELements.push(this.lockUnlockSprite);

            this.flameOnOffSpriteMaterial = new THREE.SpriteMaterial({
                map: this.flameOnSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.flameOnOffSprite = new THREE.Sprite(this.flameOnOffSpriteMaterial);
            this.flameOnOffSprite.name = "bernzomaticTS8000TorchFlameOnOffSprite";
            this.flameOnOffSprite.scale.set(0.025, 0.025, 0.025);
            this.flameOnOffSprite.position.x = 0.03;
            this.flameOnOffSprite.position.y = 0.03;
            this.flameOnOffSprite.position.z = 0.0;
            this.flameOnOffSprite.mousePressHandler = function() {
                if (!this.bernzomaticTS800TorchFlameOn) {
                    this.bernzomaticTS800TorchFlameOn = true;
                    this.bernzomaticTS800TorchFlameSound.play();
                    this.lockUnlockSprite.visible = false;
                    this.model.getObjectByName("bernzomaticTS800TorchButton").translateX(-0.0075);
                    this.flameOnOffSpriteMaterial.map = this.flameOffSpriteTexture;
                    setTimeout(() => {
                        this.model.getObjectByName("bernzomaticTS800TorchFlame").visible = true;
                    }, 180);
                } else {
                    this.bernzomaticTS800TorchFlameOn = false;
                    this.flameOnOffSpriteMaterial.map = this.flameOnSpriteTexture;
                    this.model.getObjectByName("bernzomaticTS800TorchButton").translateX(0.0075);
                    this.lockUnlockSprite.visible = true;
                    this.model.getObjectByName("bernzomaticTS800TorchFlame").visible = false;
                    this.bernzomaticTS800TorchFlameSound.stop();
                }
            };
            this.flameOnOffSprite.visible = false;
            this.model.getObjectByName("bernzomaticTS800TorchButton").add(this.flameOnOffSprite);
            this.accessableInteractiveELements.push(this.flameOnOffSprite);


            this.flamePlusSpriteMaterial = new THREE.SpriteMaterial({
                map: this.flamePlusSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });
            this.flamePlusSprite = new THREE.Sprite(this.flamePlusSpriteMaterial);
            this.flamePlusSprite.name = "bernzomaticTS8000TorchFlamePlusSprite";
            this.flamePlusSprite.scale.set(0.035, 0.035, 0.035);
            this.flamePlusSprite.position.x = -0.03;
            this.flamePlusSprite.position.y = 0.0;
            this.flamePlusSprite.position.z = 0.0;
            this.flamePlusSprite.mousePressHandler = function() {
                if (this.flameStrength < 1.0) this.flameStrength += 0.1;
                this.model.getObjectByName("bernzomaticTS800TorchFlame").scale.x = this.flameStrength;
                this.bernzomaticTS800TorchFlameSound.setVolume(this.flameStrength);
                this.model.getObjectByName("bernzomaticTS800TorchRegulator").rotateX(-0.05);
            };
            this.flamePlusSprite.visible = false;
            this.model.getObjectByName("bernzomaticTS800TorchRegulator").add(this.flamePlusSprite);
            this.accessableInteractiveELements.push(this.flamePlusSprite);

            this.flameMinusSpriteMaterial = new THREE.SpriteMaterial({
                map: this.flameMinusSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });
            this.flameMinusSprite = new THREE.Sprite(this.flameMinusSpriteMaterial);
            this.flameMinusSprite.name = "bernzomaticTS8000TorchFlameMinusSprite";
            this.flameMinusSprite.scale.set(0.035, 0.035, 0.035);
            this.flameMinusSprite.position.x = -0.08;
            this.flameMinusSprite.position.y = 0.0;
            this.flameMinusSprite.position.z = 0.0;
            this.flameMinusSprite.mousePressHandler = function() {
                if (this.flameStrength > 0.1) this.flameStrength -= 0.1;
                this.model.getObjectByName("bernzomaticTS800TorchFlame").scale.x = this.flameStrength;
                this.bernzomaticTS800TorchFlameSound.setVolume((this.flameStrength > 0.1) ? this.flameStrength : 0.05);
                this.model.getObjectByName("bernzomaticTS800TorchRegulator").rotateX(0.05);
            };
            this.flameMinusSprite.visible = false;
            this.model.getObjectByName("bernzomaticTS800TorchRegulator").add(this.flameMinusSprite);
            this.accessableInteractiveELements.push(this.flameMinusSprite);


            // this.context.nature.objectMenus[this.model.name] = {
            //     "en": [{
            //         "title": "Pick",
            //         "icon": "fa fa-hand-rock",
            //         "click": "takeObject"
            //         },{
            //             "title": "To Inventory",
            //             "icon": "toolboxMenuIcon",
            //             "click": "takeObjectToInventory"
            //         }, {
            //         "title": "Info",
            //         "icon": ["fa fa-info"],
            //         "click": "showInfo",
            //         "args": {   "title": "Bosch IXO III 3.6-Volt Multipurpose Screwdriver",
            //                     "html": '<div style="text-align: center; padding-top: 5pt;"><iframe width="90%" height="300" src="https://www.youtube.com/embed/VXADzvSTosc" frameborder="0" encrypted-media" allowfullscreen></iframe></div>'}
            //         }, {
            //         "disabled": true
            //         }, {
            //         "disabled": true
            //         }, {
            //         "disabled": true
            //         }],
            // };

            if (this.initObj.inventory) {
                this.initObj.inventory.addItem({
                    item: this.model,
                    initObj: this.initObj,
                    vLabItem: this
                });
                console.log("BernzomaticTS8000Torch added to Inventory");
            } else {
                this.context.vLabScene.add(this.model);
                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("BernzomaticTS8000Torch is not set");
                }
                if (this.initObj.manipulation) {
                    this.manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
                    this.manipulationControl.setSize(1.0);
                    this.context.vLabScene.add(this.manipulationControl);
                    this.context.manipulationControl.attach(this.model);
                }
                if (this.initObj.interactive) {
                    this.context.addSelectionHelperToObject(this.model);
                    this.context.nature.interactiveObjects.push(this.model.name);
                    this.context.setInteractiveObjects();
                }
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
        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);

        if (interactionObjectIntersects.length > 0) {
            if (interactionObjectIntersects[0].object.name.indexOf('bernzomatic') > -1) {
                if (interactionObjectIntersects[0].object.mousePressHandler) {
                    interactionObjectIntersects[0].object.mousePressHandler.call(this);
                }
            }
        }
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

    bernzomaticTS800TorchLockButtonPress() {
        if (!this.bernzomaticTS800TorchLockButtonPressed) {
            this.bernzomaticTS800TorchLockButtonPressed = true;
            this.model.getObjectByName("bernzomaticTS800TorchLockButton").translateZ(-0.003);
            // this.boschScrewdriverButtonPressSoundTime = 0;
            // this.boschScrewdriverButtonPressSound.offset = 0;
            // this.boschScrewdriverButtonPressSound.play();
            // if (this.boschScrewdriverBitHolderStopTween) this.boschScrewdriverBitHolderStopTween.stop();
            // this.boschScrewdriverBitHolderSpeed = 0.6;
        } else {
            this.bernzomaticTS800TorchLockButtonPressed = false;
            this.model.getObjectByName("bernzomaticTS800TorchLockButton").translateZ(0.003);
        }
    }

    bernzomaticTS800TorchButtonPress() {
        if (this.bernzomaticTS800TorchButtonHanlderHideTween) this.bernzomaticTS800TorchButtonHanlderHideTween.stop();
        if (!this.bernzomaticTS800TorchFlameOn) this.lockUnlockSprite.visible = true;
        if (!this.bernzomaticTS800TorchButtonLocked) this.flameOnOffSprite.visible = true;
        this.lockUnlockSpriteMaterial.opacity = this.flameOnOffSpriteMaterial.opacity = this.handlersSpriteMaterialOpacity = 0.5;

        this.bernzomaticTS800TorchButtonHanlderHideTween = new TWEEN.Tween(this)
        .to({ handlersSpriteMaterialOpacity: 0.0 }, 5000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(() => {
            this.lockUnlockSpriteMaterial.opacity = this.flameOnOffSpriteMaterial.opacity = this.handlersSpriteMaterialOpacity;
        })
        .onComplete(() => {
            this.lockUnlockSprite.visible = false;
            this.flameOnOffSprite.visible = false;
        })
        .start();
    }

    bernzomaticTS800TorchRegulatorPress() {
        if (this.bernzomaticTS800TorchRegulatorHanlderHideTween) this.bernzomaticTS800TorchRegulatorHanlderHideTween.stop();
        this.flamePlusSprite.visible = true;
        this.flameMinusSprite.visible = true;
        this.flamePlusSpriteMaterial.opacity = this.flameMinusSpriteMaterial.opacity = this.flameRegulatorHandlersSpriteMaterialOpacity = 0.5;

        this.bernzomaticTS800TorchRegulatorHanlderHideTween = new TWEEN.Tween(this)
        .to({ flameRegulatorHandlersSpriteMaterialOpacity: 0.0 }, 5000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(() => {
            this.flamePlusSpriteMaterial.opacity = this.flameMinusSpriteMaterial.opacity = this.flameRegulatorHandlersSpriteMaterialOpacity;
        })
        .onComplete(() => {
            this.flamePlusSprite.visible = false;
            this.flameMinusSprite.visible = false;
        })
        .start();
    }

    animate(time) {
        if (this.bernzomaticTS800TorchFlameOn) {
            this.bernzomaticTS800TorchFlameSoundTime += (this.clock.getDelta() - this.prevTime);
            var delta = this.clock.getDelta() * 1000;
            this.currentDisplayTime += delta;

            if (this.currentDisplayTime > this.tileDisplayDuration)
            {
                this.currentDisplayTime = 0;
    
                this.currentTile++;
                if (this.currentTile == this.numberOfTiles) this.currentTile = 0;
                var currentColumn = this.currentTile % this.tilesHorizontal;
    
                // // var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
    
                this.bernzomaticTS800TorchFlameMap.offset.x = currentColumn / this.tilesHorizontal;
                // this.bernzomaticTS800TorchFlameMap.offset.y = 0;//currentRow / this.tilesVertical;
            }

            this.model.getObjectByName("bernzomaticTS800TorchFlame").rotateX((1.5 + Math.random()) * (Math.random() < 0.5 ? -1 : 1));

            if (this.bernzomaticTS800TorchFlameSoundTime > 4.0) {
                this.bernzomaticTS800TorchFlameSound.stop();
                this.bernzomaticTS800TorchFlameSound.offset = 1.0;
                this.bernzomaticTS800TorchFlameSound.play();
                this.bernzomaticTS800TorchFlameSoundTime = 0;
            }
        }

        // TWEEN.update(time);

        this.prevTime = this.clock.getDelta();
    }

}