import * as THREE           from 'three';
import VLab from '../../vlabs.core/vlab';
import Inventory from '../../vlabs.core/inventory';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

export default class FatMaxScrewdriver {
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

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("../vlabs.items/fatMaxScrewdriver/fatMaxScrewdriver.json", "FatMaxScrewdriver").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            this.context.nature.objectMenus[this.model.name] = {
                "en": [{
                    "title": "Pick",
                    "icon": "fa fa-hand-rock",
                    "click": "takeObject"
                    }, {
                    "title": "Info",
                    "icon": ["fa fa-info"],
                    "click": "showInfo",
                    "args": {   "title": "Stanley 69-189 Ratchet Multi Bit Screwdriver",
                                "html": '<span style="color: white;">\
                                The Stanley 69-189 Ratcheting Multi-Bit Screwdriver is a multi-bit ratcheting screwdriver that holds 6 bits securely in the handle. The handle is made from a bi-material texture for torque. Its ratcheting mechanism works in 3 different positions. The bits are made of chrome vanadium steel. It features a 3-position ratcheting mechanism which enables clockwise, counter clockwise and locked ratcheting positions. The quick release magnetic bit holder provides for fast and secure bit change capability. Bi-material textured handle for torque. Includes: 6 chrome vanadium (CRV) bits stored inside the handle for easy access. Dimensions (L x W x H): 11.8" x 3.6" x 1.3" Made in Taiwan\
                                </span>'}
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
                    initObj: this.initObj
                });
                console.log("FatMaxScrewdriver added to Inventory");
            } else {
                this.context.vLabScene.add(this.model);
                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("FatMaxScrewdriver is not set");
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
        }).catch(error => {
            console.error(error);
        });
    }
}