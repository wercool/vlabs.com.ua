import * as THREE from 'three';

/**
 * VLabPanel base class
 * @class
 */
class VLabPanel {
   /**
    * VLabPanel constructor
    * @constructor
    * @param {Object}    initObj                           - VLabScene initialization object
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
                    activated:              this.onVLabSceneActivated,
                    deActivated:            this.onVLabSceneDeActivated,
                    interactableTaken:      this.onVLabSceneInteractableTaken,
                    interactablePut:        this.onVLabSceneInteractablePut,
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

                this.VLabPanelRightContainer = document.createElement('div');
                this.VLabPanelRightContainer.id = 'VLabPanelRightContainer';
                this.VLabPanelContainer.appendChild(this.VLabPanelRightContainer);

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
            if (this.vLab.Inventory !== undefined) {
                shiftLeft += this.vLab.Inventory.opentButton.clientWidth / 2;
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
            this.VLabPanelCenterContainer.style.width = 'calc(20% / ' + vLabContainerRatio + ')';
            this.VLabPanelCenterContainer.style.display = 'table-cell';
            this.VLabPanelLeftContainer.style.width = 'auto';
            this.VLabPanelRightContainer.style.width = 'auto';
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
        this.conformVLabPanelContainer();
    }
    /**
     * VLabScene interactable put event handler
     */
    onVLabSceneInteractablePut() {
        this.conformVLabPanelContainer();
    }
    /**
     * Inventory ready event handler
     */
    onInventoryReady() {
        this.conformVLabPanelContainer();
    }
    /**
     * Arbitary VLabScene activated event handler
     */
    onVLabSceneActivated(event) {
        if (event.vLabSceneClass !== 'VLabInventory') {
            this.show();
        }
    }
    /**
     * Arbitary VLabScene de-activated event handler
     */
    onVLabSceneDeActivated(event) {
        this.hide();
    }
}
export default VLabPanel;