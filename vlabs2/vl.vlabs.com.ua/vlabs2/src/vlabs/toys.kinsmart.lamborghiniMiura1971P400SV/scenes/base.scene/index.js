import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import * as AmmoJSUTILS from '../../../../vlab.fwk/utils/ammojs.utils';

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

        this.pointLight = new THREE.PointLight(0xffffff, 5.0);
        this.pointLight.position.copy(new THREE.Vector3(0.0, 2.0, 0.0));
        this.add(this.pointLight);

        /**
         * This VLabScene meshes references
         */
        this.LamborghiniMiura1971P400SV = {
            chassis: this.getObjectByName('LamborghiniMiura1971P400SV'),
            wheelFL: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('wheelFL'),
            wheelFR: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('wheelFR'),
            wheelRL: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('wheelRL'),
            wheelRR: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('wheelRR')
        };
        this.LamborghiniMiura1971P400SV.chassis.position.add(new THREE.Vector3(0.0, 0.2, 0.0));
// this.LamborghiniMiura1971P400SV.chassis.visible = false;

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

        this.PhysicsConfiguration = {};
        this.PhysicsConfiguration.AMMO_TRANSFORM_AUX = new Ammo.btTransform();
        // var STATE = {
        //     ACTIVE : 1,
        //     ISLAND_SLEEPING : 2,
        //     WANTS_DEACTIVATION : 3,
        //     DISABLE_DEACTIVATION : 4,
        //     DISABLE_SIMULATION : 5
        // };
        this.PhysicsConfiguration.AMMO_DISABLE_DEACTIVATION = 4;
        this.PhysicsConfiguration.G = -1.4;//-9.82;
        this.PhysicsConfiguration.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.PhysicsConfiguration.dispatcher = new Ammo.btCollisionDispatcher(this.PhysicsConfiguration.collisionConfiguration);
        this.PhysicsConfiguration.broadphase = new Ammo.btDbvtBroadphase();
        this.PhysicsConfiguration.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.PhysicsConfiguration.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.PhysicsConfiguration.dispatcher, this.PhysicsConfiguration.broadphase, this.PhysicsConfiguration.solver, this.PhysicsConfiguration.collisionConfiguration);
        this.PhysicsConfiguration.physicsWorld.setGravity(new Ammo.btVector3(0, this.PhysicsConfiguration.G, 0));


        this.prepareAmmoJSBodies();
    }
    /**
     * Prepare AmmoJS bodies
     */
    prepareAmmoJSBodies() {
        // this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle = new AmmoJSUTILS.AmmoJSRaycastVehicle({
        //     vLabScene: this,
        //     vehiclePos: new THREE.Vector3(0.0, 2.0, 0.0),
        //     vehicleQuat: new THREE.Quaternion(0.0, 0.0, 0.0, 1.0),
        //     physicsConfiguration: this.PhysicsConfiguration
        // });

        this.ammoBodies = [];
        let ammoBody;

// ground
let groundGeometry = new THREE.BoxGeometry(1, 0.001, 1);
groundGeometry.computeBoundingBox();
var groundMaterial = new THREE.MeshLambertMaterial({color: 0x454545});
let groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.position.copy(new THREE.Vector3(0.0, -0.0005, 0.0));
groundMesh.quaternion.copy(new THREE.Quaternion(0.05, 0.0, 0.0, 1.0));
this.add(groundMesh);
ammoBody = AmmoJSUTILS.ammoBoxShapeBody({
    mesh: groundMesh,
    mass: 0.0,
    friction: 0.1
});
this.PhysicsConfiguration.physicsWorld.addRigidBody(ammoBody.body);
this.ammoBodies.push(ammoBody);

ammoBody = AmmoJSUTILS.ammoBoxShapeBody({
    mesh: this.LamborghiniMiura1971P400SV.chassis,
    mass: 0.2,
    friction: 0.1,
    deactivation: 3
});
this.PhysicsConfiguration.physicsWorld.addRigidBody(ammoBody.body);
this.ammoBodies.push(ammoBody);


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
        // this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle.sync();

        this.ammoBodies.forEach(ammoBody => {
            if (ammoBody.mass > 0.0) {
                let ms = ammoBody.body.getMotionState();
                ms.getWorldTransform(this.PhysicsConfiguration.AMMO_TRANSFORM_AUX);
                var p = this.PhysicsConfiguration.AMMO_TRANSFORM_AUX.getOrigin();
                var q = this.PhysicsConfiguration.AMMO_TRANSFORM_AUX.getRotation();
                ammoBody.mesh.position.set(p.x(), p.y(), p.z());
                ammoBody.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        });

        this.PhysicsConfiguration.physicsWorld.stepSimulation(params.dt, 10);
    }
}

export default BaseScene;