import * as THREE           from 'three';

var TransformControls       = require('../../vlabs.core/three-transformcontrols/index');

export default class ExtrudedPath {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.name = this.initObj.name;

        this.material = new THREE.MeshLambertMaterial( { color: this.initObj.color ? this.initObj.color : 0xffffff } );
    }

    setPath(pathObj) {
        this.path = new THREE.CatmullRomCurve3(pathObj.path);
        this.geometry = new THREE.TubeGeometry(this.path, 20, 0.002, 6, false);

        if (this.mesh === undefined) {
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.name = this.name + 'Mesh';
            this.context.vLabScene.add(this.mesh);
        } else {
            this.mesh.geometry = this.geometry;
            this.mesh.geometry.verticesNeedUpdate = true;
        }

        if (pathObj.devMode && this.devSphere === undefined) {

            var geometry = new THREE.SphereBufferGeometry(0.0025, 10, 10 );
            var material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
            this.devSphere = new THREE.Mesh( geometry, material );
            this.context.vLabScene.add( this.devSphere );

            this.devSphere.position.copy(pathObj.path[0]);

            this.manipulationControl = new TransformControls(this.context.defaultCamera, this.context.webGLRenderer.domElement);
            this.manipulationControl.setSize(0.5);
            this.manipulationControl.attach(this.devSphere);
            this.context.vLabScene.add(this.manipulationControl);

            document.addEventListener("keydown", (event)=>{
                switch (event.keyCode) {
                    case 13: // Enter
                        console.log(this.name);
                        console.log('position (m): ' + this.devSphere.position.x.toFixed(3) + ', ' + this.devSphere.position.y.toFixed(3) + ', ' + this.devSphere.position.z.toFixed(3));
                    break;

                }
            }, false);
        }
    }
}