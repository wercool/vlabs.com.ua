import * as THREE from 'three';
import * as VLabUtils from '../../utils/vlab.utils.js';
import * as StringUtils from '../../utils/string.utils';
import * as TWEEN from '@tweenjs/tween.js';
import VLabSceneInteractable from '../../core/vlab.scene.interactable';
/**
 * VLab Scene auxilary which move camera to target VLabScene position.
 * @class
 * @classdesc VLabSceneLocator base class.
 */
class VLabSceneLocator extends VLabSceneInteractable {
    /**
     * VLabSceneLocator constructor.
     * 
     * @constructor
     * @param {Object}              initObj                           - VLabSceneLocator initialization object
     * @param {VLab}                initObj.vLabScene                 - VLabScene instance
     * @param {Vector3}             initObj.position                  - VLabSceneLocator position in initObj.vLab.SceneDispatcher.currentVLabScene
     * @param {Vector3}             initObj.target                    - VLabSceneLocator target in initObj.vLab.SceneDispatcher.currentVLabScene
     * @param {string}              initObj.name                      - VLabSceneLocator name
     */
    constructor(initObj) {
        /**
         * Verify initObj
         */
        /*<dev>*/
            let initObjAbnormals = [];
            if (initObj.vLabScene == undefined)             initObjAbnormals.push('this.initObj.vLabScene is not set');
            if (initObj.position == undefined)              initObjAbnormals.push('this.initObj.position is not set');
            if (initObj.target == undefined)                initObjAbnormals.push('this.initObj.target is not set');
            if (initObjAbnormals.length > 0) {
                console.error('VLabSceneLocator ' + (initObj.name !== undefined ? '"' + initObj.name + '"' : ''));
                initObjAbnormals.forEach((initObjAbnormal) => {
                    console.error(initObjAbnormal);
                });
            }
        /*</dev>*/

        let interactableInitObj = {
            vLabScene: initObj.vLabScene,
        };

        super(interactableInitObj);

        this.selfInitObj = initObj;
        this.selfInitObj.scaleFactor = (initObj.scaleFactor) ? initObj.scaleFactor : 1.0;

        /**
         * Add to VLab prefabs if not exists yet
         */
        if (!this.vLab.prefabs['VLabSceneLocatorPrefabs']) {
            this.vLab.prefabs['VLabSceneLocatorPrefabs'] = {};

            let vLabSceneTransitorSpriteMaterialMap = VLabUtils.textureFromMaterialIcon({ icon: '3d_rotation', sizeP2: 64, color: '#fff744' });
            vLabSceneTransitorSpriteMaterialMap.needsUpdate = true;
            this.vLab.prefabs['VLabSceneLocatorPrefabs']['VLabSceneLocatorSpriteMaterial'] = new THREE.SpriteMaterial({
                map: vLabSceneTransitorSpriteMaterialMap,
                blending: THREE.AdditiveBlending,
                color: 0xffffff
            });

            this.vLab.prefabs['VLabSceneLocatorPrefabs']['VLabSceneLocatorInteractableObjectGeometry'] = new THREE.SphereBufferGeometry(0.2, 4, 4);
        }

        let vLabSceneLocatorInteractableObjectSprite = new THREE.Sprite(this.vLab.prefabs['VLabSceneLocatorPrefabs']['VLabSceneLocatorSpriteMaterial']);
        vLabSceneLocatorInteractableObjectSprite.scale.set(0.3, 0.3, 0.3);
        let vLabSceneLocatorInteractableObject = new THREE.Mesh(this.vLab.prefabs['VLabSceneTransitorPrefabs']['VLabSceneTransitorInteractableObjectGeometry'], this.vLab.prefabs['Generic']['TransparentMeshBasicMaterial']);
        vLabSceneLocatorInteractableObject.add(vLabSceneLocatorInteractableObjectSprite);
        vLabSceneLocatorInteractableObject.position.copy(this.selfInitObj.position);
        vLabSceneLocatorInteractableObject.scale.multiplyScalar(this.selfInitObj.scaleFactor);
        vLabSceneLocatorInteractableObject.name = 'VLabSceneTransitor_' + (this.selfInitObj.name ? this.selfInitObj.name : StringUtils.getRandomString(5));

        this.vLabScene.add(vLabSceneLocatorInteractableObject);

        /**
         * VLabSceneInteractable initialization for VLabSceneLocator
         * @memberof VLabSceneInteractable
         * {@link VLabSceneInteractable#initialize}
         */
        this.initialize({
            interactable: {
                sceneObject: vLabSceneLocatorInteractableObject,
                intersectable: true,
                preselectable: true,
                selectable: false,
                boundsOnly: true,
                action: {
                    function: this.move,
                    args: this.selfInitObj,
                    context: this
                },
                tooltip: (this.selfInitObj.tooltip) ? this.selfInitObj.tooltip : 'Move here'
            }
        });
    }
    /**
     * Moves this.vLabScene to this.selfInitObj.position
     */
    move(initObj) {
        /**
         * Reset this.zoomHelperStack
         */
        this.vLabScene.manager.resetZoomHelperStack();

        new TWEEN.Tween(this.vLabScene.currentCamera.position)
        .to({x: initObj.position.x, y: initObj.position.y, z: initObj.position.z}, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            this.deSelect();
        })
        .onComplete(() => {
            this.vLabScene.currentControls.update();
        })
        .start();
        this.vLabScene.currentControls.setTarget(initObj.target);
    }
}
export default VLabSceneLocator;