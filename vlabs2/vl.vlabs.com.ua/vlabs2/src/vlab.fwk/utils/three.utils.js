import * as THREE from 'three';
import VLabScene from '../core/vlab.scene';
import * as ObjectUtils from './object.utils';

export function getObjectWorldPosition(obj) {
    var worldPosition = new THREE.Vector3();

    obj.updateMatrixWorld();
    worldPosition.setFromMatrixPosition(obj.matrixWorld);

    return worldPosition;
}

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

/**
 * Conforms material with VLab using material.userData
 * 
 * @argument {THREE.MeshStandardMaterial} material                - MeshStandardMaterial if glTF is loaded
 * @argument {Object} material.userData
 * @argument {String} material.userData.MeshBasicMaterial
 * @argument {String} material.userData.MeshLambertMaterial
 * @argument {String} material.userData.MeshPhongMaterial
 * @argument {VLabScene} vLabScene                - VLabScene instance, if provided - check for material exists already in the given VLabScene
 * @returns { MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial | MeshStandardMaterial }
 */
export function conformMaterial(material, vLabScene) {
    let existingMaterial = undefined;
    if (vLabScene !== undefined) {
        vLabScene.traverse((child) => {
            if (child.material) {
                if (child.material.name === material.name && Object.keys(child.material.userData).length == 0) {
                    existingMaterial = child.material;
                }
            }
        });
    }
    if (existingMaterial !== undefined) return existingMaterial;

    if (Object.keys(material.userData).length > 0) {
        /**
         * Conform with blender.three Material Side setting
         */
        if (material.userData.THREE_double_sided == 1) {
            material.userData['MaterialSide'] = THREE.DoubleSide;
        }

        if (material.userData.MeshBasicMaterial || (material instanceof THREE.MeshBasicMaterial)) {
            let typeChanged = !(material instanceof THREE.MeshBasicMaterial);
            let _MeshBasicMaterial = (!typeChanged) ? material : new THREE.MeshBasicMaterial();
            if (typeChanged) {
                // _MeshBasicMaterial = ObjectUtils.assign(_MeshBasicMaterial, material);

                _MeshBasicMaterial.map = material.map;
                _MeshBasicMaterial.type = 'MeshBasicMaterial';
            }
            if (material.userData.MaterialSide) {
                _MeshBasicMaterial.side = material.userData.MaterialSide;
            }
            if (material.userData.colorIntensity) {
                _MeshBasicMaterial.color = new THREE.Color(material.userData.colorIntensity, material.userData.colorIntensity, material.userData.colorIntensity);
            }
            _MeshBasicMaterial.userData = {};
            return _MeshBasicMaterial;
        }
        if (material.userData.MeshLambertMaterial || (material instanceof THREE.MeshLambertMaterial)) {
            let typeChanged = !(material instanceof THREE.MeshLambertMaterial);
            let _MeshLambertMaterial = (!typeChanged) ? material : new THREE.MeshLambertMaterial();
            if (typeChanged) {
                _MeshLambertMaterial = ObjectUtils.assign(_MeshLambertMaterial, material);
                _MeshLambertMaterial.type = 'MeshLambertMaterial';
            }
            if (material.userData.MaterialSide) {
                _MeshLambertMaterial.side = material.userData.MaterialSide;
            }
            _MeshLambertMaterial.userData = {};
            return _MeshLambertMaterial;
        }
        if (material.userData.MeshPhongMaterial || (material instanceof THREE.MeshPhongMaterial)) {
            let typeChanged = !(material instanceof THREE.MeshPhongMaterial);
            let _MeshPhongMaterial = (!typeChanged) ? material : new THREE.MeshPhongMaterial();
            if (typeChanged) {
                _MeshPhongMaterial = ObjectUtils.assign(_MeshPhongMaterial, material);
                _MeshPhongMaterial.type = 'MeshPhongMaterial';
            }
            if (material.userData.MaterialSide) {
                _MeshPhongMaterial.side = material.userData.MaterialSide;
            }
            _MeshPhongMaterial.userData = {};
            return _MeshPhongMaterial;
        }
        if (material.userData.MeshStandardMaterial || (material instanceof THREE.MeshStandardMaterial)) {
            let typeChanged = !(material instanceof THREE.MeshStandardMaterial);
            let _MeshStandardMaterial = (!typeChanged) ? material : new THREE.MeshStandardMaterial();
            if (typeChanged) {
                _MeshStandardMaterial = ObjectUtils.assign(_MeshStandardMaterial, material);
                _MeshStandardMaterial.type = 'MeshStandardMaterial';
            }
            if (material.userData.MaterialSide) {
                _MeshStandardMaterial.side = material.userData.MaterialSide;
            }
            if (material.userData.NomralMapToBumpMap) {
                /**
                 * Do not use bump mapping if strictly defined in vLabScene.vLab.nature.materialParameters.bumpMaps
                 */
                if(vLabScene.vLab.nature.materialParameters && vLabScene.vLab.nature.materialParameters.bumpMaps !== false) {
                    _MeshStandardMaterial.bumpMap = _MeshStandardMaterial.normalMap;
                    _MeshStandardMaterial.bumpScale = material.userData.bumpScale;
                }
                _MeshStandardMaterial.normalMap = null;
            }
            if (material.userData.metalness) {
                _MeshStandardMaterial.metalness = material.userData.metalness;
            }
            if (material.userData.roughness) {
                _MeshStandardMaterial.roughness = material.userData.roughness;
            }
            if (material.userData.transparent) {
                _MeshStandardMaterial.transparent = true;
                _MeshStandardMaterial.opacity = parseFloat(material.userData.transparent);
            }
            _MeshStandardMaterial.userData = {};
            return _MeshStandardMaterial;
        }
    } else {
        return material;
    }
}