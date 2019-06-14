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

        var ambientLight = new THREE.AmbientLight(0x505050, 2.0); // white light
        this.add(ambientLight);

        // var pointLight = new THREE.PointLight(0xffffff, 1.0, 50.0);
        // pointLight.position.set(0.0, 2.5, 5.0);
        // this.add(pointLight);
    }

    onActivated() {
        this.rgbdSize = new THREE.Vector2(320, 240);

        /**
         * Kinect RGB Image canvas
         */
        this.slamKinectRGBImageCanvas = document.createElement('canvas');
        this.slamKinectRGBImageCanvas.style.position = 'absolute';
        this.slamKinectRGBImageCanvas.style.left = 'calc(50% - ' + this.rgbdSize.x + 'px)'
        this.slamKinectRGBImageCanvas.style.zIndex = 3;
        this.slamKinectRGBImageCanvas.width = this.rgbdSize.x;
        this.slamKinectRGBImageCanvas.height = this.rgbdSize.y;
        this.slamKinectRGBImageCanvas.style.visibility = 'hidden';
        this.slamKinectRGBImageCanvasCtx = this.slamKinectRGBImageCanvas.getContext('2d');
        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBImageCanvas);
        /**
         * Kinect Depth Image canvas
         */
        this.slamKinectDepthImageCanvas = document.createElement('canvas');
        this.slamKinectDepthImageCanvas.style.position = 'absolute';
        this.slamKinectDepthImageCanvas.style.left = '50%'
        this.slamKinectDepthImageCanvas.style.zIndex = 3;
        this.slamKinectDepthImageCanvas.width = this.rgbdSize.x;
        this.slamKinectDepthImageCanvas.height = this.rgbdSize.y;
        this.slamKinectDepthImageCanvasCtx = this.slamKinectDepthImageCanvas.getContext('2d');
        this.vLab.DOMManager.container.appendChild(this.slamKinectDepthImageCanvas);

        this.onNavKinectRGBDWebSocketMessage = this.onNavKinectRGBDWebSocketMessage.bind(this);
        this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.onSocketMessage = this.onNavKinectRGBDWebSocketMessage;
        this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.connect();

        var geometry = new THREE.PlaneBufferGeometry(3.0 * (4 / 3), 3.0, this.rgbdSize.x, this.rgbdSize.y);
        this.kinectRGBDPlaneMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.FrontSide });
        this.kinectRGBDPlaneMaterial.roughness = 1.0;
        this.kinectRGBDPlaneMaterial.metalness = 0.0;
        this.kinectRGBDPlaneMaterial.map = new THREE.Texture();
        this.kinectRGBDPlaneMaterial.displacementMap = new THREE.Texture();
        this.kinectRGBDPlaneMaterial.displacementScale = 3.0;
        this.kinectRGBDPlane = new THREE.Mesh(geometry, this.kinectRGBDPlaneMaterial);
        this.kinectRGBDPlane.position.y += 1.5;
        this.add(this.kinectRGBDPlane);

    }

    onNavKinectRGBDWebSocketMessage(event) {
        /**
         * event.data typeof NavKinectRGBDWebSocketMessage
         */
        let navKinectRGBDWebSocketMessage = JSON.parse(event.data);

        let rgbImage = new Image();
        rgbImage.onload = function(event) {
            this.slamKinectRGBImageCanvasCtx.drawImage(rgbImage, 0, 0);

            this.kinectRGBDPlaneMaterial.map.image = rgbImage;
            this.kinectRGBDPlaneMaterial.map.needsUpdate = true;
        };
        rgbImage.onload = rgbImage.onload.bind(this);
        rgbImage.src = navKinectRGBDWebSocketMessage.rgbImageData;

        let depthImage = new Image();
        depthImage.onload = function(event) {
            this.slamKinectDepthImageCanvasCtx.drawImage(depthImage, 0, 0);

            this.kinectRGBDPlaneMaterial.displacementMap.image = depthImage;
            this.kinectRGBDPlaneMaterial.displacementMap.needsUpdate = true;
        };
        depthImage.onload = depthImage.onload.bind(this);
        depthImage.src = navKinectRGBDWebSocketMessage.depthImageData;
    }
}

export default BaseScene;