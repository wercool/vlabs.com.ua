import * as THREE from 'three';
import * as VLabUtils from '../../utils/vlab.utils.js';
import VLabSceneInteractable from '../../core/vlab.scene.interactable';
/**
 * VLab ZoomHelper auxilary which makes a transition to defined position in VLabScene.
 * Conditionally makes OrbitControls orbit inactive
 * @class
 * @classdesc VLabZoomHelper base class.
 */
class VLabZoomHelper extends VLabSceneInteractable {
    /**
     * VLabZoomHelper constructor.
     * 
     * @constructor
     * @param {Object}              initObj                           - VLabZoomHelper initialization object
     * @param {VLab}                initObj.vLabScene                 - VLabScene instance
     * @param {Vector3}             initObj.position                  - VLabZoomHelper position in initObj.vLab.SceneDispatcher.currentVLabScene
     * @param {number}              initObj.scaleFactor               - Scale factor for VLabSceneTransitor icon; default 1.0
     */
    constructor(initObj) {
        /**
         * Verify initObj
         */
        /*<dev>*/
            let initObjAbnormals = [];
            if (initObj.vLabScene == undefined)             initObjAbnormals.push('this.initObj.vLabScene is not set');
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

        /**
         * 
         * 
         * Activated true if zoomed to this
         * 
         * 
         */
        this.activated = false;

        this.selfInitObj = initObj;
        this.selfInitObj.scaleFactor = (initObj.scaleFactor) ? initObj.scaleFactor : 1.0;

        /**
         * Add to VLab prefabs if not exists yet
         */
        if (!this.vLab.prefabs['VLabZoomHelperPrefabs']) {
            this.vLab.prefabs['VLabZoomHelperPrefabs'] = {};

            let vLabZoomHelperSpriteMaterialMap = VLabUtils.textureFromMaterialIcon({ icon: 'zoom_in', sizeP2: 64, color: '#f3f3f3' });
            vLabZoomHelperSpriteMaterialMap.needsUpdate = true;
            this.vLab.prefabs['VLabZoomHelperPrefabs']['VLabZoomHelperSpriteMaterial'] = new THREE.SpriteMaterial({
                map: vLabZoomHelperSpriteMaterialMap,
                blending: THREE.AdditiveBlending,
                color: 0xffffff
            });

            this.vLab.prefabs['VLabZoomHelperPrefabs']['VLabZoomHelperInteractableObjectGeometry'] = new THREE.SphereBufferGeometry(0.2, 4, 4);
        }

        /**
         * 
         * 
         * Add zoomHelpersStack array into this.vLabScene if not exists
         * 
         * 
         */
        if (this.vLabScene['zoomHelpersStack'] == undefined) {
            this.vLabScene['zoomHelpersStack'] = [];
        }

        let vLabZoomHelperInteractableObjectSprite = new THREE.Sprite(this.vLab.prefabs['VLabZoomHelperPrefabs']['VLabZoomHelperSpriteMaterial']);
        vLabZoomHelperInteractableObjectSprite.scale.set(0.3, 0.3, 0.3);
        let vLabZoomHelperInteractableObject = new THREE.Mesh(this.vLab.prefabs['VLabZoomHelperPrefabs']['VLabZoomHelperInteractableObjectGeometry'], this.vLab.prefabs['Generic']['TransparentMeshBasicMaterial']);
        vLabZoomHelperInteractableObject.add(vLabZoomHelperInteractableObjectSprite);
        vLabZoomHelperInteractableObject.position.copy(this.selfInitObj.position);
        vLabZoomHelperInteractableObject.scale.multiplyScalar(this.selfInitObj.scaleFactor);
        vLabZoomHelperInteractableObject.name = 'VLabZoomHelper_' + (this.selfInitObj.name ? this.selfInitObj.name : StringUtils.getRandomString(5));

        this.vLabScene.add(vLabZoomHelperInteractableObject);

        /**
         * VLabSceneInteractable initialization for VLabSceneTransitor
         * @memberof VLabSceneInteractable
         * {@link VLabSceneInteractable#initialize}
         */
        this.initialize({
            interactable: {
                sceneObject: vLabZoomHelperInteractableObject,
                intersectable: true,
                preselectable: true,
                selectable: false,
                boundsOnly: true,
                action: {
                    function: () => { console.log('!!!!!!!!'); },
                    args: {},
                    context: this
                },
                tooltip: (this.selfInitObj.tooltip) ? this.selfInitObj.tooltip : undefined
            }
        }).then(() => {
            this.vLabScene.zoomHelpersStack.push(this);
        });
    }
}
export default VLabZoomHelper;