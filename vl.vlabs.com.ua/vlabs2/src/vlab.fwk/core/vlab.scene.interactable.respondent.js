class VLabSceneInteractableRespondent {
    /**
     * VLabSceneInteractable constructor.
     * 
     * @constructor
     */
    constructor(initObj = {}) {
        if (!initObj.interactable) {
            console.warn('VLabSceneInteractable is not defined for VLabSceneInteractableRespondent');
            return null;
        }
        if (!initObj.callerInteractable) {
            console.warn('Caller VLabSceneInteractable is not defined for VLabSceneInteractableRespondent');
            return null;
        }
        this.initObj = initObj;
        /**
         * Respondent VLabSceneInteractable
         */
        this.interactable = this.initObj.interactable;
        /**
         * Caller VLabSceneInteractable which initiates this.action
         */
        this.callerInteractable = this.initObj.callerInteractable;
        /**
         * Tooltip that will be shown in projected to screen this.interactable.vLabSceneObject 3D coords when VLabSceneInteractable which calls this.action() is pre-selected
         */
        this.preTooltip = this.initObj.preTooltip ? this.initObj.preTooltip : '';
    }
    /**
     * Default action
     * @abstract
     */
    action() {
        if (this.initObj.action) {
            this.initObj.action.function.call(this.initObj.action.context, this.initObj.action.params);
        }
    }
}
export default VLabSceneInteractableRespondent;