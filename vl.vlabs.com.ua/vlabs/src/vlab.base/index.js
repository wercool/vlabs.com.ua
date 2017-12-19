import * as THREE from 'three';
import VLab from "../vlabs.assets/core/vlab";

class VlabBase extends VLab {
    constructor(initObj = {}) {
        super(initObj);
        super.initialize().then((result) => {
            this.initialize();
        });
    }

    initialize () {
        this.loadScene().then((vLabScene) => {
            vLabScene.traverse(function(obj) {
                console.log(obj);
            });
        }).catch(error => {
            console.error(error);
        });
    }
}

let vLabBase = new VlabBase({
    "natureURL": "http://localhost:9001/vlab.base/resources/nature.json",
    "webGLContainer": "webGLContainer"
});