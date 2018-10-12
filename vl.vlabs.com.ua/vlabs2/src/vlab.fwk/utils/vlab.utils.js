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

export function textureFromMaterialIcon(params) {
    /**
     * Prepare VLabSceneTransitorSpriteMaterial
     */
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = canvas.height = params.sizeP2;
    ctx.font = params.sizeP2 + 'px Material Icons';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(params.icon, 0, params.sizeP2);

    // ctx.strokeStyle = '#ff0000';
    // ctx.strokeRect(0, 0, canvas.width, canvas.height);
    // canvas.style.left = '300px';
    // canvas.style.top = '300px';
    // canvas.style.position = 'absolute';
    // canvas.style.zIndex = 100000;
    // document.body.appendChild(canvas);

    return new THREE.Texture(canvas);
}