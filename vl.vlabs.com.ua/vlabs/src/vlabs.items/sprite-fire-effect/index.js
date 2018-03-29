import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class SpriteFireEffect {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.clock = new THREE.Clock();
        this.prepareSprite();
    }

    prepareSprite() {
        var loader = new THREE.TextureLoader();
        var spriteURL = undefined;
        var spriteAltURL = undefined;
        switch (this.initObj.type) {
            case 'burning':
                spriteURL = '../vlabs.items/sprite-fire-effect/sprites/burning.png';
                spriteAltURL = '../vlabs.items/sprite-fire-effect/sprites/burning-alt.png';
                this.tilesHorizontal = 4;
                this.tilesVertical = 4;
                this.numberOfTiles = 16;
                this.tileDisplayDuration = 75;
                this.tileDisplayDurationAlt = 55;
                this.shiftY = -0.1;
                this.shiftYAlt = 0.0;
            break;
        }
        if (spriteURL) {
            var self = this;
            loader.load(
                spriteURL,
                // onLoad callback
                function(loadedTexture) {
                    self.texture = loadedTexture;
                    self.texture.wrapS = self.texture.wrapT = THREE.RepeatWrapping; 
                    self.texture.repeat.set(1 / self.tilesHorizontal, 1 / self.tilesVertical);
                    self.spriteMaterial = new THREE.SpriteMaterial({
                        map: self.texture,
                        blending: THREE.AdditiveBlending,
                        depthTest: true,
                        transparent: true,
                        opacity: 0.75
                    });

                    if (self.initObj.type === 'burning') {
                        loader.load(
                            spriteAltURL,
                            // onLoad callback
                            function(loadedTexture) {
                                self.textureAlt = loadedTexture;
                                self.textureAlt.needsUpdate = true;
                                self.textureAlt.wrapS = self.textureAlt.wrapT = THREE.RepeatWrapping; 
                                self.textureAlt.repeat.set(1 / self.tilesHorizontal, 1 / self.tilesVertical);
                                self.spriteMaterial1 = new THREE.SpriteMaterial({
                                    map: self.textureAlt,
                                    blending: THREE.AdditiveBlending,
                                    depthTest: true
                                });
    
    
                                self.initializeEffect();
                            },
                            // onError callback
                            function (err) {
                                console.error('An error happened.', err);
                            }
                        );
                    } else {
                        self.initializeEffect();
                    }

                },
                // onError callback
                function (err) {
                    console.error('An error happened.', err);
                }
            );
        }
    }

    initializeEffect() {
        this.sprite = new THREE.Sprite(this.spriteMaterial);
        this.sprite.visible = false;
        this.initObj.context.vLabScene.add(this.sprite);
        if (this.initObj.scale) {
            this.sprite.scale.copy(this.initObj.scale);
        }
        if (this.initObj.pos) {
            this.sprite.position.set(this.initObj.pos.x,
                                     this.initObj.pos.y + 0.5 * this.sprite.scale.y + this.shiftY * this.sprite.scale.y,
                                     this.initObj.pos.z);
        }
        if (this.initObj.type === 'burning') {
            this.spriteAlt = new THREE.Sprite(this.spriteMaterial1);
            this.spriteAlt.visible = false;
            this.initObj.context.vLabScene.add(this.spriteAlt);
            if (this.initObj.scale) {
                this.spriteAlt.scale.copy(this.initObj.scale);
            }
            this.spriteAlt.scale.x *= 0.65;
            this.spriteAlt.scale.y *= 0.65;
            this.spriteAlt.position.set(this.initObj.pos.x, 
                                        this.initObj.pos.y + 0.5 * this.spriteAlt.scale.y + this.shiftYAlt * this.spriteAlt.scale.y, 
                                        this.initObj.pos.z);
        }
    }

    start() {
        this.sprite.visible = true;
        this.currentDisplayTime = 0;
        this.lightEffectTime = 0;
        this.currentTile = 0;
        if (this.initObj.type === 'burning') {
            this.spriteAlt.visible = true;
            this.currentDisplayTimeAlt = 0;
            this.currentTileAlt = 0;
            this.initObj.context.ambientLight.color = new THREE.Color(0x775a00);
        }
        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.renderframe["SpriteFireEffect" + this.initObj.name + "vLabSceneRenderFrame"] = 
        {
            callback: this.onRedererFrameEvent,
            instance: this
        };
    }

    stop() {
        this.sprite.visible = false;
        if (this.initObj.type === 'burning') {
            this.spriteAlt.visible = false;
        }
        delete this.context.webGLContainerEventsSubcribers.renderframe["SpriteFireEffect" + this.initObj.name + "vLabSceneRenderFrame"];
    }

    onRedererFrameEvent(event) {
        var self = this;
        if (self.sprite.visible) {
            var delta = self.clock.getDelta() * 1000;
            self.currentDisplayTime += delta;
            self.lightEffectTime += delta;
            if (self.currentDisplayTime > self.tileDisplayDuration)
            {
                self.currentDisplayTime = 0;

                self.currentTile++;
                if (self.currentTile == self.numberOfTiles) self.currentTile = 0;
                var currentColumn = self.currentTile % self.tilesHorizontal;
                var currentRow = Math.floor( self.currentTile / self.tilesHorizontal );

                self.texture.offset.x = currentColumn / self.tilesHorizontal;
                self.texture.offset.y = currentRow / self.tilesVertical;
            }
            if (self.initObj.type === 'burning') {

                if (self.lightEffectTime > 50) {
                    self.initObj.context.ambientLight.intensity = 0.2 + 0.5 * Math.random();
                    self.lightEffectTime = 0;
                }

                self.currentDisplayTimeAlt += delta;
                if (self.currentDisplayTimeAlt > self.tileDisplayDurationAlt)
                {
                    self.currentDisplayTimeAlt = 0;

                    self.currentTileAlt++;
                    if (self.currentTileAlt == self.numberOfTiles) self.currentTileAlt = 0;
                    var currentColumn = self.currentTileAlt % self.tilesHorizontal;
                    var currentRow = Math.floor( self.currentTileAlt / self.tilesHorizontal );

                    self.textureAlt.offset.x = currentColumn / self.tilesHorizontal;
                    self.textureAlt.offset.y = currentRow / self.tilesVertical;
                }
            }
        }
    }
}