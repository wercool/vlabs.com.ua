import * as THREE           from 'three';
import VLab                 from '../../../vlabs.core/vlab';

export default class ReversingValveEF17BZ251 {
    /*
    initObj {
        "context": VLab,
    }
    */
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.pos = initObj.pos;

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("/vlabs.items/hvac/reversingValveEF17BZ251/reversingValveEF17BZ251.json", "reversingValveEF17BZ251").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }

            if (this.initObj.detailedView) {
                this.initObj.detailedView.addVLabItem(this);
            } else {
                this.context.vLabScene.add(this.model);
            }

            if (this.pos) {
                this.model.position.copy(this.pos);
            } else {r
                console.error("Reversing Valve EF17BZ251 is not set");
            }

        }).catch(error => {
            console.error(error);
        });
    }

    setupEnvMaterials(materialsObj) {
        var textureLoader = new THREE.TextureLoader();

        var reversingValveEF17BZ251Tube = this.model.parent.getObjectByName("reversingValveEF17BZ251Tube");
        reversingValveEF17BZ251Tube.material.envMap = materialsObj.envMap;
        reversingValveEF17BZ251Tube.material.combine = THREE.MixOperation;
        reversingValveEF17BZ251Tube.material.reflectivity = 0.075;
        reversingValveEF17BZ251Tube.material.needsUpdate = true;

        if (this.context.nature.bumpMaps) {
            Promise.all([
                textureLoader.load('/vlabs.items/hvac/reversingValveEF17BZ251/maps/brass-bump.jpg')
            ])
            .then((result) => {
                reversingValveEF17BZ251Tube.material.bumpMap = result[0];
                reversingValveEF17BZ251Tube.material.bumpScale = 0.000075;
                reversingValveEF17BZ251Tube.material.needsUpdate = true;
            })
            .catch(error => {
                console.error(error);
            });
        }
        if (this.context.nature.alphaMaps) {
            Promise.all([
                textureLoader.load('/vlabs.items/hvac/reversingValveEF17BZ251/maps/reversingValveEF17BZ251TubeMaterialAlphaMap.jpg')
            ])
            .then((result) => {
                reversingValveEF17BZ251Tube.material.alphaMap = result[0];
                reversingValveEF17BZ251Tube.material.transparent = true;
                reversingValveEF17BZ251Tube.material.needsUpdate = true;
            })
            .catch(error => {
                console.error(error);
            });
        }

        var reversingValveEF17BZ251SmallValveFixture = this.model.parent.getObjectByName("reversingValveEF17BZ251SmallValveFixture");
        reversingValveEF17BZ251SmallValveFixture.material.envMap = materialsObj.envMap;
        reversingValveEF17BZ251SmallValveFixture.material.combine = THREE.MixOperation;
        reversingValveEF17BZ251SmallValveFixture.material.reflectivity = 0.05;
        reversingValveEF17BZ251SmallValveFixture.material.needsUpdate = true;

        if (this.context.nature.alphaMaps) {
            Promise.all([
                textureLoader.load('/vlabs.items/hvac/reversingValveEF17BZ251/maps/reversingValveEF17BZ251SmallValveFixtureMaterialAlpha.jpg')
            ])
            .then((result) => {
                reversingValveEF17BZ251SmallValveFixture.material.alphaMap = result[0];
                reversingValveEF17BZ251SmallValveFixture.material.transparent = true;
                reversingValveEF17BZ251SmallValveFixture.material.needsUpdate = true;
            })
            .catch(error => {
                console.error(error);
            });
        }

        var reversingValveEF17BZ251SmallValveCylinder = this.model.parent.getObjectByName("reversingValveEF17BZ251SmallValveCylinder");
        // if (this.context.nature.alphaMaps) {
        //     Promise.all([
        //         textureLoader.load('/vlabs.items/hvac/reversingValveEF17BZ251/maps/reversingValveEF17BZ251SmallValveCylinderMaterialAlpha.jpg')
        //     ])
        //     .then((result) => {
        //         reversingValveEF17BZ251SmallValveCylinder.material.alphaMap = result[0];
        //         reversingValveEF17BZ251SmallValveCylinder.material.transparent = true;
        //         reversingValveEF17BZ251SmallValveCylinder.material.needsUpdate = true;
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     });
        // }

        var reversingValveEF17BZ251CoilFixture = this.model.parent.getObjectByName("reversingValveEF17BZ251CoilFixture");
        reversingValveEF17BZ251CoilFixture.material.envMap = materialsObj.envMap;
        reversingValveEF17BZ251CoilFixture.material.combine = THREE.MixOperation;
        reversingValveEF17BZ251CoilFixture.material.reflectivity = 0.05;
        reversingValveEF17BZ251CoilFixture.material.needsUpdate = true;

        // var reversingValveEF17BZ251SmallValveFixtureP1 = this.model.parent.getObjectByName("reversingValveEF17BZ251SmallValveFixtureP1");
        // reversingValveEF17BZ251SmallValveFixtureP1.visible = false;

        var reversingValveEF17BZ251SmallValveCylinderP1 = this.model.parent.getObjectByName("reversingValveEF17BZ251SmallValveCylinderP1");
        reversingValveEF17BZ251SmallValveCylinderP1.visible = false;

        // console.log(reversingValveEF17BZ251Tube.material);
    }

    prepareInitialState() {
        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('/vlabs.assets/img/look-through.png'),
        ])
        .then((result) => {
            var lookThroughSpriteTexture = result[0];
            var lookThroughSpriteMaterial = new THREE.SpriteMaterial({
                map: lookThroughSpriteTexture,
                color: 0x0000ff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            var lookThroughSpriteMaterialRot = new THREE.SpriteMaterial({
                map: lookThroughSpriteTexture,
                color: 0x0000ff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true,
                rotation: Math.PI
            });

            this.reversingValveEF17BZ251TubeBackWallLookSprite = new THREE.Sprite(lookThroughSpriteMaterial);
            this.reversingValveEF17BZ251TubeBackWallLookSprite.name = "reversingValveEF17BZ251TubeBackWallLookThroughHandler";
            this.reversingValveEF17BZ251TubeBackWallLookSprite.scale.set(0.05, 0.025, 0.05);
            this.reversingValveEF17BZ251TubeBackWallLookSprite.position.x += 0.0;
            this.reversingValveEF17BZ251TubeBackWallLookSprite.position.y += -0.03;
            this.reversingValveEF17BZ251TubeBackWallLookSprite.position.z += 0.0;

            this.model.add(this.reversingValveEF17BZ251TubeBackWallLookSprite);

            this.reversingValveEF17BZ251SmallValveLookSprite = new THREE.Sprite(lookThroughSpriteMaterialRot);
            this.reversingValveEF17BZ251SmallValveLookSprite.name = "reversingValveEF17BZ251SmallValveLookSprite";
            this.reversingValveEF17BZ251SmallValveLookSprite.scale.set(0.05, 0.025, 0.05);
            this.reversingValveEF17BZ251SmallValveLookSprite.position.x += 0.0;
            this.reversingValveEF17BZ251SmallValveLookSprite.position.y += 0.05;
            this.reversingValveEF17BZ251SmallValveLookSprite.position.z += 0.0;

            this.model.add(this.reversingValveEF17BZ251SmallValveLookSprite);
        })
        .catch(error => {
            console.error(error);
        });
    }
}