import * as THREE from 'three';
import * as VLabUtils from '../../utils/vlab.utils.js';
import VLabSceneInteractable from '../../core/vlab.scene.interactable';
/**
 * VLab Scene auxilary which makes a transition to target VLabScene.
 * @class
 * @classdesc VLabSceneTransitor base class.
 */
class VLabSceneTransitor extends VLabSceneInteractable {
    /**
     * VLabSceneTransitor constructor.
     * 
     * @constructor
     * @param {Object}              initObj                           - VLabSceneTransitor initialization object
     * @param {VLab}                initObj.vLabScene                 - VLabScene instance
     * @param {VLabScene}           initObj.targetVLabScene           - VLabScene instance which this VLabSceneTransitor transits to
     * @param {Vector3}             initObj.position                  - VLabSceneTransitor position in initObj.vLab.SceneDispatcher.currentVLabScene
     */
    constructor(initObj) {
        /**
         * Verify initObj
         */
        /*<dev>*/
            let initObjAbnormals = [];
            if (initObj.vLabScene == undefined)             initObjAbnormals.push('this.initObj.vLabScene is not set');
            if (initObj.targetVLabScene == undefined)       initObjAbnormals.push('this.initObj.targetVLabScene is not set');
            if (initObj.position == undefined)              initObjAbnormals.push('this.initObj.position is not set');
            if (initObjAbnormals.length > 0) {
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

        if (!this.vLab.prefabs['VLabSceneTransitorPrefabs']) {
            this.vLab.prefabs['VLabSceneTransitorPrefabs'] = {};

            let vLabSceneTransitorSpriteMaterialMap = VLabUtils.textureFromMaterialIcon({ icon: 'input', sizeP2: 64 });
            vLabSceneTransitorSpriteMaterialMap.needsUpdate = true;
            this.vLab.prefabs['VLabSceneTransitorPrefabs']['VLabSceneTransitorSpriteMaterial'] = new THREE.SpriteMaterial({
                map: vLabSceneTransitorSpriteMaterialMap,
                blending: THREE.AdditiveBlending,
                color: 0xffffff
            });

            this.vLab.prefabs['VLabSceneTransitorPrefabs']['VLabSceneTransitorInteractableObjectGeometry'] = new THREE.SphereBufferGeometry(0.2, 10, 10);
        }
        let vLabSceneTransitorInteractableObjectSprite = new THREE.Sprite(this.vLab.prefabs['VLabSceneTransitorPrefabs']['VLabSceneTransitorSpriteMaterial']);
        vLabSceneTransitorInteractableObjectSprite.scale.set(0.3, 0.3, 0.3);
        let vLabSceneTransitorInteractableObject = new THREE.Mesh(this.vLab.prefabs['VLabSceneTransitorPrefabs']['VLabSceneTransitorInteractableObjectGeometry'], this.vLab.prefabs['Generic']['TransparentMeshBasicMaterial']);
        vLabSceneTransitorInteractableObject.add(vLabSceneTransitorInteractableObjectSprite);
        vLabSceneTransitorInteractableObject.position.copy(this.selfInitObj.position);
        vLabSceneTransitorInteractableObject.name = 'VLabSceneTransitor_' + this.selfInitObj.targetVLabScene.name;
        this.vLabScene.add(vLabSceneTransitorInteractableObject);

        /**
         * VLabSceneInteractable initialization for VLabSceneTransitor
         * @memberof VLabSceneInteractable
         * {@link VLabSceneInteractable#initialize}
         */
        this.initialize({
            interactable: {
                sceneObject: vLabSceneTransitorInteractableObject,
                intersectable: true,
                preselectable: true,
                action: {
                    function: this.vLab.SceneDispatcher.activateScene,
                    /**
                     * Scene activation object {@link VLabSceneDispatcher#activateScene}
                     */
                    args: {
                        class: this.selfInitObj.targetVLabScene.constructor
                    },
                    context: this.vLab.SceneDispatcher
                },
                tooltip: 'Go to <b>' + initObj.vLabScene.nature.title + '</b>'
            }
        });
    }
}
export default VLabSceneTransitor;