import * as THREE           from 'three';
import VLab from '../../vlabs.core/vlab';
import Inventory from '../../vlabs.items/inventory';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

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

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("/vlabs.items/boshScrewdriver/bosch-screwdriver.json", "BoshScrewdriver").then((scene) => {
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
                    item: this.model
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
}