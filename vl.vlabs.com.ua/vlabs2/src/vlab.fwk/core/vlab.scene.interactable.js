import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as THREEUtils from '../utils/three.utils';
import * as ObjectUtils from '../utils/object.utils';
import VLabScene from './vlab.scene';
import VLabSceneInteractableRespondent from './vlab.scene.interactable.respondent';
/*<dev>*/
import DEVVLabSceneInteractable from '../aux/dev/dev.vlab.scene.interactable';
/*</dev>*/

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
     * @param {boolean}             [initObj.interactable.boundsOnly]           - If true pre-selectionwill always show only selection bounds Sprite only
     * @param {boolean}             [initObj.interactable.selectable]           - If true mousedown and touchstart will select this.vLabSceneObject if it is preselectable and already preselected or if it is not preselectable
     * @param {Object}              [initObj.interactable.action]               - Native action; if defined then VLabSceneInteractable.selectble is set to false; native action will be called instead of selection
     * @param {Function}            [initObj.interactable.action.function]      - This function reference will be called on native action
     * @param {Function}            [initObj.interactable.action.args]          - Native function arguments
     * @param {Function}            [initObj.interactable.action.context]       - Native action function context; action.function.call(action.context, action.args)
     * @param {HTML}                [initObj.interactable.tooltip]              - If defined and != "" then will be shown in {@linkg VLabSceneInteractable#preselect}
     * @param {[Object]}            [initObj.interactable.menu]                 - Array of menu items
     * @param {Object}              [initObj.interactable.menu.item]            - Menu item
     * @param {string}              [initObj.interactable.menu.item.label]      - Menu item label (HTML)
     * @param {string}              [initObj.interactable.menu.item.icon]       - Menu item icon (HTML)
     * @param {boolean}             [initObj.interactable.menu.item.enabled]    - Menu item enabled
     * @param {string | Function}   [initObj.interactable.menu.item.action]     - Menu item action
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
         * Bounding sphere center Object3D
         */
        this.centerObject3D = undefined;
        /**
         * This native action function
         */
        this.actionFunction = undefined;
        /**
         * This native action funciton args
         */
        this.actionFunctionArgs = {};
        /**
         * This native action funciton context
         */
        this.actionFunctionContext = undefined;
        /**
         * Is this is a taken object in VLab
         */
        this.taken = false;
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
         * If true then postprocessing pre-selection outline will not be shown, instead only bounds Sprtie will be shown
         * @public
         * @default false
         */
        this.boundsOnly = false;
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
         * Simple outline (if EffectComposer is not in use) helper mesh
         */
        this.outlineHelperMesh = undefined;
        /**
         * Simple outline TWEEN animation
         */
        this.outlineHelperMeshTWEEN = undefined;
        /**
         * Selection bounds Sprite
         */
        this.boundsSprite = undefined;
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
         * Currently shown tooltips HTML Elements with optional respondent option
         */
        this.tooltipHTMLElements = [];
        /**
         * Menu to be shown in {@link VLabSceneInteractable#select}
         */
        this.menu = [];
        /**
         * Menu DIV
         */
        this.menuContainer = undefined;
        /**
         * Respondent VLabSceneInteractables; identified by key = respondent(VLabSceneInteractables).vLabSceneObjectName
         */
        this.respondents = [];
        /**
         * Lines drawn from `this` to it's respondents; THREE.Line instances
         * respondentIntersectionPoint(s)
         */
        this.respondentPreselectionHelpers = [];
        /**
         * Shown respondents
         */
        this.shownRespondents = [];
    }
    /**
     * Initialize VLabSceneInteractable.
     * Adds this VLabSceneInteractable to {@link VLabScene#interactables};
     *
     * 
     * 
     * 
     *   _____           __      _         
     *  |  __ \         / _|    | |        
     *  | |__) | __ ___| |_ __ _| |__  ___ 
     *  |  ___/ '__/ _ \  _/ _` | '_ \/ __|
     *  | |   | | |  __/ || (_| | |_) \__ \
     *  |_|   |_|  \___|_| \__,_|_.__/|___/
     * 
     * 
     * 
     * 
     * 
     * @memberof VLabSceneInteractable
     * @async
     * @returns {Promise | VLabSceneInteractable}                       - VLabSceneInteractable instance in Promise resolver
     */
    initialize(initObj){
        /*<dev>*/
        if (!this['DEV']) {
            this['DEV'] = new DEVVLabSceneInteractable(this);
        }
        /*</dev>*/

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
                if (this.initObj.interactable.boundsOnly !== undefined) {
                    this.boundsOnly = this.initObj.interactable.boundsOnly;
                }
                if (this.initObj.interactable.selectable !== undefined) {
                    this.selectable = this.initObj.interactable.selectable;
                }
                if (this.initObj.interactable.action !== undefined) {
                    if (this.initObj.interactable.action.function !== undefined) {
                        this.actionFunction = this.initObj.interactable.action.function;
                        this.actionFunctionArgs = this.initObj.interactable.action.args;
                        this.actionFunctionContext = this.initObj.interactable.action.context;
                        this.selectable = false;
                    }
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
            this.vLabSceneObject.geometry.computeBoundingSphere();
            this.centerObject3D = new THREE.Object3D();
            this.centerObject3D.name = this.vLabSceneObject.name + '_CENTER';
            this.centerObject3D.position.copy(this.vLabSceneObject.geometry.boundingSphere.center);
            this.vLabSceneObject.add(this.centerObject3D);
            this.vLabScene.interactables[this.vLabSceneObject.name] = this;
            this.addOutlineHelperMesh();
            this.addBoundsSprite();
            this.setVisibility();
        }
    }
    /**
     * Native action which calls this.actionFunction if defined
     * Exectued if this.intersection and this.preselected
     * @returns {boolean} returns true if this.actionFunction has been actually called
     */
    action(event) {
        if (this.intersection && this.preselected) {
            if (this.actionFunction) {
                let extendedActionFunctionArgs = ObjectUtils.merge(this.actionFunctionArgs, {
                    event: event,
                    intersection: this.intersection
                });
                this.actionFunction.call(this.actionFunctionContext, extendedActionFunctionArgs);
                this.hideTooltip();
                this.removeRespondentsHelpers();
                return true;
            }
        }
        return false;
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
                    icon: '<i class="material-icons" style="color: #ff0000;">adjust</i>',
                    action: 'this.select({hold: false})'
                });
            } else {
                this.updateMenuWithMenuItem({
                    label: 'Hold selection',
                    icon: '<i class="material-icons">adjust</i>',
                    action: 'this.select({hold: true})'
                });
                this.deSelect(true);
            }
            return;
        }

        if (this.vLabScene.intersectedInteractables[0]) {
            // this.vLabScene.selectedInteractables.forEach((selectedInteractable) => {
            //     selectedInteractable.respondents.forEach((selectedInteractableRespondent) => {
            //         if (selectedInteractableRespondent.interactable == this.vLabScene.intersectedInteractables[0]) {
            //             console.log('!!!!!!!!!!!!!!!');
            //         }
            //     });
            // });
        }

        /**
         * Intersection
         */
        if (this.intersection) {
            if (this.selectable && !this.selected) {
                if (this.preselectable && this.preselected || !this.preselectable) {
                    let currentlySelectedInteractable = this.vLabScene.manager.getCurrentlySelectedInteractable();
                    if (currentlySelectedInteractable) currentlySelectedInteractable.deSelect();
                    /**
                     * push to selections if not yet in array
                     */
                    if (this.vLabScene.selectedInteractables.indexOf(this) == -1) {
                        this.vLabScene.selectedInteractables.push(this);
                    }

                    this.selected = true;
                    this.dePreselect();
                }
            } else if (this.selectable && this.selected) {
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
        if (this.selected  
        && ((!this.selection.hold && this.vLabScene.intersectedInteractables.length > 0) || (!this.selection.hold && insistently == true))) {
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
                this.removeRespondentsHelpers();
                /**
                 * push to preSelections if not yet in array
                 */
                if (this.vLabScene.preSelectedInteractables.indexOf(this) == -1) {
                    this.vLabScene.preSelectedInteractables.push(this);
                    this.vLabScene.manager.processInteractablesSelections();
                }

                this.preselected = true;
            }
            this.showTooltip();
            this.showRespondents();
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
            this.removeRespondentsHelpers();
        }
    }
    /**
     * Adds / updates VLabSceneInteractableRespondent to this.respondents
     * Checks that respondent.callerInteractable == this
     * @param {VLabSceneInteractableRespondent} respondent 
     */
    addRespondent(respondentObj) {
        if (respondentObj && respondentObj.callerInteractable == this) {
            let existingRespondentIndex = undefined;
            let idx = 0;
            this.respondents.forEach((existingRespondent) => {
                if (existingRespondent.interactable == respondentObj.interactable) {
                    existingRespondentIndex = idx;
                }
                idx++;
            });
            if (existingRespondentIndex !== undefined) {
                this.respondents[existingRespondentIndex] = new VLabSceneInteractableRespondent(respondentObj);
            } else {
                this.respondents.push(new VLabSceneInteractableRespondent(respondentObj));
            }
        }
    }
    /**
     * 
     * 
     * 
     *    ______               _     _    _                 _ _  
     *   |  ____|             | |   | |  | |               | | |
     *   | |____   _____ _ __ | |_  | |__| | __ _ _ __   __| | | ___ _ __ ___ 
     *   |  __\ \ / / _ \ '_ \| __| |  __  |/ _` | '_ \ / _` | |/ _ \ '__/ __|
     *   | |___\ V /  __/ | | | |_  | |  | | (_| | | | | (_| | |  __/ |  \__ \
     *   |______\_/ \___|_| |_|\__| |_|  |_|\__,_|_| |_|\__,_|_|\___|_|  |___/
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
        if(event.button == 0) {
            if (!this.action(event)) {
                this.select();
                this.hideTooltip();
                this.removeRespondentsHelpers();
            }
        } else if (event.button == 1){
            this.deSelect();
        } else if (event.button == 2){
            this.deSelect();
            if (this.intersection) {
                /*<dev>*/
                    if (!this.taken) {
                        this['DEV'].showMenu();
                    }
                /*</dev>*/
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
        if (this.intersection) {
            if (!this.actionFunction) {
                this.preselect();
            }
        }
    }
    /**
     * Default mousemove event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousemoveHandler(event) {
        if(event.buttons == 0) {
            this.preselect();
        }
    }
    /**
     * Default touchstart event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchstartHandler(event) {
        if (!this.action(event)) {
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
    }
    /**
     * Default touchend event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchendHandler(event) {
        if (this.intersection) {
            this.preselect();
        }
    }
    /**
     * Default touchmove event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchmoveHandler(event) {
        if (this.vLab.EventDispatcher.eventHelpers.touchmoveDelta > 5
        || (this.vLab.SceneDispatcher.takenInteractable && this.vLab.EventDispatcher.eventHelpers.touchmoveDelta > 0)) {
            this.dePreselect();
            if (!this.intersection) {
                this.hideMenu();
            }
        }
    }
    /**
     * 
     *                     _ _            _
     *     /\             (_) |          (_)
     *    /  \  _   ___  ___| | __ _ _ __ _  ___  ___
     *   / /\ \| | | \ \/ / | |/ _` | '__| |/ _ \/ __|
     *  / ____ \ |_| |>  <| | | (_| | |  | |  __/\__ \
     * /_/    \_\__,_/_/\_\_|_|\__,_|_|  |_|\___||___/
     * 
     * 
     * 
     */
    /**
     * Shows simple outline based on this.vLabSceneObject.geometry
     */
    outline() {
        if (this.vLab.nature.selections && this.vLab.nature.selections.outlineHelperMesh == true && !this.boundsOnly) {
            this.outlineHelperMesh.material = this.vLabScene.vLab.prefabs['VLabSceneInteractablePrefabs']['simpleOutlineMaterial'];
            this.outlineHelperMesh.visible = true;
            this.outlineHelperMesh.matrixAutoUpdate = true;
        } else if (!this.vLab.nature.selections || (this.vLab.nature.selections && this.vLab.nature.selections.boundsSprite == true) || this.boundsOnly) {
            this.boundsSprite.material = this.vLabScene.vLab.prefabs['VLabSceneInteractablePrefabs']['preSelectionSpriteMaterial'];
            this.boundsSprite.visible = true;
            this.boundsSprite.matrixAutoUpdate = true;
        }
    }
    /**
     * Shows simple outline shows selected, based on this.vLabSceneObject.geometry
     */
    outlineSelected() {
        if (this.vLab.nature.selections && this.vLab.nature.selections.outlineHelperMesh == true && !this.boundsOnly) {
            this.outlineHelperMesh.material = this.vLabScene.vLab.prefabs['VLabSceneInteractablePrefabs']['simpleOutlineSelectedMaterial'];
            this.outlineHelperMesh.visible = true;
            this.outlineHelperMesh.matrixAutoUpdate = true;
        } else if (!this.vLab.nature.selections || (this.vLab.nature.selections && this.vLab.nature.selections.boundsSprite == true)|| this.boundsOnly) {
            this.boundsSprite.material = this.vLabScene.vLab.prefabs['VLabSceneInteractablePrefabs']['selectionSpriteMaterial'];
            this.boundsSprite.visible = true;
            this.boundsSprite.matrixAutoUpdate = true;
        }
    }
    /**
     * Hides simple outline based on this.vLabSceneObject.geometry
     */
    clearOutline() {
        this.outlineHelperMesh.visible = false;
        this.outlineHelperMesh.matrixAutoUpdate = false;

        this.boundsSprite.visible = false;
        this.boundsSprite.matrixAutoUpdate = false;
    }
    /**
     * Adds simple outline based on this.vLabSceneObject.geometry as THREE.Mesh to this.vLabSceneObject
     */
    addOutlineHelperMesh() {
        if (this.vLabSceneObject && this.outlineHelperMesh == undefined) {
            this.outlineHelperMesh = new THREE.Mesh(this.vLabSceneObject.geometry, this.vLabScene.vLab.prefabs['VLabSceneInteractablePrefabs']['simpleOutlineMaterial']);
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
     * Adds pre-selection / selection bound Sprite
     */
    addBoundsSprite() {
        if (this.vLabSceneObject && this.boundsSprite == undefined) {
            this.boundsSprite = new THREE.Sprite(this.vLab.prefabs['VLabSceneInteractablePrefabs']['preSelectionSpriteMaterial']);
            this.boundsSprite.name = this.vLabSceneObject.name + '_BOUNDS';
            this.boundsSprite.scale.multiplyScalar(2 * this.vLabSceneObject.geometry.boundingSphere.radius);
            this.boundsSprite.visible = false;
            this.boundsSprite.matrixAutoUpdate = false;
            this.centerObject3D.add(this.boundsSprite);
        }
    }
    /**
     * 
     * 
     *  __  __                  
     * |  \/  |                 
     * | \  / | ___ _ __  _   _ 
     * | |\/| |/ _ \ '_ \| | | |
     * | |  | |  __/ | | | |_| |
     * |_|  |_|\___|_| |_|\__,_|
                          
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
            let menuCoords = THREEUtils.screenProjected2DCoordsOfObject(this.vLab, this.centerObject3D);
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
                console.log('Menu Item [' + menuItem.label + '] has no context defined and will be removed from menu');
                this.removeMenuItem(menuItem);
            }
        }
        this.hideTooltip();
        this.removeRespondentsHelpers();
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
     * If menuItemObj is type of string - then Menu item will be deleted by label
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
     *  _______          _ _   _       
     * |__   __|        | | | (_)      
     *    | | ___   ___ | | |_ _ _ __  
     *    | |/ _ \ / _ \| | __| | '_ \ 
     *    | | (_) | (_) | | |_| | |_) |
     *    |_|\___/ \___/|_|\__|_| .__/ 
     *                          | |    
     *                          |_|    
     * 
     * 
     * 
     */
    /**
     * Shows tooltip
     * Do not show tooltips when this.vLabScene.currentControls.active == false
     */
    showTooltip(shownRespondent) {
        let shiftX = 0;
        let shiftY = 0;

        if (!this.tooltipContainer 
        && (this.tooltip != '' || (shownRespondent !== undefined && shownRespondent.preselectionTooltip != ''))
        && !this.selected
        || (this.selected && (shownRespondent !== undefined && shownRespondent.preselectionTooltip != ''))) {
            this.tooltipContainer = document.createElement('div');
            this.tooltipContainer.id = this.vLabSceneObject.name + '_TOOLTIP';
            if (shownRespondent == undefined) {
                this.tooltipContainer.className = 'interactableTooltip';
            } else {
                this.tooltipContainer.className = 'respondentTooltip';
                shiftX += 2;
                shiftY += 2;
            }
            if (shownRespondent !== undefined && shownRespondent.respondentCSSCLass !== undefined) {
                this.tooltipContainer.classList.add(shownRespondent.respondentCSSCLass);
            }

            this.tooltipContainer.innerHTML = (shownRespondent !== undefined && shownRespondent.preselectionTooltip != '') ? shownRespondent.preselectionTooltip : this.tooltip;
            let existingTooltipContainer = document.getElementById(this.tooltipContainer.id);
            if (existingTooltipContainer) this.vLab.DOMManager.WebGLContainer.removeChild(existingTooltipContainer);
            this.vLab.DOMManager.WebGLContainer.appendChild(this.tooltipContainer);
        }

        if (this.tooltipContainer) {
            let tooltipCoords = THREEUtils.screenProjected2DCoordsOfObject(this.vLab, (shownRespondent !== undefined && shownRespondent.respondentIntersectionPointMesh != undefined) ? shownRespondent.respondentIntersectionPointMesh : this.centerObject3D);
            tooltipCoords.x += shiftX;
            tooltipCoords.y += shiftY;
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
    /**
     * Hides tooltip
     */
    hideTooltip() {
        if (this.tooltipContainer) {
            this.vLab.DOMManager.WebGLContainer.removeChild(this.tooltipContainer);
            this.tooltipContainer = undefined;
        }
    }
    /**
     * 
     * 
     * 
     *  _____                                 _            _       
     * |  __ \                               | |          | |      
     * | |__) |___  ___ _ __   ___  _ __   __| | ___ _ __ | |_ ___ 
     * |  _  // _ \/ __| '_ \ / _ \| '_ \ / _` |/ _ \ '_ \| __/ __|
     * | | \ \  __/\__ \ |_) | (_) | | | | (_| |  __/ | | | |_\__ \
     * |_|  \_\___||___/ .__/ \___/|_| |_|\__,_|\___|_| |_|\__|___/
     *                 | |                                         
     *                 |_|                                         
     * 
     * 
     */
    /**
     * Shows respondents (if responder function is present), e.g. VLabSceneInteractables ("respondent" is an object in a current scene, with which one `this` can interact)
     */
    showRespondents() {
        let raycaster = new THREE.Raycaster();
        if (this.shownRespondents.length == 0) {
            this.respondents.forEach((respondent) => {
                if (respondent.callerInteractable == this && respondent.interactable.vLabScene == this.vLab.SceneDispatcher.currentVLabScene) {
                    if (respondent.interactable) {
                        if (respondent.interactable.vLabSceneObject) {
                            let thisOrigin = this.vLabSceneObject.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0));
                            let respondentOrigin = respondent.interactable.vLabSceneObject.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0));
                            let respondentDirection = respondentOrigin.clone().sub(thisOrigin.clone()).normalize();

                            raycaster.set(thisOrigin, respondentDirection);
                            let respondentIntersections = raycaster.intersectObject(respondent.interactable.vLabSceneObject);

                            if (respondentIntersections.length > 0) {
                                if (this.preselected) {
                                    let respondentCSSCLass = 'respondentReferenceTooltip';
                                    let interactableIntersectionPointMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['interactableIntersectionReferencePointMaterial'];
                                    let respondentLineMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentReferenceLineMaterial'];
                                    let respondentIntersectionPointMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentIntersectionReferencePointMaterial'];

                                    if (respondent.initObj.action !== undefined) {
                                        respondentCSSCLass = 'respondentActionTooltip';
                                        interactableIntersectionPointMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['interactableIntersectionActionPointMaterial'];
                                        respondentLineMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentActionLineMaterial'];
                                        respondentIntersectionPointMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentIntersectionActionPointMaterial'];
                                    }

                                    let respondentIntersectionPointMesh = new THREE.Mesh(this.vLab.prefabs['VLabSceneInteractablePrefabs']['linePointGeometry'], respondentIntersectionPointMaterial);
                                    respondentIntersectionPointMesh.position.copy(respondentIntersections[0].point);
                                    respondentIntersectionPointMesh.scale.multiplyScalar(0.5 * respondentIntersections[0].point.distanceTo(this.vLabScene.currentCamera.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0))));
                                    this.vLabScene.add(respondentIntersectionPointMesh);

                                    /**
                                     * Show this interactable intersection point of line, connecting with this respondent
                                     */
                                    raycaster.set(respondentIntersectionPointMesh.position.clone(), respondentDirection.clone().negate());
                                    let thisIntersections = raycaster.intersectObject(this.vLabSceneObject);
                                    let thisIntersectionPoint = thisOrigin;
                                    if (thisIntersections.length > 0) {
                                        thisIntersectionPoint = thisIntersections[0].point;
                                    }

                                    let thisPointMeshPosition = new THREE.Vector3().addVectors(thisIntersectionPoint, (!this.taken) ? respondentDirection.clone().multiplyScalar(0.02) : new THREE.Vector3());
                                    let thisPointMesh = new THREE.Mesh(this.vLab.prefabs['VLabSceneInteractablePrefabs']['linePointGeometry'], interactableIntersectionPointMaterial);
                                    thisPointMesh.position.copy(thisPointMeshPosition);
                                    let scale = 0.1;
                                    if (!this.taken) {
                                        scale = 2.0 / (1 / thisIntersectionPoint.distanceTo(this.vLabScene.currentCamera.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0))));
                                        if (scale > 3.0) scale = 3.0;
                                    }
                                    thisPointMesh.scale.multiplyScalar(scale);
                                    this.vLabScene.add(thisPointMesh);

                                    let lineGeometry = new THREE.Geometry();
                                    lineGeometry.vertices.push(
                                        thisPointMeshPosition,
                                        respondentIntersections[0].point
                                    );

                                    let line = new THREE.Line(lineGeometry, respondentLineMaterial);
                                    this.vLabScene.add(line);

                                    this.respondentPreselectionHelpers.push(lineGeometry);
                                    this.respondentPreselectionHelpers.push(respondentIntersectionPointMesh);
                                    this.respondentPreselectionHelpers.push(thisPointMesh);
                                    this.respondentPreselectionHelpers.push(line);

                                    // var lineSegments = new THREE.LineSegments(lineGeometry, this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentReferenceDashedLineMaterial']);
                                    // lineSegments.computeLineDistances();
                                    // this.vLabScene.add(lineSegments);
                                    // this.respondentPreselectionHelpers.push(lineSegments);

                                    this.shownRespondents.push({
                                        respondent: respondent,
                                        respondentIntersectionPointMesh: respondentIntersectionPointMesh,
                                        respondentCSSCLass: respondentCSSCLass,
                                        interactable: respondent.interactable,
                                        preselectionTooltip: respondent.preselectionTooltip
                                    });

                                    respondent.preselectionAction.call(respondent);
                                    this.showRespondents();

                                }
                            }
                        }
                    }
                }
            });
        } else {
            this.shownRespondents.forEach((shownRespondent) => {
                if (shownRespondent.preselectionTooltip != '') {
                    if (THREEUtils.frustumContainsPoint(this.vLab, shownRespondent.respondentIntersectionPointMesh.position)) {
                        shownRespondent.interactable.showTooltip(shownRespondent);
                    }
                }
            });
        }
    }
    /**
     * Removes all reposndents helper assets from this.vLabScene
     */
    removeRespondentsHelpers() {
        if (this.respondentPreselectionHelpers.length > 0) {
            this.respondents.forEach((respondent) => {
                respondent.interactable.hideTooltip();
                respondent.dePreselectionAction.call(respondent);
            });
            this.respondentPreselectionHelpers.forEach((respondentPreselectionHelper) => {
                if(respondentPreselectionHelper.type == 'Geometry') {
                    respondentPreselectionHelper.dispose();
                } else {
                    this.vLabScene.remove(respondentPreselectionHelper);
                }
            });
            this.respondentPreselectionHelpers = [];
        }
        this.shownRespondents = [];
    }

}
export default VLabSceneInteractable;