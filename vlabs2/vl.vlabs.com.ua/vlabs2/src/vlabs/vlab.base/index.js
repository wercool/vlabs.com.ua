import VLab from '../../vlab.fwk/core/vlab';

/* This VLab Auxilaries */
import VLabInventory   from    '../../vlab.fwk/aux/inventory/index';
import VLabQuiz from '../../vlab.fwk/aux/quiz/index';

/* This VLab Scenes */
import ValterScene   from    './scenes/valter.scene';
import FirstScene   from    './scenes/first.scene';
import SecondScene  from    './scenes/second.scene';
import ThirdScene   from    './scenes/third.scene';
import RightArmScene   from    './scenes/right.arm.scene';

/**
 * VLab experimental/tutorial class.
 * @class
 * @extends VLab
 * @classdesc BaseVLab class serves as an application example of standard VLab features.
 */
class BaseVLab extends VLab {
    /**
     * BaseVLab constructor
     * @constructor
     * @param {Object} initObj                      - Initialization Object
     * @param {string} initObj.name                 - VLab name
     * @param {string} initObj.natureURL            - VLab nature JSON file URL
     */
    constructor(initObj = {}) {
        super(initObj);
        this.name = initObj.name;
        super.initialize().then((iniObj) => { this.bootstrap(iniObj); }, (error) => { console.error(error); });
    }
    /**
     * VLab bootstrap. Loads and initializes Vlab Scenes, VLab Items, other shared VLab elements
     * @async
     * @memberof BaseVLab
     */
    bootstrap(iniObj) {
// console.warn('NO CONTENT MODE');
// this.FFClientManager.sendMessage({message: 'test message from VLab'});
// return;
        /* VLab Inventory */
        this.Inventory = new VLabInventory({
            vLab: this
        });

        /* Valter scene */
        this.SceneDispatcher.addScene({
            class: ValterScene,
            natureURL: './scenes/valter.scene/resources/vlab.scene.nature.json',
            /**
             * Set active: true for default VLabScene
             */
            active: true
        });
        /* First scene */
        this.SceneDispatcher.addScene({
            class: FirstScene,
            natureURL: './scenes/first.scene/resources/vlab.scene.nature.json',
            autoload: false,
        });
        /* Second scene */
        this.SceneDispatcher.addScene({
            class: SecondScene,
            natureURL: './scenes/second.scene/resources/vlab.scene.nature.json',
            autoload: false
        });
        /* Third scene */
        this.SceneDispatcher.addScene({
            class: ThirdScene,
            natureURL: './scenes/third.scene/resources/vlab.scene.nature.json',
            autoload: false
        });
        /* RightArm Scene */
        this.SceneDispatcher.addScene({
            class: RightArmScene,
            natureURL: './scenes/right.arm.scene/resources/vlab.scene.nature.json',
            autoload: false
        });





        // let self = this;
        // setTimeout(() => {
        //     /* Activate Second Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: SecondScene
        //     }).then((vLabScene) => { console.log(vLabScene.name + ' activated from ' + this.initObj.name); });
        // }, 10000);

        // setTimeout(() => {
        //     /* Activate FirstScene Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: FirstScene
        //     });
        // }, 20000);

        // setTimeout(() => {
        //     /* Activate ThirdScene Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: ThirdScene
        //     });
        // }, 30000);

        // setTimeout(() => {
        //     /* Activate FirstScene Scene */
        //     self.SceneDispatcher.activateScene({
        //         class: FirstScene
        //     });
        // }, 40000);

        console.log(this);

        this.vLabQuiz = new VLabQuiz({
            vLab: this
        });
        this.vLabQuiz.initialize()
        .then(() => {

            this.vLabQuiz.quizData.description = 'Test Quiz description............';
            this.vLabQuiz.quizData.questions.push(
                {
                    type: 'select',
                    text: 'Question 1 text',
                    data: [
                        {
                            label: 'Answer1',
                            value: 'answer1'
                        },
                        {
                            label: 'Answer2',
                            value: 'answer2'
                        },
                        {
                            label: 'Answer3',
                            value: 'answer3'
                        },
                        {
                            label: 'Answer4',
                            value: 'answer4'
                        }
                    ],
                    correct: 3
                },
                {
                    type: 'select',
                    text: 'Question 2 text',
                    data: [
                        {
                            label: 'Answer1',
                            value: 'answer1'
                        },
                        {
                            label: 'Answer2',
                            value: 'answer2'
                        },
                        {
                            label: 'Answer3',
                            value: 'answer3'
                        },
                        {
                            label: 'Answer4',
                            value: 'answer4'
                        }
                    ],
                    correct: 3
                }
            );

            this.vLabQuiz.startTimedOut();
        });

        this.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabQuiz: {
                    quizTimedOut:         this.onQuizTimedOut
                }
            }
        });
    }
    /**
     * onQuizTimedOut
     */
    onQuizTimedOut(event) {
        this.vLabQuiz.openQuizPanel();
    }
}

new BaseVLab({
    name: 'Base VLab2',
    natureURL: './resources/vlab.nature.json'
});