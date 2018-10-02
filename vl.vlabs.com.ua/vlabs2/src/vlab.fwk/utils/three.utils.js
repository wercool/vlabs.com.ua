import * as THREE from 'three';

export function toScreenPosition(vLab, object3D) {
    let vector = new THREE.Vector3();

    var widthHalf  = 0.5 * vLab.DOMManager.WebGLContainer.clientWidth;
    var heightHalf = 0.5 * vLab.DOMManager.WebGLContainer.clientHeight;

    object3D.updateMatrixWorld();
    vector.setFromMatrixPosition(object3D.matrixWorld);
    vector.project(vLab.SceneDispatcher.currentVLabScene.currentCamera);

    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;

    return {
        x: vector.x,
        y: vector.y
    };
}