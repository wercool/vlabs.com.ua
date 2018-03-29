import * as THREE           from 'three';
import VLab from '../../vlabs.core/vlab';
import Inventory from '../../vlabs.core/inventory';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

export default class ClampMeterUEIDL479 {
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
        this.context.loadVLabItem("../vlabs.items/clampMeterUEIDL479/clampMeterUEIDL479.json", "clampMeterUEIDL479").then((scene) => {
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
                    "args": {   "title": "CLAMP METER UEi DL479",
                                "html": '<ul style="color: white;">\
                                <li>True RMS</li>\
                                <li>600A AC</li>\
                                <li>750V AC/600V DC</li>\
                                <li>Resistance 60MO</li>\
                                <li>Capacitance 2000µF</li>\
                                <li>Temperature 14° to 752°F (-10° to 400°C)</li>\
                                <li>DC microamps 2000µA</li>\
                                <li>Frequency/Duty cycle</li>\
                                <li>Diode test</li>\
                                <li>Non-contact voltage detection</li>\
                                <li>Audible continuity</li>\
                                <li>2-Year limited warranty</li>\
                                </ul>'}
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
                console.log("ClampMeterUEIDL479 added to Inventory");
            } else {
                this.context.vLabScene.add(this.model);
                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("ClampMeterUEIDL479 is not set");
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