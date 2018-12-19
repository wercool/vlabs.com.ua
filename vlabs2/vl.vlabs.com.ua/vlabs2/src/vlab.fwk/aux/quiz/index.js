/**
 * VLabs build in Quiz
 * @class
 */
class VLabQuiz {
   /**
    * VLabQuiz constructor
    * @constructor
    * @param {Object}    initObj                           - VLabQuiz initialization object
    * @param {VLab}      initObj.vLab                      - VLab instance
    */
    constructor(initObj) {
        this.initObj = initObj;
        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;

        this.name = 'VLabQuiz';

        this.quizData = {
            label: 'Quiz',
            description: '',
            questions: [
                /**
                 * Question
                 * {
                 *     type: 'select',
                 *     text: '',
                 *     data: [
                 *         {
                 *             label: ''
                 *             value: '',
                 *             correct: true // optional
                 *         }
                 *     ]
                 * }
                 */
            ]
        };
    }
    /**
     * Initializtion of VLabQuiz
     */
    initialize() {
        return new Promise((resolve) => {
            /**
             * Add VLabQuiz CSS
             */
            this.vLab.DOMManager.addStyle({
                id: 'vLabQuizCSS',
                href: '/vlab.assets/css/quiz.css'
            })
            .then(() => {
                this.overlayButton = document.createElement('div');
                this.overlayButton.id = 'quizOverlayButton';

                this.overlayButton.onclick = this.overlayButton.ontouchstart = this.openQuizPanel.bind(this);

                this.overlayButtonIcon = document.createElement('div');
                this.overlayButtonIcon.id = 'quizOverlayButtonIcon';
                this.overlayButtonIcon.className = 'material-icons';
                this.overlayButtonIcon.innerHTML = 'assignment_turned_in';
                this.overlayButton.appendChild(this.overlayButtonIcon);

                this.panel = document.createElement('div');
                this.panel.id = 'quizPanel';
                this.vLab.DOMManager.container.appendChild(this.panel);

                /**
                 * Timed out Quiz
                 */
                this.overlayButtonTimedQuizIcon = document.createElement('div');
                this.overlayButtonTimedQuizIcon.className = 'material-icons';
                this.overlayButtonTimedQuizIcon.innerHTML = 'timer';
                this.overlayButton.appendChild(this.overlayButtonTimedQuizIcon);

                this.overlayButtonTimedQuizLabel = document.createElement('div');
                this.overlayButtonTimedQuizLabel.style = 'padding: 4px; font-size: 14px;'
                this.overlayButtonTimedQuizLabel.innerHTML = '00:00';
                this.overlayButton.appendChild(this.overlayButtonTimedQuizLabel);

                this.timeOutQuizSeconds = 600;

                this.vLab.DOMManager.container.appendChild(this.overlayButton);

                resolve();
            });
        });
    }
    /**
     * Build QuizPanel
     */
    buildQuizPanel() {
        while (this.panel.firstChild) {
            this.panel.removeChild(this.panel.firstChild);
        }

        this.panelLabel = document.createElement('div');
        this.panelLabel.id = 'quizPanelLabel';
        this.panelLabel.innerHTML = this.quizData.label;
        this.panelLabel.innerHTML += '<div class="quizCustomHR"></div>';
        this.panel.appendChild(this.panelLabel);

        this.panelContent = document.createElement('div');
        this.panelContent.id = 'quizPanelContent';
        this.panel.appendChild(this.panelContent);


        if (this.quizData.description != '') {
            this.panelContent.innerHTML += '<h4>' + this.quizData.description + '</h4>'
        }

        let contentTableHTML = '<form id="quizForm">';
        contentTableHTML += '<table class="quizContentTable">';
        let QId = 0;
        this.quizData.questions.forEach((quizQuestion) => {
            contentTableHTML += '<tr class="quizContentTableTR">';
                /**
                 * Question column
                 */
                contentTableHTML += '<td style="width: 60%; padding: 8px;">';
                    contentTableHTML += quizQuestion.text;
                contentTableHTML += '</td>';
                /**
                 * Answer column
                 */
                contentTableHTML += '<td style="padding: 8px;">';
                switch (quizQuestion.type) {
                    case 'select':
                        contentTableHTML += '<div class="quizSelect">';
                            contentTableHTML += '<select name="Q#' + QId + '">';
                                quizQuestion.data.forEach((quizQuestionOption) => {
                                    contentTableHTML += '<option value="' + quizQuestionOption.value + '">';
                                    contentTableHTML += quizQuestionOption.label;
                                    contentTableHTML += '</option>';
                                });
                            contentTableHTML += '</select>';
                        contentTableHTML += '</div>';
                    break;
                }
                contentTableHTML += '</td>';
            contentTableHTML += '</tr>';
            QId++;
        });
        contentTableHTML += '</table>';
        contentTableHTML += '</form>';
        this.panelContent.innerHTML += contentTableHTML;

        this.panelContent.innerHTML += '<div id="quizDoneButton">SUBMIT</div>';

        this.doneButton = this.panel.querySelector('#quizDoneButton');
        this.doneButton.onclick = this.doneButton.ontouchstart = this.quizDone.bind(this);

        this.closeButton = document.createElement('button');
        this.closeButton.id = 'quizCloseButton';
        this.closeButton.className = 'quizButton';
        this.closeButton.innerHTML = 'Close';
        this.closeButton.onclick = this.closeButton.ontouchstart = this.closeQuizPanel.bind(this);

        this.panel.appendChild(this.closeButton);

        this.form = this.panelContent.querySelector('#quizForm');
    }
    /**
     * Open QuizPanel
     */
    openQuizPanel(event) {
        if (event) event.stopPropagation();
        this.vLab.renderPaused = true;
        this.buildQuizPanel();
        this.panel.style.display = 'block';
        this.overlayButton.style.visibility = 'hidden';
    }
    /**
     * Close QuizPanel
     */
    closeQuizPanel(event) {
        if (event) event.stopPropagation();
        this.panel.style.display = 'none';
        this.overlayButton.style.visibility = 'visible';
        this.vLab.renderPaused = false;
    }
    /**
     * Strart timedOut Quiz
     */
    startTimedOut() {
        let self = this;
        this.timeOutQuizInterval = setInterval(() => {
            self.timeOutQuizSeconds--;
            let minutes = parseInt(self.timeOutQuizSeconds / 60) % 60;
            let seconds = self.timeOutQuizSeconds % 60;
            seconds = seconds.toString().padStart(2, '0');
            minutes = minutes.toString().padStart(2, '0');
            this.overlayButtonTimedQuizLabel.innerHTML = minutes + ':' + seconds;
            if (self.timeOutQuizSeconds == 0) {
                clearInterval(self.timeOutQuizInterval);
                // dself.openQuizPanel();
                self.vLab.EventDispatcher.notifySubscribers({
                    target: 'VLabQuiz',
                    type: 'quizTimedOut',
                    args: {
                        quiz: self
                    }
                });
            }
        }, 1000);
    }
    /**
     * quizDone
     */
    quizDone() {
        this.formData = new FormData(this.form);
        let correctAnswersNum = 0;
        for (var [key, value] of this.formData.entries()) { 
            let QId = key.split('#')[1];
            switch (this.quizData.questions[QId].type) {
                case 'select':
                    let correctAnswer = this.quizData.questions[QId].data[this.quizData.questions[QId].correct];
                    if (correctAnswer.value == value) {
                        correctAnswersNum++;
                    }
                break;
            }
        }
        this.buildQuizResultsPanel(correctAnswersNum);
    }

    /**
     * Build QuizPanel Result
     */
    buildQuizResultsPanel(correctAnswersNum) {
        while (this.panel.firstChild) {
            this.panel.removeChild(this.panel.firstChild);
        }

        this.panelLabel = document.createElement('div');
        this.panelLabel.id = 'quizPanelLabel';
        this.panelLabel.innerHTML = this.quizData.label;
        this.panelLabel.innerHTML += '<div class="quizCustomHR"></div>';
        this.panel.appendChild(this.panelLabel);

        this.panelContent = document.createElement('div');
        this.panelContent.id = 'quizPanelContent';
        this.panel.appendChild(this.panelContent);

        let resultRate = parseInt((correctAnswersNum / this.quizData.questions.length) * 100);
        this.panelContent.innerHTML += '<h1 style="width: 100%; text-align: center;">' + resultRate + '% correct</h1>'
        this.panelContent.innerHTML += '<br/><div class="quizCustomHR"></div>';


        if (this.quizData.description != '') {
            this.panelContent.innerHTML += '<h4>' + this.quizData.description + '</h4>'
        }

        let contentTableHTML = '<table class="quizContentTable">';

        this.quizData.questions.forEach((quizQuestion) => {
            contentTableHTML += '<tr class="quizContentTableTR">';
                /**
                 * Question column
                 */
                contentTableHTML += '<td style="width: 60%; padding: 8px;">';
                    contentTableHTML += quizQuestion.text;
                contentTableHTML += '</td>';
                /**
                 * Answer column
                 */
                contentTableHTML += '<td style="padding: 8px; color: #b6ffab;">';
                switch (quizQuestion.type) {
                    case 'select':
                        contentTableHTML += quizQuestion.data[quizQuestion.correct].label;
                    break;
                }
                contentTableHTML += '</td>';
            contentTableHTML += '</tr>';
        });

        contentTableHTML += '</table>';

        this.panelContent.innerHTML += contentTableHTML;

        this.closeButton = document.createElement('button');
        this.closeButton.id = 'quizCloseButton';
        this.closeButton.className = 'quizButton';
        this.closeButton.innerHTML = 'Close';
        this.closeButton.onclick = this.closeButton.ontouchstart = this.closeQuizPanel.bind(this);

        this.panel.appendChild(this.closeButton);
    }
}
export default VLabQuiz;