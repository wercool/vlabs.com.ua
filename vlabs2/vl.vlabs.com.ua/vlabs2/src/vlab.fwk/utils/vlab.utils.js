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
        /**
         * Prefabs for VLabSceneInteractableRespondets
         */
        vLabPrefabs['VLabSceneInteractablePrefabs'] = {};
        vLabPrefabs['VLabSceneInteractablePrefabs']['linePointGeometry'] = new THREE.SphereBufferGeometry(0.006, 3, 3);
        vLabPrefabs['VLabSceneInteractablePrefabs']['respondentReferenceLineMaterial'] = new THREE.LineBasicMaterial({ color: 0xfff6b7 });
        vLabPrefabs['VLabSceneInteractablePrefabs']['respondentActionLineMaterial'] = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3.0 });
        vLabPrefabs['VLabSceneInteractablePrefabs']['respondentReferenceDashedLineMaterial'] = new THREE.LineDashedMaterial({ color: 0xfff6b7, dashSize: 0.05, gapSize: 0.015 });
        vLabPrefabs['VLabSceneInteractablePrefabs']['respondentActionDashedLineMaterial'] = new THREE.LineDashedMaterial({ color: 0x91ff8e, dashSize: 0.05, gapSize: 0.015 });
        vLabPrefabs['VLabSceneInteractablePrefabs']['respondentIntersectionReferencePointMaterial'] = new THREE.MeshBasicMaterial({ color: 0xfff6b7, depthTest: false, side: THREE.BackSide });
        vLabPrefabs['VLabSceneInteractablePrefabs']['interactableIntersectionReferencePointMaterial'] = new THREE.MeshBasicMaterial({ color: 0xfff6b7, side: THREE.BackSide });
        vLabPrefabs['VLabSceneInteractablePrefabs']['respondentIntersectionActionPointMaterial'] = new THREE.MeshBasicMaterial({ color: 0x91ff8e, depthTest: false, side: THREE.BackSide });
        vLabPrefabs['VLabSceneInteractablePrefabs']['interactableIntersectionActionPointMaterial'] = new THREE.MeshBasicMaterial({ color: 0x91ff8e, side: THREE.BackSide });
        vLabPrefabs['VLabSceneInteractablePrefabs']['simpleOutlineMaterial'] = new THREE.MeshLambertMaterial({
            color: 0xffff00,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.75,
            emissive: new THREE.Color(1.0, 1.0, 0.0),
            depthTest: true,
            depthWrite: true,
            polygonOffset: true,
            polygonOffsetFactor: 1
        });
        vLabPrefabs['VLabSceneInteractablePrefabs']['simpleOutlineSelectedMaterial'] = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.75,
            emissive: new THREE.Color(0.0, 1.0, 0.0),
            depthTest: true,
            depthWrite: true,
            polygonOffset: true,
            polygonOffsetFactor: 1
        });
        /**
         * VLabSceneInteractablePrefabs prefab textures
         */
        let textureLoader = new THREE.TextureLoader()
        Promise.all([
            /**
             * selectionSpriteMaterial
             */
            textureLoader.load('/vlab.assets/img/scene/selection-bounds.png')
        ]).then((results) => {
            vLabPrefabs['VLabSceneInteractablePrefabs']['selectionSpriteMaterial'] = new THREE.SpriteMaterial({
                map: results[0],
                blending: THREE.AdditiveBlending,
                color: 0x00ff00,
                depthTest: false
            });
            vLabPrefabs['VLabSceneInteractablePrefabs']['preSelectionSpriteMaterial'] = new THREE.SpriteMaterial({
                map: results[0],
                blending: THREE.AdditiveBlending,
                color: 0xffff00,
                depthTest: false
            });
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