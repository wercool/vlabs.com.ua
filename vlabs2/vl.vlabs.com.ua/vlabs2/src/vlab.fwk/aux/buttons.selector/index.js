/**
 * VLabs buttons selector overlay
 * Contains vertical set of buttons (default in right top corner)
 * @class
 */
class VLabButtonsSelector {
   /**
    * VLabButtonsSelector constructor
    * @constructor
    * @param {Object}    initObj                           - VLabQuiz initialization object
    * @param {VLab}      initObj.vLab                      - VLab instance
    * @param {array}     initObj.buttons                   - Array of buttons objects
    */
    constructor(initObj) {
        this.initObj = initObj;
        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;

        this.buttons = [];
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
                id: 'vLabButtonsSelectorCSS',
                href: '/vlab.assets/css/buttons.selector.css'
            })
            .then(() => {
                this.panel = document.createElement('div');
                this.panel.id = 'buttonsSelectorPanel';
                this.vLab.DOMManager.container.appendChild(this.panel);

                let id = 0;
                this.initObj.buttons.forEach(buttonObj => {
                    let button = document.createElement('button');
                    button.className = 'buttonsSelectorPanelButton';
                    button.onclick = buttonObj.onclick;
                    button.innerHTML = buttonObj.label;
                    button.setAttribute('selectorID', id++);
                    if (buttonObj.desc) {
                        button.innerHTML +=  '<div style="font-size: 10px; pointer-events: none;">' + buttonObj.desc + '</div>'
                    }

                    this.buttons.push(button);
                    this.panel.appendChild(button);
                });

                resolve();
            });
        });
    }
    /**
     * Sets selected button
     */
    setSelected(selectionObj) {
        this.buttons.forEach(button => {
            button.style.borderStyle = 'none';
        });
        if (selectionObj.button) {
            selectionObj.button.style.borderStyle = 'solid';
            selectionObj.button.style.borderTopStyle = 'none';
            selectionObj.button.style.borderColor = '#1cff00';
            selectionObj.button.style.borderWidth = '4px';
        }
        if (selectionObj.buttonInnerText) {
            this.buttons.forEach(button => {
                if (button.innerText == selectionObj.buttonInnerText) {
                    button.style.borderStyle = 'solid';
                    button.style.borderTopStyle = 'none';
                    button.style.borderColor = '#1cff00';
                    button.style.borderWidth = '4px';
                }
            });
        }
    }
    /**
     * Get index of param button from this.buttons
     */
    getIndex(srcButton) {
        let idx = 0;
        while (this.buttons[idx]) {
            if (this.buttons[idx] == srcButton) {
                return idx;
            }
            idx++;
        }
    }
}
export default VLabButtonsSelector;