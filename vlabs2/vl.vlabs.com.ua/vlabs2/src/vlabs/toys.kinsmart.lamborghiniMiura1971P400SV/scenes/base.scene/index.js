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
        this.pointLight.position.copy(new THREE.Vector3(0.0, 1.0, 0.1));
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
this.LamborghiniMiura1971P400SV.chassis.visible = false;

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
        this.PhysicsConfiguration.AMMO_DISABLE_DEACTIVATION = 4;
        this.PhysicsConfiguration.G = -9.82;
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
        this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle = new AmmoJSUTILS.AmmoJSRaycastVehicle({
            vLabScene: this,
            vehiclePos: new THREE.Vector3(0.0, 2.0, 0.0),
            vehicleQuat: new THREE.Quaternion(0.0, 0.0, 0.0, 1.0),
            physicsConfiguration: this.PhysicsConfiguration
        });

        this.ammoBodies = [];
        let ammoBody;

// ground
let groundGeometry = new THREE.BoxGeometry(100, 0.001, 100);
groundGeometry.computeBoundingBox();
var groundMaterial = new THREE.MeshLambertMaterial({color: 0x454545});
let groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.position.copy(new THREE.Vector3(0.0, -0.0005, 0.0));
this.add(groundMesh);
ammoBody = AmmoJSUTILS.ammoBoxShapeBody({
    mesh: groundMesh,
    mass: 0.0,
    friction: 0.1
});
this.PhysicsConfiguration.physicsWorld.addRigidBody(ammoBody.body);
this.ammoBodies.push(ammoBody);


//         this.LamborghiniMiura1971P400SVChassisAmmoBody = AmmoJSUTILS.ammoBoxShapeBody({
//             mesh: this.LamborghiniMiura1971P400SV.chassis,
//             mass: 0.2,
//             friction: 0.1,
//             restitution: 0.9,
//             deactivation: this.AMMO_DISABLE_DEACTIVATION,
//             boxMargins: new THREE.Vector3(0.0, 0.005, 0.0)
//         });
//         this.PhysicsConfiguration.physicsWorld.addRigidBody(this.LamborghiniMiura1971P400SVChassisAmmoBody.body);
//         this.ammoBodies.push(this.LamborghiniMiura1971P400SVChassisAmmoBody);


// // // dummy
// // let dummyGeometry = new THREE.BoxGeometry(0.05, 0.03, 0.1);
// // dummyGeometry.computeBoundingBox();
// // var dummyMaterial = new THREE.MeshLambertMaterial({color: 0x45ff45});
// // let dummyMesh = new THREE.Mesh(dummyGeometry, dummyMaterial);
// // dummyMesh.position.copy(new THREE.Vector3(0.0, 0.1, 0.0));
// // this.add(dummyMesh);
// // ammoBody = AmmoJSUTILS.ammoBoxShapeBody({
// //     mesh: dummyMesh,
// //     mass: 0.1,
// //     friction: 0.1
// // });
// // this.PhysicsConfiguration.physicsWorld.addRigidBody(ammoBody.body);
// // this.ammoBodies.push(ammoBody);


//         // Raycast Vehicle
//         let wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
//         let wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
//         let tuning = new Ammo.btVehicleTuning();

//         let rayCaster = new Ammo.btDefaultVehicleRaycaster(this.PhysicsConfiguration.physicsWorld);
//         this.LamborghiniMiura1971P400SVVehicle = new Ammo.btRaycastVehicle(tuning, this.LamborghiniMiura1971P400SVChassisAmmoBody, rayCaster);
//         this.LamborghiniMiura1971P400SVVehicle.setCoordinateSystem(0, 1, 2);
//         this.PhysicsConfiguration.physicsWorld.addAction(this.LamborghiniMiura1971P400SVVehicle);



//         var addWheel = function(vehicle, isFront, pos, radius) {
//             var wheelInfo = vehicle.addWheel(
//                             pos,
//                             wheelDirectionCS0,
//                             wheelAxleCS,
//                             0.6,
//                             radius,
//                             tuning,
//                             isFront);
//             // wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
//             // wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
//             // wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
//             // wheelInfo.set_m_frictionSlip(friction);
//             // wheelInfo.set_m_rollInfluence(rollInfluence);
//         }

//         addWheel(this.LamborghiniMiura1971P400SVVehicle, true, this.LamborghiniMiura1971P400SV.wheelFL.position, 0.012);
//         addWheel(this.LamborghiniMiura1971P400SVVehicle, true, this.LamborghiniMiura1971P400SV.wheelFR.position, 0.012);
//         addWheel(this.LamborghiniMiura1971P400SVVehicle, false, this.LamborghiniMiura1971P400SV.wheelRL.position, 0.012);
//         addWheel(this.LamborghiniMiura1971P400SVVehicle, false, this.LamborghiniMiura1971P400SV.wheelRR.position, 0.012);


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

        this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle.sync();

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