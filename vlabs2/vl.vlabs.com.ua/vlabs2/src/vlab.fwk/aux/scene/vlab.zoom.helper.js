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
     * @param {Vector3}             initObj.target                    - THREE.Vector3 of point to look at
     * @param {boolean}             initObj.addToStack                - If defined and false - do not add to ZoomHelper Stack
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

        /**
         * Conditional visibility on deactivation
         */
        this.conditionalDeactivationVisibility = true;

        /**
         * Re-render screenshot counter if empty rendered on this.vLab.WebGLRenderer.render(....)
         */
        this.screenshorRenrendering = 0;

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
                this.vLab.DOMManager.container.zoomHelperStackContainer = document.createElement('div');
                this.vLab.DOMManager.container.zoomHelperStackContainer.id = 'zoomHelperStackContainer';
                this.vLab.DOMManager.container.appendChild(this.vLab.DOMManager.container.zoomHelperStackContainer);
            }
        }

        /**
         * 
         * 
         * Add zoomHelpersStack array into this.vLabScene if not exists
         * 
         * 
         */
        if (this.vLabScene.manager['zoomHelpersStack'] == undefined) {
            this.vLabScene.manager['zoomHelpersStack'] = [];
        }

        this.vLabZoomHelperInteractableObjectSprite = new THREE.Sprite(this.vLab.prefabs['VLabZoomHelperPrefabs']['VLabZoomHelperSpriteMaterial']);
        this.vLabZoomHelperInteractableObjectSprite.scale.set(0.3, 0.3, 0.3);
        let vLabZoomHelperInteractableObject = new THREE.Mesh(this.vLab.prefabs['VLabZoomHelperPrefabs']['VLabZoomHelperInteractableObjectGeometry'], this.vLab.prefabs['Generic']['TransparentMeshBasicMaterial']);
        vLabZoomHelperInteractableObject.add(this.vLabZoomHelperInteractableObjectSprite);
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
                visible: this.selfInitObj.visibility,
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

        this.vLabScene.manager.clock.getDelta();
    }
    /**
     * Reposition this.selfInitObj.position
     */
    activateWithSelfInitObj() {
        return this.activate(this.selfInitObj);
    }
    /**
     * Reposition this.selfInitObj.position
     */
    activate(initObj) {
        return new Promise((resolve) => {
            let self = this;
            /**
             * Get current VLab WebGLRenderer Frame Image
             * Save current this.vLabScene.currentCamera.position
             * Save current this.vLabScene.currentControls params
             */
            this.deSelect();
            this.vLabSceneObject.visible = false;

            /**
             * Do not add to stack if defined
             */
            if (this.selfInitObj.addToStack === false) {
                this.beforeZoomState = {
                    currentCamera: {
                        position: this.vLabScene.currentCamera.position.clone()
                    },
                    currentControls: {
                        target: this.vLabScene.currentControls.target.clone()
                    },
                };

                new TWEEN.Tween(this.vLabScene.currentCamera.position)
                .to({x: initObj.position.x, y: initObj.position.y, z: initObj.position.z}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                })
                .onComplete(() => {
                    this.vLabScene.currentControls.update();
                    resolve();
                })
                .start();
                this.vLabScene.currentControls.setTarget(initObj.target);

                return;
            }

            let currentVLabWebGLRendererFrameImage = new Image();

            /**
             * Take RenderScreenshot, make takenInteractable invisible if present
             */
            if (this.vLab.SceneDispatcher.takenInteractable) {
                this.vLab.SceneDispatcher.takenInteractable.vLabSceneObject.visible = false;
            }

            this.vLab.WebGLRenderer.render(this.vLabScene, this.vLabScene.currentCamera);
            currentVLabWebGLRendererFrameImage.src = this.vLab.WebGLRendererCanvas.toDataURL('image/jpeg');

            if (this.vLab.SceneDispatcher.takenInteractable) {
                this.vLab.SceneDispatcher.takenInteractable.vLabSceneObject.visible = true;
            }

            currentVLabWebGLRendererFrameImage.onload = function() {

                let viewThumbnailBackgroundImage = null;

                /**
                 * Test for empty currentVLabWebGLRendererFrameImage
                 */
                let viewThumbnailTestCanvas = document.createElement('canvas');
                let viewThumbnailTestCanvasCtx = viewThumbnailTestCanvas.getContext('2d');
                viewThumbnailTestCanvas.width = currentVLabWebGLRendererFrameImage.width;
                viewThumbnailTestCanvas.height = currentVLabWebGLRendererFrameImage.height;
                viewThumbnailTestCanvasCtx.beginPath();
                viewThumbnailTestCanvasCtx.rect(0, 0, viewThumbnailTestCanvas.width, viewThumbnailTestCanvas.height);
                viewThumbnailTestCanvasCtx.fillStyle = '#000000';
                viewThumbnailTestCanvasCtx.fill();
                let testImage = new Image();
                testImage.src = viewThumbnailTestCanvas.toDataURL('image/jpeg');
                if (testImage.src == currentVLabWebGLRendererFrameImage.src && self.screenshorRenrendering < 10) {
                    self.screenshorRenrendering++;
                    self.activate(initObj);
                    return;
                } else {
                    if (self.screenshorRenrendering >= 10) {
                        viewThumbnailBackgroundImage = self.vLab.prefabs['Generic']['Images']['prevLocation'];
                    }
                    self.screenshorRenrendering = 0;
                }

                let viewThumbnail = document.createElement('div');
                viewThumbnail.classList.add('zoomHelperViewThumbnail');

                let viewThumbnailCanvas = document.createElement('canvas');
                let viewThumbnailCanvasCtx = viewThumbnailCanvas.getContext('2d');

                let ratio = currentVLabWebGLRendererFrameImage.width / currentVLabWebGLRendererFrameImage.height;
                viewThumbnailCanvas.width = Math.round(currentVLabWebGLRendererFrameImage.width * 0.1);
                viewThumbnailCanvas.height = Math.round(viewThumbnailCanvas.width / ratio);

                if (viewThumbnailBackgroundImage === null) {
        
                    viewThumbnailCanvasCtx.drawImage(currentVLabWebGLRendererFrameImage, 0, 0, viewThumbnailCanvas.width, viewThumbnailCanvas.height);

                    viewThumbnailBackgroundImage = new Image();
                    viewThumbnailBackgroundImage.src = viewThumbnailCanvas.toDataURL();
                    viewThumbnailBackgroundImage.onload = function() {
                        viewThumbnail.style.backgroundImage = 'url("' + viewThumbnailBackgroundImage.src + '")';
                    }
                } else {
                    viewThumbnail.style.backgroundImage = 'url("' + viewThumbnailBackgroundImage.src + '")';
                    viewThumbnail.style.backgroundColor = '#000000';
                    viewThumbnail.style.backgroundSize = 'contain';
                }

                viewThumbnail.style.width = viewThumbnailCanvas.width + 'px';
                viewThumbnail.style.height = viewThumbnailCanvas.height + 'px';
                viewThumbnail.style.display = 'none';
                viewThumbnail.onclick = viewThumbnail.ontouchend = self.deactivate.bind(self);

                let viewThumbnailIcon = document.createElement('div');
                viewThumbnailIcon.classList.add('zoomHelperViewThumbnailIcon', 'nonSelectable');
                viewThumbnailIcon.style.width = viewThumbnailCanvas.width / 2 + 'px';
                viewThumbnailIcon.style.fontSize = viewThumbnailIcon.style.width;
                viewThumbnailIcon.innerHTML = 'youtube_searched_for';
                viewThumbnail.appendChild(viewThumbnailIcon);

                self.vLab.DOMManager.container.zoomHelperStackContainer.appendChild(viewThumbnail);

                self.beforeZoomState = {
                    viewThumbnail: viewThumbnail,
                    viewThumbnailIcon: viewThumbnailIcon,
                    currentCamera: {
                        position: self.vLabScene.currentCamera.position.clone()
                    },
                    currentControls: {
                        target: self.vLabScene.currentControls.target.clone()
                    },
                };

                new TWEEN.Tween(self.vLabScene.currentCamera.position)
                .to({x: initObj.position.x, y: initObj.position.y, z: initObj.position.z}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                })
                .onComplete(() => {
                    self.vLabScene.currentControls.update();
                    viewThumbnail.style.display = 'inline-block';
                    self.vLabScene.manager.zoomHelpersStack.push(self);
                    resolve();
                })
                .start();
                self.vLabScene.currentControls.setTarget(initObj.target);
            };
        });
    }
    /**
     * Deactivates this zoomHelper
     * @param {boolean} withoutAnimation        - not transition animation on true
     * @param {boolean} forced                  - deactivate despite delta
     */
    deactivate(withoutAnimation, forced) {
        /**
         * Press Event dumper
         */
        let delta = this.vLabScene.manager.clock.getDelta();
        if (delta > 0.1 || forced == true) {
            let revertPosition = this.beforeZoomState.currentCamera.position;
            let revertControlsTarget = this.beforeZoomState.currentControls.target;

            if (withoutAnimation == true) {
                this.vLabScene.currentCamera.position.copy(revertPosition);
                this.vLabScene.currentControls.target.copy(revertControlsTarget);
                this.vLabScene.currentControls.update();
            } else {
                new TWEEN.Tween(this.vLabScene.currentCamera.position)
                .to({x: revertPosition.x, y: revertPosition.y, z: revertPosition.z}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                })
                .onComplete(() => {
                    this.vLabScene.currentControls.update();
                    this.clearStack(this.vLabScene.manager.zoomHelpersStack.indexOf(this));
                })
                .start();
                this.vLabScene.currentControls.setTarget(revertControlsTarget);
            }
        }
    }
    /**
     * Clear this.vLabScene.manager.zoomHelpersStack
     */
    clearStack(fromIdx) {
        if (fromIdx == undefined) {
            this.vLabScene.manager.zoomHelpersStack[0].deactivate(true);
            fromIdx = 0;
        }
        let deletedZoomHelpers = this.vLabScene.manager.zoomHelpersStack.splice(fromIdx);
        deletedZoomHelpers.forEach((deletedZoomHelper) => {
            this.vLab.DOMManager.container.zoomHelperStackContainer.removeChild(deletedZoomHelper.beforeZoomState.viewThumbnail);
            deletedZoomHelper.vLabSceneObject.visible = this.conditionalDeactivationVisibility;
        });
    }
    /**
     * Set target
     */
    setTarget(target) {
        this.selfInitObj.target = target;
    }
    /**
     * Set target
     */
    setViewPosition(position) {
        this.selfInitObj.position = position;
    }
}
export default VLabZoomHelper;