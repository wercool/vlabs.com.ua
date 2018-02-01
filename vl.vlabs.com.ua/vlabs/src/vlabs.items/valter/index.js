import * as THREE           from 'three';

export default class Valter {
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
        this.context.loadVLabItem("/vlabs.items/valter/valter-sim.json", "Valter").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }
            this.context.vLabScene.add(this.model);
            if (this.pos) {
                this.model.position.copy(this.pos);
            } else {
                console.error("Valter is not set");
            }
        }).catch(error => {
            console.error(error);
        });
    }
}