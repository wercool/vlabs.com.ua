import * as THREE               from 'three';
import * as TWEEN               from 'tween.js';
import * as StringUtils         from '../../vlabs.core/utils/string.utils.js';

export default class SchematicHelper {
    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;

        var textureLoader = new THREE.TextureLoader();

        if (this.initObj.object == undefined) {
            console.error(this.initObj.name + ' SchematicHelper Relative Object (object) is not defined');
            return undefined;
        }

        Promise.all([
            textureLoader.load('../vlabs.items/schematic-helper/assets/schematic-helper-icon.png'),
        ])
        .then((result) => {
            this.schematicIcon = result[0];

            this.initialize();
        })
        .catch(error => {
            console.error(error);
        });
    }

    initialize() {

        this.buildHTML();

        this.helperSpriteMaterial = new THREE.SpriteMaterial({
            map: this.schematicIcon,
            rotation: this.initObj.rotation ? this.initObj.rotation : 0.0,
            depthTest: this.initObj.depthTest !== undefined ? this.initObj.depthTest : true,
            depthWrite: this.initObj.depthWrite !== undefined ? this.initObj.depthWrite : true,
        });

        this.helperSprite = new THREE.Sprite(this.helperSpriteMaterial);
        this.helperSprite.name = this.initObj.name + "SchematicHelperSprite";
        this.helperSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));
        this.helperSprite.mousePressHandler = function(){
            console.log(this);
        };
        // this.helperSprite.visible = false;

        this.initObj.object.add(this.helperSprite);
        if (this.initObj.relPos !== undefined) this.helperSprite.position.add(this.initObj.relPos);

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

        console.log("SchematicHelper " + this.initObj.name + " initialized");
    }

    buildHTML() {
        if (document.getElementById('schematicHelperStyles') === null) {
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.id   = 'schematicHelperStyles';
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = '../vlabs.items/schematic-helper/assets/schematic-helper.css';
            link.media = 'all';
            head.appendChild(link);
        }

        this.container = document.createElement('div');
        this.container.id = this.context.name + '_' + this.initObj.name + '_SchematicHelperViewContainer';
        this.container.className = 'schematicsHelperViewContainer';
        this.container.style.display = 'none';
        document.body.appendChild(this.container);

        this.closeBtn = document.createElement('div');
        this.closeBtn.id = this.context.name + 'SchematicsHelperViewContainerCloseButton';
        this.closeBtn.className = 'schematicsHelperViewContainerCloseButton';
        this.container.appendChild(this.closeBtn);
        this.closeBtn.addEventListener("mouseup", this.close.bind(this), false);
        this.closeBtn.addEventListener("touchend", this.close.bind(this), false);

        this.containerContent = document.createElement('div');
        this.containerContent.id = this.context.name + '_' + this.initObj.name + '_SchematicHelperViewContainerContent';
        this.containerContent.className = 'schematicsHelperViewContainerContent';
        this.container.appendChild(this.containerContent);
        this.containerContent.style.backgroundImage = 'url("' + this.initObj.schematicPNG + '")';
    }

    onVLabSceneMouseUp(event) {
        this.interactionEvent();
    }

    onVLabSceneTouchEnd(event) {
        this.interactionEvent();
    }

    interactionEvent() {
        if (this.context.paused || this.helperSprite == undefined) {
            return;
        }

        this.context.helpersRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);

        var intersectObjects = this.context.interactivesSuppressorsObjects.slice();

        intersectObjects = intersectObjects.concat(this.helperSprite);

        var intersects = this.context.helpersRaycaster.intersectObjects(intersectObjects);

        if (intersects.length > 0) {
            if (intersects[0].object == this.helperSprite) {
                this.open();
            }
        }
    }

    open() {
        this.container.style.display = 'block';
        if (this.context.onSchematicHelperOpened !== undefined) {
            this.context.onSchematicHelperOpened();
        }
        this.helperSprite.visible = false;
    }

    close() {
        var self = this;
        this.container.style.display = 'none';
        this.helperSprite.visible = true;
        setTimeout(()=>{
            if (self.context.onSchematicHelperClosed !== undefined) {
                self.context.onSchematicHelperClosed();
            }
        }, 150);
    }
}