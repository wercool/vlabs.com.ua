import * as THREE from 'three';

export function getWorldPosition(obj) {
    var worldPosition = new THREE.Vector3();

    obj.updateMatrixWorld();
    worldPosition.setFromMatrixPosition(obj.matrixWorld);

    return worldPosition;
}