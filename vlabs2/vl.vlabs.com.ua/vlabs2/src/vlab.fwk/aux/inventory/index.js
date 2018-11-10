import * as THREE from 'three';
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
        this.VLab = this.initObj.vLab;
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
         * Default event subscription object; {@link VLabEventDispatcher#eventSubscribers}
         * @public
         */
        this.eventSubscrObj = {
            subscriber: this,
            events: {
            }
        };

        if (this.vLab.SceneDispatcher.getScene(VLabInventory) === null) {
            this.vLab.SceneDispatcher.scenes.push(this);

            if (this.VLab.DOMManager.vLabPanel) {
                if (this.VLab.DOMManager.vLabPanel.VLabPanelRightContainer) {
                    this.VLab.DOMManager.addStyle({
                        id: 'inventoryCSS',
                        href: '/vlab.assets/css/inventory.css'
                    })
                    .then(() => {
                        /**
                         * Subscrive to events
                         */
                        this.vLab.EventDispatcher.subscribe(this.eventSubscrObj);

                        this.opentButtonIcon = document.createElement('li');
                        this.opentButtonIcon.id = 'inventoryOpentButtonIcon';
                        this.opentButtonIcon.className = 'material-icons';
                        this.opentButtonIcon.innerHTML = 'work';

                        this.opentButton = document.createElement('div');
                        this.opentButton.id = 'inventoryOpentButton';

                        this.opentButton.appendChild(this.opentButtonIcon);
                        this.opentButton.onclick = this.opentButton.ontouchstart = this.onOpentButtonHandler.bind(this);

                        /**
                         * Add this.opentButton to vLabPanel.VLabPanelRightContainer
                         * {@link VLabPanel#VLabPanelRightContainer}
                         */
                        this.VLab.DOMManager.vLabPanel.VLabPanelRightContainer.appendChild(this.opentButton);

                        /**
                         * Notify event subscribers
                         */
                        this.vLab.EventDispatcher.notifySubscribers({
                            target: 'VLabInventory',
                            type: 'ready'
                        });
                    });
                }
            }
        } else {
            console.error('VLabInventory already exists in VLab');
        }
    }
    /**
     * this.opentButton click and touchstart event hanlder
     * this.opentButton.onclick = this.opentButton.ontouchstart
     */
    onOpentButtonHandler(event) {
        this.vLab.SceneDispatcher.activateScene({
            class: this.constructor
        });
    }
}
export default VLabInventory;