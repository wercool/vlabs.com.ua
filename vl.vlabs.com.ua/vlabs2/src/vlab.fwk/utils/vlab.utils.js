import * as THREE from 'three';

export function initializeVLabPrefabs(vLab) {
    let vLabPrefabs = {};
    return new Promise((resolve, reject) => {
        if (!vLab.prefabs['linePointGeometry']) {
            vLabPrefabs['linePointGeometry'] = new THREE.SphereBufferGeometry(0.006, 3, 3);
        }
        if (!vLab.prefabs['respondentReferenceLineMaterial']) {
            vLabPrefabs['respondentReferenceLineMaterial'] = new THREE.LineBasicMaterial({ color: 0xfff6b7 });
        }
        if (!vLab.prefabs['respondentActionLineMaterial']) {
            vLabPrefabs['respondentActionLineMaterial'] = new THREE.LineBasicMaterial({ color: 0x91ff8e });
        }
        if (!vLab.prefabs['respondentReferenceDashedLineMaterial']) {
            vLabPrefabs['respondentReferenceDashedLineMaterial'] = new THREE.LineDashedMaterial({ color: 0xfff6b7, dashSize: 0.05, gapSize: 0.015 });
        }
        if (!vLab.prefabs['respondentActionDashedLineMaterial']) {
            vLabPrefabs['respondentActionDashedLineMaterial'] = new THREE.LineDashedMaterial({ color: 0x91ff8e, dashSize: 0.05, gapSize: 0.015 });
        }
        if (!vLab.prefabs['respondentIntersectionReferencePointMaterial']) {
            vLabPrefabs['respondentIntersectionReferencePointMaterial'] = new THREE.MeshBasicMaterial({ color: 0xfff6b7, depthTest: false, side: THREE.BackSide });
        }
        if (!vLab.prefabs['interactableIntersectionReferencePointMaterial']) {
            vLabPrefabs['interactableIntersectionReferencePointMaterial'] = new THREE.MeshBasicMaterial({ color: 0xfff6b7, side: THREE.BackSide });
        }
        if (!vLab.prefabs['respondentIntersectionActionPointMaterial']) {
            vLabPrefabs['respondentIntersectionActionPointMaterial'] = new THREE.MeshBasicMaterial({ color: 0x91ff8e, depthTest: false, side: THREE.BackSide });
        }
        if (!vLab.prefabs['interactableIntersectionActionPointMaterial']) {
            vLabPrefabs['interactableIntersectionActionPointMaterial'] = new THREE.MeshBasicMaterial({ color: 0x91ff8e, side: THREE.BackSide });
        }
        resolve(vLabPrefabs);
    });
}