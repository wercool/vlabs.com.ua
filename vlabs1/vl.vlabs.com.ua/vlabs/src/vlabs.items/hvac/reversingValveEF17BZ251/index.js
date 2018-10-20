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

       this.itemName = this.initObj.itemName;

       this.accessableInteractiveELements = [];

       this.initialized = false;

       this.initObj.detailedView.addVLabItem(this);
       this.parent = this.initObj.detailedView;

    //    this.initialize();
    }

    initialize() {
        return new Promise((resolve, reject) => {
            this.context.loadVLabItem("../vlabs.items/hvac/reversingValveEF17BZ251/reversingValveEF17BZ251.json", "reversingValveEF17BZ251").then((scene) => {
                this.model = scene.children[0];
                if (this.initObj.name) {
                    this.model.name = this.initObj.name;
                }

                this.initialized = true;
                if (this.initObj.detailedView) {
                    this.initObj.detailedView.addVLabItem(this);
                    this.parent = this.initObj.detailedView;
                } else {
                    this.context.vLabScene.add(this.model);
                    this.parent = this.context;
                }

                resolve(this);

                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("Reversing Valve EF17BZ251 is not set");
                }

            }).catch(error => {
                console.error(error);
                reject('An error happened while loading VLab Item ' + this.itemName, error);
            });
        });
    }

    setupEnvMaterials(materialsObj) {
        if (!this.initialized) return;

        var textureLoader = new THREE.TextureLoader();

        var reversingValveEF17BZ251Tube = this.model.parent.getObjectByName("reversingValveEF17BZ251Tube");
        reversingValveEF17BZ251Tube.material.envMap = materialsObj.envMap;
        reversingValveEF17BZ251Tube.material.combine = THREE.MixOperation;
        reversingValveEF17BZ251Tube.material.reflectivity = 0.055;
        reversingValveEF17BZ251Tube.material.needsUpdate = true;

        if (this.context.nature.bumpMaps) {
            Promise.all([
                textureLoader.load('../vlabs.items/hvac/reversingValveEF17BZ251/maps/brass-bump.jpg'),
            ])
            .then((result) => {
                var texture = result[0];
                reversingValveEF17BZ251Tube.material.bumpMap = texture;
                reversingValveEF17BZ251Tube.material.bumpScale = 0.01;
                reversingValveEF17BZ251Tube.material.needsUpdate = true;
            })
            .catch(error => {
                console.error(error);
            });
        }

        if (this.context.nature.alphaMaps) {
            Promise.all([
                textureLoader.load('../vlabs.items/hvac/reversingValveEF17BZ251/maps/reversingValveEF17BZ251TubeMaterialAlphaMap.jpg')
            ])
            .then((result) => {
                this.reversingValveEF17BZ251TubeAlphaMap = result[0];
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
                textureLoader.load('../vlabs.items/hvac/reversingValveEF17BZ251/maps/reversingValveEF17BZ251SmallValveFixtureMaterialAlpha.jpg')
            ])
            .then((result) => {
                this.reversingValveEF17BZ251SmallValveFixtureAlphaMap = result[0];
            })
            .catch(error => {
                console.error(error);
            });
        }

        var reversingValveEF17BZ251SmallValveCylinder = this.model.parent.getObjectByName("reversingValveEF17BZ251SmallValveCylinder");

        var reversingValveEF17BZ251CoilFixture = this.model.parent.getObjectByName("reversingValveEF17BZ251CoilFixture");
        reversingValveEF17BZ251CoilFixture.material.envMap = materialsObj.envMap;
        reversingValveEF17BZ251CoilFixture.material.combine = THREE.MixOperation;
        reversingValveEF17BZ251CoilFixture.material.reflectivity = 0.05;
        reversingValveEF17BZ251CoilFixture.material.needsUpdate = true;
    }

    prepareInitialState() {
        if (!this.initialized) return;

        var textureLoader = new THREE.TextureLoader();

        var reversingValveEF17BZ251PlungeCapLookThrough = this.model.parent.getObjectByName("reversingValveEF17BZ251PlungeCapLookThrough");
        reversingValveEF17BZ251PlungeCapLookThrough.visible = false;

        this.reversingValveEF17BZ251CoilCore = this.model.getObjectByName("reversingValveEF17BZ251CoilCore");
        this.reversingValveEF17BZ251InTubeHihgPressure = this.model.getObjectByName("reversingValveEF17BZ251InTubeHihgPressure");
        this.reversingValveEF17BZ251InTubeLowPressure = this.model.getObjectByName("reversingValveEF17BZ251InTubeLowPressure");

        this.reversingValveEF17BZ251InTubeHihgPressure.visible = false;
        this.reversingValveEF17BZ251InTubeLowPressure.visible = false;

        this.reversingValveEF17BZ251PlungeConsole = this.model.getObjectByName("reversingValveEF17BZ251PlungeConsole");

        this.reversingValveEF17BZ251InTubeHihgPressure24VOff = this.model.getObjectByName("reversingValveEF17BZ251InTubeHihgPressure24VOff");
        this.reversingValveEF17BZ251InTubeLowPressure24VOff = this.model.getObjectByName("reversingValveEF17BZ251InTubeLowPressure24VOff");

        Promise.all([
            textureLoader.load('../vlabs.assets/img/look-through.png'),
            textureLoader.load('../vlabs.items/hvac/reversingValveEF17BZ251/sprites/24VOn.png'),
            textureLoader.load('../vlabs.items/hvac/reversingValveEF17BZ251/sprites/24VOff.png'),
        ])
        .then((result) => {
            var lookThroughSpriteTexture = result[0];
            var lookThroughSpriteMaterial = new THREE.SpriteMaterial({
                map: lookThroughSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.45,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.reversingValveEF17BZ251PlungeCapLookSprite = new THREE.Sprite(lookThroughSpriteMaterial);
            this.reversingValveEF17BZ251PlungeCapLookSprite.name = "reversingValveEF17BZ251PlungeCapLookSprite";
            this.reversingValveEF17BZ251PlungeCapLookSprite.scale.set(0.015, 0.015, 0.015);
            this.reversingValveEF17BZ251PlungeCapLookSprite.position.x -= 0.015;
            this.reversingValveEF17BZ251PlungeCapLookSprite.position.y += -0.025;
            this.reversingValveEF17BZ251PlungeCapLookSprite.position.z += 0.0;
            this.reversingValveEF17BZ251PlungeCapLookSprite.mousePressHandler = function() {
                var reversingValveEF17BZ251PlungeCap = this.model.parent.getObjectByName("reversingValveEF17BZ251PlungeCap");
                var reversingValveEF17BZ251PlungeCapLookThrough = this.model.parent.getObjectByName("reversingValveEF17BZ251PlungeCapLookThrough");
                if (reversingValveEF17BZ251PlungeCapLookThrough.visible) {
                    reversingValveEF17BZ251PlungeCap.visible = true;
                    reversingValveEF17BZ251PlungeCapLookThrough.visible = false;
                } else {
                    reversingValveEF17BZ251PlungeCap.visible = false;
                    reversingValveEF17BZ251PlungeCapLookThrough.visible = true;
                }
            };
            this.model.add(this.reversingValveEF17BZ251PlungeCapLookSprite);
            this.reversingValveEF17BZ251PlungeCapLookSprite.visible = false;
            this.accessableInteractiveELements.push(this.reversingValveEF17BZ251PlungeCapLookSprite);

            this.reversingValveEF17BZ251TubeBackWallLookSprite = new THREE.Sprite(lookThroughSpriteMaterial);
            this.reversingValveEF17BZ251TubeBackWallLookSprite.name = "reversingValveEF17BZ251TubeBackWallLookThroughHandler";
            this.reversingValveEF17BZ251TubeBackWallLookSprite.scale.set(0.02, 0.02, 0.02);
            this.reversingValveEF17BZ251TubeBackWallLookSprite.position.x += 0.0;
            this.reversingValveEF17BZ251TubeBackWallLookSprite.position.y += -0.045;
            this.reversingValveEF17BZ251TubeBackWallLookSprite.position.z += 0.0;
            this.reversingValveEF17BZ251TubeBackWallLookSprite.mousePressHandler = function() {
                var reversingValveEF17BZ251Tube = this.model.parent.getObjectByName("reversingValveEF17BZ251Tube");
                if (reversingValveEF17BZ251Tube.material.transparent) {
                    reversingValveEF17BZ251Tube.material.alphaMap = undefined;
                    reversingValveEF17BZ251Tube.material.transparent = false;
                    this.reversingValveEF17BZ251PlungeCapLookSprite.visible = false;
                    this.reversingValveEF17BZ251TubeBackWallLookSprite.material.opacity = 0.45;
                } else {
                    reversingValveEF17BZ251Tube.material.alphaMap = this.reversingValveEF17BZ251TubeAlphaMap;
                    reversingValveEF17BZ251Tube.material.transparent = true;
                    this.reversingValveEF17BZ251PlungeCapLookSprite.visible = true;
                    this.reversingValveEF17BZ251TubeBackWallLookSprite.material.opacity = 0.1;
                }
                reversingValveEF17BZ251Tube.material.needsUpdate = true;
            };
            this.model.add(this.reversingValveEF17BZ251TubeBackWallLookSprite);
            this.accessableInteractiveELements.push(this.reversingValveEF17BZ251TubeBackWallLookSprite);

            this.reversingValveEF17BZ251SmallValveLookSprite = new THREE.Sprite(lookThroughSpriteMaterial);
            this.reversingValveEF17BZ251SmallValveLookSprite.name = "reversingValveEF17BZ251SmallValveLookSprite";
            this.reversingValveEF17BZ251SmallValveLookSprite.scale.set(0.01, 0.01, 0.01);
            this.reversingValveEF17BZ251SmallValveLookSprite.position.x += 0.0;
            this.reversingValveEF17BZ251SmallValveLookSprite.position.y += 0.04;
            this.reversingValveEF17BZ251SmallValveLookSprite.position.z += 0.01;
            this.reversingValveEF17BZ251SmallValveLookSprite.mousePressHandler = function() {
                var reversingValveEF17BZ251SmallValveFixture = this.model.parent.getObjectByName("reversingValveEF17BZ251SmallValveFixture");
                var reversingValveEF17BZ251SmallValveCylinderP1 = this.model.parent.getObjectByName("reversingValveEF17BZ251SmallValveCylinderP1");
                // var reversingValveEF17BZ251CoilCoreP1 = this.model.parent.getObjectByName("reversingValveEF17BZ251CoilCoreP1");

                if (reversingValveEF17BZ251SmallValveCylinderP1.visible) {
                    reversingValveEF17BZ251SmallValveFixture.material.alphaMap = this.reversingValveEF17BZ251SmallValveFixtureAlphaMap;
                    reversingValveEF17BZ251SmallValveFixture.material.transparent = true;
    
                    reversingValveEF17BZ251SmallValveCylinderP1.visible = false;
            
                    // reversingValveEF17BZ251CoilCoreP1.visible = false;

                    this.reversingValveEF17BZ251SmallValveLookSprite.material.opacity = 0.1;
                } else {
                    reversingValveEF17BZ251SmallValveFixture.material.alphaMap = undefined;
                    reversingValveEF17BZ251SmallValveFixture.material.transparent = false;
    
                    reversingValveEF17BZ251SmallValveCylinderP1.visible = true;
            
                    // reversingValveEF17BZ251CoilCoreP1.visible = true;

                    this.reversingValveEF17BZ251SmallValveLookSprite.material.opacity = 0.45;
                }
                reversingValveEF17BZ251SmallValveFixture.material.needsUpdate = true;
            };

            this.model.add(this.reversingValveEF17BZ251SmallValveLookSprite);
            this.accessableInteractiveELements.push(this.reversingValveEF17BZ251SmallValveLookSprite);


            this.on24VTexture = result[1];
            this.off24VTexture = result[2];
            this.onOff24VSpriteMaterial = new THREE.SpriteMaterial({
                map: this.off24VTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.45,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.onOff24VSprite = new THREE.Sprite(this.onOff24VSpriteMaterial);
            this.onOff24VSprite.name = "onOff24VSprite";
            this.onOff24VSprite.scale.set(0.02, 0.02, 0.02);
            this.onOff24VSprite.position.add(new THREE.Vector3(0.04, 0.0, -0.028));
            this.onOff24VSprite.mousePressHandler = function() {
                if (this.onOff24VSpriteMaterial.map == this.off24VTexture) {
                    this.onOff24VSpriteMaterial.map = this.on24VTexture;
                    this.set24VOn();
                } else {
                    this.onOff24VSpriteMaterial.map = this.off24VTexture;
                    this.set24VOff();
                }
            };
            this.model.getObjectByName('reversingValveEF17BZ251Coil').add(this.onOff24VSprite);
            this.accessableInteractiveELements.push(this.onOff24VSprite);
        })
        .catch(error => {
            console.error(error);
        });

        var highPressureLineMaterial = new THREE.LineBasicMaterial({
            color: 0xff3d01,
            linewidth: 4.0
        });
        var highPressureMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});

        var lowPressureLineMaterial = new THREE.LineBasicMaterial({
            color: 0x046eff,
            linewidth: 4.0
        });
        var lowPressureMaterial = new THREE.MeshBasicMaterial({color: 0x046eff});

        // 24V On
        //High Pressure Main line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.0, 0.0, 0.15),
            new THREE.Vector3(0.005, 0.0, 0.025),
            new THREE.Vector3(0.032, 0.0, 0.0),
            new THREE.Vector3(0.035, 0.0, -0.15),
        ]);
        var points = curve.getPoints(50);
        var highPressureLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.highPressureMainLine1_24On = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine2_24On = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine2_24On.position.y += 0.002;
        this.highPressureMainLine2_24On.position.x -= 0.002;
        this.highPressureMainLine3_24On = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine3_24On.position.y += 0.004;
        this.highPressureMainLine3_24On.position.x -= 0.004;
        this.highPressureMainLine4_24On = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine4_24On.position.y -= 0.002;
        this.highPressureMainLine4_24On.position.x -= 0.002;
        this.highPressureMainLine5_24On = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine5_24On.position.y -= 0.004;
        this.highPressureMainLine5_24On.position.x -= 0.004;

        this.model.add(this.highPressureMainLine1_24On);
        this.model.add(this.highPressureMainLine2_24On);
        this.model.add(this.highPressureMainLine3_24On);
        this.model.add(this.highPressureMainLine4_24On);
        this.model.add(this.highPressureMainLine5_24On);

        this.highPressureMainLine1_24On.visible = false;
        this.highPressureMainLine2_24On.visible = false;
        this.highPressureMainLine3_24On.visible = false;
        this.highPressureMainLine4_24On.visible = false;
        this.highPressureMainLine5_24On.visible = false;

        //High Pressure Small line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.0, 0.0, 0.15),
            new THREE.Vector3(0.0, 0.0087, 0.05),
            new THREE.Vector3(0.0, 0.0193, 0.0493),
            new THREE.Vector3(0.0005, 0.0308, 0.0413),
            new THREE.Vector3(0.0, 0.0356, 0.005),
            new THREE.Vector3(0.006, 0.037, 0.0045),
            new THREE.Vector3(0.0054, 0.037, -0.008),
        ]);
        var points = curve.getPoints(50);
        var highPressureSmallLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.highPressureSmallLine1_24VOn = new THREE.Line(highPressureSmallLineGeometry, highPressureLineMaterial);
        this.model.add(this.highPressureSmallLine1_24VOn);
        this.highPressureSmallLine1_24VOn.visible = false;

        //High Pressure Intube line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.103, 0.0121, -0.011),
            new THREE.Vector3(0.103, -0.002, -0.005),
            new THREE.Vector3(0.09, -0.002, -0.005),
        ]);
        var points = curve.getPoints(20);
        var highPressureInTubeLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.highPressureInTubeLineLine_24VOn = new THREE.Line(highPressureInTubeLineGeometry, highPressureLineMaterial);
        this.model.add(this.highPressureInTubeLineLine_24VOn);
        this.highPressureInTubeLineLine_24VOn.visible = false;

        var highPressureInTubeLineEndConeGeometry = new THREE.ConeGeometry(0.004, 0.01, 16, 8);
        highPressureInTubeLineEndConeGeometry.rotateZ(Math.PI / 2);
        var highPressureInTubeLineEndCone = new THREE.Mesh(highPressureInTubeLineEndConeGeometry, highPressureMaterial);
        highPressureInTubeLineEndCone.position.copy(new THREE.Vector3(0.09, -0.002, -0.005));
        this.highPressureInTubeLineLine_24VOn.add(highPressureInTubeLineEndCone);

        //Low Pressure Main line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.035, 0.0, -0.15),
            new THREE.Vector3(-0.035, 0.0, 0.0),
            new THREE.Vector3(-0.0175, 0.0, 0.01),
            new THREE.Vector3(0.0, 0.0, 0.0),
            new THREE.Vector3(0.0, 0.0, -0.15),
        ]);
        var points = curve.getPoints(50);
        var lowPressureLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.lowPressureMainLine1_24VOn = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine2_24VOn = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine2_24VOn.position.y += 0.002;
        this.lowPressureMainLine2_24VOn.position.z += 0.002;
        this.lowPressureMainLine3_24VOn = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine3_24VOn.position.y += 0.004;
        this.lowPressureMainLine3_24VOn.position.z += 0.004;
        this.lowPressureMainLine4_24VOn = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine4_24VOn.position.y -= 0.002;
        this.lowPressureMainLine4_24VOn.position.z += 0.002;
        this.lowPressureMainLine5_24VOn = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine5_24VOn.position.y -= 0.004;
        this.lowPressureMainLine5_24VOn.position.z += 0.004;

        this.model.add(this.lowPressureMainLine1_24VOn);
        this.model.add(this.lowPressureMainLine2_24VOn);
        this.model.add(this.lowPressureMainLine3_24VOn);
        this.model.add(this.lowPressureMainLine4_24VOn);
        this.model.add(this.lowPressureMainLine5_24VOn);

        this.lowPressureMainLine1_24VOn.visible = false;
        this.lowPressureMainLine2_24VOn.visible = false;
        this.lowPressureMainLine3_24VOn.visible = false;
        this.lowPressureMainLine4_24VOn.visible = false;
        this.lowPressureMainLine5_24VOn.visible = false;

        //Low Pressure Intube line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.085, 0.0, 0.0),
            new THREE.Vector3(-0.102, 0.0, 0.0),
            new THREE.Vector3(-0.103, 0.0123, -0.0085),
        ]);
        var points = curve.getPoints(20);
        var lowPressureInTubeLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.lowPressureInTubeLineLine_24VOn = new THREE.Line(lowPressureInTubeLineGeometry, lowPressureLineMaterial);
        this.model.add(this.lowPressureInTubeLineLine_24VOn);
        this.lowPressureInTubeLineLine_24VOn.visible = false;

        var lowPressureInTubeLineEndConeGeometry = new THREE.ConeGeometry(0.003, 0.006, 16, 8);
        lowPressureInTubeLineEndConeGeometry.rotateZ(Math.PI / 2);
        var lowPressureInTubeLineEndCone = new THREE.Mesh(lowPressureInTubeLineEndConeGeometry, lowPressureMaterial);
        lowPressureInTubeLineEndCone.position.copy(new THREE.Vector3(-0.1, 0.0, 0.0));
        this.lowPressureInTubeLineLine_24VOn.add(lowPressureInTubeLineEndCone);




        // 24V Off
        //High Pressure Main line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.0, 0.0, 0.15),
            new THREE.Vector3(-0.005, 0.0, 0.025),
            new THREE.Vector3(-0.032, 0.0, 0.0),
            new THREE.Vector3(-0.035, 0.0, -0.15),
        ]);
        var points = curve.getPoints(50);
        var highPressureLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.highPressureMainLine1_24Off = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine2_24Off = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine2_24Off.position.y += 0.002;
        this.highPressureMainLine2_24Off.position.x += 0.002;
        this.highPressureMainLine3_24Off = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine3_24Off.position.y += 0.004;
        this.highPressureMainLine3_24Off.position.x += 0.004;
        this.highPressureMainLine4_24Off = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine4_24Off.position.y -= 0.002;
        this.highPressureMainLine4_24Off.position.x += 0.002;
        this.highPressureMainLine5_24Off = new THREE.Line(highPressureLineGeometry, highPressureLineMaterial);
        this.highPressureMainLine5_24Off.position.y -= 0.004;
        this.highPressureMainLine5_24Off.position.x += 0.004;

        this.model.add(this.highPressureMainLine1_24Off);
        this.model.add(this.highPressureMainLine2_24Off);
        this.model.add(this.highPressureMainLine3_24Off);
        this.model.add(this.highPressureMainLine4_24Off);
        this.model.add(this.highPressureMainLine5_24Off);

        this.highPressureMainLine1_24Off.visible = true;
        this.highPressureMainLine2_24Off.visible = true;
        this.highPressureMainLine3_24Off.visible = true;
        this.highPressureMainLine4_24Off.visible = true;
        this.highPressureMainLine5_24Off.visible = true;

        //Low Pressure Main line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.035, 0.0, -0.15),
            new THREE.Vector3(0.035, 0.0, 0.0),
            new THREE.Vector3(0.0175, 0.0, 0.01),
            new THREE.Vector3(0.0, 0.0, 0.0),
            new THREE.Vector3(0.0, 0.0, -0.15),
        ]);
        var points = curve.getPoints(50);
        var lowPressureLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.lowPressureMainLine1_24VOff = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine2_24VOff = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine2_24VOff.position.y -= 0.002;
        this.lowPressureMainLine2_24VOff.position.z += 0.002;
        this.lowPressureMainLine3_24VOff = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine3_24VOff.position.y -= 0.004;
        this.lowPressureMainLine3_24VOff.position.z += 0.004;
        this.lowPressureMainLine4_24VOff = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine4_24VOff.position.y += 0.002;
        this.lowPressureMainLine4_24VOff.position.z += 0.002;
        this.lowPressureMainLine5_24VOff = new THREE.Line(lowPressureLineGeometry, lowPressureLineMaterial);
        this.lowPressureMainLine5_24VOff.position.y += 0.004;
        this.lowPressureMainLine5_24VOff.position.z += 0.004;

        this.model.add(this.lowPressureMainLine1_24VOff);
        this.model.add(this.lowPressureMainLine2_24VOff);
        this.model.add(this.lowPressureMainLine3_24VOff);
        this.model.add(this.lowPressureMainLine4_24VOff);
        this.model.add(this.lowPressureMainLine5_24VOff);

        this.lowPressureMainLine1_24VOff.visible = true;
        this.lowPressureMainLine2_24VOff.visible = true;
        this.lowPressureMainLine3_24VOff.visible = true;
        this.lowPressureMainLine4_24VOff.visible = true;
        this.lowPressureMainLine5_24VOff.visible = true;

        //High Pressure Intube line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.103, 0.0121, -0.0088),
            new THREE.Vector3(-0.103, -0.002, -0.005),
            new THREE.Vector3(-0.09, -0.002, -0.005),
        ]);
        var points = curve.getPoints(20);
        var highPressureInTubeLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.highPressureInTubeLineLine_24VOff = new THREE.Line(highPressureInTubeLineGeometry, highPressureLineMaterial);
        this.model.add(this.highPressureInTubeLineLine_24VOff);
        this.highPressureInTubeLineLine_24VOff.visible = true;

        var highPressureInTubeLineEndConeGeometry = new THREE.ConeGeometry(0.004, 0.01, 16, 8);
        highPressureInTubeLineEndConeGeometry.rotateZ(-Math.PI / 2);
        var highPressureInTubeLineEndCone = new THREE.Mesh(highPressureInTubeLineEndConeGeometry, highPressureMaterial);
        highPressureInTubeLineEndCone.position.copy(new THREE.Vector3(-0.09, -0.002, -0.005));
        this.highPressureInTubeLineLine_24VOff.add(highPressureInTubeLineEndCone);

        //Low Pressure Intube line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.085, 0.0, 0.0),
            new THREE.Vector3(0.102, 0.0, 0.0),
            new THREE.Vector3(0.103, 0.0123, -0.0095),
        ]);
        var points = curve.getPoints(20);
        var lowPressureInTubeLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.lowPressureInTubeLineLine_24VOff = new THREE.Line(lowPressureInTubeLineGeometry, lowPressureLineMaterial);
        this.model.add(this.lowPressureInTubeLineLine_24VOff);
        this.lowPressureInTubeLineLine_24VOff.visible = true;

        var lowPressureInTubeLineEndConeGeometry = new THREE.ConeGeometry(0.003, 0.006, 16, 8);
        lowPressureInTubeLineEndConeGeometry.rotateZ(-Math.PI / 2);
        var lowPressureInTubeLineEndCone = new THREE.Mesh(lowPressureInTubeLineEndConeGeometry, lowPressureMaterial);
        lowPressureInTubeLineEndCone.position.copy(new THREE.Vector3(0.1, 0.0, 0.0));
        this.lowPressureInTubeLineLine_24VOff.add(lowPressureInTubeLineEndCone);

        //High Pressure Small line
        var curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.0, 0.0, 0.15),
            new THREE.Vector3(0.0, 0.0087, 0.05),
            new THREE.Vector3(0.0, 0.0193, 0.0493),
            new THREE.Vector3(-0.0005, 0.0308, 0.0413),
            new THREE.Vector3(0.0, 0.0356, 0.005),
            new THREE.Vector3(-0.006, 0.037, 0.004),
            new THREE.Vector3(-0.00595, 0.039, 0.003),
            new THREE.Vector3(-0.0057, 0.0405, 0.0025),
            new THREE.Vector3(-0.0054, 0.0405, 0.0015),
            new THREE.Vector3(-0.0055, 0.0405, -0.0025),
            new THREE.Vector3(-0.0055, 0.036, -0.007),
            new THREE.Vector3(-0.007, 0.035, -0.008),
        ]);
        var points = curve.getPoints(50);
        var highPressureSmallLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        this.highPressureSmallLine1_24VOff = new THREE.Line(highPressureSmallLineGeometry, highPressureLineMaterial);
        this.model.add(this.highPressureSmallLine1_24VOff);
        this.highPressureSmallLine1_24VOff.visible = true;
    }

    onReleaseGesture() {
        this.parent.iteractionRaycaster.setFromCamera(this.parent.mouseCoordsRaycaster, this.parent.defaultCamera);
        var interactionObjectIntersects = this.parent.iteractionRaycaster.intersectObjects(this.accessableInteractiveELements);
        if (interactionObjectIntersects.length > 0) {
            if (interactionObjectIntersects[0].object.mousePressHandler) {
                interactionObjectIntersects[0].object.mousePressHandler.call(this);
            }
        }
    }

    set24VOn() {
        this.reversingValveEF17BZ251CoilCore.position.copy(new THREE.Vector3(0.000226, -0.00045, -0.023));
        this.reversingValveEF17BZ251PlungeConsole.position.copy(new THREE.Vector3(-0.016385, 0.0, 0.000264));

        this.reversingValveEF17BZ251InTubeHihgPressure.visible = true;
        this.reversingValveEF17BZ251InTubeLowPressure.visible = true;

        this.reversingValveEF17BZ251InTubeHihgPressure24VOff.visible = false;
        this.reversingValveEF17BZ251InTubeLowPressure24VOff.visible = false;

        this.highPressureMainLine1_24On.visible = true;
        this.highPressureMainLine2_24On.visible = true;
        this.highPressureMainLine3_24On.visible = true;
        this.highPressureMainLine4_24On.visible = true;
        this.highPressureMainLine5_24On.visible = true;

        this.lowPressureMainLine1_24VOn.visible = true;
        this.lowPressureMainLine2_24VOn.visible = true;
        this.lowPressureMainLine3_24VOn.visible = true;
        this.lowPressureMainLine4_24VOn.visible = true;
        this.lowPressureMainLine5_24VOn.visible = true;

        this.highPressureSmallLine1_24VOn.visible = true;
        this.highPressureInTubeLineLine_24VOn.visible = true;
        this.lowPressureInTubeLineLine_24VOn.visible = true;

        this.highPressureMainLine1_24Off.visible = false;
        this.highPressureMainLine2_24Off.visible = false;
        this.highPressureMainLine3_24Off.visible = false;
        this.highPressureMainLine4_24Off.visible = false;
        this.highPressureMainLine5_24Off.visible = false;

        this.lowPressureMainLine1_24VOff.visible = false;
        this.lowPressureMainLine2_24VOff.visible = false;
        this.lowPressureMainLine3_24VOff.visible = false;
        this.lowPressureMainLine4_24VOff.visible = false;
        this.lowPressureMainLine5_24VOff.visible = false;

        this.highPressureInTubeLineLine_24VOff.visible = false;
        this.lowPressureInTubeLineLine_24VOff.visible = false;
        this.highPressureSmallLine1_24VOff.visible = false;
    }

    set24VOff() {
        this.reversingValveEF17BZ251CoilCore.position.copy(new THREE.Vector3(0.000226, -0.00045, -0.017592));
        this.reversingValveEF17BZ251PlungeConsole.position.copy(new THREE.Vector3(0.016385, 0.0, 0.000264));

        this.reversingValveEF17BZ251InTubeHihgPressure24VOff.visible = true;
        this.reversingValveEF17BZ251InTubeLowPressure24VOff.visible = true;

        this.reversingValveEF17BZ251InTubeHihgPressure.visible = false;
        this.reversingValveEF17BZ251InTubeLowPressure.visible = false;

        this.highPressureMainLine1_24On.visible = false;
        this.highPressureMainLine2_24On.visible = false;
        this.highPressureMainLine3_24On.visible = false;
        this.highPressureMainLine4_24On.visible = false;
        this.highPressureMainLine5_24On.visible = false;

        this.lowPressureMainLine1_24VOn.visible = false;
        this.lowPressureMainLine2_24VOn.visible = false;
        this.lowPressureMainLine3_24VOn.visible = false;
        this.lowPressureMainLine4_24VOn.visible = false;
        this.lowPressureMainLine5_24VOn.visible = false;

        this.highPressureSmallLine1_24VOn.visible = false;
        this.highPressureInTubeLineLine_24VOn.visible = false;
        this.lowPressureInTubeLineLine_24VOn.visible = false;

        this.highPressureMainLine1_24Off.visible = true;
        this.highPressureMainLine2_24Off.visible = true;
        this.highPressureMainLine3_24Off.visible = true;
        this.highPressureMainLine4_24Off.visible = true;
        this.highPressureMainLine5_24Off.visible = true;

        this.lowPressureMainLine1_24VOff.visible = true;
        this.lowPressureMainLine2_24VOff.visible = true;
        this.lowPressureMainLine3_24VOff.visible = true;
        this.lowPressureMainLine4_24VOff.visible = true;
        this.lowPressureMainLine5_24VOff.visible = true;

        this.highPressureInTubeLineLine_24VOff.visible = true;
        this.lowPressureInTubeLineLine_24VOff.visible = true;
        this.highPressureSmallLine1_24VOff.visible = true;
    }
}