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
                        this.opentButtonIcon = document.createElement('li');
                        this.opentButtonIcon.id = 'inventoryOpentButtonIcon';
                        this.opentButtonIcon.className = 'material-icons';
                        this.opentButtonIcon.innerHTML = 'work';

                        this.closeButtonIcon = document.createElement('li');
                        this.closeButtonIcon.id = 'inventoryCloseButtonIcon';
                        this.closeButtonIcon.className = 'material-icons';
                        this.closeButtonIcon.innerHTML = 'subdirectory_arrow_left';
                        this.closeButtonIcon.classList.add('hidden');


                        this.opentButton = document.createElement('div');
                        this.opentButton.id = 'inventoryOpentButton';

                        this.opentButton.appendChild(this.opentButtonIcon);
                        this.opentButton.appendChild(this.closeButtonIcon);

                        this.opentButton.onclick = this.opentButton.ontouchstart = this.onOpentButtonHandler.bind(this);
                        this.opentButton.onmouseover = this.onOpentButtonMouseOverHandler.bind(this);

                        /**
                         * Add this.opentButton to vLabPanel.VLabPanelRightContainer
                         * {@link VLabPanel#VLabPanelRightContainer}
                         */
                        this.vLab.DOMManager.vLabPanel.VLabPanelRightContainer.appendChild(this.opentButton);

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

                        this.currentCamera.position.copy(new THREE.Vector3(0.5, 0.5, 0.5));

var pointLight = new THREE.PointLight(0xff0000, 1, 100);
pointLight.position.set(0, 1.0, 0);
this.add(pointLight);

var sphereSize = 0.1;
var pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
this.add(pointLightHelper);

var geometry = new THREE.SphereBufferGeometry( 0.1, 32, 32 );
var material = new THREE.MeshPhongMaterial( {color: 0xffff00} );
var sphere = new THREE.Mesh( geometry, material );
this.add( sphere );

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
    }
    /**
     * this.opentButton click and touchstart event hanlder
     * this.opentButton.onclick = this.opentButton.ontouchstart
     */
    onOpentButtonHandler(event) {
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
    onOpentButtonMouseOverHandler(event) {
        this.vLab.SceneDispatcher.currentVLabScene.dePreselectInteractables();
    }
}
export default VLabInventory;