import * as THREE from 'three';
import * as HTTPUtils from '../utils/http.utils';
/**
 * VLabItem base class.
 * @class
 * @classdesc VLabItem is a complex interactable.
 */
class VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        this.initObj = initObj;

        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;
        /**
         * VLabScene nature
         * @public
         * @property {Object} nature                    - VLabItem nature loaded from constructor initObj.natureURL
         */
        this.nature = undefined;
        /**
         * Name of VLabItem
         */
        this.name = this.initObj.name;
    }
    /**
     * Initialize VLab Item
     */
    initialize() {
        let self = this;
        return new Promise((resolve, reject) => {


            HTTPUtils.getJSONFromURL(this.initObj.natureURL)
            .then((nature) => {
                self.nature = nature;

                /**
                 * Setup CSS styles
                 */
                self.setupStyles().then(() => {

                    /**
                     * Prepare DOM elements
                     */
                    self.VLabPanelNotification = document.createElement('div');
                    self.VLabPanelNotification.className = 'vLabItemNotification';
                    self.VLabPanelNotification.style.backgroundImage = 'url("' + (self.nature.thumbnail ? self.nature.thumbnail : '') + '")';

                    self.VLabPanelNotificationLoader = document.createElement('div');
                    self.VLabPanelNotificationLoader.setAttribute('class', 'ldBar label-center vLabItemNotificationLoader');
                    self.VLabPanelNotificationLoader.setAttribute('data-preset', 'circle');
                    self.VLabPanelNotificationLoader.setAttribute('data-stroke', '#00ff00');
                    self.VLabPanelNotification.appendChild(self.VLabPanelNotificationLoader);

                    self.loadingBar = new ldBar(self.VLabPanelNotificationLoader);
                    self.loadingBar.set(45.0);

                    self.vLab.DOMManager.vLabPanel.VLabPanelNotificationContainer.appendChild(self.VLabPanelNotification);

                    self.onInitialized();
                    resolve(this);
                });
            });


        });
    }
    /**
     * VLabItem onInitialized abstract function.
     *
     * @memberof VLabItem
     * @abstract
     */
    onInitialized() { console.log('%c' + this.name + ' onInitialized abstract method not implemented', 'color: orange'); }
    /**
     * VLabItem onLoaded abstract function.
     *
     * @memberof VLabItem
     * @abstract
     */
    onLoaded() { console.log('%c' + this.name + ' onLoaded abstract method not implemented', 'color: orange'); }
    /**
     * Load 3D content from this.nature.modelURL
     * @memberof VLabItem
     */
    load() {

    }
    /**
     * Setup VLabItem HTML CSS styles accordingly to VLabItem nature.
     * 
     * * Loads style either from VLabItem nature link or default (/vlab.assets/css/vlab.item.css)
     * @async
     * @memberof VLabItem
     */
    setupStyles() {
        if (this.nature.style) {
            return this.vLab.DOMManager.addStyle({
                id: this.constructor.name + 'CSS',
                href: this.nature.style
            });
        } else {
            let defaultVLabItemCSS = document.getElementById('VLabItemCSS');
            if (defaultVLabItemCSS) {
                return Promise.resolve();
            } else {
                return this.vLab.DOMManager.addStyle({
                    id: 'VLabItemCSS',
                    href: '/vlab.assets/css/vlab.item.css'
                });
            }
        }
    }
}
export default VLabItem;