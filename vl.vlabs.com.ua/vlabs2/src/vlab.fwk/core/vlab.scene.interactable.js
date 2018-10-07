import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as THREEUtils from '../utils/three.utils';
import * as ObjectUtils from '../utils/object.utils';
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
     * @param {string}              [initObj.interactable.name]                 - VLab Scene object name
     * @param {Object}              [initObj.interactable.sceneObject]          - VLab Scene object reference
     * @param {boolean}             [initObj.interactable.visibility]           - VLab Scene object visibility
     * @param {boolean}             [initObj.interactable.intersectable]        - If true then will be checked for intersection in {@link VLabScene#intersectInteractablesWithInteractablesRaycaster}
     * @param {boolean}             [initObj.interactable.preselecatble]        - If true mouseover and touchstart will preselect this.vLabSceneObject 
     * @param {boolean}             [initObj.interactable.selectable]           - If true mousedown and touchstart will select this.vLabSceneObject if it is preselectable and already preselected or if it is not preselectable
     * @param {HTML}                [initObj.interactable.tooltip]              - If defined and != "" then will be shown in {@linkg VLabSceneInteractable#preselect}
     * @param {[Object]}            [initObj.interactable.menu]                 - Array of menu items
     * @param {Object}              [initObj.interactable.menu.item]            - Menu item
     * @param {string}              [initObj.interactable.menu.item.label]      - Menu item label (HTML)
     * @param {string}              [initObj.interactable.menu.item.icon]       - Menu item icon (HTML)
     * @param {boolean}             [initObj.interactable.menu.item.enabled]    - Menu item enabled
     * @param {string | function}   [initObj.interactable.menu.item.action]     - Menu item action
     * @param {Object}              [initObj.interactable.menu.item.args]       - Menu item action args
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
         * VLab instance
         * @public
         */
        this.vLab = this.vLabScene.vLab;
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
         * Selection inner object
         */
        this.selection = {};
        /**
         * Is this is a taken object in VLab
         */
        this.taken = false;
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
        /**
         * Respondent VLabSceneInteractables (respondent is an object in a current scene, with which one `this` can interact)
         */
        this.respondents = [];
        /**
         * Lines drawn from `this` to it's respondents; THREE.Line instances
         * respondentIntersectionPoint(s)
         */
        this.respondentPreselectionHelpers = [];
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
            this.vLab.DOMManager.addStyle({
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
    /**
     * Sets vLabSceneObject and actually adds `this` instance of VLabSceneInteractable to {@link VLabScene#interactables}; vLabSceneObject.name used as a key for {@link VLabScene#interactables}
     * @memberof VLabSceneInteractable
     */
    setVLabSceneObject(vLabSceneObject) {
        if (vLabSceneObject) {
            this.vLabSceneObject = vLabSceneObject;
            this.vLabScene.interactables[this.vLabSceneObject.name] = this;
            this.addOutlineHelperMesh();
            this.setVisibility();
        }
    }
    /**
     * Makes VLabSceneInteractable.vLabSceneObject.visible = visibility; if defined
     * @param {boolean} visibility
     */
    setVisibility(visibility) {
        this.vLabSceneObject.visible = (visibility !== undefined) ? visibility : ((this.initObj.interactable.visibility !== undefined) ? this.initObj.interactable.visibility : true);
    }
    /**
     * Calls {@link VLabSceneDispatcher#putTakenInteractable}
     * @abstract
     */
    put(putObj) {
        this.vLab.SceneDispatcher.putTakenInteractable(putObj);
    }
    /**
     * Calls {@link VLabSceneDispatcher#setTakenInteractable}
     * @abstract
     */
    take() {
        this.vLab.SceneDispatcher.setTakenInteractable(this);
    }
    /**
     * Selects this VLabSceneInteractable
     * Adds this instance to {@link VLabScene#selectedInteractables}
     * @param {Object} selectionObj 
     * selectionObj = {
     * [ hold: true, true: selection would be kept until next VLabSceneInteractable be selected
     *   ...
     * ]
     * };
     * @abstract
     */
    select(selectionObj) {
        /**
         * Selection
         */
        if (selectionObj != undefined) {
            this.selection =  ObjectUtils.merge(this.selection, selectionObj);

            if (this.selection.hold == true) {
                this.updateMenuWithMenuItem({
                    label: 'Hold selection',
                    icon: '<i class="material-icons" style="color: #ffffff;">filter_tilt_shift</i>',
                    action: 'this.select({hold: false})'
                });
            } else {
                this.updateMenuWithMenuItem({
                    label: 'Hold selection',
                    icon: '<i class="material-icons">filter_tilt_shift</i>',
                    action: 'this.select({hold: true})'
                });
            }
            return;
        }
        /**
         * Intersection
         */
        if (this.intersection) {
            if (this.selectable && !this.selected) {
                if (this.preselectable && this.preselected || !this.preselectable) {
                    let currentlySelectedInteractable = this.vLabScene.manager.getCurrentlySelectedInteractable();
                    if (currentlySelectedInteractable) currentlySelectedInteractable.deSelect();

                    this.vLabScene.selectedInteractables.push(this);
                    this.selected = true;
                    this.dePreselect();
                }
            } else if (this.selectable && this.selected) {
                /**
                 * 
                 * Auto Hold Selection
                 * 
                 */
                // if (this.menuContainer && this.menu[0]) {
                //     /**
                //      * Hold Selection is at the menu[0]
                //      */
                //     if (this.menu[0].label == 'Hold selection') {
                //         this.selection.hold = true;
                //         this.updateMenuWithMenuItem({
                //             label: 'Hold selection',
                //             icon: '<i class="material-icons" style="color: #ffffff;">filter_tilt_shift</i>',
                //             action: 'this.select({hold: false})'
                //         });
                //         this.hideMenu();
                //         return;
                //     }
                // }
                this.showMenu();
            }
        } else {
            /**
             * No intersection
             */
            this.deSelect();
        }
    }
    /**
     * Deselects @conditionally this VLabSceneInteractable
     * Removes this instance from {@link VLabScene#selectedInteractables}
     * Sets @conditionally this.selected = false
     * @abstract
     */
    deSelect(insistently) {
        if (this.selected  && ((!this.selection.hold && this.vLabScene.intersectedInteractables.length > 0) || (!this.selection.hold && insistently == true))) {
            let indexOfThisSelected = this.vLabScene.selectedInteractables.indexOf(this);
            this.vLabScene.selectedInteractables.splice(indexOfThisSelected, 1);
            this.selected = false;
        }
        this.hideMenu();
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
     * 
     * 
     * 
     * 
     * 
     * 
     * Event Handlers
     * 
     * 
     * 
     * 
     * 
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
            if (event.target == this.vLab.WebGLRendererCanvas) {
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
        /**
         * do not react on middle mouse down
         * do not react on right mouse down
         */
        if(event.button != 1 && event.button != 2) {
            this.select();
            this.hideTooltip();
        } else if (event.button == 2){
            if (this.intersection) {
                console.log(this.vLabSceneObject.name);
                console.log(this);
            }
        }
    }
    /**
     * Default mouseup event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mouseupHandler(event) {
        if (this.preselected) {
            this.showTooltip();
        }
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
            if (!this.vLabScene.manager.getCurrentlySelectedInteractable()) {
                this.deSelect();
            } else {
                this.dePreselect();
            }
            this.hideMenu();
        }
    }
    /**
     * Default touchend event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchendHandler(event) {
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
            this.hideTooltip();
        } else {
            if (!this.preselected) {
                this.hideTooltip();
            } else {
                this.showTooltip();
            }
        }
    }
    /**
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * Behavior auxilary functions
     * 
     * 
     * 
     * 
     * 
     * 
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
     * 
     * 
     * Menu functions
     * 
     * 
     */
    /**
     * Show menu
     * Executes menu action
     */
    showMenu() {
        if (this.menu.length > 0  && !this.menuContainer) {
            /**
             * Depress current VLabControls
             */
            this.vLabScene.currentControls.depress();

            this.menuContainer = document.createElement('div');
            this.menuContainer.id = this.vLabSceneObject.name + '_MENU';
            this.menuContainer.className = 'interactableMenu';

            this.menu.forEach((menuItem) => {
                let menuItemDIV = document.createElement('div');
                menuItemDIV.className = 'interactableMenuItem';
                menuItemDIV.innerHTML = '<div class="interactableMenuIcon">' + (menuItem.icon ? menuItem.icon : '<i class=\"material-icons\">code</i>') + '</div>' + menuItem.label;
                if (menuItem.enabled !== undefined && !menuItem.enabled) {
                    menuItemDIV.style.opacity = 0.1;
                } else {
                    menuItemDIV.onmousedown = menuItemDIV.ontouchstart = this.callMenuAction.bind(this, menuItem);
                }
                this.menuContainer.appendChild(menuItemDIV);
            });

            this.vLab.DOMManager.WebGLContainer.appendChild(this.menuContainer);
            let menuCoords = THREEUtils.screenProjected2DCoordsOfObject(this.vLab, this.vLabSceneObject);
            let xPosDelta = this.vLab.DOMManager.WebGLContainer.clientWidth - (menuCoords.x + this.menuContainer.clientWidth);
            let yPosDelta = this.vLab.DOMManager.WebGLContainer.clientHeight - (menuCoords.y + this.menuContainer.clientHeight);
            let xPos = menuCoords.x + (xPosDelta < 0 ? xPosDelta : 0);
            let yPos = menuCoords.y + (yPosDelta < 0 ? yPosDelta : 0);
            this.menuContainer.style.left = (xPos > 0 ? xPos : 0).toFixed(0) + 'px';
            this.menuContainer.style.top = (yPos > 0 ? yPos : 0).toFixed(0) + 'px';
        }
    }
    /**
     * Hide menu
     */
    hideMenu() {
        if (this.menuContainer) {
            this.vLab.DOMManager.WebGLContainer.removeChild(this.menuContainer);
            this.menuContainer = null;
        }
    }
    /**
     * Calls menu item action; eval(event.target.menuItem.action) or call event.target.menuItem.action in event.target.menuItem.context
     */
    callMenuAction(menuItem) {
        if (typeof menuItem.action == 'string') {
            eval(menuItem.action);
        } else {
            if (menuItem.context) {
                let actionArgs = ObjectUtils.merge({ interactable: this }, menuItem.args ? menuItem.args : {} );
                menuItem.action.call(menuItem.context, actionArgs);
            } else {
                console.warn('Menu Item [' + menuItem.label + '] has no context defined and will be removed from menu');
                this.removeMenuItem(menuItem);
            }
        }
        this.hideMenu();
    }
    /**
     * Updates or add (if none of this.menu items has the same label as menuItemObj) new menuItem to this.menu
     */
    updateMenuWithMenuItem(menuItemObj, top) {
        let existingMenuItemIndex = this.getExistingMenuItemIndex(menuItemObj);
        /**
         * Menu Item exists; will be overwritten by menuItemObj
         */
        if (existingMenuItemIndex !== undefined) {
            this.menu[existingMenuItemIndex] = ObjectUtils.merge(this.menu[existingMenuItemIndex], menuItemObj);
        } else {
            /**
             * New Menu Item; will be pushed to this.menu
             */
            if (top == true) {
                this.menu.unshift(menuItemObj);
            } else {
                this.menu.push(menuItemObj);
            }
        }
    }
    /**
     * Updates or add (if none of this.menu items has the same label as menuItemObj) new menuItem to this.menu
     * @param {Object | string} menuItemObj     - Menu Item Object or Menu Item Label
     */
    removeMenuItem(menuItemObj) {
        if (typeof menuItemObj == 'string') {
            menuItemObj = { label: menuItemObj };
        }
        let existingMenuItemIndex = this.getExistingMenuItemIndex(menuItemObj);
        if (existingMenuItemIndex !== undefined) {
            this.menu.splice(existingMenuItemIndex, 1);
        }
    }
    /**
     * Enables / Disables menu item
     * @param {Object | string} menuItemObj     - Menu Item Object or Menu Item Label
     * @param {boolean} state                   - Menu Item enabled / disabled
     */
    setMenuItemEnabled(menuItemObj, state) {
        if (state !== undefined) {
            if (typeof menuItemObj == 'string') {
                menuItemObj = { label: menuItemObj };
            }
            let existingMenuItemIndex = this.getExistingMenuItemIndex(menuItemObj);
            if (existingMenuItemIndex !== undefined) {
                this.menu[existingMenuItemIndex].enabled = state;
            }
        }
    }
    /**
     * Get menu existing item index
     * @default undefined
     */
    getExistingMenuItemIndex(menuItemObj) {
        let existingMenuItemIndex = undefined;
        let menuItemIndex = 0;
        this.menu.forEach((menuItem) => {
            if (menuItem.label == menuItemObj.label) {
                existingMenuItemIndex = menuItemIndex;
            }
            menuItemIndex++;
        });
        return existingMenuItemIndex;
    }
    /**
     * 
     * 
     * 
     * Tooltip functions
     * 
     * 
     * 
     * 
     */
    /**
     * Shows tooltip
     * Do not show tooltips when this.vLabScene.currentControls.active == false
     */
    showTooltip(tooltipHTML, object3D) {
        if (!this.vLabScene.currentControls.active) {
            this.showRespondents();

            if ((this.tooltip != '' || tooltipHTML !== undefined) && !this.tooltipContainer) {
                this.tooltipContainer = document.createElement('div');
                this.tooltipContainer.id = this.vLabSceneObject.name + '_TOOLTIP';
                let shiftX = 0;
                let shiftY = 0;
                if (object3D == undefined) {
                    this.tooltipContainer.className = 'interactableTooltip';
                } else {
                    this.tooltipContainer.className = 'interactableRespondentTooltip';
                    shiftX += 2;
                    shiftY += 2;
                }
                this.vLab.DOMManager.WebGLContainer.appendChild(this.tooltipContainer);
                let tooltipCoords = THREEUtils.screenProjected2DCoordsOfObject(this.vLab, (object3D !== undefined) ? object3D : this.vLabSceneObject);

                tooltipCoords.x += shiftX;
                tooltipCoords.y += shiftY;

                this.tooltipContainer.innerHTML = (tooltipHTML !== undefined) ? tooltipHTML : this.tooltip;

                let xPosDelta = this.vLab.DOMManager.WebGLContainer.clientWidth - (tooltipCoords.x + this.tooltipContainer.clientWidth);
                let yPosDelta = this.vLab.DOMManager.WebGLContainer.clientHeight - (tooltipCoords.y + this.tooltipContainer.clientHeight);
                let xPos = tooltipCoords.x + (xPosDelta < 0 ? xPosDelta : 0);
                let yPos = tooltipCoords.y + (yPosDelta < 0 ? yPosDelta : 0);
                if (this.tooltipContainer.clientHeight > this.tooltipContainer.clientWidth * 3) {
                    xPos -= this.tooltipContainer.clientWidth * 3;
                }
                this.tooltipContainer.style.left = (xPos > 0 ? xPos : 0).toFixed(0) + 'px';
                this.tooltipContainer.style.top = (yPos > 0 ? yPos : 0).toFixed(0) + 'px';
            }
        }
    }
    /**
     * Hides tooltip
     */
    hideTooltip() {
        if (this.tooltipContainer) {
            this.vLab.DOMManager.WebGLContainer.removeChild(this.tooltipContainer);
            this.tooltipContainer = null;
        }
        if (this.respondentPreselectionHelpers.length > 0) {
            this.respondents.forEach((respondent) => {
                respondent.hideTooltip();
            });
            this.respondentPreselectionHelpers.forEach((respondentPreselectionHelper) => {
                this.vLabScene.remove(respondentPreselectionHelper);
            });
            this.respondentPreselectionHelpers = [];
        }
    }
    /**
     * Shows respondents, e.g. VLabSceneInteractables ("respondent" is an object in a current scene, with which one `this` can interact)
     */
    showRespondents() {
        let raycaster = new THREE.Raycaster();
        this.respondents.forEach((respondent) => {
            if (respondent.vLabSceneObject) {
                let thisOrigin = this.vLabSceneObject.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0));
                let respondentOrigin = respondent.vLabSceneObject.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0));
                let respondentDirection = respondentOrigin.clone().sub(thisOrigin.clone()).normalize();

                raycaster.set(thisOrigin, respondentDirection);
                let respondentIntersections = raycaster.intersectObject(respondent.vLabSceneObject);

                if (respondentIntersections.length > 0) {
                    let lineGeometry = new THREE.Geometry();
                    if (!this.taken) {
                        let thisPointMeshPosition = new THREE.Vector3().addVectors(thisOrigin, respondentDirection.clone().multiplyScalar(this.vLabSceneObject.geometry.boundingSphere.radius * 1.1));
                        let thisPointMesh = new THREE.Mesh(this.vLab.prefabs['respondentIntersectionPointGeometry'], this.vLab.prefabs['interactableToRespondentPointMaterial']);
                        thisPointMesh.position.copy(thisPointMeshPosition);
                        thisPointMesh.scale.multiplyScalar(2.0);
                        this.vLabScene.add(thisPointMesh);
                        this.respondentPreselectionHelpers.push(thisPointMesh);

                        lineGeometry.vertices.push(
                            thisPointMeshPosition,
                            respondentIntersections[0].point
                        );
                    } else {
                        lineGeometry.vertices.push(
                            thisOrigin,
                            respondentIntersections[0].point
                        );
                    }

                    let line = new THREE.Line(lineGeometry, this.vLab.prefabs['respondentLineMaterial']);
                    this.vLabScene.add(line);
                    this.respondentPreselectionHelpers.push(line);

                    let respondentIntersectionPointMesh = new THREE.Mesh(this.vLab.prefabs['respondentIntersectionPointGeometry'], this.vLab.prefabs['respondentIntersectionPointMaterial']);
                    respondentIntersectionPointMesh.position.copy(respondentIntersections[0].point);
                    respondentIntersectionPointMesh.scale.multiplyScalar(0.5 * respondentIntersections[0].point.distanceTo(this.vLabScene.currentCamera.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0))));
                    this.vLabScene.add(respondentIntersectionPointMesh);
                    this.respondentPreselectionHelpers.push(respondentIntersectionPointMesh);

                    if (respondent[this.vLabSceneObject.name + '_RESP_TOOLTIP']) {
                        if (THREEUtils.frustumContainsPoint(this.vLab, respondentIntersectionPointMesh.position)) {
                            respondent.showTooltip(respondent[this.vLabSceneObject.name + '_RESP_TOOLTIP'], respondentIntersectionPointMesh);
                        }
                    }
                }
            }
        });
    }

}
export default VLabSceneInteractable;