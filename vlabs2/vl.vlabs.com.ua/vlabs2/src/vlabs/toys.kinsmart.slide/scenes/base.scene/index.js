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
        console.log(this.dummyObject);
        /*</dev>*/

        this.vLab.WebGLRenderer.gammaFactor = 1.5;

        this.ambientLight = new THREE.AmbientLight(0x404040, 0.75);
        this.add(this.ambientLight);

        this.pointLight = new THREE.PointLight(0xffffff, 2.0);
        this.pointLight.position.copy(new THREE.Vector3(0.0, 2.0, 0.0));
        this.pointLight.castShadow = true;
        this.pointLight.shadow.camera.near = 0.1;
        this.pointLight.shadow.camera.far = 3.0;
        this.pointLight.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
        this.pointLight.shadow.mapSize.width = 1204;  // default 512
        this.pointLight.shadow.mapSize.height = 1024; // default 512

        this.add(this.pointLight);

        /**
         * This VLabScene meshes references
         */
        this.LamborghiniMiura1971P400SV = {
            chassis: this.getObjectByName('LamborghiniMiura1971P400SV'),
            wheelFL: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('LamborghiniMiura1971P400SV_wheelFL'),
            wheelFR: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('LamborghiniMiura1971P400SV_wheelFR'),
            wheelRL: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('LamborghiniMiura1971P400SV_wheelRL'),
            wheelRR: this.getObjectByName('LamborghiniMiura1971P400SV').getObjectByName('LamborghiniMiura1971P400SV_wheelRR')
        };
        this.LamborghiniMiura1971P400SV.chassis.position.add(new THREE.Vector3(0.0, 0.05, 0.0));
        this.LamborghiniMiura1971P400SV.chassis.castShadow = true;

        this.Volkswagen1963BusDoublePickup = {
            chassis: this.getObjectByName('Volkswagen1963BusDoublePickup'),
            wheelFL: this.getObjectByName('Volkswagen1963BusDoublePickup').getObjectByName('Volkswagen1963BusDoublePickup_wheelFL'),
            wheelFR: this.getObjectByName('Volkswagen1963BusDoublePickup').getObjectByName('Volkswagen1963BusDoublePickup_wheelFR'),
            wheelRL: this.getObjectByName('Volkswagen1963BusDoublePickup').getObjectByName('Volkswagen1963BusDoublePickup_wheelRL'),
            wheelRR: this.getObjectByName('Volkswagen1963BusDoublePickup').getObjectByName('Volkswagen1963BusDoublePickup_wheelRR')
        };
        this.Volkswagen1963BusDoublePickup.chassis.position.add(new THREE.Vector3(0.25, 0.05, 0.3));
        this.Volkswagen1963BusDoublePickup.chassis.quaternion.copy(new THREE.Quaternion(0.0, THREE.Math.degToRad(-45.0), 0.0, 1.0));

        /**
         * Initialize AmmoJS
         */
        this.onAmmoJSReady = this.onAmmoJSReady.bind(this);
        Ammo().then(this.onAmmoJSReady);

        /**
         * Subscribe on events
         */
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                window: {
                    keydown: this.onKeyDown,
                    keyup: this.onKeyUp
                }
            }
        });
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
        let AMMO_DISABLE_DEACTIVATION = {
            ACTIVE : 1,
            ISLAND_SLEEPING : 2,
            WANTS_DEACTIVATION : 3,
            DISABLE_DEACTIVATION : 4,
            DISABLE_SIMULATION : 5
        };
        this.PhysicsConfiguration.AMMO_DISABLE_DEACTIVATION = AMMO_DISABLE_DEACTIVATION.DISABLE_DEACTIVATION;
        this.PhysicsConfiguration.G = -0.2;//-9.82;
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
        this.ammoBodies = [];
        let ammoBody;
        this.ammoSyncs = [];

        this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle = new AmmoJSUTILS.AmmoJSRaycastVehicle({
            vLabScene: this,
            vehicleMeshes: this.LamborghiniMiura1971P400SV,
            vehiclePos: new THREE.Vector3(0.0, 0.0, 0.0),
            vehicleQuat: new THREE.Quaternion(0.0, 0.0, 0.0, 1.0),
            physicsConfiguration: this.PhysicsConfiguration
        });
        this.ammoSyncs.push(this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle);

        this.Volkswagen1963BusDoublePickupAmmoJSRaycastVehicle = new AmmoJSUTILS.AmmoJSRaycastVehicle({
            vLabScene: this,
            vehicleMeshes: this.Volkswagen1963BusDoublePickup,
            vehiclePos: new THREE.Vector3(0.0, 0.0, 0.0),
            vehicleQuat: new THREE.Quaternion(0.0, 0.0, 0.0, 1.0),
            physicsConfiguration: this.PhysicsConfiguration
        });
        this.ammoSyncs.push(this.Volkswagen1963BusDoublePickupAmmoJSRaycastVehicle);

// ground
let groundGeometry = new THREE.BoxGeometry(2.0, 0.001, 2.0);
groundGeometry.computeBoundingBox();
var groundMaterial = new THREE.MeshLambertMaterial({color: 0x021010});
let groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.position.copy(new THREE.Vector3(0.0, -0.0005, 0.0));
groundMesh.quaternion.copy(new THREE.Quaternion(0.0, 0.0, 0.0, 1.0));
groundMesh.receiveShadow = true;
this.add(groundMesh);
ammoBody = AmmoJSUTILS.ammoJSBoxShapeBody({
    mesh: groundMesh,
    mass: 0.0,
    friction: 0.1
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
        this.ammoSyncs.forEach(ammoSync => {
            ammoSync.sync();
        });

        // this.ammoBodies.forEach(ammoBody => {
        //     if (ammoBody.mass > 0.0) {
        //         let ms = ammoBody.body.getMotionState();
        //         ms.getWorldTransform(this.PhysicsConfiguration.AMMO_TRANSFORM_AUX);
        //         var p = this.PhysicsConfiguration.AMMO_TRANSFORM_AUX.getOrigin();
        //         var q = this.PhysicsConfiguration.AMMO_TRANSFORM_AUX.getRotation();
        //         ammoBody.mesh.position.set(p.x(), p.y(), p.z());
        //         ammoBody.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
        //     }
        // });

        this.PhysicsConfiguration.physicsWorld.stepSimulation(params.dt, 10);
    }
    /**
     * onKeyDown subscribtion
     */
    onKeyDown(event) {
        switch (event.key) {
            case 'ArrowUp':
                this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle.engineForce     += 0.0025;
                this.Volkswagen1963BusDoublePickupAmmoJSRaycastVehicle.engineForce  += 0.0025;
            break;
            case 'ArrowDown':
                this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle.engineForce     -= 0.0025;
                this.Volkswagen1963BusDoublePickupAmmoJSRaycastVehicle.engineForce  -= 0.0025;

                this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle.breakingForce       += 0.01;
                this.Volkswagen1963BusDoublePickupAmmoJSRaycastVehicle.breakingForce    += 0.01;
            break;
        }
    }
    /**
     * onKeyUp subscribtion
     */
    onKeyUp(event) {
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle.breakingForce       = 0.00025;
                this.Volkswagen1963BusDoublePickupAmmoJSRaycastVehicle.breakingForce    = 0.00025;

                this.LamborghiniMiura1971P400SVAmmoJSRaycastVehicle.engineForce     = 0.0;
                this.Volkswagen1963BusDoublePickupAmmoJSRaycastVehicle.engineForce  = 0.0;
            break;
        }
    }
}

export default BaseScene;