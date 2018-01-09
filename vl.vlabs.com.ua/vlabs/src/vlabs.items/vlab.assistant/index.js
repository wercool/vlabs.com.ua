import * as THREE           from 'three';

export default class VLabAssistant {
/*
initObj {
    "context": VLab,
    "initPos": THREE.Vector3,
    "name": optional name,
    "title": optional title
}
*/
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.initPos = initObj.initPos;

       this.initialize();
    }

    initialize() {
        this.context.loadVLabItem("/vlabs.items/vlab.assistant/vlab.assistant.json", "VLab Assistant").then((scene) => {
            this.model = scene.children[0];
            if (this.initObj.name) {
                this.model.name = this.initObj.name;
            }
            this.context.vLabScene.add(this.model);
            if (this.initPos) {
                this.model.position.copy(this.initPos);
            } else {
                console.error("VLab Assistant is not set");
            }
            this.context.nature.tooltips[this.model.name] = {
                "en": "VLab Assistant" + ((this.initObj.title) ? "\n" + this.initObj.title : ""),
                "ru": "VLab Ассистент" + ((this.initObj.title) ? "\n" + this.initObj.title : "")
            };

            this.context.interactiveObjects.push(this.model);
            this.context.addSelectionSphereToObject(this.model);

            var VlabsAssistantDisplayZoomHelperMaterial = new THREE.SpriteMaterial({
                map: this.context.helpers.zoomHelper.texture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: Math.PI
            });
            VlabsAssistantDisplayZoomHelperMaterial.depthTest = false;
            VlabsAssistantDisplayZoomHelperMaterial.depthWrite = false;
            var VlabsAssistantDisplayZoomHelperSprite = new THREE.Sprite(VlabsAssistantDisplayZoomHelperMaterial);
            VlabsAssistantDisplayZoomHelperSprite.scale.set(0.2, 0.2, 0.2);
            VlabsAssistantDisplayZoomHelperSprite.position.z += 0.1;
            VlabsAssistantDisplayZoomHelperSprite.position.x -= 0.025;
            this.model.getObjectByName("VlabsAssistantDisplay").add(VlabsAssistantDisplayZoomHelperSprite);
            this.context.helpers.zoomHelper.assigned.push(VlabsAssistantDisplayZoomHelperSprite);

        }).catch(error => {
            console.error(error);
        });
    }
}