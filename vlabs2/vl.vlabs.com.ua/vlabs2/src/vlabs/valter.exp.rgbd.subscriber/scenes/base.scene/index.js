import * as THREE from 'three';
import * as ImageUtils from '../../../../vlab.fwk/utils/image.utils';
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

        var ambientLight = new THREE.AmbientLight(0x505050, 2.0); // soft white light
        this.add(ambientLight);

        // var pointLight = new THREE.PointLight(0xffffff, 1.0, 50.0);
        // pointLight.position.set(0.0, 2.5, 5.0);
        // this.add(pointLight);

        this.vLab.WebGLRenderer.gammaOutput = false;
    }

    onActivated() {
        this.rgbdSizeNormalizedToPower2 = new THREE.Vector2(256, 256);

        /**
         * Kinect RGB Image canvas
         */
        this.slamKinectRGBImageCanvas = document.createElement('canvas');
        this.slamKinectRGBImageCanvas.style.position = 'absolute';
        this.slamKinectRGBImageCanvas.style.left = 'calc(50% - ' + this.rgbdSizeNormalizedToPower2.x + 'px)'
        this.slamKinectRGBImageCanvas.style.zIndex = 3;
        this.slamKinectRGBImageCanvas.width = this.rgbdSizeNormalizedToPower2.x;
        this.slamKinectRGBImageCanvas.height = this.rgbdSizeNormalizedToPower2.y;
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
        this.slamKinectDepthImageCanvas.width = this.rgbdSizeNormalizedToPower2.x;
        this.slamKinectDepthImageCanvas.height = this.rgbdSizeNormalizedToPower2.y;
        this.slamKinectDepthImageCanvas.style.visibility = 'hidden';
        this.slamKinectDepthImageCanvasCtx = this.slamKinectDepthImageCanvas.getContext('2d');
        this.vLab.DOMManager.container.appendChild(this.slamKinectDepthImageCanvas);

        this.onNavKinectRGBDWebSocketMessage = this.onNavKinectRGBDWebSocketMessage.bind(this);
        this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.onSocketMessage = this.onNavKinectRGBDWebSocketMessage;
        this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.connect();

        var geometry = new THREE.PlaneBufferGeometry(3.0 * (4 / 3), 3.0, this.rgbdSizeNormalizedToPower2.x, this.rgbdSizeNormalizedToPower2.y);
        this.kinectRGBDPlaneMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.FrontSide });
        this.kinectRGBDPlaneMaterial.transparent = true;
        this.kinectRGBDPlaneMaterial.roughness = 1.0;
        this.kinectRGBDPlaneMaterial.metalness = 0.0;
        this.kinectRGBDPlaneMaterial.map = new THREE.Texture();
        this.kinectRGBDPlaneMaterial.displacementMap = new THREE.Texture();
        this.kinectRGBDPlaneMaterial.displacementScale = 4.5;
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
            this.slamKinectRGBImageCanvasCtx.drawImage(rgbImage, 0, 0, rgbImage.width, rgbImage.height, 0, 0, this.rgbdSizeNormalizedToPower2.x, this.rgbdSizeNormalizedToPower2.y);

            // let rgbImageData = ImageUtils.blackToTransparent(this.slamKinectRGBImageCanvasCtx.getImageData(0, 0, this.rgbdSizeNormalizedToPower2.x, this.rgbdSizeNormalizedToPower2.y));
            // this.slamKinectRGBImageCanvasCtx.putImageData(rgbImageData, 0, 0);

            this.kinectRGBDPlaneMaterial.map.image = this.slamKinectRGBImageCanvas;
            this.kinectRGBDPlaneMaterial.map.needsUpdate = true;
        };
        rgbImage.onload = rgbImage.onload.bind(this);
        rgbImage.src = navKinectRGBDWebSocketMessage.rgbImageData;

        let depthImage = new Image();
        depthImage.onload = function(event) {
            this.slamKinectDepthImageCanvasCtx.drawImage(depthImage, 0, 0, depthImage.width, depthImage.height, 0, 0, this.rgbdSizeNormalizedToPower2.x, this.rgbdSizeNormalizedToPower2.y);

            this.kinectRGBDPlaneMaterial.displacementMap.image = this.slamKinectDepthImageCanvas;
            this.kinectRGBDPlaneMaterial.displacementMap.needsUpdate = true;
        };
        depthImage.onload = depthImage.onload.bind(this);
        depthImage.src = navKinectRGBDWebSocketMessage.depthImageData;
    }
}

export default BaseScene;