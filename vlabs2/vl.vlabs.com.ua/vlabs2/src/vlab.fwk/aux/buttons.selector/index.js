import * as StringUtils from '../../utils/string.utils';
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
    * @param {String}    [initObj.name]                    - Name of this selector (random by default)
    */
    constructor(initObj) {
        this.initObj = initObj;
        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;

        this.name = 'VLabButtonsSelector_' + StringUtils.getRandomString(5)

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

                if (this.vLab.DOMManager.container.clientWidth < 640) {
                    this.addExpandButton();
                }

                this.vLab.DOMManager.container.appendChild(this.panel);

                let id = 0;
                this.initObj.buttons.forEach(buttonObj => {
                    let button = document.createElement('button');
                    button.className = 'buttonsSelectorPanelButton';
                    button.onclick = (event) => {
                        buttonObj.onclick(event);
                        if (this.restoreExpandButtonTimeout) clearTimeout(this.restoreExpandButtonTimeout);
                        if (this.expandButton) {
                            this.restoreExpandButtonTimeout = setTimeout(this.restoreExpandButton, 1000);
                        }
                    };
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
    /**
     * Add Expand Button
     */
    addExpandButton() {
        this.panel.style.height = '60px';
        this.expandButton = document.createElement('button');
        this.expandButton.className = 'buttonsSelectorExpandPanelButton';
        this.expandButton.onclick = () => {
            this.expandButton.style.display = 'none';
            this.panel.style.height = 'auto';
            this.panel.style.maxHeight = '80vh';
            this.panel.style.overflowY = 'scroll';
        };
        this.expandButton.onclick.bind(this);
        this.expandButton.innerHTML = '<div style="display: table-cell; line-height: 40px;">Lung conditions</div><div style="display: table-cell; vertical-align: middle; padding-left: 20px;" class="material-icons">expand_more</div>';
        this.panel.appendChild(this.expandButton);

        this.restoreExpandButton = this.restoreExpandButton.bind(this);

        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    mousedown: this.restoreExpandButton,
                    touchstart: this.restoreExpandButton
                }
            }
        });
    }
    restoreExpandButton() {
        if (this.expandButton.style.display !== 'block') {
            this.panel.style.height = '60px';
            this.panel.style.overflowY = 'hidden';
            this.panel.scrollTop = 0;
            this.expandButton.style.display = 'block';
        }
    }
}
export default VLabButtonsSelector;