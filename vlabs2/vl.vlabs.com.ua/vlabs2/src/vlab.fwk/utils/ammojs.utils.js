import * as THREE from 'three';

export function ammoJSBoxShapeBody(params) {
    params.mesh.geometry.computeBoundingBox();
    let meshBoundingBoxGeometry = new THREE.BoxGeometry(
        params.mesh.geometry.boundingBox.max.x - params.mesh.geometry.boundingBox.min.x, 
        params.mesh.geometry.boundingBox.max.y - params.mesh.geometry.boundingBox.min.y, 
        params.mesh.geometry.boundingBox.max.z - params.mesh.geometry.boundingBox.min.z, 
        1, 1, 1);
    meshBoundingBoxGeometry.computeBoundingBox();

    let w = (meshBoundingBoxGeometry.boundingBox.max.x - meshBoundingBoxGeometry.boundingBox.min.x) * 0.5;
    let h = (meshBoundingBoxGeometry.boundingBox.max.y - meshBoundingBoxGeometry.boundingBox.min.y) * 0.5;
    let l = (meshBoundingBoxGeometry.boundingBox.max.z - meshBoundingBoxGeometry.boundingBox.min.z) * 0.5;

    if (params.boxMargins) {
        w += params.boxMargins.x;
        h += params.boxMargins.y;
        l += params.boxMargins.z;
    }

    let ammoShapeGeometry = new Ammo.btBoxShape(new Ammo.btVector3(w, h, l));
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(params.mesh.position.x, params.mesh.position.y, params.mesh.position.z));
    transform.setRotation(new Ammo.btQuaternion(params.mesh.quaternion.x, params.mesh.quaternion.y, params.mesh.quaternion.z, params.mesh.quaternion.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let localInertia = new Ammo.btVector3(0.0, 0.0, 0.0);
    ammoShapeGeometry.calculateLocalInertia(0.1, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(params.mass, motionState, ammoShapeGeometry, localInertia);
    let ammoBody = new Ammo.btRigidBody(rbInfo);
    if (params.friction) ammoBody.setFriction(params.friction);
    if (params.restitution) ammoBody.setRestitution(params.restitution);
    if (params.damping) ammoBody.setDamping(params.damping);

    if (params.mass > 0.0 && params.deactivation) {
        ammoBody.setActivationState(params.deactivation);
    }

    return {
        body: ammoBody,
        mesh: params.mesh,
        mass: params.mass
    }
}

export class AmmoJSRaycastVehicle {
    constructor(initObj) {
        this.initObj = initObj;

        // Chassis
        this.chassis = ammoJSBoxShapeBody({
            mesh: this.initObj.vehicleMeshes.chassis,
            mass: 0.2,
            friction: 0.1,
            deactivation: this.initObj.physicsConfiguration.AMMO_DISABLE_DEACTIVATION
        });
        this.initObj.physicsConfiguration.physicsWorld.addRigidBody(this.chassis.body);

        // Raycast Vehicle
        this.tuning = new Ammo.btVehicleTuning();
        this.rayCaster = new Ammo.btDefaultVehicleRaycaster(this.initObj.physicsConfiguration.physicsWorld);
        this.vehicle = new Ammo.btRaycastVehicle(this.tuning, this.chassis.body, this.rayCaster);
        this.vehicle.setCoordinateSystem(0, 1, 2);
        this.initObj.physicsConfiguration.physicsWorld.addAction(this.vehicle);

        // Wheels
        this.wheelMeshes = [
            this.initObj.vehicleMeshes.wheelFL,
            this.initObj.vehicleMeshes.wheelFR,
            this.initObj.vehicleMeshes.wheelRL,
            this.initObj.vehicleMeshes.wheelRR,
        ];
        this.addWheel(true, 0);
        this.addWheel(true, 1);
        this.addWheel(true, 2);
        this.addWheel(true, 3);

        this.engineForce = 0.0;
        this.breakingForce = 0.0;
    }

    addWheel(isFront, index) {
        let wheelMesh = this.wheelMeshes[index];
        wheelMesh.geometry.computeBoundingBox();

        let radius = (wheelMesh.geometry.boundingBox.max.y - wheelMesh.geometry.boundingBox.min.y) * 0.5;
        let wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
        let wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
        let suspensionRestLength = 0.005;
        let suspensionStiffness = 20.0;
        let suspensionDamping = 2.3;
        let suspensionCompression = 4.4;
        let friction = 1000;
        let rollInfluence = 0.2;

        let wheelInfo = this.vehicle.addWheel(
                        new Ammo.btVector3(wheelMesh.position.x, wheelMesh.position.y, wheelMesh.position.z),
                        wheelDirectionCS0,
                        wheelAxleCS,
                        suspensionRestLength,
                        radius,
                        this.tuning,
                        isFront);
        wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
        wheelInfo.set_m_frictionSlip(friction);
        wheelInfo.set_m_rollInfluence(rollInfluence);
        
        this.chassis.mesh.remove(wheelMesh);
        this.initObj.vLabScene.add(wheelMesh);
    }
    sync() {
        let vehicleSteering = 0;

        this.vehicle.applyEngineForce(this.engineForce, 0);
        this.vehicle.applyEngineForce(this.engineForce, 1);

        this.vehicle.setBrake(this.breakingForce / 2, 0);
        this.vehicle.setBrake(this.breakingForce / 2, 1);
        this.vehicle.setBrake(this.breakingForce, 2);
        this.vehicle.setBrake(this.breakingForce, 3);

        this.vehicle.setSteeringValue(vehicleSteering, 0);
        this.vehicle.setSteeringValue(vehicleSteering, 1);

        let tm, p, q, i;
        let n = this.vehicle.getNumWheels();
        for (i = 0; i < n; i++) {
            this.vehicle.updateWheelTransform(i, true);
            tm = this.vehicle.getWheelTransformWS(i);
            p = tm.getOrigin();
            q = tm.getRotation();
            this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
            this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
        }

        tm = this.vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();
        this.chassis.mesh.position.set(p.x(), p.y(), p.z());
        this.chassis.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }

}