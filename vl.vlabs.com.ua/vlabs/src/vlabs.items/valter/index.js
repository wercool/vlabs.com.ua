import * as THREE           from 'three';
import * as THREEUtils      from '../../vlabs.core/utils/three.utils';
var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

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
       if (this.initObj.name) {
        this.name = this.initObj.name;
        }

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("../vlabs.items/valter/valter-sim.json", "Valter").then((scene) => {
            this.model = scene.children[0];

            this.context.vLabScene.add(this.model);

            if (this.pos) {
                this.model.position.copy(this.pos);
            } else {
                console.error("Valter is not set");
            }

            this.cableSleeveMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } );

            this.baseFrame      = this.model.getObjectByName('baseFrame');
            this.bodyFrame      = this.model.getObjectByName('bodyFrame');
            this.torsoFrame     = this.model.getObjectByName('torsoFrame');
            this.headTiltLink   = this.model.getObjectByName('headTiltLink');
            this.headFrame      = this.model.getObjectByName('headFrame');

            this.torsoFrameCableInput = new THREE.Object3D();
            this.torsoFrameCableInput.position.set(0.0, -0.101, 0.38);
            this.torsoFrame.add(this.torsoFrameCableInput);

            this.headFrameCableInput = new THREE.Object3D();
            this.headFrameCableInput.position.set(0.0, 0.1036, 0.057);
            this.headFrame.add(this.headFrameCableInput);

            this.model.updateMatrixWorld();
            this.torsoFrameToHeadFrameCableCurve = new THREE.CatmullRomCurve3([
                this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.torsoFrameCableInput)),
                this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.torsoFrameCableInput)).add(new THREE.Vector3(0.0, -0.0175, 0.025)),
                this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.torsoFrameCableInput)).add(new THREE.Vector3(0.0, -0.075, 0.15)),
                this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.headFrameCableInput)).add(new THREE.Vector3(0.0, -0.02, 0.0)),
                this.torsoFrame.worldToLocal(THREEUtils.getWorldPosition(this.headFrameCableInput))
            ]);

            this.torsoFrameToHeadFrameCableGeometry = new THREE.TubeBufferGeometry(this.torsoFrameToHeadFrameCableCurve, 12, 0.01, 5);
            this.torsoFrameToHeadFrameCableMesh = new THREE.Mesh(this.torsoFrameToHeadFrameCableGeometry, this.cableSleeveMaterial);
            this.torsoFrame.add(this.torsoFrameToHeadFrameCableMesh);



            if (this.initObj.manipulation) {
                this.manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
                this.manipulationControl.setSize(1.0);
                this.context.vLabScene.add(this.manipulationControl);
                this.context.manipulationControl.attach(this.model);
            }
        }).catch(error => {
            console.error(error);
        });
    }
}