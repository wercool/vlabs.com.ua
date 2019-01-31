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

        var ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
        this.add(ambientLight);

        this.pointLight = new THREE.PointLight(0xffffff, 2.0);
        this.pointLight.position.copy(new THREE.Vector3(2.0, 2.0, 2.0));
        this.add(this.pointLight);

        var height = 1.0;
        var geometry = new THREE.ConeGeometry(0.1, height, 16);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 2, 0));
        // var material = new THREE.MeshNormalMaterial();
        var material = new THREE.MeshLambertMaterial({color: 0x00ffff, wireframe: true});
        this.cone = new THREE.Mesh(geometry, material);

        var geometry = new THREE.BoxGeometry(0.01, 0.01, 0.1);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var cube = new THREE.Mesh(geometry, material);
        cube.position.copy(new THREE.Vector3(0.0, 1.0, 0.05));
        this.cone.add(cube);

        this.add(this.cone);

        this.axis = new THREE.Vector3(1.0, 1.0, 1.0);
        this.angle = 0.0;

        this.arrowHelper = new THREE.ArrowHelper(this.axis.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), this.axis.clone().length(), 0xffff00, 0.1, 0.025);
        this.add(this.arrowHelper);

        // this.cone.position.copy(new THREE.Vector3(1.0, 1.0, 1.0));

        /**
         * Subscribe on events
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    framerequest: this.onFramerequest
                }
            }
        });
    }
    /**
     * onFramerequest
     */
    onFramerequest(params) {
        let rotateQuaternion = new THREE.Quaternion().setFromAxisAngle(this.axis.clone().normalize(), this.angle).normalize();
        // let rotateQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0.0, 1.0, 0.0).normalize(), this.angle).normalize();
        // let positionQuaternion = new THREE.Quaternion().setFromAxisAngle(this.axis.clone().normalize(), 0.0025).normalize();

        this.cone.quaternion.copy(rotateQuaternion);
        // this.cone.position.applyQuaternion(positionQuaternion);

        this.angle += THREE.Math.degToRad(1.0);
    }
}

export default BaseScene;