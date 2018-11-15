import * as THREE from 'three';

export function screenProjected2DCoordsOfObject(vLab, object3D) {
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

export function frustumContainsPoint(vLab, point) {
    vLab.SceneDispatcher.currentVLabScene.currentCamera.updateMatrix();
    vLab.SceneDispatcher.currentVLabScene.currentCamera.updateMatrixWorld();

    var frustum = new THREE.Frustum();
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(vLab.SceneDispatcher.currentVLabScene.currentCamera.projectionMatrix, vLab.SceneDispatcher.currentVLabScene.currentCamera.matrixWorldInverse));

    return frustum.containsPoint(point);
}

export function completeDispose(object) {
    object.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            if (node.geometry) {
                node.geometry.dispose();
            }

            if (node.material) {

                if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) {
                    node.material.materials.forEach(function (mtrl, idx) {
                        if (mtrl.map) mtrl.map.dispose();
                        if (mtrl.lightMap) mtrl.lightMap.dispose();
                        if (mtrl.bumpMap) mtrl.bumpMap.dispose();
                        if (mtrl.normalMap) mtrl.normalMap.dispose();
                        if (mtrl.specularMap) mtrl.specularMap.dispose();
                        if (mtrl.envMap) mtrl.envMap.dispose();

                        mtrl.dispose();    // disposes any programs associated with the material
                    });
                }
                else {
                    if (node.material.map) node.material.map.dispose();
                    if (node.material.lightMap) node.material.lightMap.dispose();
                    if (node.material.bumpMap) node.material.bumpMap.dispose();
                    if (node.material.normalMap) node.material.normalMap.dispose();
                    if (node.material.specularMap) node.material.specularMap.dispose();
                    if (node.material.envMap) node.material.envMap.dispose();

                    node.material.dispose();   // disposes any programs associated with the material
                }
            }
        }
    });
}