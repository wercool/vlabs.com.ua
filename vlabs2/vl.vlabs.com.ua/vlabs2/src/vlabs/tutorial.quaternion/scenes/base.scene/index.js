import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class BaseScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    /**
     * Override VLabScene.onLoaded and called when VLabScene nature JSON is loaded as minimum
     */
    onLoaded() {
        console.log('BaseScene onLoaded()');
        /**
         * Trace VLabScene object (this)
         */
        console.log(this);

        this.dummyObject.position.copy(new THREE.Vector3(1.0, 1.0, 1.0));

        this.pointLight = new THREE.PointLight(0xffffff, 2.0);
        this.pointLight.position.copy(new THREE.Vector3(2.0, 2.0, 2.0));
        this.add(this.pointLight);

        var height = 1.0;
        var geometry = new THREE.ConeGeometry(0.1, height, 16);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 2, 0));
        var material = new THREE.MeshLambertMaterial({color: 0x0000ff});
        this.cone = new THREE.Mesh(geometry, material);
        this.add(this.cone);

        this.cone.quaternion.copy(this.cone.quaternion.clone().setFromAxisAngle(new THREE.Vector3(1.0, 1.0, 1.0).normalize(), THREE.Math.degToRad(-90.0)));
    }
}

export default BaseScene;