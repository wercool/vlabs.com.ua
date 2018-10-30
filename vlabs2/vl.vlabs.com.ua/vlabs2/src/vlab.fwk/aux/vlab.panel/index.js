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
         * @todo describe VLabPanel components
         * this.VLabPanelContainer
         * this.VLabPanelLeftContainer
         * this.VLabPanelRightContainer
         */
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

                this.conformVLabPanelCenterContainer();

                this.vLab.EventDispatcher.subscribe({
                    subscriber: this,
                    events: {
                        window: {
                            resize: this.onWindowResized
                        },
                        VLabScene: {
                            interactableTaken: this.onVLabSceneInteractableTaken,
                            interactablePut: this.onVLabSceneInteractablePut,
                        }
                    }
                });

                resolve(this);
            });
        });
    }
    /**
     * Window resized event handler
     */
    onWindowResized(event) {
        this.conformVLabPanelCenterContainer();
    }
    /**
     * Conditionally conforms VLabPanelContainer
     */
    conformVLabPanelContainer() {

    }
    /**
     * Conditionally conforms VLabPanelLeftContainer
     */
    conformVLabPanelLeftContainer() {
    }
    /**
     * Conditionally conforms VLabPanelCenterContainer
     */
    conformVLabPanelCenterContainer() {
        if (this.vLab.SceneDispatcher.takenInteractable) {
            let vLabContainerRatio = this.vLab.DOMManager.container.clientWidth / this.vLab.DOMManager.container.clientHeight;
            this.VLabPanelCenterContainer.style.width = 'calc(20% / ' + vLabContainerRatio + ')';
            this.VLabPanelCenterContainer.style.display = 'table-cell';
            this.VLabPanelRightContainer.style.width = 'auto';
        } else {
            this.VLabPanelCenterContainer.style.display = 'none';
            this.VLabPanelRightContainer.style.width = '60%';
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
        this.conformVLabPanelCenterContainer();
    }
    /**
     * VLabScene interactable put event handler
     */
    onVLabSceneInteractablePut() {
        this.conformVLabPanelCenterContainer();
    }
}
export default VLabPanel;