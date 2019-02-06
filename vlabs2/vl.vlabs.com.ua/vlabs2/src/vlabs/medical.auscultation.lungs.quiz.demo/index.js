import VLab from '../../vlab.fwk/core/vlab';

/* This VLab Auxilaries */
import VLabInventory   from    '../../vlab.fwk/aux/inventory/index';
import VLabQuiz from '../../vlab.fwk/aux/quiz/index';

/* This VLab Scenes */
import BasicsOfLungSoundsScene   from    './scenes/base.scene';

/**
 * Medical VLab
 * Basics of Lung Sounds
 * @class
 * @extends VLab
 */
class BasicsOfLungSounds extends VLab {
    /**
     * BasicsOfLungSounds constructor
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
     * @memberof BasicsOfLungSounds
     */
    bootstrap(iniObj) {
        /* VLab Inventory */
        this.Inventory = new VLabInventory({
            vLab: this
        });

        /* BasicsOfLungSounds Scene */
        this.SceneDispatcher.addScene({
            class: BasicsOfLungSoundsScene,
            natureURL: './scenes/base.scene/resources/vlab.scene.nature.json',
            /**
             * Set active: true for default VLabScene
             */
            active: true
        });

        console.log(this);
    }

    addQuiz(BasicsOfLungSoundsScene) {
        this.vLabQuiz = new VLabQuiz({
            vLab: this
        });
        this.vLabQuiz.initialize()
        .then(() => {

            this.vLabQuiz.quizData.description = 'According to auscultation examination you have completed what pathologies have you identified?';
            this.vLabQuiz.quizData.questions.push(
                {
                    type: 'select',
                    text: 'Something wrong with lungs?',
                    data: [
                        {
                            label: 'No, normal, vesicular breath',
                            value: '0'
                        },
                        {
                            label: 'Fine crackles, suspicion of pneumonia, CHF, or atelectasis',
                            value: '1'
                        },
                        {
                            label: 'Coarse crackles, strong suspicion of pneumonia, CHF, or atelectasis',
                            value: '2'
                        },
                        {
                            label: 'Wheeze, suspicion of asthma',
                            value: '3'
                        },
                        {
                            label: 'Rhonchi, suspicion of bronchi',
                            value: '4'
                        },
                        {
                            label: 'Bronchial breath sounds, suspicion of pneumonia, atelectasis, pleural effusions',
                            value: '5'
                        },
                        {
                            label: 'Pleural rubs sounds, suspicion of pleurisy',
                            value: '6'
                        },
                        {
                            label: 'Bronchovesicular breath sounds, suspicion of early infiltrate or partial atelectasis',
                            value: '7'
                        }
                    ],
                    correct: BasicsOfLungSoundsScene.lungsSoundsID
                },
                {
                    type: 'select',
                    text: 'Something wrong with cardiovascular system?',
                    data: [
                        {
                            label: 'No, normal and unsplit sounds from the heart',
                            value: '0'
                        }
                    ],
                    correct: 0
                },
                {
                    type: 'select',
                    text: 'Something wrong with digestive system system?',
                    data: [
                        {
                            label: 'No, normal digestive system sounds',
                            value: '0'
                        }
                    ],
                    correct: 0
                }
            );

            this.vLabQuiz.startTimedOut();

            // this.vLabQuiz.overlayButton.style.left = '2px';
            // this.vLabQuiz.overlayButton.style.top = '50px';
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

new BasicsOfLungSounds({
    name: 'BasicsOfLungSounds',
    natureURL: './resources/vlab.nature.json'
});