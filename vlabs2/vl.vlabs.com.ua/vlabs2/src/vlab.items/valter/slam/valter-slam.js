import * as THREE from 'three';

/**
 * Valter SLAM class.
 * @class
 * @classdesc Valter The Robot SLAM methods.
 */
class ValterSLAM {
    /**
     * Initializtion
     * @param {*} initObj 
     */
    constructor(initObj) {
        this.name = 'ValterSLAM';

        this.Valter = initObj.Valter;

        this.vLab = this.Valter.vLab;

        console.log('Valter SLAM');

        let kinectCameraAspect = 640 / 480;

        this.slamKinectRGBCameraOffset = new THREE.Vector3(-0.005, 0.307, 0.209);
        this.slamKinectRGBCamera = new THREE.PerspectiveCamera(49, kinectCameraAspect, 0.2, 30.0);
        this.slamKinectRGBCamera.updateProjectionMatrix();
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBCamera);

        // this.slamKinectRGBCameraHelper = new THREE.CameraHelper(this.slamKinectRGBCamera);
        // this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBCameraHelper);

        /**
         * Kinect RGB camera renderer canvas
         */

        this.slamKinectRGBCameraRendererCanvas = document.createElement('canvas');
        this.slamKinectRGBCameraRendererCanvas.style.position = 'absolute';
        this.slamKinectRGBCameraRendererCanvas.style.zIndex = 3;
        this.slamKinectRGBCameraRendererCanvas.width = 640;
        this.slamKinectRGBCameraRendererCanvas.height = 480;
        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBCameraRendererCanvas);

        this.WebGLRenderer = new THREE.WebGLRenderer({
            canvas: this.slamKinectRGBCameraRendererCanvas,
            antialias: false,
            powerPreference: 'high-performance',
            precision: 'lowp'
        });
        this.WebGLRenderer.context.getShaderInfoLog = function () { return '' };
        this.WebGLRenderer.context.getProgramInfoLog = function () { return '' };
        this.WebGLRenderer.gammaOutput = true;

        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    framerequest: this.onWebGLRendererCanvasFramerequest
                }
            }
        });
    }

    onWebGLRendererCanvasFramerequest(event) {
        this.slamKinectRGBCamera.position.copy(this.slamKinectRGBCameraOffset);
        this.slamKinectRGBCamera.position.applyMatrix4(this.Valter.bodyFrame.matrixWorld);
        this.slamKinectRGBCamera.lookAt(this.Valter.bodyFrame.localToWorld(this.slamKinectRGBCameraOffset.clone().setZ(1.0)));

        this.WebGLRenderer.render(this.vLab.SceneDispatcher.currentVLabScene, this.slamKinectRGBCamera);
    }
}
export default ValterSLAM;