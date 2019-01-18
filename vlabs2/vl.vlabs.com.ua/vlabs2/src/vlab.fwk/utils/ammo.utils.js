import * as THREE from 'three';

export function ammoBoxBody(params) {
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