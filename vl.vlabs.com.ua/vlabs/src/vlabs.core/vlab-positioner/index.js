import * as THREE               from 'three';
import * as TWEEN               from 'tween.js';

export default class VLabPositioner {
    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;

        this.reseted = false;

        var textureLoader = new THREE.TextureLoader();

        this.active = this.initObj.active !== undefined ? this.initObj.active : true;

        Promise.all([
            textureLoader.load('../vlabs.assets/img/position.png'),
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
        this.handlerSpriteMaterial = new THREE.SpriteMaterial({
            map: this.handlerSpriteTexture,
            color: 0xffff00,
            blending: THREE.NormalBlending,
            transparent: true,
            opacity: 0.3,
            rotation: 0.0,
            depthTest: true,
            depthWrite: true
        });

        this.handlerSprite = new THREE.Sprite(this.handlerSpriteMaterial);
        this.handlerSprite.name = this.initObj.name + "VLabPositionerSprite";
        this.handlerSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));
        this.handlerSprite.position.copy(this.initObj.pos);

        this.context.vLabScene.add(this.handlerSprite);

        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.mouseup[this.handlerSprite.name + "vLabSceneMouseUp"] = 
        {
            callback: this.onVLabSceneMouseUp,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchend[this.handlerSprite.name + "vLabSceneTouchEnd"] = 
        {
            callback: this.onVLabSceneTouchEnd,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.resetview["VLabPositioner" + this.initObj.name + "vLabSceneResetView"] = 
        {
            callback: this.onVLabSceneResetView,
            instance: this
        };

        this.context.helpers.VLabPositioners.push(this);

        this.setActive(this.active);

        // var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3());
        // arrowHelper.setColor(new THREE.Color(0x00ff00));
        // this.context.vLabScene.add(arrowHelper);
        // arrowHelper.position.copy(this.initObj.pos);
        // var dir = this.initObj.target.clone().sub(this.initObj.pos.clone());
        // arrowHelper.setDirection(dir.normalize());
        // arrowHelper.setLength(this.initObj.pos.distanceTo(this.initObj.target), 0.02, 0.01);

        console.log("VLabPositioner initialized");
    }

    setActive(state) {
        this.active = state;
        this.handlerSprite.visible = !state;
        if (this.initObj.completeCallBack && this.active === true) {
            this.initObj.completeCallBack.call(this.context);
        }
    }

    onVLabSceneMouseUp(event) {
        // console.log("VLabLocator onVLabSceneMouseUp", event.type);
        this.interactionEvent();
    }

    onVLabSceneTouchEnd(event) {
        // console.log("VLabLocator onVLabSceneTouchEnd", event.type);
        this.interactionEvent();
    }

    interactionEvent() {
        if (this.active || this.context.defaultCameraControls.type !== 'orbit' || this.context.paused) {
            return;
        }
        if (this.reseted === true) {
            setTimeout(() => {this.reseted = false;}, 500);
            return;
        }
        this.context.helpersRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);

        var intersectObjects = this.context.interactivesSuppressorsObjects.slice();
        intersectObjects = intersectObjects.concat(this.handlerSprite);

        var intersects = this.context.helpersRaycaster.intersectObjects(intersectObjects);

        if (intersects.length > 0) {
            if (intersects[0].object == this.handlerSprite) {
                this.moveToPosition();
            }
        }
    }

    moveToPosition() {
        this.context.tooltipHide();

        new TWEEN.Tween(this.context.defaultCameraControls.target)
        .to({ x: this.initObj.target.x, y: this.initObj.target.y, z: this.initObj.target.z }, 750)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            this.context.defaultCameraControls.update();
        })
        .start();

        new TWEEN.Tween(this.context.defaultCameraControls.object.position)
        .to({ x: this.initObj.pos.x, y: this.initObj.pos.y, z: this.initObj.pos.z }, 1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            this.context.defaultCameraControls.update();
        })
        .onComplete(() => {
            for (var i = 0; i < this.context.helpers.VLabPositioners.length; i++) {
                if (this.context.helpers.VLabPositioners[i] != this) {
                    this.context.helpers.VLabPositioners[i].setActive(false);
                }
            }
            this.setActive(true);
        })
        .start();
    }

    onVLabSceneResetView() {
        if (!this.initObj.initial) {
            this.setActive(false);
        } else {
            this.setActive(true);
        }

        this.reseted = true;
    }
}