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

    setupEnvMaterials(materialsObj) {
        var textureLoader = new THREE.TextureLoader();

        var reversingValveEF17BZ251Tube = this.model.parent.getObjectByName("reversingValveEF17BZ251Tube");
        reversingValveEF17BZ251Tube.material.envMap = materialsObj.envMap;
        reversingValveEF17BZ251Tube.material.combine = THREE.MixOperation;
        reversingValveEF17BZ251Tube.material.reflectivity = 0.1;
        reversingValveEF17BZ251Tube.material.needsUpdate = true;

        if (this.context.nature.bumpMaps) {
            Promise.all([
                textureLoader.load('/vlabs.items/hvac/reversingValveEF17BZ251/maps/brass-bump.jpg')
            ])
            .then((result) => {
                reversingValveEF17BZ251Tube.material.bumpMap = result[0];
                reversingValveEF17BZ251Tube.material.bumpScale = 0.000075;
                reversingValveEF17BZ251Tube.material.needsUpdate = true;
            })
            .catch(error => {
                console.error(error);
            });
        }
        if (this.context.nature.alphaMaps) {
            Promise.all([
                textureLoader.load('/vlabs.items/hvac/reversingValveEF17BZ251/maps/reversingValveEF17BZ251TubeMaterialAlphaMap.jpg')
            ])
            .then((result) => {
                reversingValveEF17BZ251Tube.material.alphaMap = result[0];
                reversingValveEF17BZ251Tube.material.transparent = true;
                reversingValveEF17BZ251Tube.material.needsUpdate = true;
            })
            .catch(error => {
                console.error(error);
            });
        }

        console.log(reversingValveEF17BZ251Tube.material);
    }
}