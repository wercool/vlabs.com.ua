import * as THREE from 'three';
import * as VLabUtils from '../../utils/vlab.utils.js';
import * as StringUtils from '../../utils/string.utils';
import * as TWEEN from '@tweenjs/tween.js';
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

            if (this.vLab.DOMManager.container.zoomHelperStackContainer == undefined) {
                this.zoomHelperStackContainer = document.createElement('div');
                this.zoomHelperStackContainer.id = 'zoomHelperStackContainer';
                this.vLab.DOMManager.container.appendChild(this.zoomHelperStackContainer);
            }
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
                    function: this.activate,
                    args: this.selfInitObj,
                    context: this
                },
                tooltip: (this.selfInitObj.tooltip) ? this.selfInitObj.tooltip : undefined
            }
        }).then(() => {
            //initialization Promise resolved
        });
    }
    /**
     * Reposition this.selfInitObj.position
     */
    activate(initObj) {
        let self = this;
        /**
         * Get current VLab WebGLRenderer Frame Image
         * Save current this.vLabScene.currentCamera.position
         * Save current this.vLabScene.currentControls params
         */
        this.deSelect();
        this.vLabSceneObject.visible = false;

        this.vLab.WebGLRenderer.render(this.vLabScene, this.vLabScene.currentCamera);

        let currentVLabWebGLRendererFrameImage = new Image();
        currentVLabWebGLRendererFrameImage.src = this.vLab.WebGLRendererCanvas.toDataURL();
        currentVLabWebGLRendererFrameImage.onload = function() {
            let ratio = currentVLabWebGLRendererFrameImage.width / currentVLabWebGLRendererFrameImage.height;
            let viewThumbnailCanvas = document.createElement('canvas');
            let viewThumbnailCanvasCtx = viewThumbnailCanvas.getContext('2d');

            viewThumbnailCanvas.height = 100;
            viewThumbnailCanvas.width = viewThumbnailCanvas.height * ratio;

            viewThumbnailCanvasCtx.drawImage(currentVLabWebGLRendererFrameImage, 0, 0, viewThumbnailCanvas.width, viewThumbnailCanvas.height);

            let viewThumbnail = document.createElement('div');
            viewThumbnail.classList.add('zoomHelperViewThumbnail');
            viewThumbnail.style.width = viewThumbnailCanvas.width + 'px';
            viewThumbnail.style.height = viewThumbnailCanvas.height + 'px';
            viewThumbnail.style.backgroundImage = 'url("' + viewThumbnailCanvas.toDataURL() + '")';
            viewThumbnail.classList.add('hidden');

            let viewThumbnailIcon = document.createElement('div');
            viewThumbnailIcon.classList.add('material-icons', 'zoomHelperViewThumbnailIcon', 'nonSelectable');
            viewThumbnailIcon.innerHTML = 'youtube_searched_for';
            viewThumbnail.appendChild(viewThumbnailIcon);

            self.zoomHelperStackContainer.appendChild(viewThumbnail);

            self.beforeZoomState = {
                viewThumbnail: viewThumbnail,
                currentCamera: {
                    position: self.vLabScene.currentCamera.position.clone()
                },
                currentControls: {},
            };

            new TWEEN.Tween(self.vLabScene.currentCamera.position)
            .to({x: initObj.position.x, y: initObj.position.y, z: initObj.position.z}, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                self.deSelect();
            })
            .onComplete(() => {
                self.vLabScene.currentControls.update();
                viewThumbnail.classList.remove('hidden');
                console.log(self.vLabScene.zoomHelpersStack.indexOf(self));
                self.vLabScene.zoomHelpersStack.push(self);
            })
            .start();
            self.vLabScene.currentControls.setTarget(initObj.target);
        };
    }
}
export default VLabZoomHelper;