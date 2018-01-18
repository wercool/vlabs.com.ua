import * as THREE           from 'three';

var self = undefined;

export default class WaterStream {
    constructor(initObj) {
        this.initObj = initObj;
        this.clock = new THREE.Clock();
        this.initialize();
        self = this;
    }

    initialize() {
        if (this.initObj.streamPathPoints) {
            this.streamPathPoints = this.initObj.streamPathPoints;
        } else {
            this.streamPathPoints = [this.initObj.startsAt, this.initObj.endsAt];
        }
        this.streamPath = new THREE.CatmullRomCurve3(this.streamPathPoints);
        this.streamPath.type = 'chordal';
        this.streamPath.closed = false;

        this.geometry = new THREE.TubeBufferGeometry(this.streamPath, 
                                                     (this.initObj.tubularSegments) ? this.initObj.tubularSegments : 16, 
                                                     this.initObj.radius, 
                                                     (this.initObj.radialSegments) ? this.initObj.radialSegments : 8, 
                                                     false);

        this.material = new THREE.MeshBasicMaterial({
                                                     color: 0x00ff00
                                                    });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.initObj.pos);
        this.mesh.name = this.initObj.name;

        this.initObj.context.vLabScene.add(this.mesh);
        console.log("WaterStream '" + this.initObj.name +"' initialized");
    }
}