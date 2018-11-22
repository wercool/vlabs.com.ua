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
         * Activated
         */
        this.activated = false;
        /**
         * Interactables in the Inventory
         */
        this.items = {};
        /**
         * Interactables in the Inventory
         * {
         *      interactable: interactable,
         *      thumbnail: thumbnail,
         *      container: itemContainer,
         *      putObj: putObj
         * }
         */
        this.selectedItem = undefined;
        /**
         * Inventory open button
         */
        this.opentButton = undefined;
        /**
         * Inventory opentButton icon
         */
        this.opentButtonIcon = undefined;
        /**
         * Thumbnail size
         */
        this.thumbnailSize = 200;

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
             * Add inventory CSS
             */
            if (this.vLab.DOMManager.vLabPanel) {
                if (this.vLab.DOMManager.vLabPanel.VLabPanelRightContainer) {
                    this.vLab.DOMManager.addStyle({
                        id: 'inventoryCSS',
                        href: '/vlab.assets/css/inventory.css'
                    })
                    .then(() => {

                        /**
                         * Disable pan on this.currentControls
                         */
                        this.currentControls.enablePan = false;

                        /**
                         * WebGLRenderer, PerspectiveCamera for rendering Inventory items for getting their thumbnails
                         */
                        this.thumbsWebGLRenderer = new THREE.WebGLRenderer({
                            antialias: true,
                            precision: 'lowp'
                        });
                        this.thumbsWebGLRenderer.context.getShaderInfoLog = function () { return '' };
                        this.thumbsWebGLRenderer.context.getProgramInfoLog = function () { return '' };

                        this.thumbsWebGLRenderer.setSize(this.thumbnailSize, this.thumbnailSize, false);
                        this.thumbsWebGLRenderer.setClearColor(0x747a7c);
                        this.thumbsWebGLRenderer.domElement.style.width  = this.thumbnailSize + 'px';
                        this.thumbsWebGLRenderer.domElement.style.height = this.thumbnailSize + 'px';

                        this.thumbsCanvas = document.createElement('canvas');
                        this.thumbsCanvas.width  = this.thumbnailSize;
                        this.thumbsCanvas.height = this.thumbnailSize;
                        this.thumbsCanvasCtx = this.thumbsCanvas.getContext('2d');

                        this.thumbsCamera = new THREE.PerspectiveCamera(50, 1.0, 0.01, 10);
                        this.thumbsCamera.updateProjectionMatrix();
                        this.thumbsCamera.position.copy(new THREE.Vector3(1.0, 1.0, 1.0));
                        this.thumbsCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));


                        /**
                         * Build HTML elements
                         */
                        this.inventoryContainer = document.createElement('div');
                        this.inventoryContainer.id = 'inventoryContainer';
                        this.inventoryContainer.style.display = 'none';
                        this.inventoryContainer.setAttribute('collapsed', 'false');

                        this.inventoryContainerScrollArea = document.createElement('div');
                        this.inventoryContainerScrollArea.id = 'inventoryContainerScrollArea';
                        this.inventoryContainer.appendChild(this.inventoryContainerScrollArea);

                        this.inventoryExpandIcon = document.createElement('div');
                        this.inventoryExpandIcon.id = 'inventoryExpandIcon';
                        this.inventoryExpandIcon.className = 'material-icons';
                        this.inventoryExpandIcon.innerHTML = 'more_vert';
                        this.inventoryExpandIcon.style.display = 'none';
                        this.inventoryExpandIcon.onclick = this.inventoryExpandIcon.ontouchstart = this.onInventoryExpandIconHandler.bind(this);

                        /**
                         * Add this.inventoryContainer to this.DOMManager.container
                         * Add this.inventoryExpandIcon to this.DOMManager.container
                         * {@link VLabDOMManager#container}
                         */
                        this.vLab.DOMManager.container.appendChild(this.inventoryContainer);
                        this.vLab.DOMManager.container.appendChild(this.inventoryExpandIcon);

                        this.button = document.createElement('div');
                        this.button.id = 'inventoryButton';

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

                        this.addedThumbnail = document.createElement('div');
                        this.addedThumbnail.id = 'inventoryAddedThumbnail';
                        this.addedThumbnail.style.opacity = 0.0;

                        this.button.appendChild(this.openButtonIcon);
                        this.button.appendChild(this.closeButtonIcon);
                        this.button.appendChild(this.addedIcon);
                        this.button.appendChild(this.addedThumbnail);

                        this.button.onclick = this.button.ontouchstart = this.onButtonHandler.bind(this);
                        this.button.onmouseover = this.onButtonMouseOverHandler.bind(this);

                        /**
                         * Add this.button to vLabPanel.VLabPanelRightContainer
                         * {@link VLabPanel#VLabPanelRightContainer}
                         */
                        this.vLab.DOMManager.vLabPanel.VLabPanelRightContainer.appendChild(this.button);

                        this.inventoryTakeButton = document.createElement('div');
                        this.inventoryTakeButton.id = 'inventoryTakeButton';
                        this.inventoryTakeButton.style.display = 'none';

                        this.inventoryTakeButtonIcon = document.createElement('li');
                        this.inventoryTakeButtonIcon.id = 'inventoryTakeButtonIcon';
                        this.inventoryTakeButtonIcon.className = 'material-icons';
                        this.inventoryTakeButtonIcon.innerHTML = 'pan_tool';

                        this.inventoryTakeButton.appendChild(this.inventoryTakeButtonIcon);

                        this.inventoryTakeButton.onclick = this.inventoryTakeButton.ontouchstart = this.take.bind(this);

                        /**
                         * Add this.inventoryTakeButton to vLabPanel.VLabPanelRightContainer
                         * {@link VLabPanel#VLabPanelRightContainer}
                         */
                        this.vLab.DOMManager.vLabPanel.VLabPanelRightContainer.appendChild(this.inventoryTakeButton);

                        /**
                         * Bind onWebGLRendererCanvasPressed
                         */
                        this.onWebGLRendererCanvasPressed = this.onWebGLRendererCanvasPressed.bind(this);

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
                            this.axesHelper = new THREE.AxesHelper(10);
                            this.add(this.axesHelper);
                            console.info("10m AxesHelper added to VLabInventory");
                        /*</dev>*/

                        this.currentCamera.near = 0.01;
                        this.currentCamera.far = 10.0;

                        this.currentCamera.position.copy(new THREE.Vector3(1.0, 1.0, 1.0));

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
        this.activated = true;
        this.closeButtonIcon.classList.remove('hidden');
        /**
         * Add WebGLRendererCanvas press listeners
         */
        this.vLab.WebGLRendererCanvas.addEventListener('mousedown', this.onWebGLRendererCanvasPressed);
        this.vLab.WebGLRendererCanvas.addEventListener('touchstart', this.onWebGLRendererCanvasPressed);
        this.expandInventoryItemList();
        this.updateTakeButtonState();
        this.manager.clock.getDelta();
    }
    /**
     * VLab Scene onDeactivated abstract function implementation.
     *
     */
    onDeactivated() {
        this.activated = false;
        this.inventoryContainer.style.display = 'none';
        this.closeButtonIcon.classList.add('hidden');
        this.resetView();
        /**
         * Remove WebGLRendererCanvas press listeners
         */
        this.vLab.WebGLRendererCanvas.removeEventListener('mousedown', this.onWebGLRendererCanvasPressed);
        this.vLab.WebGLRendererCanvas.removeEventListener('touchstart', this.onWebGLRendererCanvasPressed);
        this.inventoryExpandIcon.style.display = 'none';
        this.inventoryTakeButton.style.display = 'none';
    }
    /**
     * Sets this.currentCamera position and update this.currentControls.target
     */
    resetView() {
        let cameraPos = 1.0;

        if (this.selectedItem !== undefined) {
            this.selectedItem.interactable.vLabSceneObject.geometry.computeBoundingSphere();

            /**
             * Set camera position to 2 * bouding sphere radius
             */
            cameraPos = this.selectedItem.interactable.vLabSceneObject.geometry.boundingSphere.radius * 2;
        }

        if (cameraPos <= this.currentCamera.near) {
            cameraPos = this.currentCamera.near * 2;
        }

        this.currentCamera.position.copy(new THREE.Vector3(cameraPos, cameraPos, cameraPos));
        this.thumbsCamera.position.copy(new THREE.Vector3(cameraPos, cameraPos, cameraPos));

        this.currentControls.target = new THREE.Vector3(0.0, 0.0, 0.0);
        this.currentControls.reset();
        this.currentControls.update();
    }
    /**
     * Update this.inventoryTakeButton state
     */
    updateTakeButtonState() {
        if (this.selectedItem) {
            if (this.vLab.SceneDispatcher.takenInteractable) {
                this.inventoryTakeButtonIcon.innerHTML = 'swap_vertical_circle';
                this.inventoryTakeButtonIcon.style.fontSize = 'calc(var(--screenDependentButtonSize))';
            } else {
                this.inventoryTakeButtonIcon.style.fontSize = 'calc(var(--screenDependentButtonSize) * 0.85)';
                this.inventoryTakeButtonIcon.innerHTML = 'pan_tool';
            }
            if (this.activated == true) {
                this.inventoryTakeButton.style.display = 'block';
            }
        } else {
            this.inventoryTakeButton.style.display = 'none';
        }
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
     * Sets selected Inventory item
     * @param {Object} selectedItem     - if undefined, process this.selectedItem
     */
    setSelectedItem(selectedItem) {
        if (this.selectedItem !== undefined || selectedItem !== undefined) {
            for (let itemName in this.items) {
                this.items[itemName].interactable.vLabSceneObject.visible = false;
                if (this.items[itemName].container) {
                    this.items[itemName].container.removeAttribute('selected');
                    this.items[itemName].container.classList.remove('inventoryItemContainerSelected');
                }
            }
            if (selectedItem !== undefined) {
                this.selectedItem = selectedItem;
            }

            this.selectedItem.interactable.vLabSceneObject.getObjectByName(this.selectedItem.interactable.vLabSceneObject.name + '_BOUNDS').visible = false;

            this.selectedItem.interactable.vLabSceneObject.visible = true;

            this.resetView();

            this.selectedItem.interactable.vLabSceneObject.lookAt(this.currentCamera.position.clone());

            if ( this.selectedItem.container) {
                this.selectedItem.container.setAttribute('selected', 'true');
                this.selectedItem.container.classList.add('inventoryItemContainerSelected');

                this.inventoryContainerScrollArea.scrollTop = this.selectedItem.container.offsetTop;
            }
        }
        this.updateTakeButtonState();
    }
    /**
     * Sets selected Inventory item by interactable.vLabSceneObject.name
     */
    setSelectedItemByName(itemName) {
        this.setSelectedItem(this.items[itemName]);
    }
    /**
     * Removes {interactable} from interactable.vLabScene.interactables;
     * Appends VLabSceneInteractable to this.VLabScene.interactables
     * @param {VLabSceneInteractable} interactable 
     */
    addInteractable(interactable) {
        return new Promise((resolve) => {
            this.items[interactable.vLabSceneObject.name] = {};

            let self = this;

            let interactableVLabScene = interactable.vLabScene;

            let putObj = {
                scene: interactableVLabScene,
                parent: interactable.vLabSceneObject.parent,
                position: interactable.vLabSceneObject.position.clone(),
                quaternion: interactable.vLabSceneObject.quaternion.clone(),
                scale: interactable.vLabSceneObject.scale.clone(),
                materials: this.manager.getInteractableMaterials(interactable)
            };

            /**
             * If interactable is this.vLab.SceneDispatcher.takenInteractable
             */
            if (interactable == this.vLab.SceneDispatcher.takenInteractable) {
                // this.vLab.SceneDispatcher.putTakenInteractable(interactable.vLabSceneObject.userData['beforeTakenState']);
                if (this.vLab.SceneDispatcher.takenInteractableSceneObjectTween) {
                    this.vLab.SceneDispatcher.takenInteractableSceneObjectTween.stop();
                    this.vLab.SceneDispatcher.takenInteractableSceneObjectTween = undefined;

                    this.vLab.SceneDispatcher.currentVLabScene.currentCamera.remove(interactable.vLabSceneObject);

                    interactable.boundsSprite.position.copy(new THREE.Vector3(0.0, 0.0, 0.0));
                    interactable.boundsSprite.scale.copy(new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(2 * interactable.vLabSceneObject.geometry.boundingSphere.radius));
                    interactable.centerObject3D.add(interactable.boundsSprite);

                    this.vLab.SceneDispatcher.takenInteractable.taken = false;
                    this.vLab.SceneDispatcher.takenInteractable = null;

                    putObj = interactable.vLabSceneObject.userData['beforeTakenState'];

                    interactable.updateMenuWithMenuItem({
                        label: 'Put back',
                        icon: '<i class="material-icons">undo</i>',
                        enabled: false,
                        action: interactable.put,
                        context: interactable,
                        originalScene: interactableVLabScene,
                        args: putObj
                    }, true);

                    this.vLab.EventDispatcher.notifySubscribers({
                        target: 'VLabScene',
                        type: 'interactablePut'
                    });

                    this.manager.resetTakeItemsInMenus();
                }
            }

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

            interactable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, 0.0, 0.0).sub(interactable.centerObject3D.position));
            interactable.vLabSceneObject.quaternion.copy(new THREE.Quaternion(0.0, 0.0, 0.0, 0.0));
            interactable.vLabSceneObject.scale.copy(new THREE.Vector3(1.0, 1.0, 1.0));

            /**
             * Add interactable.vLabSceneObject to this.Scene
             */
            this.add(interactable.vLabSceneObject);

            interactable.vLabSceneObject.visible = true;

            /**
             * Add interactable of taken VLabSceneInteractable into this.items
             */
            this.items[interactable.vLabSceneObject.name]['interactable'] = interactable;
            /**
             * Add interactable putObj
             */
            this.items[interactable.vLabSceneObject.name]['putObj'] = putObj;

            /**
             * Set added as selected Inventory item
             */
            this.setSelectedItem(this.items[interactable.vLabSceneObject.name]);

            this.vLab.EventDispatcher.notifySubscribers({
                target: 'VLabScene',
                type: 'interactablePut'
            });

            /*<dev>*/
                this.axesHelper.visible = false;
            /*</dev>*/

            this.thumbsWebGLRenderer.clear();
            this.thumbsWebGLRenderer.render(this, this.thumbsCamera);

            /*<dev>*/
                this.axesHelper.visible = true;
            /*</dev>*/

            let animationTime = 2000;
            let thumbnail = new Image(this.thumbnailSize, this.thumbnailSize);
            thumbnail.src = this.thumbsWebGLRenderer.domElement.toDataURL();
            thumbnail.onload = function () {
                let thumbnail = this;

                /**
                 * Rectangular shape
                 */
                self.thumbsCanvasCtx.clearRect(0, 0, self.thumbnailSize, self.thumbnailSize);
                self.thumbsCanvasCtx.save();
                self.thumbsCanvasCtx.drawImage(thumbnail, 0.0, 0.0);
                self.addedThumbnail.style.backgroundImage = 'url("' + self.thumbsCanvas.toDataURL() + '")';
                self.thumbsCanvasCtx.restore();

                self.addedThumbnail.style.setProperty('opacity', 1.0);

                let marginTop = -90;
                let width = 100;
                let height = 100;
                new TWEEN.Tween(self.addedThumbnail.style)
                .to({opacity: 0.0}, animationTime)
                .onUpdate(() => {
                    if (marginTop < 0) {
                        marginTop += 1.5;
                        width -= 1;
                        height -= 1;
                        self.addedThumbnail.style.setProperty('left', 'calc(50% - ' + Math.round(width / 2) + 'px)');
                        self.addedThumbnail.style.setProperty('width',width + 'px');
                        self.addedThumbnail.style.setProperty('height', height + 'px');
                        self.addedThumbnail.style.setProperty('margin-top', Math.round(marginTop) + 'px');
                    } else {
                        self.addedThumbnail.style.setProperty('opacity', 0.0);
                    }
                })
                .start();

                self.addedIcon.style.opacity = 1.0;
                new TWEEN.Tween(self.addedIcon.style)
                .to({opacity: 0.0}, animationTime)
                .start();


                /**
                 * 
                 * 
                 * VLabInventory Item object actualization
                 * 
                 * 
                 */

                /**
                 * Add thumbnail of taken VLabSceneInteractable into this.items
                 */
                self.items[interactable.vLabSceneObject.name]['thumbnail'] = thumbnail;

                let itemContainer = document.createElement('div');
                itemContainer.id = 'inventoryItemContainer_' + interactable.vLabSceneObject.name;
                itemContainer.className = 'inventoryItemContainer';
                itemContainer.style.backgroundImage = 'url("' + thumbnail.src + '")';
                itemContainer.setAttribute('itemName', interactable.vLabSceneObject.name);
                itemContainer.onclick = itemContainer.ontouchstart = self.onItemContainerHandler.bind(self);
                self.inventoryContainerScrollArea.appendChild(itemContainer);

                /**
                 * Add container of taken VLabSceneInteractable into this.items
                 */
                self.items[interactable.vLabSceneObject.name]['container'] = itemContainer;

                self.updateTakeButtonState();

                self.setSelectedItem(self.items[interactable.vLabSceneObject.name]);

                setTimeout(() => {
                    resolve(self.items[interactable.vLabSceneObject.name]);
                }, 50);
            }
        });
    }
    /**
     * Takes VLabSceneInteractable and sets it as taken
     */
    take() {
        /**
         * Press Event dumper
         */
        let delta = this.manager.clock.getDelta();

        if (delta > 0.25) {
            let beforeSwapSelectedItem = this.selectedItem;
            /**
             * Swap if this.vLab.SceneDispatcher.takenInteractable
             */
            if (this.vLab.SceneDispatcher.takenInteractable) {
                this.vLab.SceneDispatcher.takenInteractable.takeToInventory()
                .then((inventoryItem) => {
                    this.setSelectedItem(inventoryItem);
                });
            }
            /**
             * If Swap then select Inentory item that was selected before put of take Interactable to take it away (remove from Inventory)
             */
            if (beforeSwapSelectedItem) {
                this.setSelectedItem(beforeSwapSelectedItem);
            }
            this.selectedItem.interactable.deSelect();
            this.vLab.SceneDispatcher.setTakenInteractable(this.selectedItem.interactable, this.selectedItem.putObj);
            this.inventoryContainerScrollArea.removeChild(this.selectedItem.container);
            delete this.items[this.selectedItem.interactable.vLabSceneObject.name];
            this.selectedItem = undefined;
            this.updateTakeButtonState();
        }

        this.manager.clock.getDelta();
    }
    /**
     * Handle itemContainer onclick / ontouchstart events
     */
    onItemContainerHandler(event) {
        event.stopPropagation();
        let itemContainer = event.target;
        for (let itemName in this.items) {
            if (itemName !== itemContainer.getAttribute('itemName')) {
                this.items[itemName]['container'].removeAttribute('preSelected');
                this.items[itemName]['container'].classList.remove('inventoryItemContainerPreSelected');
            }
        }

        if (itemContainer.getAttribute('preSelected') === 'true') {
            this.setSelectedItemByName(itemContainer.getAttribute('itemName'));
        } else {
            itemContainer.setAttribute('preSelected', 'true');
            itemContainer.classList.add('inventoryItemContainerPreSelected');
        }
    }
    /**
     * Called when WebGLRendererCanvasPressed is pressed
     */
    onWebGLRendererCanvasPressed(event) {
        /**
         * Collapse if there is this.selectedItem
         */
        if (this.selectedItem) {
            if (this.inventoryContainer.getAttribute('collapsed') === 'false') {
                this.inventoryContainer.style.opacity = 1.0;
                new TWEEN.Tween(this.inventoryContainer.style)
                .to({opacity: 0.0}, 250)
                .onUpdate(() => {
                    this.inventoryContainer.style.top = 200 * (1 - this.inventoryContainer.style.opacity) + 'px';
                    this.inventoryContainer.style.bottom = 'calc(22% + ' + (2 + 200 * (1 - this.inventoryContainer.style.opacity)) + 'px' + ')';
                })
                .onComplete(() => {
                    this.inventoryContainer.style.display = 'none';
                    if (Object.keys(this.items).length > 0) {
                        this.inventoryExpandIcon.style.display = 'block';
                    } else {
                        this.inventoryExpandIcon.style.display = 'none';
                    }
                    this.inventoryContainer.setAttribute('collapsed', 'true');
                })
                .start();
            }
        }
    }
    /**
     * Handle inventoryExpandIcon press
     */
    onInventoryExpandIconHandler(event) {
        event.stopPropagation();
        this.expandInventoryItemList();
    }
    /**
     * Actually expand Inventory items list
     */
    expandInventoryItemList() {
        this.inventoryContainer.style.opacity = 0.0;
        this.inventoryContainer.style.display = 'block';
        new TWEEN.Tween(this.inventoryContainer.style)
        .to({opacity: 1.0}, 250)
        .onUpdate(() => {
            this.inventoryContainer.style.top = 200 * (1 - this.inventoryContainer.style.opacity) + 'px';
            this.inventoryContainer.style.bottom = 'calc(22% + ' + (2 + 200 * (1 - this.inventoryContainer.style.opacity)) + 'px' + ')';
        })
        .onComplete(() => {
            this.inventoryExpandIcon.style.display = 'none';
            this.inventoryContainer.setAttribute('collapsed', 'false');
            this.inventoryContainer.style.display = 'block';
            this.setSelectedItem();
        })
        .start();
    }
}
export default VLabInventory;