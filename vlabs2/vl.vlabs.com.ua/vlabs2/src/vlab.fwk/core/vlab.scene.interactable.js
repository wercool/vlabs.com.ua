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
     * @param {boolean}             [initObj.interactable.visible]              - Interactable vLabSceneObject is visible / not visible
     * @param {boolean}             [initObj.interactable.showRespondents]      - Show Interactable respondents
     *
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
     * @param {boolean}             [initObj.interactable.noPutBack]            - Menu item Put Back ommit if true
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
         * Siblings
         */
        this.siblings = [];

        /**
         * Native function
         */
        /**
         * This native action function
         */
        this.actionFunction = undefined;
        /**
         * This native action function acts as manipulator ("pointer out" event is ignored when acting with this Interactable)
         */
        this.actionFunctionManipulator = false;
        /**
         * true, if this native action function acts as manipulator activated
         */
        this.actionFunctionManipulatorActivated = false;
        /**
         * This native action funciton args
         */
        this.actionFunctionArgs = {};
        /**
         * This native action funciton context
         */
        this.actionFunctionContext = undefined;
        /**
         * This native action function activated
         */
        this.actionFunctionActivated  = false;
        /**
         * This native action invert function
         */
        this.actionInvFunction = undefined;


        /**
         * Selection function
         */
        /**
         * This selection action function
         */
        this.selectionActionFunction = undefined;
        /**
        /**
         * This selection action funciton args
         */
        this.selectionActionFunctionArgs = {};
        /**
         * This selection action funciton context
         */
        this.selectionActionFunctionContext = undefined;


        /**
         * Preselection function
         */
        /**
         * This preSelection action function
         */
        this.preSelectionActionFunction = undefined;
        /**
         * This preSelection action function
         */
        this.dePreSelectionActionFunction = undefined;
        /**
         * This preSelection action funciton args
         */
        this.preSelectionActionFunctionArgs = {};
        /**
         * This preSelection action funciton context
         */
        this.preSelectionActionFunctionContext = undefined;

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
         * Raycaster intersection object of object passed to {@link VLabSceneInteractable#intersectionHandler} from {@link VLabScene#processInteractables}
         * @public
         * @default null
         */
        this.intersectionRaycaster = null;
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
         * If true then this.dePreselect will no de-preselect this
         * @public
         * @default false
         */
        this.keepPreselection = false;
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
         * Whether to show respondents
         */
        this.showRespondentsFlag = true;
        /**
         * Lines drawn from `this` to it's respondents; THREE.Line instances
         * respondentIntersectionPoint(s)
         */
        this.respondentPreselectionHelpers = [];
        /**
         * Shown respondents
         */
        this.shownRespondents = [];
        /**
         * Last click / touch intersection
         */
        this.lastTouchRaycasterIntersection = undefined;
        /**
         * Whether or not could be taken from Inventory
         */
        this.canBeTakenFromInventory = true;
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
        /**
         * 
         * 
         *  _____  ________      ____      ___           _     _____                     _____       _                      _        _     _      
         * |  __ \|  ____\ \    / /\ \    / / |         | |   / ____|                   |_   _|     | |                    | |      | |   | |     
         * | |  | | |__   \ \  / /  \ \  / /| |     __ _| |__| (___   ___ ___ _ __   ___  | |  _ __ | |_ ___ _ __ __ _  ___| |_ __ _| |__ | | ___ 
         * | |  | |  __|   \ \/ /    \ \/ / | |    / _` | '_ \\___ \ / __/ _ \ '_ \ / _ \ | | | '_ \| __/ _ \ '__/ _` |/ __| __/ _` | '_ \| |/ _ \
         * | |__| | |____   \  /      \  /  | |___| (_| | |_) |___) | (_|  __/ | | |  __/_| |_| | | | ||  __/ | | (_| | (__| || (_| | |_) | |  __/
         * |_____/|______|   \/        \/   |______\__,_|_.__/_____/ \___\___|_| |_|\___|_____|_| |_|\__\___|_|  \__,_|\___|\__\__,_|_.__/|_|\___|
         * 
         * 
         */
        if (!this['DEV']) {
            this['DEV'] = new DEVVLabSceneInteractable(this);
        }
        /*</dev>*/

        if (initObj) this.initObj = initObj;
        return new Promise((resolve, reject) => {
            this.vLab.DOMManager.addStyle({
                id: (this.initObj.interactable.style && this.initObj.interactable.style.id !== undefined) ? this.initObj.interactable.style.id : 'interactableCSS',
                href: (this.initObj.interactable.style && this.initObj.interactable.style.href !== undefined) ? this.initObj.interactable.style.href : '/vlab.assets/css/interactable.css'
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
                        this.actionFunctionManipulator = this.initObj.interactable.action.manipulator;
                        this.actionFunctionArgs = this.initObj.interactable.action.args;
                        this.actionFunctionContext = this.initObj.interactable.action.context;
                        /**
                         * By default native actionFunction is activated
                         */
                        this.actionFunctionActivated = true;
                        /**
                         * If defined then set defined value for this.actionFunctionActivated
                         */
                        if (this.initObj.interactable.action.activated !== undefined) {
                            this.actionFunctionActivated = this.initObj.interactable.action.activated;
                        }
                        this.actionInvFunction = this.initObj.interactable.action.invfunction;
                        /**
                         * If there is an native function, this VLabSceneInteractable becomes non-selectable
                         */
                        this.selectable = false;
                    }
                }

                if (this.initObj.interactable.selectionAction !== undefined) {
                    if (this.initObj.interactable.selectionAction.function !== undefined) {
                        this.selectionActionFunctionContext = this.initObj.interactable.selectionAction.context;
                        this.selectionActionFunctionArgs = this.initObj.interactable.selectionAction.args;
                        this.selectionActionFunction = this.initObj.interactable.selectionAction.function;
                    }
                }
                if (this.initObj.interactable.preselectionAction !== undefined) {
                    if (this.initObj.interactable.preselectionAction.function !== undefined) {
                        this.preSelectionActionFunctionContext = this.initObj.interactable.preselectionAction.context;
                        this.preSelectionActionFunctionArgs = this.initObj.interactable.preselectionAction.args;
                        this.preSelectionActionFunction = this.initObj.interactable.preselectionAction.function;
                        this.dePreSelectionActionFunction = this.initObj.interactable.preselectionAction.invfunction;
                    }
                }
                if (this.initObj.interactable.tooltip !== undefined) {
                    this.tooltip = this.initObj.interactable.tooltip;
                }
                if (this.initObj.interactable.menu !== undefined) {
                    this.menu = this.initObj.interactable.menu;
                }
                if (this.initObj.interactable.visible !== undefined) {
                    this.vLabSceneObject.visible = this.initObj.interactable.visible;
                }
                if (this.initObj.interactable.showRespondents !== undefined) {
                    this.showRespondentsFlag = this.initObj.interactable.showRespondents;
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
        } else {
            console.error('VLabSceneInteractable->setVLabSceneObject: No Scene object find for the given interactable initObj', this.initObj.interactable);
        }
    }
    /**
     * Native action which calls this.actionFunction if defined
     * Exectued if this.intersection and this.preselected
     * @returns {boolean} returns true if this.actionFunction has been actually called
     */
    action(event) {
        if (this.intersection) {
            this.lastTouchRaycasterIntersection = this.intersectionRaycaster;
        }

        if (this.intersection && this.preselected || this.actionFunctionManipulatorActivated) {
            if (this.actionFunction && this.actionFunctionActivated) {
                /**
                 * Native action function
                 */
                if (typeof this.actionFunction == 'string') {
                    this.actionFunction = eval(this.actionFunction);
                }
                let extendedActionFunctionArgs = ObjectUtils.merge(this.actionFunctionArgs, {
                    event: event,
                    intersection: this.intersection
                });
                /**
                 * Native action function context
                 */
                if (this.actionFunctionContext) {
                    if (typeof this.actionFunctionContext == 'string') {
                        this.actionFunctionContext = eval(this.actionFunctionContext);
                    }
                    this.actionFunction.call(this.actionFunctionContext, extendedActionFunctionArgs);
                } else {
                    this.actionFunction.call(extendedActionFunctionArgs);
                }

                if (this.actionFunctionManipulator == true) {
                    this.actionFunctionManipulatorActivated = true;
                }

                this.hideTooltip();
                this.removeRespondentsHelpers();
                return true;
            }
        }
        return false;
    }
    /**
     * 
     * Native invert action which calls this.actionInvFunction if defined
     * Exectued this.actionFunctionActivated
     */
    actionInv(event) {
        if (this.actionInvFunction && this.actionFunctionActivated) {
            this.actionFunctionManipulatorActivated = false;
            /**
             * Native action invert function
             */
            if (typeof this.actionInvFunction == 'string') {
                this.actionInvFunction = eval(this.actionInvFunction);
            }
            let extendedActionFunctionArgs = ObjectUtils.merge(this.actionFunctionArgs, {
                event: event,
                intersection: this.intersection
            });
            /**
             * Native action function context
             */
            if (this.actionFunctionContext) {
                if (typeof this.actionFunctionContext == 'string') {
                    this.actionFunctionContext = eval(this.actionFunctionContext);
                }
                this.actionInvFunction.call(this.actionFunctionContext, extendedActionFunctionArgs);
            } else {
                this.actionInvFunction.call(extendedActionFunctionArgs);
            }
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
     * Sets VLabSceneInteractable.vLabSceneObject.position
     * @param {THREE.Vector3} position
     */
    setPosition(position) {
        this.vLabSceneObject.position.copy(position);
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
     * Calls {@link VLabSceneDispatcher#takeInteractableToInventory}
     * @abstract
     */
    takeToInventory() {
        return new Promise((resolve) => {
            this.vLab.SceneDispatcher.takeInteractableToInventory(this)
            .then((inventoryItem) => resolve(inventoryItem));
        });
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
    select(selectionObj, forced) {
        let inventoryMenu = false;
        this.menu.forEach((menuItem) => {
            if (menuItem.inventory == true) {
                inventoryMenu = true;
            }
        });
        if (this.vLabScene.constructor.name !== 'VLabInventory' || (this.vLabScene.constructor.name == 'VLabInventory' && inventoryMenu) || this.taken) {
            /**
             * Selection
             */
            if (selectionObj != undefined) {
                this.selection =  ObjectUtils.merge(this.selection, selectionObj);


                if (this.selection.hold !== undefined) {
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
            }
            /**
             * Intersection
             */
            if (this.intersection || forced == true) {
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
                } else if (this.selectable && this.selected || inventoryMenu) {
                    this.showMenu();
                }

                /**
                 * Selection action
                 */
                if (!(selectionObj && selectionObj.selectionAction == false)) {
                    if (this.selectionActionFunction) {
                        if (typeof this.selectionActionFunction == 'string') {
                            this.selectionActionFunction = eval(this.selectionActionFunction);
                        }
                        if (this.selectionActionFunctionContext) {
                            if (typeof this.selectionActionFunctionContext == 'string') {
                                this.selectionActionFunctionContext = eval(this.selectionActionFunctionContext);
                            }
                            this.selectionActionFunction.call(this.selectionActionFunctionContext, this.selectionActionFunctionArgs);
                        } else {
                            this.selectionActionFunction.call(this.selectionActionFunctionArgs);
                        }
                    }
                }

            } else {
                /**
                 * No intersection
                 */
                this.deSelect();
            }
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
    preselect(forced, preselectionObj) {
        if (this.intersection || forced == true) {
            // console.log(this.vLabSceneObject.name, forced, '[', this.preselectable, !this.preselected, !this.selected, ']');
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
            /**
             * Preselection action
             */
            if (!(preselectionObj && preselectionObj.preselectionAction == false)) {
                if (this.preSelectionActionFunction) {
                    if (typeof this.preSelectionActionFunction == 'string') {
                        this.preSelectionActionFunction = eval(this.preSelectionActionFunction);
                    }
                    let extendedActionFunctionArgs = ObjectUtils.merge(this.preSelectionActionFunctionArgs, {
                        callerInteractable: this,
                        intersection: this.intersection
                    });
                    if (this.preSelectionActionFunctionContext) {
                        if (typeof this.preSelectionActionFunctionContext == 'string') {
                            this.preSelectionActionFunctionContext = eval(this.preSelectionActionFunctionContext);
                        }
                        this.preSelectionActionFunction.call(this.preSelectionActionFunctionContext, extendedActionFunctionArgs);
                    } else {
                        this.preSelectionActionFunction.call(extendedActionFunctionArgs);
                    }
                }
            }
            if (!(preselectionObj && preselectionObj.tooltip == false)) {
                this.showTooltip();
            }
            // if (this.vLabScene.constructor.name !== 'VLabInventory') {
            //     this.showRespondents();
            // }
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
        // console.log(this.vLabSceneObject.name + '.dePreselect()', '[', this.preselected, !this.keepPreselection, ']');
        if (this.preselected && !this.keepPreselection) {
            let indexOfThisPreselected = this.vLabScene.preSelectedInteractables.indexOf(this);
            this.vLabScene.preSelectedInteractables.splice(indexOfThisPreselected, 1);
            this.vLabScene.manager.processInteractablesSelections();
            this.preselected = false;
            this.hideTooltip();
            this.hideMenu();

            // if (this.vLabScene.constructor.name !== 'VLabInventory') {
            //     this.removeRespondentsHelpers();
            // }
            this.removeRespondentsHelpers();

            /**
             * de-preselection action
             */
            let extendedActionFunctionArgs = ObjectUtils.merge(this.preSelectionActionFunctionArgs, {
                callerInteractable: this
            });

            if (this.dePreSelectionActionFunction) {
                if (typeof this.dePreSelectionActionFunction == 'string') {
                    this.dePreSelectionActionFunction = eval(this.dePreSelectionActionFunction);
                }
                if (this.preSelectionActionFunctionContext) {
                    if (typeof this.preSelectionActionFunctionContext == 'string') {
                        this.preSelectionActionFunctionContext = eval(this.preSelectionActionFunctionContext);
                    }
                    this.dePreSelectionActionFunction.call(this.preSelectionActionFunctionContext, extendedActionFunctionArgs);
                } else {
                    this.dePreSelectionActionFunction.call(extendedActionFunctionArgs);
                }
            }
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
         * Left mouse button
         */
        if(event.button == 0) {
            if (!this.action(event)) {
                this.select();
                this.hideTooltip();
                this.removeRespondentsHelpers();
            }
        /**
         * Middle mouse button
         */
        } else if (event.button == 1){
            this.deSelect();
        /**
         * Right mouse button
         */
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
        this.actionInv(event);
    }
    /**
     * Default mousemove event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousemoveHandler(event) {
        /**
         * No mounse button pressed
         */
        if(event.buttons == 0) {
            this.preselect();
        } else {
            /**
             * Left mouse button pressed
             */
            if (event.button == 0) {
                if (this.actionFunction && this.intersection || (this.actionFunction && this.actionFunctionManipulatorActivated == true)) {
                    this.action(event);
                }
            }
        }
    }
    /**
     * Default touchstart event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchstartHandler(event) {
        event.stopPropagation();
        if (!this.action(event)) {
            /**
             * No native action
             */
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
        } else {
        }
    }
    /**
     * Default touchend event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchendHandler(event) {
        event.stopPropagation();
        if (this.intersection) {
            this.preselect();
        }
        this.actionInv(event);
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
            if (!this.intersection) {
                this.dePreselect();
                this.hideMenu();
            }
        }

        if (this !== this.vLab.SceneDispatcher.takenInteractable && this.preselected) {
            /**
             * One finger touch move
             */
            if (event.touches.length == 1) {
                if (this.actionFunction && this.intersection || (this.actionFunction && this.actionFunctionManipulatorActivated == true)) {
                    this.action(event);
                }
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
        if (this.outlineHelperMesh) {
            this.outlineHelperMesh.visible = false;
            this.outlineHelperMesh.matrixAutoUpdate = false;
        }

        if (this.boundsSprite) {
            this.boundsSprite.visible = false;
            this.boundsSprite.matrixAutoUpdate = false;
        }
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
            this.vLabScene.currentControls.suppress();

            this.menuContainer = document.createElement('div');
            this.menuContainer.id = this.vLabSceneObject.name + '_MENU';
            this.menuContainer.className = 'interactableMenu';

            this.menu.forEach((menuItem) => {
                /**
                 * Check special conditions on particular Menu Items by menuItem.label
                 */
                let ommitMenuItem = false;
                switch (menuItem.label) {
                    case 'Take to Inventory':
                        if (this.vLab.Inventory == undefined) menuItem.enabled = false;
                    break;
                    /**
                     * Ommit 'Put back' if distanceTo(new THREE.Vector3()) > 0.001
                     * Ommit 'Put back' if this.initObj.interactable.noPutBack == true
                     */
                    case 'Put back':
                        if (this.initObj.interactable.noPutBack == true ||
                            menuItem.args.position.distanceTo(new THREE.Vector3()) <= 0.001) {
                            ommitMenuItem = true;
                        }
                    break;
                    /**
                     * Do not add if this.nature.noPutBack
                     */
                }

                if (!ommitMenuItem) {
                    let menuItemDIV = document.createElement('div');
                    menuItemDIV.className = 'interactableMenuItem';
                    menuItemDIV.innerHTML = '<div class="interactableMenuIcon">' + (menuItem.icon ? menuItem.icon : '<i class=\"material-icons\">code</i>') + '</div>' + menuItem.label;
    
                    if (menuItem.enabled !== undefined && !menuItem.enabled) {
                        menuItemDIV.style.opacity = 0.1;
                    } else {
                        menuItemDIV.onmousedown = menuItemDIV.ontouchstart = this.callMenuAction.bind(this, menuItem);
                    }
                    this.menuContainer.appendChild(menuItemDIV);
                }
            });

            this.vLab.DOMManager.container.appendChild(this.menuContainer);
            let menuCoords = THREEUtils.screenProjected2DCoordsOfObject(this.vLab, this.centerObject3D);
            let xPosDelta = this.vLab.DOMManager.container.clientWidth - (menuCoords.x + this.menuContainer.clientWidth);
            let yPosDelta = this.vLab.DOMManager.container.clientHeight - (menuCoords.y + this.menuContainer.clientHeight);
            let xPos = menuCoords.x + (xPosDelta < 0 ? xPosDelta : 0);
            let yPos = menuCoords.y + (yPosDelta < 0 ? yPosDelta : 0);
            this.menuContainer.style.left = (xPos > 0 ? xPos : 0).toFixed(0) + 'px';
            this.menuContainer.style.top = (yPos > 0 ? yPos : 0).toFixed(0) + 'px';

            this.vLabScene.manager.clock.getDelta();
        }
    }
    /**
     * Hide menu
     */
    hideMenu() {
        if (this.menuContainer) {
            /**
             * Press Event dumper
             */
            let delta = this.vLabScene.manager.clock.getDelta();
            if (delta > 0.1) {
                this.vLab.DOMManager.container.removeChild(this.menuContainer);
                this.menuContainer = null;
            }
        }
        /*<dev>*/
            this['DEV'].hideMenu();
        /*</dev>*/
    }
    /**
     * Calls menu item action; eval(event.target.menuItem.action) or call event.target.menuItem.action in event.target.menuItem.context
     */
    callMenuAction(menuItem, event) {
        event.preventDefault();
        event.stopPropagation();
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
        && !this.menuContainer
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
            if (existingTooltipContainer) this.vLab.DOMManager.container.removeChild(existingTooltipContainer);
            this.vLab.DOMManager.container.appendChild(this.tooltipContainer);
        }

        if (this.tooltipContainer) {
            let tooltipCoords = THREEUtils.screenProjected2DCoordsOfObject(this.vLab, (shownRespondent !== undefined && shownRespondent.respondentIntersectionPointMesh != undefined) ? shownRespondent.respondentIntersectionPointMesh : this.centerObject3D);
            tooltipCoords.x += shiftX;
            tooltipCoords.y += shiftY;
            let xPosDelta = this.vLab.DOMManager.container.clientWidth - (tooltipCoords.x + this.tooltipContainer.clientWidth);
            let yPosDelta = this.vLab.DOMManager.container.clientHeight - (tooltipCoords.y + this.tooltipContainer.clientHeight);
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
            this.vLab.DOMManager.container.removeChild(this.tooltipContainer);
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
        if (!this.showRespondentsFlag) return;

        let raycaster = new THREE.Raycaster();
        if (this.shownRespondents.length == 0) {
            this.respondents.forEach((respondent) => {
                if (respondent.callerInteractable == this && respondent.interactable.vLabScene == this.vLab.SceneDispatcher.currentVLabScene) {
                    if (respondent.interactable) {
                        if (respondent.interactable.vLabSceneObject) {

                            /**
                             * Respondent extras - particularQualities
                             */
                            let showRespondents = true;
                            /**
                             * showHelpersOnlyWhenTaken
                             */
                            if (respondent.interactable.initObj.interactable.respondentExtras
                            && respondent.interactable.initObj.interactable.respondentExtras.particularQualities
                            && respondent.interactable.initObj.interactable.respondentExtras.particularQualities[this.vLabSceneObject.name]) {
                                if (respondent.interactable.initObj.interactable.respondentExtras.particularQualities[this.vLabSceneObject.name]['showHelpersOnlyWhenTaken'] == true
                                && !this.taken) {
                                    showRespondents = false;
                                }
                            }

                            if (showRespondents) {

                                let thisOrigin = this.vLabSceneObject.localToWorld(new THREE.Vector3(0.0, 0.0, 0.0));

                                let respondentOffset = new THREE.Vector3(0.0, 0.0, 0.0);
                                /**
                                 * Respondent extras - origin offset
                                 */
                                if (respondent.interactable.initObj.interactable.respondentExtras && respondent.interactable.initObj.interactable.respondentExtras.offset) {
                                    respondentOffset = eval(respondent.interactable.initObj.interactable.respondentExtras.offset);
                                }
                                let respondentOrigin = respondent.interactable.vLabSceneObject.localToWorld(respondentOffset);
                                let respondentDirection = respondentOrigin.clone().sub(thisOrigin.clone()).normalize();

                                raycaster.set(thisOrigin, respondentDirection);
                                let respondentIntersections = raycaster.intersectObject(respondent.interactable.vLabSceneObject);

                                if (respondentIntersections.length > 0) {
                                    if (this.preselected) {
                                        let respondentCSSCLass = 'respondentReferenceTooltip';
                                        let interactableIntersectionPointMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['interactableIntersectionReferencePointMaterial'];
                                        let respondentLineMaterial = this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentReferenceDashedLineMaterial'];
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
                                        let scale = 0.01;
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
                                        if (respondentLineMaterial === this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentReferenceDashedLineMaterial']) {
                                            line = new THREE.LineSegments(lineGeometry, this.vLab.prefabs['VLabSceneInteractablePrefabs']['respondentReferenceDashedLineMaterial']);
                                            line.computeLineDistances();
                                        } else {
                                            line = new THREE.Line(lineGeometry, respondentLineMaterial);
                                        }

                                        this.vLabScene.add(line);

                                        this.respondentPreselectionHelpers.push(lineGeometry);
                                        this.respondentPreselectionHelpers.push(respondentIntersectionPointMesh);
                                        this.respondentPreselectionHelpers.push(thisPointMesh);
                                        this.respondentPreselectionHelpers.push(line);

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

                            } //if (showRespondents)

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
    /**
     *   _____ _ _     _ _ 
     *  / ____(_) |   | (_)
     * | (___  _| |__ | |_ _ __   __ _ ___ 
     *  \___ \| | '_ \| | | '_ \ / _` / __|
     *  ____) | | |_) | | | | | | (_| \__ \
     * |_____/|_|_.__/|_|_|_| |_|\__, |___/
    *                            __/ |
    *                           |___/
    */

    /**
    * Preselects sibling Interactables
    */
    preselectSibligns() {
        for (let siblingInteractableName in this.siblings) {
            let siblingInteractable = this.siblings[siblingInteractableName];
            siblingInteractable.keepPreselection = true;
            siblingInteractable.preselect(true);
        }
    }

    /**
    * dePreselect sibling Interactables
    */
   dePreselectSibligns() {
    for (let siblingInteractableName in this.siblings) {
        let siblingInteractable = this.siblings[siblingInteractableName];
        siblingInteractable.keepPreselection = false;
        siblingInteractable.dePreselect();
    }
}

}
export default VLabSceneInteractable;