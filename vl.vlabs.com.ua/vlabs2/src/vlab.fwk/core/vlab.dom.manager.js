import * as StringUtils         from '../utils/string.utils';
import VLab from './vlab';

/**
 * VLab DOM manager.
 * @class
 * @classdesc VLabDOMManager class generates, manages HTML DOM assemblies for VLab.
 */
class VLabDOMManager {
    /**
     * VLabDOM constructor.
     * @constructor
     * @param {VLab} vLab                         - VLab instance
     */
    constructor(vLab) {
        /**
         * VLab instance reference
         * @inner
         */
        this.vLab = vLab;
        /**
         * VLab DOM CSS styles
         * @inner
         */
        this.styles = {};
    }
    /**
     * Initializes DOM for VLab.
     * * Sets document.title from VLab nature name
     * * Prevents from go back in browser and reload of a window with VLab
     * * Loads global style either from VLab nature link or default (/vlab.assets/css/global.css)
     * * Removes default loader div and style link from head
     * @memberof VLabDOMManager
     * @async
     */
    initialize() {
        return new Promise((resolve, reject) => {
            document.title = this.vLab.nature.name || this.vLab.initObj.name;

            if (this.vLab.getProdMode()) {
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
            this.addStyle({
                id: 'globalCSS',
                href: (this.vLab.nature.styles) ? this.vLab.nature.styles.global ? this.vLab.nature.styles.global : '../vlab.assets/css/global.css' : '../vlab.assets/css/global.css'
            }).then(() => {
                /* Remove default loader, default JS, default CSS */
                let defaultLoader = document.getElementById('loader');
                defaultLoader.parentNode.removeChild(defaultLoader);
                let defaultCSS = document.getElementById('defaultCSS');
                defaultCSS.parentNode.removeChild(defaultCSS);
                let defaultJS = document.getElementById('defaultJS');
                defaultJS.parentNode.removeChild(defaultJS);
                let ZipLoaderJS = document.getElementById('ZipLoaderJS');
                if (ZipLoaderJS) ZipLoaderJS.parentNode.removeChild(ZipLoaderJS);
    
                /**
                 * VLab DOM container <div id='VLabContainer'>
                 * #VLabContainer in /vlab.assets/css/global.css 
                 * @inner
                 */
                this.container = document.createElement('div');
                this.container.id = 'VLabContainer';
                if(document.body != null) {
                    document.body.appendChild(this.container);
                }
                /**
                 * THREE.WebGLRenderer DOM container <div id='WebGLContainer'>
                 * #WebGLContainer in /vlab.assets/css/global.css 
                 * @inner
                 */
                this.WebGLContainer = document.createElement('div');
                this.WebGLContainer.id = 'WebGLContainer';
                this.container.appendChild(this.WebGLContainer);
                /**
                 * Shared assets for VLabScene
                 * @inner
                 */
                this.VLabSceneSharedAssets = {
                    sceneLoader: null,
                    sceneLoaderContainer: null,
                    sceneLoaderHeader: null,
                    sceneLoaderContent: null,
                    sceneLoadingBarDIV: null,
                    loadingBar: null,
                    sceneAutoLoader: null,
                    sceneAutoLoaderProgress: null,
                    sceneAutoLoaderLabel: null
                };

                resolve();
            });
        });
    }
    /**
     * Adds style to <head>
     * @memberof VLabDOMManager
     * @async
     * @param {Object} styleObj                         - Style object
     * @param {string} styleObj.id                      - Style 'id' property
     * @param {string} styleObj.href                    - Style 'href' property
     */
    addStyle(styleObj) {
        return new Promise(function(resolve, reject) {
            let style = document.getElementById(styleObj.id);
            if (style) resolve();
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
export default VLabDOMManager;