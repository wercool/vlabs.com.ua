import * as THREE               from 'three';
import * as TWEEN           from 'tween.js';
import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';

var OrbitControls           = require('../../vlabs.core/three-orbit-controls/index')(THREE);

export default class DetailedView {
    /*
    initObj {
        "context": VLab
    }
    */
        constructor(initObj) {
           this.initObj = initObj;
           this.context = initObj.context;

           this.mouseCoordsRaycaster = new THREE.Vector2();
           this.iteractionRaycaster = new THREE.Raycaster();

           this.context = this.context;

           var textureLoader = new THREE.TextureLoader();
           return Promise.all([
               textureLoader.load('/vlabs.assets/img/detailed-view.png'),
           ])
           .then((result) => {
               this.handlerSpriteTexture = result[0];
               this.initialize();
           })
           .catch(error => {
               console.error(error);
           });
        }

        initialize() {

            this.container = document.createElement('div');
            this.container.id = this.initObj.targetObjectName + 'DetailedViewContainer';
            this.container.className = 'detailedViewContainer';
            this.container.style.display = 'none';
            document.getElementById("overlayContainer").appendChild(this.container);

            this.closeBtn = document.createElement('div');
            this.closeBtn.id = 'detailedViewCloseButton';
            this.container.appendChild(this.closeBtn);
            this.closeBtn.addEventListener("mousedown", this.close.bind(this), false);

            var handlerSpriteMaterial = new THREE.SpriteMaterial({
                map: this.handlerSpriteTexture,
                color: 0x00ff00,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.handlerSprite = new THREE.Sprite(handlerSpriteMaterial);
            this.handlerSprite.name = this.initObj.targetObjectName + "DetailedViewSprite"
            this.handlerSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));
            this.handlerSprite.position.x += this.initObj.positionDeltas ? this.initObj.positionDeltas.x : 0.0;
            this.handlerSprite.position.y += this.initObj.positionDeltas ? this.initObj.positionDeltas.y : 0.0;
            this.handlerSprite.position.z += this.initObj.positionDeltas ? this.initObj.positionDeltas.z : 0.0;

            var animationScale = this.handlerSprite.scale.x * 0.75;
            this.handlerSpritePulsation = new TWEEN.Tween(this.handlerSprite.scale)
            .to({x: animationScale, y: animationScale, z: animationScale}, 2000)
            .repeat(Infinity)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.InOut).start();

            if (this.initObj.parent) {
                this.targetObject = this.initObj.parent.getObjectByName(this.initObj.targetObjectName);
            } else {
                this.targetObject = this.context.vLabScene.getObjectByName(this.initObj.targetObjectName);
            }

            this.targetObject.add(this.handlerSprite);

            //VLab events subscribers
            this.context.webGLContainerEventsSubcribers.mouseup["DetailedView" + this.initObj.targetObjectName + "vLabSceneMouseUp"] = 
            {
                callback: this.onVLabSceneMouseUp,
                instance: this
            };
            this.context.webGLContainerEventsSubcribers.touchend["DetailedView" + this.initObj.targetObjectName + "vLabSceneTouchEnd"] = 
            {
                callback: this.onVLabSceneTouchEnd,
                instance: this
            };

            console.log("DetailedView initialized for " + this.initObj.targetObjectName);
        }

        onVLabSceneMouseUp(event) {
            // console.log("DetailedView" + this.initObj.targetObjectName + "vLabSceneMouseUp", event.type);
            this.interactionEvent();
        }

        onVLabSceneTouchEnd(event) {
            // console.log("DetailedView" + this.initObj.targetObjectName + "vLabSceneTouchEnd", event.type);
            this.interactionEvent();
        }

        interactionEvent() {
            if (this.initObj.context.defaultCameraControls.type !== 'orbit' || this.initObj.context.paused) {
                return;
            }
            this.initObj.context.helpersRaycaster.setFromCamera(this.initObj.context.mouseCoordsRaycaster, this.initObj.context.defaultCamera);

            var intersectObjects = this.context.interactivesSuppressorsObjects.slice();
            intersectObjects.push(this.handlerSprite);

            var intersects = this.initObj.context.helpersRaycaster.intersectObjects(intersectObjects);

            if (intersects.length > 0) {
                if (intersects[0].object.name == this.handlerSprite.name) {
                    console.log(intersects[0].object.name);
                    this.activate();
                }
            }
        }

        activate() {
            this.context.paused = true;
            document.getElementById("fullscreen").style.display = 'none';
            document.getElementById("resetview").style.display = 'none';
            document.getElementById("modalMessage").style.display = 'none';
            document.getElementById("progressBar").style.display = 'none';
            this.context.statsTHREE.domElement.style.display = 'none';
            document.getElementById("toolbox").style.display = 'none';

            if (this.context.zoomHelperMode) {
                document.getElementById("back").style.display = 'none';
            }

            document.getElementById("overlayContainer").style.display = 'block';
            this.container.style.display = 'block';
        }

        close() {
            this.container.style.display = 'none';
            document.getElementById("overlayContainer").style.display = 'none';
    
            this.context.paused = false;
            this.context.statsTHREE.domElement.style.display = 'block';
            document.getElementById("toolbox").style.display = 'block';
    
            document.getElementById("fullscreen").style.display = 'block';
            document.getElementById("resetview").style.display = 'block';
    
            if (this.context.zoomHelperMode) {
                document.getElementById("back").style.display = 'block';
            }

            this.context.mouseCoordsRaycaster.set(-1.0, -1.0);

            console.log(this.initObj.targetObjectName + " Detailed View closed");
        }
}