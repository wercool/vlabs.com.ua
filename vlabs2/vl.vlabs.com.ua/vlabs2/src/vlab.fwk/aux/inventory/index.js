import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import VLabScene from '../../core/vlab.scene';

/**
 * VLabInventory base class
 * @class
 */
class VLabInventory extends VLabScene {
   /**
    * VLabInventory constructor
    * @constructor
    * @param {Object}    initObj                           - VLabScene initialization object
    * @param {VLab}      initObj.vLab                      - VLab instance
    */
    constructor(initObj) {
        initObj['loaded'] = true;
        initObj['configured'] = true;
        super(initObj);
        this.initObj = initObj;
        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;
        /**
         * name for this.vLab.EventDispatcher
         */
        this.name = 'VLabInventory';
        /**
         * Inventory open button
         */
        this.opentButton = undefined;
        /**
         * Inventory opentButton icon
         */
        this.opentButtonIcon = undefined;

        /**
         * Initialize inventory; VLabInventory contructor called;
         */
        console.log('Initialize inventory; VLabInventory contructor called;');
        if (this.vLab.SceneDispatcher.getScene(VLabInventory) === null) {
            /**
             * Push VLabInventory to vLab.SceneDispatcher into scenes[] array
             * {@link VLabSceneDispatcher#scenes}
             */
            this.vLab.SceneDispatcher.scenes.push(this);

            /**
             * Build HTML elements
             */
            if (this.vLab.DOMManager.vLabPanel) {
                if (this.vLab.DOMManager.vLabPanel.VLabPanelRightContainer) {
                    this.vLab.DOMManager.addStyle({
                        id: 'inventoryCSS',
                        href: '/vlab.assets/css/inventory.css'
                    })
                    .then(() => {

                        /**
                         * WebGLRenderer for rendering Inventory items for getting their thumbnails
                         */
                        this.thumbsWebGLRenderer = new THREE.WebGLRenderer({
                            antialias: true,
                            precision: 'lowp'
                        });
                        this.thumbsWebGLRenderer.setSize(50, 50, false);
                        this.thumbsWebGLRenderer.domElement.style.width  = '50px';
                        this.thumbsWebGLRenderer.domElement.style.height = '50px';

                        this.thumbsCamera = new THREE.PerspectiveCamera(50, 1.0, 0.1, 10);
                        this.thumbsCamera.updateProjectionMatrix();
                        this.thumbsCamera.position.copy(new THREE.Vector3(0.5, 0.5, 0.5));
                        this.thumbsCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));



                        this.openButtonIcon = document.createElement('li');
                        this.openButtonIcon.id = 'inventoryOpenButtonIcon';
                        this.openButtonIcon.className = 'material-icons';
                        this.openButtonIcon.innerHTML = 'work';

                        this.closeButtonIcon = document.createElement('li');
                        this.closeButtonIcon.id = 'inventoryCloseButtonIcon';
                        this.closeButtonIcon.className = 'material-icons';
                        this.closeButtonIcon.innerHTML = 'undo';
                        this.closeButtonIcon.classList.add('hidden');

                        this.addedIcon = document.createElement('div');
                        this.addedIcon.id = 'inventoryAddedIcon';
                        this.addedIcon.innerHTML = '+1';
                        this.addedIcon.style.opacity = 0.0;


                        this.button = document.createElement('div');
                        this.button.id = 'inventoryButton';

                        this.button.appendChild(this.openButtonIcon);
                        this.button.appendChild(this.closeButtonIcon);
                        this.button.appendChild(this.addedIcon);

                        this.button.onclick = this.button.ontouchstart = this.onButtonHandler.bind(this);
                        this.button.onmouseover = this.onButtonMouseOverHandler.bind(this);

                        /**
                         * Add this.button to vLabPanel.VLabPanelRightContainer
                         * {@link VLabPanel#VLabPanelRightContainer}
                         */
                        this.vLab.DOMManager.vLabPanel.VLabPanelRightContainer.appendChild(this.button);

                        /**
                         * Notify event subscribers
                         */
                        this.vLab.EventDispatcher.notifySubscribers({
                            target: 'VLabInventory',
                            type: 'ready'
                        });


                        /**
                         * Initialized THREE initial assets
                         */

                        /*<dev>*/
                            var axesHelper = new THREE.AxesHelper(10);
                            this.add(axesHelper);
                            console.info("10m AxesHelper added to VLabInventory");
                        /*</dev>*/

                        this.currentCamera.near = 0.01;
                        this.currentCamera.far = 10.0;

                        this.currentCamera.position.copy(new THREE.Vector3(0.5, 0.5, 0.5));

                        var pointLight = new THREE.PointLight(0xffffff, 2.0, 5.0);
                        pointLight.position.set(0.0, 2.5, 0.0);
                        this.add(pointLight);

                        var ambientLight = new THREE.AmbientLight(0x404040, 2.0); // soft white light
                        this.add(ambientLight);

                    });
                }
            }
        } else {
            console.error('VLabInventory already exists in VLab');
        }
    }
    /**
     * VLab Scene onActivated abstract function implementation.
     *
     */
    onActivated() {
        this.closeButtonIcon.classList.remove('hidden');
    }
    /**
     * VLab Scene onDeactivated abstract function implementation.
     *
     */
    onDeactivated() {
        this.closeButtonIcon.classList.add('hidden');
        this.resetView();
    }
    /**
     * Sets this.currentCamera position and update this.currentControls.target
     */
    resetView() {
        this.currentCamera.position.copy(new THREE.Vector3(0.5, 0.5, 0.5));

        this.currentControls.target = new THREE.Vector3(0.0, 0.0, 0.0);
        this.currentControls.reset();
        this.currentControls.update();
    }
    /**
     * this.opentButton click and touchstart event hanlder
     * this.opentButton.onclick = this.opentButton.ontouchstart
     */
    onButtonHandler(event) {
        event.stopPropagation();
        if (!this.active) {
            this.vLab.SceneDispatcher.activateScene({
                class: this.constructor
            });
        } else {
            this.vLab.SceneDispatcher.activateScene({
                class: this.vLab.SceneDispatcher.previousVLabScene.constructor
            });
        }
    }
    /**
     * Mouse over handler
     */
    onButtonMouseOverHandler(event) {
        this.vLab.SceneDispatcher.currentVLabScene.dePreselectInteractables();
    }
    /**
     * Removes {interactable} from interactable.vLabScene.interactables;
     * Appends VLabSceneInteractable to this.VLabScene.interactables
     * @param {VLabSceneInteractable} interactable 
     */
    addInteractable(interactable) {

        let interactableVLabScene = interactable.vLabScene;

        let putObj = {
            scene: interactableVLabScene,
            parent: interactable.vLabSceneObject.parent,
            position: interactable.vLabSceneObject.position.clone(),
            quaternion: interactable.vLabSceneObject.quaternion.clone(),
            scale:  interactable.vLabSceneObject.scale.clone()
        };

        /**
         * If interactable is this.vLab.SceneDispatcher.takenInteractable
         */
        if (interactable == this.vLab.SceneDispatcher.takenInteractable) {
            this.vLab.SceneDispatcher.putTakenInteractable(interactable.vLabSceneObject.userData['beforeTakenState']);
        }

        interactable.removeMenuItem('Take');

        interactable.updateMenuWithMenuItem({
            label: 'Put back',
            icon: '<i class="material-icons">undo</i>',
            enabled: true,
            action: this.take,
            context: interactable,
            originalScene: interactableVLabScene,
            args: putObj
        }, true);

        interactable.deSelect(true);

        /**
         * Process all siblings of interactable (transit them to VLabInventory), updating interactable.vLabScene setting it to this (VLabInventory Scene); used interactable.vLabSceneObject siblings' names
         */
        let siblingInteractables = [];
        interactable.vLabSceneObject.traverse((interactableVLabSceneObjectSibling) => {
            let interactableVLabSceneInteractable = interactableVLabScene.interactables[interactableVLabSceneObjectSibling.name];
            if (interactableVLabSceneInteractable !== undefined) {
                siblingInteractables.push(interactableVLabSceneInteractable);
            }
        });

        interactableVLabScene.remove(interactable.vLabSceneObject);

        siblingInteractables.forEach((siblingInteractable) => {
            delete interactableVLabScene.interactables[siblingInteractable.vLabSceneObject.name];
            this.appendInteractable(siblingInteractable);
        });

        interactable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, 0.0, 0.0));
        interactable.vLabSceneObject.quaternion.copy(new THREE.Quaternion(0.0, 0.0, 0.0, 0.0));
        interactable.vLabSceneObject.scale.copy(new THREE.Vector3(1.0, 1.0, 1.0));

        this.add(interactable.vLabSceneObject);

        interactable.vLabSceneObject.getObjectByName(interactable.vLabSceneObject.name + '_BOUNDS').visible = false;

        interactable.vLabSceneObject.visible = true;

        interactable.vLabSceneObject.lookAt(new THREE.Vector3(0.5, 0.5, 0.5));

        this.vLab.EventDispatcher.notifySubscribers({
            target: 'VLabScene',
            type: 'interactablePut'
        });

        this.addedIcon.style.opacity = 1.0;

        new TWEEN.Tween(this.addedIcon.style)
        .to({opacity: 0.0}, 2000)
        .start();

        this.resetView();

        this.thumbsWebGLRenderer.render(this, this.thumbsCamera);
        let imgData = this.thumbsWebGLRenderer.domElement.toDataURL();
        console.log(imgData);
    }

    /**
     * Takes VLabSceneInteractable and sets it as taken
     * putObj {@link VLabInventory#addInteractable}
     */
    take(putObj) {
        console.log(putObj);
    }
}
export default VLabInventory;