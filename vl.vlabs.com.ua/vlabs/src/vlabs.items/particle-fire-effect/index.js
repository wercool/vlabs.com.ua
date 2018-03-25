import * as THREE           from 'three';
import particleFire         from 'three-particle-fire';

export default class ParticleFireEffect {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
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
        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.renderframe["ParticleFireEffect" + this.initObj.name + "vLabSceneRenderFrame"] = 
        {
            callback: this.onRedererFrameEvent,
            instance: this
        };

        addEventListener("resize", this.resize.bind(this));
        this.particleFireMesh0.visible = true;
    }

    stop() {
        delete this.context.webGLContainerEventsSubcribers.renderframe["ParticleFireEffect" + this.initObj.name + "vLabSceneRenderFrame"];
        removeEventListener("resize", this.resize);
        this.particleFireMesh0.visible = false;
    }

    resize() {
        this.particleFireMesh0.material.setPerspective(this.initObj.context.defaultCamera.fov, this.initObj.context.webGLContainer.clientHeight);
    }

    onRedererFrameEvent(event) {
        this.particleFireMesh0.material.update(this.clock.getDelta());
    }
}