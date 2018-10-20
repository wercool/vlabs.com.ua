import * as THREE               from 'three';
import * as TWEEN               from 'tween.js';
import * as StringUtils         from '../../vlabs.core/utils/string.utils.js';

export default class WireHelper {
    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;

        var textureLoader = new THREE.TextureLoader();

        if (this.initObj.sourceThumb == undefined) {
            console.error(this.initObj.name + ' WireHelper wire Source Thumb is not defined');
            return undefined;
        }
        if (this.initObj.targetThumb == undefined) {
            console.error(this.initObj.name + ' WireHelper wire Target Thumb is not defined');
            return undefined;
        }

        Promise.all([
            textureLoader.load(this.initObj.sourceThumb),
            textureLoader.load(this.initObj.targetThumb),
        ])
        .then((result) => {
            this.sourceThumbSpriteTexture = result[0];
            this.targetThumbSpriteTexture = result[1];

            this.initialize();
        })
        .catch(error => {
            console.error(error);
        });
    }

    initialize() {
        this.sourceThumbSpriteMaterial = new THREE.SpriteMaterial({
            map: this.sourceThumbSpriteTexture,
            rotation: this.initObj.sourceThumbRotation ? this.initObj.sourceThumbRotation : 0.0,
            depthTest: this.initObj.sourceThumbDepthTest !== undefined ? this.initObj.sourceThumbDepthTest : true,
            depthWrite: this.initObj.sourceThumbDepthTest !== undefined ? this.initObj.sourceThumbDepthTest : true,
        });
        this.sourceThumbSprite = new THREE.Sprite(this.sourceThumbSpriteMaterial);
        this.sourceThumbSprite.name = this.initObj.name + "WireSourceHelper";
        this.sourceThumbSprite.scale.copy(this.initObj.sourceThumbScale ? this.initObj.sourceThumbScale : new THREE.Vector3(1.0, 1.0, 1.0));
        this.sourceThumbSprite.visible = false;

        this.targetThumbSpriteMaterial = new THREE.SpriteMaterial({
            map: this.targetThumbSpriteTexture,
            rotation: this.initObj.targetThumbRotation ? this.initObj.targetThumbRotation : 0.0,
            depthTest: this.initObj.targetThumbDepthTest !== undefined ? this.initObj.targetThumbDepthTest : true,
            depthWrite: this.initObj.targetThumbDepthTest !== undefined ? this.initObj.targetThumbDepthTest : true,
        });
        this.targetThumbSprite = new THREE.Sprite(this.targetThumbSpriteMaterial);
        this.targetThumbSprite.name = this.initObj.name + "WireTargetHelper";
        this.targetThumbSprite.scale.copy(this.initObj.targetThumbScale ? this.initObj.targetThumbScale : new THREE.Vector3(1.0, 1.0, 1.0));
        this.targetThumbSprite.visible = false;

        if (this.initObj.visible !== undefined) {
            this.sourceThumbSprite.visible = this.initObj.visible;
            this.targetThumbSprite.visible = this.initObj.visible;
        }

        if (this.initObj.object) {
            this.initObj.object.add(this.sourceThumbSprite);
            this.initObj.object.add(this.targetThumbSprite);
            if (this.initObj.sourceThumbRelPos) {
                this.sourceThumbSprite.position.add(this.initObj.sourceRelPos).add(this.initObj.sourceThumbRelPos);
            }
            if (this.initObj.targetThumbRelPos) {
                this.targetThumbSprite.position.add(this.initObj.targetRelPos).add(this.initObj.targetThumbRelPos);
            }
        } else {
            console.error(this.initObj.name + ' WireHelper target wire mesh is not defined');
            return;
        }


        var lineMaterial = new THREE.LineBasicMaterial( {
            color: 0xffffff,
            linewidth: 1.5,
            depthTest: false
        });

        if (this.initObj.sourceRelPos.distanceTo(this.initObj.targetRelPos) > 0.01) {
            var sourceToTargetThumbsLineGeometry = new THREE.Geometry();
            sourceToTargetThumbsLineGeometry.vertices.push(
                this.initObj.sourceRelPos,
                this.initObj.targetRelPos
            );
            this.sourceToTargetThumbsLine = new THREE.Line(sourceToTargetThumbsLineGeometry, lineMaterial);
            this.initObj.object.add(this.sourceToTargetThumbsLine);
            this.sourceToTargetThumbsLine.visible = false;
        }

        // if (this.initObj.sourceRelPos.distanceTo(this.sourceThumbSprite.position) > 0.01) {
        //     var sourceThumbLineGeometry = new THREE.Geometry();
        //     sourceThumbLineGeometry.vertices.push(
        //         this.initObj.sourceRelPos,
        //         this.sourceThumbSprite.position
        //     );
        //     this.sourceThumbLine = new THREE.Line(sourceThumbLineGeometry, lineMaterial);
        //     this.initObj.object.add(this.sourceThumbLine);
        // }

        // if (this.initObj.targetRelPos.distanceTo(this.targetThumbSprite.position) > 0.05) {
        //     var targetThumbLineGeometry = new THREE.Geometry();
        //     targetThumbLineGeometry.vertices.push(
        //         this.initObj.targetRelPos,
        //         this.targetThumbSprite.position
        //     );
        //     this.targetThumbLine = new THREE.Line(targetThumbLineGeometry, lineMaterial);
        //     this.initObj.object.add(this.targetThumbLine);
        // }

        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.mouseup[this.initObj.name + "_" + StringUtils.getRandomString(8) + "vLabSceneMouseUp"] = 
        {
            callback: this.onVLabSceneMouseUp,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchend[this.initObj.name + "_" + StringUtils.getRandomString(8) + "vLabSceneTouchEnd"] = 
        {
            callback: this.onVLabSceneTouchEnd,
            instance: this
        };

        console.log("WireHelper for the wire " + this.initObj.object.name + " initialized");
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
        if (this.context.paused 
         || this.sourceThumbSprite == undefined 
         || this.targetThumbSprite == undefined
         || this.context.wireHelperShown !== undefined) {
            return;
        }

        this.context.helpersRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);

        var intersectObjects = this.context.interactivesSuppressorsObjects.slice();

        intersectObjects = intersectObjects.concat(this.initObj.object);
        intersectObjects = intersectObjects.concat(this.sourceThumbSprite);
        intersectObjects = intersectObjects.concat(this.targetThumbSprite);

        var intersects = this.context.helpersRaycaster.intersectObjects(intersectObjects);

        if (intersects.length > 0) {
            if (intersects[0].object == this.initObj.object
             || intersects[0].object == this.sourceThumbSprite
             || intersects[0].object == this.targetThumbSprite) {
                this.showHelpers();
            }
        }
    }

    showHelpers() {
        this.context.wireHelperShown = true;
        if (this.thumbsDisappearTimeout !== undefined) clearTimeout(this.thumbsDisappearTimeout);
        if(this.thumbsDisappearTween !== undefined) {
            this.thumbsDisappearTween.stop();
        }

        this.sourceThumbSprite.material.opacity = 1.0;
        this.targetThumbSprite.material.opacity = 1.0;
        this.sourceThumbSprite.visible = true;
        this.targetThumbSprite.visible = true;
        this.sourceToTargetThumbsLine.visible = true;

        let self = this;
        this.thumbsDisappearTimeout = setTimeout(() => {
            self.thumbsDisappearTween = new TWEEN.Tween(self.sourceThumbSprite.material)
            .to({ opacity: 0.0 }, 3000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                self.targetThumbSprite.material.opacity = self.sourceThumbSprite.material.opacity;
            })
            .onComplete(() => {
                self.sourceThumbSprite.visible = false;
                self.targetThumbSprite.visible = false;
                self.sourceToTargetThumbsLine.visible = false;
                self.context.wireHelperShown = undefined;
            })
            .start();
        }, 10000);
    }
}