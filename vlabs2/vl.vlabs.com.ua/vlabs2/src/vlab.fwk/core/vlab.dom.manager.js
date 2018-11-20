import * as StringUtils from '../utils/string.utils';
import Stats from 'stats-js';
import VLab from './vlab';
import VLabPanel from '../aux/vlab.panel';

/*<dev>*/
import RendererStats from 'three-webgl-stats';
/*</dev>*/

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
         * @public
         */
        this.vLab = vLab;
        /**
         * Name on VLabDOMManager
         */
        this.name = 'VLabDOMManager';
        /**
         * VLab DOM CSS styles
         * @public
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
                id: 'materialIconsCSS',
                href: '/vlab.assets/css/fonts/material-icons/material-icons.css'
            }).then(() => {
                let materialIconsCSSFontPreloader = document.createElement('li');
                materialIconsCSSFontPreloader.style.position = 'fixed';
                materialIconsCSSFontPreloader.style.left = 'calc(50% - 6px)';
                materialIconsCSSFontPreloader.style.top = 'calc(50% - 6px)';
                materialIconsCSSFontPreloader.style.fontSize = '12px';
                materialIconsCSSFontPreloader.style.zIndex = 0;
                materialIconsCSSFontPreloader.className = 'material-icons';
                materialIconsCSSFontPreloader.innerHTML = 'hourglass_empty';
                document.body.appendChild(materialIconsCSSFontPreloader);
                this.addStyle({
                    id: 'globalCSS',
                    href: (this.vLab.nature.styles) ? this.vLab.nature.styles.global ? this.vLab.nature.styles.global : '/vlab.assets/css/global.css' : '/vlab.assets/css/global.css'
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
                    setTimeout(() => {
                        document.body.removeChild(materialIconsCSSFontPreloader);
                    }, 1000);
                    /**
                     * 
                     * VLab DOM container <div id='VLabContainer'>
                     * #VLabContainer in /vlab.assets/css/global.css 
                     * 
                     * @public
                     */
                    this.container = document.createElement('div');
                    this.container.id = 'VLabContainer';
                    if(document.body != null) {
                        document.body.appendChild(this.container);
                    }
                    /**
                     * THREE.WebGLRenderer DOM container <div id='WebGLContainer'>
                     * #WebGLContainer in /vlab.assets/css/global.css 
                     * @public
                     */
                    this.WebGLContainer = document.createElement('div');
                    this.WebGLContainer.id = 'WebGLContainer';
                    this.container.appendChild(this.WebGLContainer);
                    /**
                     * Shared assets for VLabScene
                     * @public
                     */
                    this.VLabSceneSharedAssets = {
                        sceneLoader: null,
                        sceneLoaderContainer: null,
                        sceneLoaderHeader: null,
                        sceneLoaderContent: null,
                        sceneLoadingBarDIV: null,
                        sceneLoaderHint: null,
                        loadingBar: null,
                        sceneAutoLoader: null,
                        sceneAutoLoaderProgress: null,
                        sceneAutoLoaderLabel: null,
                        sceneIntializing: null
                    };
                    /**
                     * Setup simple statistics
                     */
                    if (this.vLab.nature.simpleStats !== undefined) {
                        this.simpleStats = new Stats();
                        this.simpleStats.domElement.id = 'simpleStats';
                        this.simpleStats.domElement.style.position = 'absolute';
                        this.simpleStats.domElement.style.zIndex = 10000;
                        this.simpleStats.domElement.style.left = '0px';
                        this.simpleStats.domElement.style.top = '0px';
                        this.simpleStats.domElement.classList.add('nonSelectable');
                        this.container.appendChild(this.simpleStats.domElement);
                        if (this.vLab.nature.simpleStats === false) this.simpleStats.domElement.style.display = 'none';
                    }
                    /**
                     * Setup WebGLRenderer statistics
                     */
                    /*<dev>*/
                        this.rendererStats = new RendererStats();
                        this.rendererStats.domElement.style.position = 'absolute';
                        this.rendererStats.domElement.style.top = '0px';
                        this.rendererStats.domElement.style.right = '0px';
                        this.rendererStats.domElement.style.zIndex = 3;
                        this.rendererStats.domElement.classList.add('nonSelectable');
                        this.container.appendChild(this.rendererStats.domElement);
                    /*</dev>*/

                    /**
                     * Subscrive to events
                     */
                    this.vLab.EventDispatcher.subscribe({
                        subscriber: this,
                        events: {
                            document: {
                                onfullscreenchange: this.onFullscreenchange
                            },
                        }
                    });

                    /**
                     * 
                     * 
                     *  __      ___           _       _____                 _ 
                     *  \ \    / / |         | |     |  __ \               | |
                     *   \ \  / /| |     __ _| |__   | |__) |_ _ _ __   ___| |
                     *    \ \/ / | |    / _` | '_ \  |  ___/ _` | '_ \ / _ \ |
                     *     \  /  | |___| (_| | |_) | | |  | (_| | | | |  __/ |
                     *      \/   |______\__,_|_.__/  |_|   \__,_|_| |_|\___|_|
                     * 
                     * 
                     */
                    this.vLabPanel = new VLabPanel({
                        vLab: this.vLab
                    });
                    this.vLabPanel.initialize().then((vLabPanel) => {
                        this.container.appendChild(this.vLabPanel.VLabPanelContainer);



                        resolve();
                    });
                });
            })
        });
    }
    /**
     * Adds style to the <head>
     * @memberof VLabDOMManager
     * @async
     * @param {Object} styleObj                         - Style object
     * @param {string} styleObj.id                      - Style 'id' property
     * @param {string} styleObj.href                    - Style 'href' property
     */
    addStyle(styleObj) {
        return new Promise(function(resolve, reject) {
            let style = document.getElementById(styleObj.id);
            if (style !== null) {
                resolve();
            } else {
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
            }
        });
    }
    /**
     * 
     * 
     * 
     * VLabScene shared DOM methods
     * 
     * 
     * 
     */
    /**
     * Setup (if not yet exists) and show VLabScene loader splash element.
     * 
     * @memberof VLabDOMManager
     * @see {@link VLabScene#load}
     */
    showSceneLoader(vLabScene) {
        if (this.VLabSceneSharedAssets.sceneLoaderContainer === null) {
            this.VLabSceneSharedAssets.sceneLoaderContainer = document.createElement('div');
            this.VLabSceneSharedAssets.sceneLoaderContainer.id = 'sceneLoaderContainer';
            this.vLab.DOMManager.container.insertAdjacentElement('afterbegin', this.VLabSceneSharedAssets.sceneLoaderContainer);
            this.VLabSceneSharedAssets.sceneLoader = document.createElement('div');
            this.VLabSceneSharedAssets.sceneLoader.id = 'sceneLoader';
            this.VLabSceneSharedAssets.sceneLoaderContainer.appendChild(this.VLabSceneSharedAssets.sceneLoader);
            this.VLabSceneSharedAssets.sceneLoaderHeader = document.createElement('div');
            this.VLabSceneSharedAssets.sceneLoaderHeader.id = 'sceneLoaderHeader';
            this.VLabSceneSharedAssets.sceneLoader.appendChild(this.VLabSceneSharedAssets.sceneLoaderHeader);
            let sceneLoaderHeaderHR = document.createElement('div');
            sceneLoaderHeaderHR.id = 'sceneLoaderHeaderHR';
            this.VLabSceneSharedAssets.sceneLoader.appendChild(sceneLoaderHeaderHR);
            this.VLabSceneSharedAssets.sceneLoaderContent = document.createElement('div');
            this.VLabSceneSharedAssets.sceneLoaderContent.id = 'sceneLoaderContent';
            this.VLabSceneSharedAssets.sceneLoader.appendChild(this.VLabSceneSharedAssets.sceneLoaderContent);
            this.VLabSceneSharedAssets.sceneLoadingBarDIV = document.createElement('div');
            this.VLabSceneSharedAssets.sceneLoadingBarDIV.id = 'sceneLoadingBarDIV';
            this.VLabSceneSharedAssets.sceneLoadingBarDIV.setAttribute('class', 'ldBar label-center');
            this.VLabSceneSharedAssets.sceneLoadingBarDIV.setAttribute('data-preset', 'circle');
            this.VLabSceneSharedAssets.sceneLoadingBarDIV.setAttribute('data-stroke', '#c3d7e4');
            this.VLabSceneSharedAssets.sceneLoader.appendChild(this.VLabSceneSharedAssets.sceneLoadingBarDIV);
            this.VLabSceneSharedAssets.loadingBar = new ldBar(this.VLabSceneSharedAssets.sceneLoadingBarDIV);
            this.VLabSceneSharedAssets.sceneLoaderHint = document.createElement('div');
            this.VLabSceneSharedAssets.sceneLoaderHint.id = 'sceneLoaderHint';
            this.VLabSceneSharedAssets.sceneLoader.appendChild(this.VLabSceneSharedAssets.sceneLoaderHint);

            /* Autloader */
            this.VLabSceneSharedAssets.sceneAutoLoader = document.createElement('div');
            this.VLabSceneSharedAssets.sceneAutoLoader.id = 'sceneAutoLoader';
            this.VLabSceneSharedAssets.sceneLoaderContainer.appendChild(this.VLabSceneSharedAssets.sceneAutoLoader);
            this.VLabSceneSharedAssets.sceneAutoLoaderLabel = document.createElement('div');
            this.VLabSceneSharedAssets.sceneAutoLoaderLabel.id = 'sceneAutoLoaderLabel';
            this.VLabSceneSharedAssets.sceneAutoLoader.appendChild(this.VLabSceneSharedAssets.sceneAutoLoaderLabel);
            this.VLabSceneSharedAssets.sceneAutoLoaderProgress = document.createElement('div');
            this.VLabSceneSharedAssets.sceneAutoLoaderProgress.id = 'sceneAutoLoaderProgress';
            this.VLabSceneSharedAssets.sceneAutoLoader.appendChild(this.VLabSceneSharedAssets.sceneAutoLoaderProgress);
        }

        this.VLabSceneSharedAssets.sceneLoaderContainer.style.display = 'flex';

        if (vLabScene.initObj.autoload) {
            this.VLabSceneSharedAssets.sceneLoader.classList.add('hidden');
            this.VLabSceneSharedAssets.sceneAutoLoader.style.display = 'inline';
            this.VLabSceneSharedAssets.sceneLoaderContainer.style.pointerEvents = 'none';
            this.VLabSceneSharedAssets.sceneAutoLoaderProgress.style.width = '0%';
            this.VLabSceneSharedAssets.sceneAutoLoaderLabel.innerHTML = '';
            this.VLabSceneSharedAssets.sceneLoaderHint.innerHTML = '';
        } else {
            this.VLabSceneSharedAssets.loadingBar.set(0);
            this.VLabSceneSharedAssets.sceneLoader.style.display = 'inline';
            this.VLabSceneSharedAssets.sceneLoader.classList.remove('hidden');
            this.VLabSceneSharedAssets.sceneAutoLoader.style.display = 'none';
            this.VLabSceneSharedAssets.sceneLoaderContainer.style.pointerEvents = 'auto';
            this.VLabSceneSharedAssets.sceneLoaderHeader.innerHTML = vLabScene.nature.title || 'Loading scene...';
            this.VLabSceneSharedAssets.sceneLoaderContent.innerHTML = vLabScene.nature.description || '';
            this.VLabSceneSharedAssets.sceneLoaderHint.innerHTML = '';
        }
    }
    /**
     * Refreshes VLabScene loader indicator.
     * 
     * @async
     * @memberof VLabDOMManager
     * @see {@link VLabScene#load}
     */
    refreshSceneLoaderIndicator(vLabScene, progress) {
        if (vLabScene.initObj.autoload && this.vLab.SceneDispatcher.sceneIsBeingActivated != vLabScene) {
            this.VLabSceneSharedAssets.sceneAutoLoaderProgress.style.width = progress + '%';
            this.VLabSceneSharedAssets.sceneAutoLoaderLabel.innerHTML = 'Autoloading ' + (vLabScene.nature.title ? vLabScene.nature.title : 'scene') + ' ' + progress + '%';
        } else {
            if (this.VLabSceneSharedAssets.loadingBar) this.VLabSceneSharedAssets.loadingBar.set(parseInt(progress));
        }
    }
    /**
     * Handle this.VLabSceneSharedAssets when load completed.
     * 
     * @memberof VLabDOMManager
     * @see {@link VLabScene#load}
     */
    handleSceneLoadComplete() {
        if (this.vLab.SceneDispatcher.getNotYetLoadedAutoloads() == 0) {
            if (this.VLabSceneSharedAssets.sceneLoaderContainer) {
                this.container.removeChild(this.VLabSceneSharedAssets.sceneLoaderContainer);
            }
            for (let VLabSceneAsset in this.VLabSceneSharedAssets) {
                this.VLabSceneSharedAssets[VLabSceneAsset] = null;
            }
        } else {
            this.VLabSceneSharedAssets.sceneLoader.classList.add('hidden');
            this.VLabSceneSharedAssets.sceneAutoLoader.style.display = 'inline';
            this.VLabSceneSharedAssets.sceneLoaderContainer.style.pointerEvents = 'none';
        }
    }
    /**
     * Request fullscreen
     */
    requestFullscreen(event) {
        event.stopPropagation();
        let fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
        // in fullscreen mode fullscreenElement won't be null

        if (fullscreenElement == null) {
            if (this.container.requestFullscreen) {
                this.container.requestFullscreen();
            } else if (this.container.mozRequestFullScreen) { /* Firefox */
                this.container.mozRequestFullScreen();
            } else if (this.container.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                this.container.webkitRequestFullscreen();
            } else if (this.container.msRequestFullscreen) { /* IE/Edge */
                this.container.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
    }
    /**
     * Fullscreen change listener
     */
    onFullscreenchange(event) {
        let fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
        // in fullscreen mode fullscreenElement won't be null
        if (fullscreenElement == null) {
            /**
             * Change this.vLabPanel.fullScreenButton icon if this.vLabPanel.fullScreenButton exists
             */
            if (this.vLabPanel.fullScreenButton !== undefined) {
                this.vLabPanel.fullScreenButton.innerHTML = 'fullscreen';
            }
        } else {
            if (this.vLabPanel.fullScreenButton !== undefined) {
                this.vLabPanel.fullScreenButton.innerHTML = 'fullscreen_exit';
            }
        }
    }
}
export default VLabDOMManager;