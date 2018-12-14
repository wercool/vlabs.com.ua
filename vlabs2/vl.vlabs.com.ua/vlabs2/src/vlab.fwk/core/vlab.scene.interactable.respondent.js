class VLabSceneInteractableRespondent {
    /**
     * VLabSceneInteractable constructor.
     * 
     * @constructor
     * @param {Object}                    initObj                           - VLabSceneInteractableRespondent initialization object
     * @param {VLabSceneInteractable}     initObj.interactable              - VLabSceneInteractableRespondent is indeed VLabSceneInteractable reference
     * @param {VLabSceneInteractable}     initObj.callerInteractable        - VLabSceneInteractable that has this VLabSceneInteractableRespondent as a respondent
     * @param {HTML}                      [initObj.preselectionTooltip]     - Tooltip that is shown when initObj.callerInteractable is pre-selected 
     * @param {Object}                    [initObj.action]                  - Action object that defines action for initObj.callerInteractable being applied to initObj.interactable
     * @param {Function}                  [initObj.action.function]         - Function reference to be executed when initObj.callerInteractable being applied to initObj.interactable
     * @param {Object}                    [initObj.action.args]             - Action function arguments
     * @param {Object}                    [initObj.action.context]          - Context of action function; initObj.action.function.call(initObj.action.context, initObj.action.args)
     * @param {Object}                    [initObj.preselectionAction]                  - Action object that defines action for initObj.callerInteractable being preselected related to this VLabSceneInteractableRespondent
     * @param {Function}                  [initObj.preselectionAction.function]         - Preseleciton action function
     * @param {Object}                    [initObj.preselectionAction.args]             - Preseleciton action function args
     * @param {Object}                    [initObj.preselectionAction.context]          - Context of preseleciton action function
     * 
     * @param {Object}                    [initObj.dePreselectionAction]                  - Action object that defines action for initObj.callerInteractable being de-preselected related to this VLabSceneInteractableRespondent
     * @param {Function}                  [initObj.dePreselectionAction.function]         - De-preseleciton action function
     * @param {Object}                    [initObj.dePreselectionAction.args]             - De-preseleciton action function args
     * @param {Object}                    [initObj.dePreselectionAction.context]          - Context of De-preseleciton action function
     */
    constructor(initObj = {}) {
        if (!initObj.interactable) {
            console.log('VLabSceneInteractable is not defined for VLabSceneInteractableRespondent');
            return null;
        }
        if (!initObj.callerInteractable) {
            console.log('Caller VLabSceneInteractable is not defined for VLabSceneInteractableRespondent');
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
        this.preselectionTooltip = this.initObj.preselectionTooltip ? this.initObj.preselectionTooltip : '';
    }
    /**
     * Default action
     * @abstract
     */
    action() {
        if (this.initObj.action) {
            this.initObj.action.function.call(this.initObj.action.context, this.initObj.action.args);
        }
    }
    /**
     * Preseleciton action
     * @abstract
     */
    preselectionAction() {
        if (this.initObj.preselectionAction) {
            this.initObj.preselectionAction.function.call(this.initObj.preselectionAction.context, this.initObj.preselectionAction.args);
        }
    }
    /**
     * De-preseleciton action
     * @abstract
     */
    dePreselectionAction() {
        if (this.initObj.dePreselectionAction) {
            this.initObj.dePreselectionAction.function.call(this.initObj.dePreselectionAction.context, this.initObj.dePreselectionAction.args);
        }
    }
}
export default VLabSceneInteractableRespondent;