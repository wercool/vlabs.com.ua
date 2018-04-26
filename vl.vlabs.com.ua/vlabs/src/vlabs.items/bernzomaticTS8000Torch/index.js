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
       this.tileDisplayDuration = 1;
       this.currentDisplayTime = 0;

       this.clock = new THREE.Clock();

       this.prevTime = 0;

       this.initialize();
    }

    initialize() {
        var self = this;
        this.context.loadVLabItem("../vlabs.items/bernzomaticTS8000Torch/bernzomaticTS8000Torch.json", "BernzomaticTS8000Torch").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            this.model.getObjectByName("bernzomaticTS800TorchFlame").material.blending = THREE.AdditiveBlending;
            // this.bernzomaticTS800TorchFlameMap = this.model.getObjectByName("bernzomaticTS800TorchFlame").material.map;
            // this.bernzomaticTS800TorchFlameMap.wrapS = this.bernzomaticTS800TorchFlameMap.wrapT = THREE.RepeatWrapping; 
            // this.bernzomaticTS800TorchFlameMap.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

            // this.model.getObjectByName("boschScrewdriverButton").mousePressHandler = this.boschScrewdriverButtonPress;
            // this.model.getObjectByName("boschScrewdriverButton").mouseReleaseHandler = this.boschScrewdriverButtonRelease;

            // this.interactiveElements.push(this.model.getObjectByName("boschScrewdriverButton"));

            // this.interactiveSuppressElements.push(this.model);

            // this.accessableInteractiveELements = this.interactiveElements.concat(this.interactiveSuppressElements);


            // // Sounds
            // this.boschScrewdriverButtonPressSound = new THREE.Audio(this.context.defaultAudioListener);
            // // load a sound and set it as the Audio object's buffer
            // var audioLoader = new THREE.AudioLoader();
            // audioLoader.load('../vlabs.items/boshScrewdriver/sounds/sound1.mp3', function(buffer) {
            //     self.boschScrewdriverButtonPressSound.setBuffer(buffer);
            // });
            // this.boschScrewdriverButtonPressSoundTime = 0;



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
        // this.context.webGLContainerEventsSubcribers.mousedown[this.name + "vLabSceneMouseDown"] = 
        // {
        //     callback: this.onVLabSceneMouseDown,
        //     instance: this
        // };
        // this.context.webGLContainerEventsSubcribers.touchstart[this.name + "vLabSceneTouchStart"] = 
        // {
        //     callback: this.onVLabSceneTouchStart,
        //     instance: this
        // };
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

    boschScrewdriverButtonPress() {
        if (!this.boschScrewdriverButtonPressed) {
            this.boschScrewdriverButtonPressed = true;
            console.log("boschScrewdriverButtonPressed");
            this.model.getObjectByName("boschScrewdriverButton").rotation.y = THREE.Math.degToRad(7);
            this.boschScrewdriverButtonPressSoundTime = 0;
            this.boschScrewdriverButtonPressSound.offset = 0;
            this.boschScrewdriverButtonPressSound.play();
            if (this.boschScrewdriverBitHolderStopTween) this.boschScrewdriverBitHolderStopTween.stop();
            this.boschScrewdriverBitHolderSpeed = 0.6;
        }
    }

    boschScrewdriverButtonRelease() {
        if (this.boschScrewdriverButtonPressed) {
            console.log("boschScrewdriverButtonReleased");
            this.boschScrewdriverButtonPressed = false;
            this.boschScrewdriverButtonPressSound.stop();
            this.boschScrewdriverButtonPressSound.offset = 4.05;
            this.boschScrewdriverButtonPressSound.play();
            this.model.getObjectByName("boschScrewdriverButton").rotation.y = THREE.Math.degToRad(0);

            this.boschScrewdriverBitHolderStopTween = new TWEEN.Tween(this)
            .to({ boschScrewdriverBitHolderSpeed: 0.0 }, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => { 
                this.model.getObjectByName("boschScrewdriverBitHolder").rotateZ(this.boschScrewdriverBitHolderSpeed);
            })
            .onComplete(() => {
                this.boschScrewdriverButtonPressSound.stop();
            })
            .start();

        }
    }

    onVLabSceneTouchStart(event) {
        this.onVLabSceneMouseDown(event);
    }

    onVLabSceneMouseDown(event) {
        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);

        if (interactionObjectIntersects.length > 0) {
            switch (interactionObjectIntersects[0].object.name) {
                case 'boschScrewdriverButton':
                    this.boschScrewdriverButtonPress();
                break;
            }
        }
    }

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

    animate(time) {
        var delta = this.clock.getDelta() * 1000;
        this.currentDisplayTime += delta;

        if (this.currentDisplayTime > this.tileDisplayDuration)
        {
            this.currentDisplayTime = 0;

            this.model.getObjectByName("bernzomaticTS800TorchFlame").rotateX((1.5 + Math.random()) * (Math.random() < 0.5 ? -1 : 1));

            // this.currentTile++;
            // if (this.currentTile == this.numberOfTiles) this.currentTile = 0;
            // var currentColumn = this.currentTile % this.tilesHorizontal;

            // // var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);

            // this.bernzomaticTS800TorchFlameMap.offset.x = currentColumn / this.tilesHorizontal;
            // this.bernzomaticTS800TorchFlameMap.offset.y = 0;//currentRow / this.tilesVertical;
        }

        // TWEEN.update(time);

        this.prevTime = time;
    }

}