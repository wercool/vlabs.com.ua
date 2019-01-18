import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as AmmoJSUTILS from '../../../../vlab.fwk/utils/ammo.utils';

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

        /*<dev>*/
        /**
         * dummyObject
         */
        this.dummyObject.position.copy(new THREE.Vector3(0.1, 0.1, 0.1));
        /*</dev>*/

        this.vLab.WebGLRenderer.gammaFactor = 1.5;

        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.add(this.ambientLight);

        this.pointLight = new THREE.PointLight(0xffffff, 2.0);
        this.pointLight.position.copy(new THREE.Vector3(0.0, 1.0, 0.1));
        this.add(this.pointLight);

        /**
         * This VLabScene meshes references
         */
        this.LamborghiniMiura1971P400SV = this.getObjectByName('LamborghiniMiura1971P400SV');
        this.LamborghiniMiura1971P400SV.position.add(new THREE.Vector3(0.0, 0.2, 0.0));

        /**
         * Initialize AmmoJS
         */
        this.onAmmoJSReady = this.onAmmoJSReady.bind(this);
        Ammo().then(this.onAmmoJSReady);
    }
    /**
     * onAmmoJSReady
     */
    onAmmoJSReady(Ammo) {
        /**
         * Physics configuration
         */

        this.AMMO_TRANSFORM_AUX = new Ammo.btTransform();
        this.AMMO_DISABLE_DEACTIVATION = 4;
        this.G = -0.2;//-9.82;

        this.PhysicsConfiguration = {};
        this.PhysicsConfiguration.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.PhysicsConfiguration.dispatcher = new Ammo.btCollisionDispatcher(this.PhysicsConfiguration.collisionConfiguration);
        this.PhysicsConfiguration.broadphase = new Ammo.btDbvtBroadphase();
        this.PhysicsConfiguration.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.PhysicsConfiguration.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.PhysicsConfiguration.dispatcher, this.PhysicsConfiguration.broadphase, this.PhysicsConfiguration.solver, this.PhysicsConfiguration.collisionConfiguration);
        this.PhysicsConfiguration.physicsWorld.setGravity(new Ammo.btVector3(0, this.G, 0));

        this.prepareAmmoJSBodies();
    }
    /**
     * Prepare AmmoJS bodies
     */
    prepareAmmoJSBodies() {
        this.ammoBodies = [];
        let ammoBody;

        ammoBody = AmmoJSUTILS.ammoBoxBody({
            mesh: this.LamborghiniMiura1971P400SV,
            mass: 0.1,
            friction: 0.1,
            restitution: 0.9,
            deactivation: this.AMMO_DISABLE_DEACTIVATION
        });
        this.PhysicsConfiguration.physicsWorld.addRigidBody(ammoBody.body);
        this.ammoBodies.push(ammoBody);

// ground
this.groundGeometry = new THREE.BoxGeometry(1, 0.001, 1);
this.groundGeometry.computeBoundingBox();
var material = new THREE.MeshBasicMaterial({color: 0x454545});
this.ground = new THREE.Mesh(this.groundGeometry, material);
this.ground.position.copy(new THREE.Vector3(0.0, -0.05, 0.0));
this.add(this.ground);

ammoBody = AmmoJSUTILS.ammoBoxBody({
    mesh: this.ground,
    mass: 0.0,
    friction: 0.1
});
this.PhysicsConfiguration.physicsWorld.addRigidBody(ammoBody.body);
this.ammoBodies.push(ammoBody);


        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    framerequest:         this.onFramerequest
                }
            }
        });
    }
    /**
     * onFramerequest
     */
    onFramerequest(params) {
        this.ammoBodies.forEach(ammoBody => {
            if (ammoBody.mass > 0.0) {
                let ms = ammoBody.body.getMotionState();
                ms.getWorldTransform(this.AMMO_TRANSFORM_AUX);
                var p = this.AMMO_TRANSFORM_AUX.getOrigin();
                var q = this.AMMO_TRANSFORM_AUX.getRotation();
                ammoBody.mesh.position.set(p.x(), p.y(), p.z());
                ammoBody.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        });

        this.PhysicsConfiguration.physicsWorld.stepSimulation(params.dt, 10);
    }
}

export default BaseScene;