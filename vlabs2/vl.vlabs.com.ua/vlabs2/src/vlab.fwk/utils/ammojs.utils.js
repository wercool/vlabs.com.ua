import * as THREE from 'three';

export function ammoBoxShapeBody(params) {
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
        console.log(this.initObj);

                var materialInteractive = new THREE.MeshPhongMaterial( { color:0x990000 } );

				// Vehicle contants
				var chassisWidth = 1.8;
				var chassisHeight = .6;
				var chassisLength = 4;
				var massVehicle = 800;
				var wheelAxisPositionBack = -1.5;
				var wheelRadiusBack = .4;
				var wheelWidthBack = .3;
				var wheelHalfTrackBack = 1;
				var wheelAxisHeightBack = .3;
				var wheelAxisFrontPosition = 1.5;
				var wheelHalfTrackFront = 1;
				var wheelAxisHeightFront = .3;
				var wheelRadiusFront = .35;
				var wheelWidthFront = .2;
				var friction = 1000;
				var suspensionStiffness = 20.0;
				var suspensionDamping = 2.3;
				var suspensionCompression = 4.4;
				var suspensionRestLength = 0.6;
				var rollInfluence = 0.2;
				var steeringIncrement = .04;
				var steeringClamp = .5;
				var maxEngineForce = 2000;
				var maxBreakingForce = 100;

                function createChassisMesh(w, l, h) {
                    var shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
                    var mesh = new THREE.Mesh(shape, materialInteractive);
                    initObj.vLabScene.add(mesh);
                    return mesh;
                }

				// Chassis
				var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
				var transform = new Ammo.btTransform();
				transform.setIdentity();
				transform.setOrigin(new Ammo.btVector3(this.initObj.vehiclePos.x, this.initObj.vehiclePos.y, this.initObj.vehiclePos.z));
				transform.setRotation(new Ammo.btQuaternion(this.initObj.vehicleQuat.x, this.initObj.vehicleQuat.y, this.initObj.vehicleQuat.z, this.initObj.vehicleQuat.w));
				var motionState = new Ammo.btDefaultMotionState(transform);
				var localInertia = new Ammo.btVector3(0, 0, 0);
				geometry.calculateLocalInertia(massVehicle, localInertia);
				var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
				body.setActivationState(4);
				this.initObj.physicsConfiguration.physicsWorld.addRigidBody(body);
				var chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

				// Raycast Vehicle
				var engineForce = 0;
				var vehicleSteering = 0;
				var breakingForce = 0;
				var tuning = new Ammo.btVehicleTuning();
				var rayCaster = new Ammo.btDefaultVehicleRaycaster(this.initObj.physicsConfiguration.physicsWorld);
				var vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
				vehicle.setCoordinateSystem(0, 1, 2);
				this.initObj.physicsConfiguration.physicsWorld.addAction(vehicle);

				// Wheels
				var wheelMeshes = [];
				var FRONT_LEFT = 0;
				var FRONT_RIGHT = 1;
				var BACK_LEFT = 2;
				var BACK_RIGHT = 3;
				var wheelMeshes = [];
				var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
				var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

                function createWheelMesh(radius, width) {
                    var t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
                    t.rotateZ(Math.PI / 2);
                    var mesh = new THREE.Mesh(t, materialInteractive);
                    mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius*.25, 1, 1, 1), materialInteractive));
                    initObj.vLabScene.add(mesh);
                    return mesh;
                }

				function addWheel(isFront, pos, radius, width, index) {
					var wheelInfo = vehicle.addWheel(
							pos,
							wheelDirectionCS0,
							wheelAxleCS,
							suspensionRestLength,
							radius,
							tuning,
							isFront);
					wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
					wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
					wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
					wheelInfo.set_m_frictionSlip(friction);
					wheelInfo.set_m_rollInfluence(rollInfluence);
					wheelMeshes[index] = createWheelMesh(radius, width);
				}

				addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
				addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
				addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
				addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

                this.sync = function() {

					breakingForce = 0;
					engineForce = 0;

					vehicle.applyEngineForce(engineForce, BACK_LEFT);
					vehicle.applyEngineForce(engineForce, BACK_RIGHT);
					vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
					vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
					vehicle.setBrake(breakingForce, BACK_LEFT);
					vehicle.setBrake(breakingForce, BACK_RIGHT);
					vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
					vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

					var tm, p, q, i;
					var n = vehicle.getNumWheels();
					for (i = 0; i < n; i++) {
						vehicle.updateWheelTransform(i, true);
						tm = vehicle.getWheelTransformWS(i);
						p = tm.getOrigin();
						q = tm.getRotation();
						wheelMeshes[i].position.set(p.x(), p.y(), p.z());
						wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
					}


					tm = vehicle.getChassisWorldTransform();
					p = tm.getOrigin();
					q = tm.getRotation();
					chassisMesh.position.set(p.x(), p.y(), p.z());
					chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
                }
    }
}