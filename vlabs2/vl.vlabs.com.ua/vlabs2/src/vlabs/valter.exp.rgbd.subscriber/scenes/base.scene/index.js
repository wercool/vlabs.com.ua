import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class BaseScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    /**
     * Override VLabScene.onLoaded and called when VLabScene nature JSON is loaded as minimum
     */
    onLoaded() {
        console.log('BaseScene onLoaded()');
        /**
         * Trace VLabScene object (this)
         */
        console.log(this);

        /*<dev>*/
        /**
         * dummyObject
         */
        // this.dummyObject.position.copy(new THREE.Vector3(0.1, 0.1, 0.1));
        /*</dev>*/

        // var ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // white light
        // this.add(ambientLight);

        var pointLight = new THREE.PointLight(0xffffff, 1.0, 20.0);
        pointLight.position.set(0.0, 2.5, 5.0);
        this.add(pointLight);
    }

    onActivated() {
        this.rgbdSize = new THREE.Vector2(320, 240);

        /**
         * Kinect RGB camera renderer canvas
         */
        this.slamKinectRGBCameraRendererCanvas = document.createElement('canvas');
        this.slamKinectRGBCameraRendererCanvas.style.position = 'absolute';
        this.slamKinectRGBCameraRendererCanvas.style.left = 'calc(50% - ' + this.rgbdSize.x + 'px)'
        this.slamKinectRGBCameraRendererCanvas.style.zIndex = 3;
        this.slamKinectRGBCameraRendererCanvas.width = this.rgbdSize.x;
        this.slamKinectRGBCameraRendererCanvas.height = this.rgbdSize.y;
        this.slamKinectRGBCameraRendererCanvas.style.visibility = 'visible';
        this.slamKinectRGBCameraRendererCanvasCtx = this.slamKinectRGBCameraRendererCanvas.getContext('2d');

        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBCameraRendererCanvas);

        /**
         * Kinect Depth image canvas
         */
        this.slamKinectRGBCameraDepthImageCanvas = document.createElement('canvas');
        this.slamKinectRGBCameraDepthImageCanvas.style.position = 'absolute';
        this.slamKinectRGBCameraDepthImageCanvas.style.left = '50%';
        this.slamKinectRGBCameraDepthImageCanvas.style.zIndex = 3;
        this.slamKinectRGBCameraDepthImageCanvas.width = this.rgbdSize.x;
        this.slamKinectRGBCameraDepthImageCanvas.height = this.rgbdSize.y;
        this.slamKinectRGBCameraDepthImageCanvas.style.visibility = 'visible';
        this.slamKinectRGBCameraDepthImageCanvasCtx = this.slamKinectRGBCameraDepthImageCanvas.getContext('2d');

        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBCameraDepthImageCanvas);

        this.onNavKinectRGBDWebSocketMessage = this.onNavKinectRGBDWebSocketMessage.bind(this);
        this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.onSocketMessage = this.onNavKinectRGBDWebSocketMessage;
        this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.connect();

        var geometry = new THREE.PlaneBufferGeometry(3.2, 2.4, 320, 240);
        this.testPlaneMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.FrontSide });
        this.testPlaneMaterial.roughness = 1.0;
        this.testPlaneMaterial.metalness = 0.0;
        this.testPlaneMaterial.map = new THREE.Texture();
        this.testPlaneMaterial.displacementMap = new THREE.Texture();
        this.testPlaneMaterial.displacementScale = 3.0;
        this.testPlane = new THREE.Mesh(geometry, this.testPlaneMaterial);
        this.testPlane.position.y += 1.2;
        this.add(this.testPlane);

        // this.navKinectRGBDPoints = new THREE.Points();
        // this.navKinectRGBDPoints.material = new THREE.PointsMaterial({ size: 0.01, color: 0xffffff });
        // this.navKinectRGBDPoints.material.map = new THREE.Texture();
        // this.add(this.navKinectRGBDPoints);
    }

    onNavKinectRGBDWebSocketMessage(event) {
        /**
         * event.data typeof NavKinectRGBDWebSocketMessage
         */
        let navKinectRGBDWebSocketMessage = JSON.parse(event.data);

        let rgbImage = new Image();
        rgbImage.onload = function(event) {
            this.slamKinectRGBCameraRendererCanvasCtx.drawImage(rgbImage, 0, 0);

            let depthImage = new Image();
            depthImage.onload = function(event) {
                this.slamKinectRGBCameraDepthImageCanvasCtx.drawImage(depthImage, 0, 0);

                this.testPlaneMaterial.map.image = rgbImage;
                this.testPlaneMaterial.map.needsUpdate = true;

                this.testPlaneMaterial.displacementMap.image = depthImage;
                this.testPlaneMaterial.displacementMap.needsUpdate = true;

                // /**
                //  * Build navKinectRGBDPointsGeometry
                //  */
                // this.navKinectRGBDPointsGeomtry = new THREE.Geometry();

                // let slamKinectRGBCameraDepthImageCanvasImageData = this.slamKinectRGBCameraDepthImageCanvasCtx.getImageData(0, 0, this.slamKinectRGBCameraDepthImageCanvas.width, this.slamKinectRGBCameraDepthImageCanvas.height);

                // let lc = 0;
                // let x = 1.6;
                // let y = 2.4;
                // let z = 0;

                // for (let i = 0; i < slamKinectRGBCameraDepthImageCanvasImageData.data.length; i += 4) {
                //     let distance = 255 / slamKinectRGBCameraDepthImageCanvasImageData.data[i];
                //     z = distance;
                //     if (lc + 1 < this.rgbdSize.x) {
                //         x -= 0.01;
                //         lc++;
                //     } else {
                //         lc = 0;
                //         y -= 0.01;
                //         x = 1.6;
                //     }
                //     let point = new THREE.Vector3().set(x, y, z);
                //     this.navKinectRGBDPointsGeomtry.vertices.push(point);
                // }
                // this.navKinectRGBDPoints.material.map.image = rgbImage;
                // this.navKinectRGBDPoints.material.map.needsUpdate = true;
                // this.navKinectRGBDPoints.material.needsUpdate = true;

                // this.navKinectRGBDPoints.geometry = this.navKinectRGBDPointsGeomtry;

                // this.testPlaneMaterial.map.image = rgbImage;
                // this.testPlaneMaterial.map.needsUpdate = true;

            };
            depthImage.onload = depthImage.onload.bind(this);
            depthImage.src = navKinectRGBDWebSocketMessage.depthImageData;

        };
        rgbImage.onload = rgbImage.onload.bind(this);
        rgbImage.src = navKinectRGBDWebSocketMessage.rgbImageData;
    }
}

export default BaseScene;