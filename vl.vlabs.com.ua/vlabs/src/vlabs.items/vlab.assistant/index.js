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
        this.context.loadVLabItem("../vlabs.items/vlab.assistant/vlab.assistant.json", "VLab Assistant").then((scene) => {
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

            this.context.addSelectionHelperToObject(this.model);
            this.context.nature.interactiveObjects.push(this.model.name);
            this.context.setInteractiveObjects();

            // this.context.addZoomHelper("VlabsAssistantDisplay", 
            //                            this.model, 
            //                            new THREE.Vector3(-0.025, 0.0 ,0.1), 
            //                            new THREE.Vector3(0.2, 0.2, 0.2),
            //                            Math.PI);
        }).catch(error => {
            console.error(error);
        });
    }
}