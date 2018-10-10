import * as THREE from 'three';

export function initializeVLabPrefabs(vLab) {
    return new Promise((resolve, reject) => {
        /**
         * Initial VLab prefabs
         */
        let vLabPrefabs = {};
        /**
         * Generic prefabs
         */
        vLabPrefabs['Generic'] = {};
        vLabPrefabs['Generic']['TransparentMeshBasicMaterial'] = new THREE.MeshBasicMaterial({
            side: THREE.FrontSide,
            transparent: true,
            color: 0xffff00,
            opacity: 0.0,
        });

        resolve(vLabPrefabs);
    });
}