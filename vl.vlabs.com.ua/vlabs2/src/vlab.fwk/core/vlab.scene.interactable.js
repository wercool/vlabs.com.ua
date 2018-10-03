import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import * as THREEUtils from '../utils/three.utils';
import VLabScene from './vlab.scene';
/**
 * VLabScene Interactable base class.
 * @class
 * @classdesc VLabScene Interactable base class serves VLabScene interactable object.
 */
class VLabSceneInteractable {
    /**
     * VLabSceneInteractable constructor.
     * 
     * @constructor
     * @param {Object}              initObj                                     - VLabSceneInteractable initialization object
     * @param {VLabScene}           initObj.vLabScene                           - VLabScene
     * @param {Object}              initObj.interactable                        - VLab Scene nature interactables object
     * @param {string}              [initObj.interactable.name]                 - VLab Scene object name; presumed could be set later
     * @param {Object}              [initObj.interactable.sceneObject]          - VLab Scene object reference
     * @param {boolean}             [initObj.interactable.intersectable]        - If true then will be checked for intersection in {@link VLabScene#intersectInteractablesWithInteractablesRaycaster}
     * @param {boolean}             [initObj.interactable.preselecatble]        - If true mouseover and touchstart will preselect this.vLabSceneObject 
     * @param {boolean}             [initObj.interactable.selectable]           - If true mousedown and touchstart will select this.vLabSceneObject if it is preselectable and already preselected or if it is not preselectable
     * @param {HTML}                [initObj.interactable.tooltip]              - If defined and != "" then will be shown in {@linkg VLabSceneInteractable#preselect}
     * @param {[Object]}            [initObj.interactable.menu]                 - Array of menu items
     * @param {Object}              [initObj.interactable.menu.item]            - Menu item
     * @param {string}              [initObj.interactable.menu.item.label]      - Menu item label (HTML)
     * @param {string}              [initObj.interactable.menu.item.icon]       - Menu item icon (HTML)
     * @param {boolean}             [initObj.interactable.menu.item.enabled]    - Menu item enabled
     * @param {?}                   [initObj.interactable.menu.item.action]     - Menu item action
     * @param {Object}              [interactable.style]                        - CSS style for particular VLabScene Interactable
     * @param {string}              [interactable.style.id]                     - CSS style link id
     * @param {string}              [interactable.style.href]                   - CSS style link href
     *
     */
    constructor(initObj) {
        this.initObj = initObj;
        /**
         * VLabScene instance reference
         * @public
         * @default this.initObj.vLabScene
         */
        this.vLabScene = this.initObj.vLabScene;
        /**
         * VLabScene interactable object reference, retrieved as this.vLabScene.getObjectByName(initObj.interactable.name)
         * @public
         * @default undefined
         */
        this.vLabSceneObject = undefined;
        /**
         * If true then will be checked for intersection in {@link VLabScene#intersectInteractablesWithInteractablesRaycaster}
         * @public
         * @default false
         */
        this.intersectable = false;
        /**
         * Intersection object passed to {@link VLabSceneInteractable#intersectionHandler} from {@link VLabScene#processInteractables}
         * @public
         * @default null
         */
        this.intersection = null;
        /**
         * If true then this will be added to the {@link VLabScene#preSelectedInteractables}
         * @public
         * @default false
         */
        this.preselectable = false;
        /**
         * If true then this is in the {@link VLabScene#preSelectedInteractables}
         * @public
         * @default false
         */
        this.preselected = false;
        /**
         * If true then will be rendered as "selected" {@link VLabScene#selectedInteractables}
         * @public
         * @default false
         */
        this.selectable = false;
        /**
         * If true then will be rendered as "selected" {@link VLabScene#selectedInteractables}
         * @public
         * @default false
         */
        this.selected = false;
        /**
         * Simple outline (if EffectComposer is not in use) helper mesh
         */
        this.outlineHelperMesh = undefined;
        /**
         * Simple outline TWEEN animation
         */
        this.outlineHelperMeshTWEEN = undefined;
        /**
         * Tooltip to be shown in {@link VLabSceneInteractable#preselect}
         * @default empty
         */
        this.tooltip = '';
        /**
         * Tooltip DIV
         */
        this.tooltipContainer = undefined;
        /**
         * Menu to be shown in {@link VLabSceneInteractable#select}
         */
        this.menu = [];
        /**
         * Menu DIV
         */
        this.menuContainer = undefined;
    }
    /**
     * Initialize VLabSceneInteractable.
     * Adds this VLabSceneInteractable to {@link VLabScene#interactables};
     *
     * @memberof VLabSceneInteractable
     * @async
     * @returns {Promise | VLabSceneInteractable}                       - VLabSceneInteractable instance in Promise resolver
     */
    initialize(initObj){
        if (initObj) this.initObj = initObj;
        return new Promise((resolve, reject) => {
            this.vLabScene.vLab.DOMManager.addStyle({
                id: (this.initObj.interactable.style && this.initObj.interactable.style.id !== undefined) ? this.initObj.interactable.style.id : 'interactableCSS',
                href: (this.initObj.interactable.style && this.initObj.interactable.style.href !== undefined) ? this.initObj.interactable.style.href : '../vlab.assets/css/interactable.css'
            }).then(() => {
                if (this.initObj.interactable.name !== undefined) {
                    this.setVLabSceneObject(this.vLabScene.getObjectByName(this.initObj.interactable.name));
                }
                if (this.initObj.interactable.sceneObject !== undefined) {
                    this.setVLabSceneObject(this.initObj.interactable.sceneObject);
                }
                if (this.initObj.interactable.intersectable !== undefined) {
                    this.intersectable = this.initObj.interactable.intersectable;
                }
                if (this.initObj.interactable.preselectable !== undefined) {
                    this.preselectable = this.initObj.interactable.preselectable;
                }
                if (this.initObj.interactable.selectable !== undefined) {
                    this.selectable = this.initObj.interactable.selectable;
                }
                if (this.initObj.interactable.tooltip !== undefined) {
                    this.tooltip = this.initObj.interactable.tooltip;
                }
                if (this.initObj.interactable.menu !== undefined) {
                    this.menu = this.initObj.interactable.menu;
                }
                resolve(this);
            });
        });
    }
    setVLabSceneObject(vLabSceneObject) {
        if (vLabSceneObject) {
            this.vLabSceneObject = vLabSceneObject;
            this.vLabScene.interactables[this.vLabSceneObject.name] = this;
            this.addOutlineHelperMesh();
        }
    }
    /**
     * Selects this VLabSceneInteractable
     * Adds this instance to {@link VLabScene#selectedInteractables}
     * @abstract
     */
    select() {
        if (this.intersection) {
            if (this.selectable && !this.selected) {
                if (this.preselectable && this.preselected || !this.preselectable) {
                    this.vLabScene.selectedInteractables.push(this);
                    this.selected = true;
                    this.dePreselect();
                }
            } else if (this.selectable && this.selected) {
                this.showMenu();
            }
        } else {
            this.deSelect();
        }
    }
    /**
     * Deselects this VLabSceneInteractable
     * Removes this instance from {@link VLabScene#selectedInteractables}
     * @abstract
     */
    deSelect() {
        if (this.selected) {
            if (!this.preselected) {
                let indexOfThisSelected = this.vLabScene.selectedInteractables.indexOf(this);
                this.vLabScene.selectedInteractables.splice(indexOfThisSelected, 1);
                this.selected = false;
                this.hideMenu();
            }
        }
        this.dePreselect();
    }
    /**
     * Preselects this VLabSceneInteractable
     * Adds this instance to {@link VLabScene#preSelectedInteractables}
     * @abstract
     */
    preselect() {
        if (this.intersection) {
            if (this.preselectable && !this.preselected && !this.selected) {
                this.vLabScene.preSelectedInteractables.push(this);
                this.preselected = true;
                this.showTooltip();
            }
        } else {
            this.dePreselect();
        }
    }
    /**
     * Deselcts pre-selected this VLabSceneInteractable
     * Removes this instance from {@link VLabScene#preSelectedInteractables}
     * @abstract
     */
    dePreselect() {
        if (this.preselected) {
            let indexOfThisPreselected = this.vLabScene.preSelectedInteractables.indexOf(this);
            this.vLabScene.preSelectedInteractables.splice(indexOfThisPreselected, 1);
            this.preselected = false;
            this.hideTooltip();
        }
    }
    /**
     * 
     * 
     * Event Handlers
     * 
     * 
     */
    /**
     * VLabSceneInteractable default event handler / router; could be overridden in inheritor.
     *
     * @memberof VLabSceneInteractable
     * @abstract
     * @listens VLabScene:onDefaultEventHandler
     */
    onDefaultEventHandler(event) {
        if (this.vLabScene !== undefined && this.vLabSceneObject !== undefined) {
            if (event.target == this.vLabScene.vLab.WebGLRendererCanvas) {
                if (this[event.type + 'Handler']) {
                    this[event.type + 'Handler'].call(this, event);
                }
            }
        }
    }
    /**
     * Default intersection handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    intersectionHandler(event) {
        this.intersection = event.intersection;
    }
    /**
     * Default no-intersection handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    nointersectionHandler(event) {
        this.intersection = null;
    }
    /**
     * Default framerequest event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    framerequestHandler(event) {
    }
    /**
     * Default mousedown event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousedownHandler(event) {
        this.select();
    }
    /**
     * Default mouseup event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mouseupHandler(event) {
    }
    /**
     * Default mousemove event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousemoveHandler(event) {
        this.preselect();
        if (!this.intersection) {
            this.hideMenu();
        }
    }
    /**
     * Default touchstart event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchstartHandler(event) {
        if (this.intersection) {
            if (this.preselectable && !this.preselected && !this.selected) {
                this.preselect();
            } else {
                this.select();
            }
        } else {
            this.deSelect();
        }
    }
    /**
     * Default touchend event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchendHandler(event) {
        // console.log(this.vLabSceneObject.name, this.selected);
    }
    /**
     * Default touchmove event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchmoveHandler(event) {
        if (!this.intersection) {
            this.hideMenu();
        }
    }
    /**
     * 
     * 
     * Behavior auxilary functions
     * 
     * 
     */
    /**
     * Shows simple outline based on this.vLabSceneObject.geometry
     */
    outline() {
        this.outlineHelperMesh.material = this.vLabScene.manager.simpleOutlineMaterial;
        this.outlineHelperMesh.visible = true;
        this.outlineHelperMesh.matrixAutoUpdate = true;
    }
    /**
     * Shows simple outline shows selected, based on this.vLabSceneObject.geometry
     */
    outlineSelected() {
        this.outlineHelperMesh.material = this.vLabScene.manager.simpleOutlineSelectedMaterial;
        this.outlineHelperMesh.visible = true;
        this.outlineHelperMesh.matrixAutoUpdate = true;
    }
    /**
     * Hides simple outline based on this.vLabSceneObject.geometry
     */
    clearOutline() {
        this.outlineHelperMesh.visible = false;
        this.outlineHelperMesh.matrixAutoUpdate = false;
    }
    /**
     * Adds simple outline based on this.vLabSceneObject.geometry as THREE.Mesh to this.vLabSceneObject
     */
    addOutlineHelperMesh() {
        if (this.vLabSceneObject && this.outlineHelperMesh == undefined) {
            this.outlineHelperMesh = new THREE.Mesh(this.vLabSceneObject.geometry, this.vLabScene.manager.simpleOutlineMaterial);
            this.outlineHelperMesh.name = this.vLabSceneObject.name + '_OUTLINE';
            this.outlineHelperMesh.scale.multiplyScalar(1.03);
            this.outlineHelperMesh.visible = false;
            this.outlineHelperMesh.matrixAutoUpdate = false;
            this.vLabSceneObject.add(this.outlineHelperMesh);
            this.outlineHelperMeshTWEEN = new TWEEN.Tween(this.outlineHelperMesh.scale)
            .to({x: 1.01, y: 1.01, z: 1.01}, 850)
            .repeat(Infinity)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        }
    }
    /**
     * Show menu
     */
    showMenu() {
        if (this.menu.length > 0  && !this.menuContainer) {
            this.menuContainer = document.createElement('div');
            this.menuContainer.id = this.vLabSceneObject.name + '_MENU';
            this.menuContainer.className = 'interactableMenu';
            this.vLabScene.vLab.DOMManager.WebGLContainer.appendChild(this.menuContainer);
            let menuCoords = THREEUtils.toScreenPosition(this.vLabScene.vLab, this.vLabSceneObject);
            this.menuContainer.style.left = menuCoords.x.toFixed(0) + 'px';
            this.menuContainer.style.top  = menuCoords.y.toFixed(0) + 'px';

            this.menu.forEach((menuItemObj) => {
                let menuItem = document.createElement('div');
                menuItem.className = 'interactableMenuItem';
                menuItem.innerHTML = menuItemObj.icon + menuItemObj.label;
                menuItem.onmousedown = menuItem.ontouchstart = function(event) { console.log(event.target); }
                this.menuContainer.appendChild(menuItem);
            });

        } else if (this.menuContainer) {

        }
    }
    /**
     * Hide menu
     */
    hideMenu() {
        if (this.menuContainer) {
            this.vLabScene.vLab.DOMManager.WebGLContainer.removeChild(this.menuContainer);
            this.menuContainer = null;
        }
    }
    /**
     * Show tooltip
     */
    showTooltip() {
        if (this.tooltip != '' && !this.tooltipContainer) {
            this.tooltipContainer = document.createElement('div');
            this.tooltipContainer.id = this.vLabSceneObject.name + '_TOOLTIP';
            this.tooltipContainer.className = 'interactableTooltip';
            this.vLabScene.vLab.DOMManager.WebGLContainer.appendChild(this.tooltipContainer);
            let tooltipCoords = THREEUtils.toScreenPosition(this.vLabScene.vLab, this.vLabSceneObject);
            this.tooltipContainer.style.left = tooltipCoords.x.toFixed(0) + 'px';
            this.tooltipContainer.style.top  = tooltipCoords.y.toFixed(0) + 'px';
            this.tooltipContainer.innerHTML = this.tooltip;
        } else if (this.tooltipContainer) {
            let tooltipCoords = THREEUtils.toScreenPosition(this.vLabScene.vLab, this.vLabSceneObject);
            this.tooltipContainer.style.left = tooltipCoords.x.toFixed(0) + 'px';
            this.tooltipContainer.style.top  = tooltipCoords.y.toFixed(0) + 'px';
        }
    }
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltipContainer) {
            this.vLabScene.vLab.DOMManager.WebGLContainer.removeChild(this.tooltipContainer);
            this.tooltipContainer = null;
        }
    }
}
export default VLabSceneInteractable;