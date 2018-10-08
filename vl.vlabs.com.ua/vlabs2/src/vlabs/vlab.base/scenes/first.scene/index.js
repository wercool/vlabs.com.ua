import VLabScene from '../../../../vlab.fwk/core/vlab.scene';
import VLabSceneInteractableRespondent from '../../../../vlab.fwk/core/vlab.scene.interactable.respondent';

class FirstScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    onLoaded() {
        /**
         * Adds responder method to this.interactables[`interactable respondent vLabSceneObject.name`].responders to be responsive for desired vLabSceneObject.name;
         * 
         */
        this.interactables['Sphere2'].addRespondent(
            new VLabSceneInteractableRespondent({
                interactable: this.interactables['Suzanne1_1'],
                callerInteractable: this.interactables['Sphere2'],
                preTooltip: 'Reacts on Sphere2',
                action: {
                    function: this.Sphere2_to_Suzanne1_1_ACTION,
                    args: {},
                    context: this
                }
            })
        );
        this.interactables['Sphere2'].addRespondent(
            new VLabSceneInteractableRespondent({
                interactable: this.interactables['Suzanne1'],
                callerInteractable: this.interactables['Sphere2'],
                preTooltip: 'Reacts on Sphere2',
                action: {
                    function: this.Sphere2_to_Suzanne1,
                    args: {},
                    context: this
                }
            })
        );
        this.interactables['Sphere2'].addRespondent(
            new VLabSceneInteractableRespondent({
                interactable: this.interactables['Suzanne'],
                callerInteractable: this.interactables['Sphere2'],
                preTooltip: 'Referenced with Sphere2'
            })
        );
        this.interactables['Suzanne1'].addRespondent(
            new VLabSceneInteractableRespondent({
                interactable: this.interactables['Suzanne'],
                callerInteractable: this.interactables['Suzanne1'],
                preTooltip: 'Reacts on Suzanne1'
            })
        );
    }
    onActivated() {
        // console.log(this.name + ' activated');
        // console.log(this);

        // this.interactables['Sphere2'].onDefaultEventHandler = this.Sphere2EventHandler.bind(this);

        // this.subscribe({
        //     events: {
        //         WebGLRendererCanvas: {
        //             wheel:  this.onDefaultEventListener,
        //         }
        //     }
        // });
        console.log(this.interactables);
    }
    Sphere2_to_Suzanne1_1_ACTION() {
        console.log('Sphere2_to_Suzanne1_1_ACTION', this);
    }
    Sphere2_to_Suzanne1_ACTION() {
        console.log('Sphere2_to_Suzanne1_ACTION', this);
    }    
    // Sphere2EventHandler(event) {
    //     console.log(this);
    // }
    Sphere2TestAction(actionParams) {
        console.log('Sphere2TestAction');
        console.log('actionParams' , actionParams);
        console.log('this', this);
        actionParams.interactable.updateMenuWithMenuItem({
            label: 'Sphere2TestAction',
            action: this.Sphere2AltTestAction,
            context: this
        });
    }
    Sphere2AltTestAction(actionParams) {
        console.log('Sphere2AltTestAction');
        console.log('actionParams' , actionParams);
        console.log('this', this);
        actionParams.interactable.updateMenuWithMenuItem({
            label: 'Sphere2TestAction',
            action: this.Sphere2TestAction,
            context: this,
            args: { test: 'test...'}
        });
    }
}

export default FirstScene;