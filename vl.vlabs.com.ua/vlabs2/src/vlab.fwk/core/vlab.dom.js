import * as StringUtils         from '../utils/string.utils';
/**
 * VLab DOM generator.
 * @class
 * @classdesc VLabDOM class generates HTML DOM assemblies for VLab.
 */
class VLabDOM {
    /**
     * VLabDOM constructor.
     * @constructor
     * @param {VLab} vLabInstance                         - VLab instance
     */
    constructor(vLabInstance) {
        this.vLab = vLabInstance;

        this.styles = {};

        this.setupDocument();
        this.setupStyles();
    }
    /**
     * Setup document HTML DOM element for VLab.
     * * Sets document.title from VLab nature name
     * * Prevents from go back in browser and reload of a window with VLab
     *
     * @memberof VLabDOM
     */
    setupDocument() {
        document.title = this.vLab.nature.name || this.vLab.initObj.name;

        if (this.vLab.prodMode) {
            /* Prevent VLab from go back */
            (function (global) {
                if(typeof (global) === "undefined")
                {
                    throw new Error("window is undefined");
                }
                let _hash = "!";
                global.onhashchange = function () {
                    if (global.location.hash !== _hash) {
                        global.location.hash = _hash;
                    }
                };
                global.location.href += "#";
                global.setTimeout(function () {
                    global.location.href += "!";
                }, 50);
            })(window);
            window.onbeforeunload = function () {
                console.log('Prevent VLab from unneeded reload');
                return false;
            };
        }
    }
    /**
     * Setup VLab HTML CSS styles accordingly to VLab nature.
     * * Loads global style either from VLab nature link or default
     * * Removes default loader div and style link from head
     * @memberof VLabDOM
     */
    setupStyles() {
        this.addStyle({
            id: 'globalStyle',
            href: (this.vLab.nature.styles.global == undefined) ? '../vlab.assets/styles/global.css' : this.vLab.nature.styles.global
        }).then(() => {
            /* Remove default loader */
            let defaultLoader = document.getElementById('loader');
            defaultLoader.parentNode.removeChild(defaultLoader);
            let defaultLoaderStyle = document.getElementById('loaderStyle');
            defaultLoaderStyle.parentNode.removeChild(defaultLoaderStyle);
        });
    }
    /**
     * Adds style to <head>
     * @memberof VLabDOM
     * @async
     * @param {Object} styleObj                         - Style object
     * @param {string} styleObj.id                      - Style 'id' property
     * @param {string} styleObj.href                    - Style 'href' property
     */
    addStyle(styleObj) {
        return new Promise(function(resolve, reject) {
            /* Loads global style either from VLab nature link or default */
            let styleLink = document.createElement('link');
            styleLink.id = styleObj.id || StringUtils.getRandomString(5);
            styleLink.type = 'text/css';
            styleLink.rel = 'stylesheet';
            styleLink.href = styleObj.href;
            document.getElementsByTagName('head')[0].appendChild(styleLink);
            styleLink.onload = function() {
                resolve();
            };
            styleLink.onerror = function() {
                reject();
            };
        });
    }
}
export default VLabDOM;