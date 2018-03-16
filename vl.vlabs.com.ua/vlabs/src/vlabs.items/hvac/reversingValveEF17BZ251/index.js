import * as THREE           from 'three';
import VLab                 from '../../../vlabs.core/vlab';

export default class ReversingValveEF17BZ251 {
    /*
    initObj {
        "context": VLab,
    }
    */
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.pos = initObj.pos;

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("/vlabs.items/hvac/reversingValveEF17BZ251/reversingValveEF17BZ251.json", "reversingValveEF17BZ251").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            if (this.initObj.detailedView) {
                this.initObj.detailedView.addVLabItem(this);
            } else {
                this.context.vLabScene.add(this.model);
            }

            if (this.pos) {
                this.model.position.copy(this.pos);
            } else {r
                console.error("Reversing Valve EF17BZ251 is not set");
            }

        }).catch(error => {
            console.error(error);
        });
    }
}