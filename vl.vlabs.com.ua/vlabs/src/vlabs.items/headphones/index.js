import * as THREE           from 'three';
import VLab from '../../vlabs.core/vlab';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

export default class HeadPhones {
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

       this.interactiveElements = [];
       this.interactiveSuppressElements = [];
       this.accessableInteractiveELements = [];

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("../vlabs.items/headphones/headphones.json", "HeadPhones").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            // this.context.nature.objectMenus[this.model.name] = {
            //     "en": [{
            //         "title": "Pick",
            //         "icon": "fa fa-hand-rock",
            //         "click": "takeObject"
            //         }, {
            //         "title": "Info",
            //         "icon": ["fa fa-info"],
            //         "click": "showInfo",
            //         "args": {   "title": "Stanley 69-189 Ratchet Multi Bit Screwdriver",
            //                     "html": '<span style="color: white;">\
            //                     The Stanley 69-189 Ratcheting Multi-Bit Screwdriver is a multi-bit ratcheting screwdriver that holds 6 bits securely in the handle. The handle is made from a bi-material texture for torque. Its ratcheting mechanism works in 3 different positions. The bits are made of chrome vanadium steel. It features a 3-position ratcheting mechanism which enables clockwise, counter clockwise and locked ratcheting positions. The quick release magnetic bit holder provides for fast and secure bit change capability. Bi-material textured handle for torque. Includes: 6 chrome vanadium (CRV) bits stored inside the handle for easy access. Dimensions (L x W x H): 11.8" x 3.6" x 1.3" Made in Taiwan\
            //                     </span>'}
            //         }, {
            //         "disabled": true
            //         }, {
            //         "disabled": true
            //         }, {
            //         "disabled": true
            //         }],
            // };

            this.model.castShadow = true;

            this.context.vLabScene.add(this.model);
            if (this.initObj.position) {
                this.model.position.copy(this.initObj.position);
            } else {
                console.error("HeadPhones is not set");
            }

            if (this.initObj.rotation) {
                this.model.rotation.set(this.initObj.rotation.x, this.initObj.rotation.y, this.initObj.rotation.z);
            }

            if (this.initObj.manipulation) {
                this.manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
                this.manipulationControl.setSize(1.0);
                this.context.vLabScene.add(this.manipulationControl);
                this.context.manipulationControl.attach(this.model);
            }
            // if (this.initObj.interactive) {
            //     this.context.addSelectionHelperToObject(this.model);
            //     this.context.nature.interactiveObjects.push(this.model.name);
            //     this.context.setInteractiveObjects();
            // }

            this.model.mousePressHandler = this.modelPressed;
            this.interactiveElements.push(this.model);

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
    }

    onVLabSceneTouchEnd(evnet) {
        this.onVLabSceneMouseUp(event);
    }

    onVLabSceneMouseUp(event) {
        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.accessableInteractiveELements);

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);
        // var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(this.accessableInteractiveELements);

        if (interactionObjectIntersects.length > 0) {
            // if (interactionObjectIntersects[0].object.userData['TrueRMSMultimeterHS36']) {
            //     this.showTestPointsHelpers(interactionObjectIntersects[0].object);
            // }
            if (interactionObjectIntersects[0].object.name.indexOf('headPhones') > -1) {
                if (interactionObjectIntersects[0].object.mousePressHandler) {
                    interactionObjectIntersects[0].object.mousePressHandler.call(this, interactionObjectIntersects[0].object);
                }
            }
        }
    }

    modelPressed() {
        console.log(this.name + ' pressed');
        if (this.audio == undefined) {
            this.audio = new Audio('../vlabs.items/headphones/defaultPlaylist/track1.m4a');
            this.audio.volume = 0.1;
            this.audio.play();
            this.setTransparency(true);
        } else {
            if (this.audio.paused) {
                this.audio.play();
                this.setTransparency(true);
            } else {
                this.audio.pause();
                this.setTransparency(false);
            }
        }
    }

    setTransparency(mode) {
        if (mode == true) {
            this.model.material.transparent = true;
            this.model.material.opacity = 0.1;
            this.model.material.side = THREE.FrontSide;
            this.model.castShadow = false;
        } else {
            this.model.material.transparent = false;
            this.model.material.opacity = 1.0;
            this.model.material.side = THREE.DoubleSide;
            this.model.castShadow = true;
        }
        this.model.material.needsUpdate = true;
    }
}