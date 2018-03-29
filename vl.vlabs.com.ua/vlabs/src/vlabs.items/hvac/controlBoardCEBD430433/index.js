import * as THREE           from 'three';
import VLab                 from '../../../vlabs.core/vlab';

export default class ControlBoardCEBD430433 {
    /*
    initObj {
        "context": VLab,
    }
    */
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.pos = initObj.pos;

       this.itemName = this.initObj.itemName;

       this.accessableInteractiveELements = [];

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("../vlabs.items/hvac/controlBoardCEBD430433/control-board.json", "controlBoardCEBD430433").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            if (this.initObj.detailedView) {
                this.initObj.detailedView.addVLabItem(this);
                this.parent = this.initObj.detailedView;
            } else {
                this.context.vLabScene.add(this.model);
                this.parent = this.context;
            }


            if (this.pos) {
                this.model.position.copy(this.pos);
            } else {r
                console.error("Control Board CEBD430433is not set");
            }

        }).catch(error => {
            console.error(error);
        });
    }

}