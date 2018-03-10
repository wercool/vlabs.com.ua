import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';
import VLab                 from '../../vlabs.core/vlab';
import Inventory            from '../../vlabs.core/inventory';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

var self = undefined;

export default class BoshScrewdriver {
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

       self = this;

       this.initialize();

       this.prevTime = 0;
    }

    initialize() {
        this.context.loadVLabItem("/vlabs.items/boshScrewdriver/bosch-screwdriver.json", "BoshScrewdriver").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            this.model.getObjectByName("boschScrewdriverButton").mousePressHandler = this.boschScrewdriverButtonPress;
            this.model.getObjectByName("boschScrewdriverButton").mouseReleaseHandler = this.boschScrewdriverButtonRelease;

            this.interactiveElements.push(this.model.getObjectByName("boschScrewdriverButton"));

            this.interactiveSuppressElements.push(this.model);

            this.accessableInteractiveELements = this.interactiveElements.concat(this.interactiveSuppressElements);

            this.boschScrewdriverButtonPressSound = new Audio('/vlabs.items/boshScrewdriver/sounds/sound1.mp3');
            this.boschScrewdriverButtonPressSoundTime = 0;

            this.context.nature.objectMenus[this.model.name] = {
                "en": [{
                    "title": "Pick",
                    "icon": "fa fa-hand-rock",
                    "click": "takeObject"
                    },{
                        "title": "To Inventory",
                        "icon": "toolboxMenuIcon",
                        "click": "takeObjectToInventory"
                    }, {
                    "title": "Info",
                    "icon": ["fa fa-info"],
                    "click": "showInfo",
                    "args": {   "title": "Bosch IXO III 3.6-Volt Multipurpose Screwdriver",
                                "html": '<div style="text-align: center; padding-top: 5pt;"><iframe width="90%" height="300" src="https://www.youtube.com/embed/VXADzvSTosc" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>'}
                    }, {
                    "disabled": true
                    }, {
                    "disabled": true
                    }, {
                    "disabled": true
                    }],
            };

            if (this.initObj.inventory) {
                this.initObj.inventory.addItem({
                    item: this.model,
                    initObj: this.initObj,
                    vLabItem: this
                });
                console.log("BoshScrewdriver added to Inventory");
            } else {
                this.context.vLabScene.add(this.model);
                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("BoshScrewdriver is not set");
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
    
                    this.context.addZoomHelper(this.model.name, 
                                                this.model, 
                                                new THREE.Vector3(-0.1, 0.0, 0.1), 
                                                new THREE.Vector3(0.1, 0.1, 0.1),
                                                Math.PI * 2,
                                                0xffffff,
                                                true,
                                                0.35);
                }
            }
        }).catch(error => {
            console.error(error);
        });
    }

    redererFrameEventHandler(time) {
        this.initObj.inventory.iteractionRaycaster.setFromCamera(this.initObj.inventory.mouseCoordsRaycaster, this.initObj.inventory.defaultCamera);
        var interactionObjectIntersects = this.initObj.inventory.iteractionRaycaster.intersectObjects(this.accessableInteractiveELements);
        if (interactionObjectIntersects.length > 0) {
            this.hoveredObject = interactionObjectIntersects[0].object;
            if (this.hoveredObject.mousePressHandler) {
                this.initObj.inventory.webGLContainer.style.cursor = 'pointer';
                if (this.initObj.inventory.mouseDown) {
                    this.hoveredObject.mousePressHandler.call();
                }
            }
        } else {
            this.initObj.inventory.webGLContainer.style.cursor = 'auto';
        }

        if (self.boschScrewdriverButtonPressed) {
            this.boschScrewdriverButtonPressSoundTime += (time - this.prevTime) / 1000;
            if (this.boschScrewdriverButtonPressSoundTime > 4.2) {
                self.boschScrewdriverButtonPressSound.currentTime = 0.3;
                this.boschScrewdriverButtonPressSoundTime = 0;
            }
            self.model.getObjectByName("boschScrewdriverBitHolder").rotateZ(self.boschScrewdriverBitHolderSpeed);
        }

        TWEEN.update(time);

        this.prevTime = time;
    }

    mouseUpHandler(event) {
        self.boschScrewdriverButtonRelease();
    }

    boschScrewdriverButtonPress() {
        if (!self.boschScrewdriverButtonPressed) {
            console.log("boschScrewdriverButtonPressed");
            self.boschScrewdriverButtonPressed = true;
            self.model.getObjectByName("boschScrewdriverButton").rotation.y = THREE.Math.degToRad(7);
            self.boschScrewdriverButtonPressSoundTime = 0;
            self.boschScrewdriverButtonPressSound.currentTime = 0;
            self.boschScrewdriverButtonPressSound.play();
            if (self.boschScrewdriverBitHolderStopTween) self.boschScrewdriverBitHolderStopTween.stop();
            self.boschScrewdriverBitHolderSpeed = 0.6;
        }
    }

    boschScrewdriverButtonRelease() {
        if (self.boschScrewdriverButtonPressed) {
            console.log("boschScrewdriverButtonReleased");
            self.boschScrewdriverButtonPressSound.currentTime = 4.05;
            self.model.getObjectByName("boschScrewdriverButton").rotation.y = THREE.Math.degToRad(0);
            self.boschScrewdriverButtonPressed = false;

            self.boschScrewdriverBitHolderStopTween = new TWEEN.Tween(self)
            .to({ boschScrewdriverBitHolderSpeed: 0.0 }, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => { 
                self.model.getObjectByName("boschScrewdriverBitHolder").rotateZ(self.boschScrewdriverBitHolderSpeed);
            })
            .start();

        }
    }
}