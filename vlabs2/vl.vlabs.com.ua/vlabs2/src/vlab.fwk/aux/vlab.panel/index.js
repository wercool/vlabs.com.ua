import * as THREE from 'three';

/**
 * VLabPanel base class
 * @class
 */
class VLabPanel {
   /**
    * VLabPanel constructor
    * @constructor
    * @param {Object}    initObj                           - VLabPanel initialization object
    * @param {VLab}      initObj.vLab                      - VLab instance
    */
    constructor(initObj) {
        this.initObj = initObj;
        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;
        this.name = 'VLabPanel';
        /**
         * Default event subscription object; {@link VLabEventDispatcher#eventSubscribers}
         * @public
         */
        this.eventSubscrObj = {
            subscriber: this,
            events: {
                window: {
                    resize: this.onWindowResized
                },
                VLabScene: {
                    activated:          this.onVLabSceneActivated,
                    deActivated:        this.onVLabSceneDeActivated,
                    interactableTaken:  this.onVLabSceneInteractableTaken,
                    interactablePut:    this.onVLabSceneInteractablePut,
                },
                VLabInventory: {
                    ready: this.onInventoryReady
                }
            }
        };
    }
    /**
     * Initialize VLabPanel
     * Loads prefabs, styles, etc...
     */
    initialize() {
        return new Promise((resolve) =>{
            this.vLab.DOMManager.addStyle({
                id: 'vLabPanelCSS',
                href: '/vlab.assets/css/vlab.panel.css'
            }).then(() => {
                this.VLabPanelContainer = document.createElement('div');
                this.VLabPanelContainer.id = 'VLabPanelContainer';

                this.VLabPanelLeftContainer = document.createElement('div');
                this.VLabPanelLeftContainer.id = 'VLabPanelLeftContainer';
                this.VLabPanelContainer.appendChild(this.VLabPanelLeftContainer);

                this.VLabPanelCenterContainer = document.createElement('div');
                this.VLabPanelCenterContainer.id = 'VLabPanelCenterContainer';
                this.VLabPanelContainer.appendChild(this.VLabPanelCenterContainer);

                this.VLabPanelCenterContainerReactiveDIV = document.createElement('div');
                this.VLabPanelCenterContainerReactiveDIV.id = 'VLabPanelCenterContainerReactiveDIV';
                this.VLabPanelCenterContainer.appendChild(this.VLabPanelCenterContainerReactiveDIV);
                this.VLabPanelCenterContainerReactiveDIV.onclick = this.VLabPanelCenterContainerReactiveDIV.ontouchend = this.VLabPanelCenterContainerReactiveDIV.onmousemove = this.takenInteractableHandleGuesture.bind(this);

                this.VLabPanelRightContainer = document.createElement('div');
                this.VLabPanelRightContainer.id = 'VLabPanelRightContainer';
                this.VLabPanelContainer.appendChild(this.VLabPanelRightContainer);

                this.fullScreenButton = document.createElement('div');
                this.fullScreenButton.id = 'fullscreenButton';
                this.fullScreenButton.classList.add('material-icons', 'settingsButtons');
                this.fullScreenButton.innerHTML = 'fullscreen';
                this.fullScreenButton.onclick = this.fullScreenButton.ontouchend = this.vLab.DOMManager.requestFullscreen.bind(this.vLab.DOMManager);

                this.VLabPanelRightContainer.appendChild(this.fullScreenButton);

                this.settingsButton = document.createElement('div');
                this.settingsButton.id = 'settingsButton';
                this.settingsButton.classList.add('material-icons', 'settingsButtons');
                this.settingsButton.innerHTML = 'settings';
                // this.settingsButton.onclick = this.settingsButton.ontouchend = this.vLab.DOMManager.requestFullscreen.bind(this.vLab.DOMManager);

                this.VLabPanelRightContainer.appendChild(this.settingsButton);

                this.VLabPanelNotificationContainer = document.createElement('div');
                this.VLabPanelNotificationContainer.id = 'VLabPanelNotificationContainer';
                this.VLabPanelLeftContainer.appendChild(this.VLabPanelNotificationContainer);

                /**
                 * Subscrive to events
                 */
                this.vLab.EventDispatcher.subscribe(this.eventSubscrObj);

                this.hide();

                resolve(this);
            });
        });
    }
    /**
     * Shows VLabPanel
     */
    show() {
        this.VLabPanelContainer.style.display = 'table';
        this.conform();
    }
    /**
     * Hides VLabPanel
     */
    hide() {
        this.VLabPanelContainer.style.display = 'none';
    }
    /**
     * Conform everything in the VLabPanel
     */
    conform() {
        this.conformVLabPanelLeftContainer();
        this.conformVLabPanelCenterContainer();
        this.conformVLabPanelRightContainer();
    }
    /**
     * Window resized event handler
     */
    onWindowResized(event) {
        this.conform();
    }
    /**
     * Conditionally conforms VLabPanelContainer
     */
    conformVLabPanelContainer() {
        this.conformVLabPanelLeftContainer();
        this.conformVLabPanelCenterContainer();
        this.conformVLabPanelRightContainer();
    }
    /**
     * Conditionally conforms VLabPanelLeftContainer
     */
    conformVLabPanelLeftContainer() {
        if (this.vLab.SceneDispatcher.takenInteractable) {
            this.VLabPanelLeftContainer.style.width = 'auto';
        } else {
            /**
             * If inventory is present take it's size into account
             */
            let shiftLeft = 0;
            if (this.vLab.Inventory !== undefined && this.vLab.Inventory.button !== undefined) {
                shiftLeft += this.vLab.Inventory.button.clientWidth / 2;
            }

            shiftLeft = 50 - (shiftLeft / this.vLab.DOMManager.container.clientWidth) * 100;

            this.VLabPanelLeftContainer.style.width = shiftLeft + '%';
        }
    }
    /**
     * Conditionally conforms VLabPanelCenterContainer
     */
    conformVLabPanelCenterContainer() {
        if (this.vLab.SceneDispatcher.takenInteractable) {
            let vLabContainerRatio = this.vLab.DOMManager.container.clientWidth / this.vLab.DOMManager.container.clientHeight;
            let calcWidth = 20 / vLabContainerRatio;
            this.VLabPanelCenterContainer.style.width = calcWidth + '%';
            this.VLabPanelCenterContainer.style.display = 'table-cell';
            this.VLabPanelLeftContainer.style.width = 'auto';
            this.VLabPanelRightContainer.style.width = 'auto';
            if(this.vLab.SceneDispatcher.takenInteractable.initObj.interactable.shallowForm == true) {
                this.VLabPanelCenterContainerReactiveDIV.style.display = 'block';
            } else {
                this.VLabPanelCenterContainerReactiveDIV.style.display = 'none';
            }
        } else {
            this.VLabPanelCenterContainer.style.display = 'none';
        }
    }
    /**
     * Conditionally conforms VLabPanelRightContainer
     */
    conformVLabPanelRightContainer() {
    }
    /**
     * VLabScene interactable taken event handler
     */
    onVLabSceneInteractableTaken() {
        this.conform();
    }
    /**
     * VLabScene interactable put event handler
     */
    onVLabSceneInteractablePut() {
        this.conform();
    }
    /**
     * Inventory ready event handler
     */
    onInventoryReady() {
        this.conform();
    }
    /**
     * Arbitary VLabScene activated event handler
     */
    onVLabSceneActivated(event) {
        this.show();
    }
    /**
     * Arbitary VLabScene de-activated event handler
     */
    onVLabSceneDeActivated(event) {
        this.hide();
    }
    /**
     * Conditionally if this.vLab.SceneDispatcher.takenInteractable.initObj.shallowForm = true
     * If this.vLab.SceneDispatcher.takenInteractable is too shallow VLabPanelCenterContainerReactiveDIV dispatches preSeleciton, seleciton methods of interactable
     */
    takenInteractableHandleGuesture(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.vLab.SceneDispatcher.takenInteractable) {
            if(this.vLab.SceneDispatcher.takenInteractable.initObj.interactable.shallowForm == true) {
                if (event.type == 'touchend') {
                    if (!this.vLab.SceneDispatcher.takenInteractable.preselected && !this.vLab.SceneDispatcher.takenInteractable.selected) {
                        this.vLab.SceneDispatcher.takenInteractable.preselect(true);
                    } else {
                        this.vLab.SceneDispatcher.takenInteractable.select(null, true);
                    }
                }
                if (event.type == 'mousemove') {
                    this.vLab.SceneDispatcher.takenInteractable.preselect(true);
                }
                if (event.type == 'click') {
                    this.vLab.SceneDispatcher.takenInteractable.select(null, true);
                }
            }
        }
    }
}
export default VLabPanel;