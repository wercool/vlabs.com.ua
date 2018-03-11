import * as THREE               from 'three';
import * as TWEEN           from 'tween.js';
import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';

var OrbitControls           = require('../../vlabs.core/three-orbit-controls/index')(THREE);

var self = undefined;

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

           self = this;

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

            var animationScale = this.initObj.scale.x * 0.75;
            this.handlerSpritePulsation = new TWEEN.Tween(this.handlerSprite.scale)
            .to({x: animationScale, y: animationScale, z: animationScale}, 2000)
            .repeat(Infinity)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.InOut).start();

            

            if (this.initObj.parent) {
                this.targetObject = this.initObj.parent.getObjectByName(this.initObj.targetObjectName);
            } else {
                this.targetObject = this.initObj.context.vLabScene.getObjectByName(this.initObj.targetObjectName);
            }

            this.targetObject.add(this.handlerSprite);

            this.initObj.context.webGLContainerEventsSubcribers.mouseup[this.initObj.targetObjectName + "vLabSceneMouseUp"] = this.vLabSceneMouseUp;
            this.initObj.context.webGLContainerEventsSubcribers.touchend[this.initObj.targetObjectName + "vLabSceneTouchEnd"] = this.vLabSceneTouchEnd;

            console.log("DetailedView initialized for " + this.initObj.targetObjectName);
        }

        vLabSceneMouseUp(event) {
            // console.log(self.initObj.targetObjectName + "vLabSceneMouseUp", event);
            self.interactionEvent();
        }

        vLabSceneTouchEnd(event) {
            // console.log(self.initObj.targetObjectName + "vLabSceneTouchEnd", event);
            self.interactionEvent();
        }

        interactionEvent() {
            if (self.initObj.context.defaultCameraControls.type !== 'orbit' || self.initObj.context.paused || self.initObj.context.defaultCameraControls.zoomMode) {
                return;
            }
            self.initObj.context.helpersRaycaster.setFromCamera(self.initObj.context.mouseCoordsRaycaster, self.initObj.context.defaultCamera);

            var intersectObjects = self.initObj.context.interactivesSuppressorsObjects;
            intersectObjects.push(self.handlerSprite);

            var intersects = self.initObj.context.helpersRaycaster.intersectObjects(intersectObjects);

            if (intersects.length > 0) {
                console.log(intersects[0].object.name);
            }
        }
}