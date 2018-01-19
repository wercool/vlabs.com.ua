import * as THREE           from 'three';
import particleFire         from 'three-particle-fire';

var self = undefined;

export default class ParticleFireEffect {
    constructor(initObj) {
        self = this;
        this.initObj = initObj;
        this.clock = new THREE.Clock();
        this.initializeEffect();
    }

    initializeEffect() {
        particleFire.install( { THREE: THREE } );

        var geometry0 = new particleFire.Geometry(this.initObj.fireRadius, this.initObj.fireHeight, this.initObj.particleCount);
        var material0 = new particleFire.Material({ color: this.initObj.color });
        material0.setPerspective(this.initObj.context.defaultCamera.fov, this.initObj.context.webGLContainer.clientHeight);
        this.particleFireMesh0 = new THREE.Points(geometry0, material0);
        this.particleFireMesh0.position.copy(this.initObj.pos);
        this.particleFireMesh0.visible = false;
        this.initObj.context.vLabScene.add(this.particleFireMesh0);
    }

    start() {
        addEventListener("redererFrameEvent",  this.onRedererFrameEvent);
        addEventListener("resize", this.resize);
        this.particleFireMesh0.visible = true;
    }

    stop() {
        removeEventListener("redererFrameEvent", this.onRedererFrameEvent);
        removeEventListener("resize", this.resize);
        this.particleFireMesh0.visible = false;
    }

    resize() {
        self.particleFireMesh0.material.setPerspective(self.initObj.context.defaultCamera.fov, self.initObj.context.webGLContainer.clientHeight);
    }

    onRedererFrameEvent(event) {
        self.particleFireMesh0.material.update(self.clock.getDelta());
    }
}