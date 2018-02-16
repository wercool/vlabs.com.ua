import * as THREE           from 'three';

export default class Inventory {
    /*
    initObj {
        "context": VLab
    }
    */
        constructor(initObj) {
           this.initObj = initObj;
           this.context = initObj.context;

           this.paused = true;

           this.initialize();
        }

        initialize() {
            this.toolboxBtn = document.createElement('div');
            this.toolboxBtn.id = 'toolbox';
            document.getElementById("webGLContainer").appendChild(this.toolboxBtn);
            this.toolboxBtn.addEventListener("mousedown", this.activate.bind(this), false);

            this.container = document.createElement('div');
            this.container.id = 'inventoryContainer';
            document.getElementById("overlayContainer").appendChild(this.container);

            this.webGLContainer = document.createElement('div');
            this.webGLContainer.id = 'inventoryWebGLContainer';
            this.container.appendChild(this.webGLContainer);

            this.webGLRenderer = new THREE.WebGLRenderer({
                antialias: false,
                powerPreference: 'high-performance',
                precision: 'lowp'
            });
            this.webGLRenderer.setClearColor(0x000000);

            this.webGLContainer.appendChild(this.webGLRenderer.domElement);
            this.webGLRenderer.domElement.addEventListener('contextmenu', function(event) {
                if (event.button == 2) {
                    event.preventDefault();
                }
            });

            this.scene = new THREE.Scene();
            this.defaultCamera = new THREE.PerspectiveCamera(70, this.webGLContainer.clientWidth / this.webGLContainer.clientHeight, 0.1, 200);
            this.defaultCamera.position.set(0, 0, 0.35);

            var light1 = new THREE.PointLight(0xffffff, 1.5);
            light1.position.set(0.0, 1.0, 3.0);
            this.scene.add(light1);

            this.infoBox = document.createElement('div');
            this.infoBox.id = 'inventoryInfoBox';
            this.container.appendChild(this.infoBox);

            this.closeBtn = document.createElement('div');
            this.closeBtn.id = 'inventoryCloseButton';
            this.container.appendChild(this.closeBtn);
            this.closeBtn.addEventListener("mousedown", this.onClose.bind(this), false);

            console.log("Inventory initialization");
        }

        activate() {
            this.context.paused = true;
            document.getElementById("modalMessage").style.display = 'none';
            document.getElementById("progressBar").style.display = 'none';
            this.context.statsTHREE.domElement.style.display = 'none';

            this.container.style.display = 'block';
            document.getElementById("overlayContainer").style.display = 'block';

            this.paused = false;
            this.resiezeWebGLContainer();
            this.render();
        }


    resiezeWebGLContainer() {
        this.webGLRenderer.setSize(this.webGLContainer.clientWidth, this.webGLContainer.clientHeight);

        if (this.defaultCamera) {
            this.defaultCamera.aspect = (this.webGLContainer.clientWidth / this.webGLContainer.clientHeight);
            this.defaultCamera.updateProjectionMatrix();
        }
    }

    render(time) {
        if (!this.paused) {
            this.webGLRenderer.clear();
            this.webGLRenderer.render(this.scene, this.defaultCamera);
            requestAnimationFrame(this.render.bind(this));
        } else {
            setTimeout(this.render.bind(this), 500);
        }
    }

    onClose() {
        this.paused = false;
        this.container.style.display = 'none';
        document.getElementById("overlayContainer").style.display = 'none';

        this.context.paused = false;
        this.context.statsTHREE.domElement.style.display = 'block';

        console.log("Inventory closed");
    }

    addItem(itemObj) {
        this.scene.add(itemObj.item);
        this.lookAt(itemObj.item);
    }

    lookAt(item) {
        this.defaultCamera.lookAt(item.position.clone());
        for (var objectMenuItem of this.context.nature.objectMenus[item.name][this.context.nature.lang]) {
            if (objectMenuItem.title == 'Info') {
                this.infoBox.outerHTML = objectMenuItem.args.html + '<h4 style="color: white;">' + objectMenuItem.args.title + '</h4>';
            }
        }
    }
}