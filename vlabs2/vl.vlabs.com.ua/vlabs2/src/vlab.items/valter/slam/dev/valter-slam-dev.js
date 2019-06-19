import NavKinectRGBDWebSocketMessage from '../model/nav-kinect-rgbd-websocket-message';
import SLAMRGBDCmdVelOrientation from '../model/slam-rgbd-cmd_vel-orientation';
import * as ImageUtils from '../../../../vlab.fwk/utils/image.utils';
import * as WebWorkerUtils from '../../../../vlab.fwk/utils/web.worker.utils';

/**
 * Valter SLAM Dev class.
 * @class
 * @classdesc Valter The Robot SLAM Dev methods.
 */
class ValterSLAMDev {
    constructor(Valter) {
        /**
         * Valter instance
         */
        this.Valter = Valter;
        /**
         * Valter.vLab VLab Instance
         */
        this.vLab = this.Valter.vLab;

        /**
         * Add dev menu options in this.Valter defined
         */
        if (this.Valter) {
            this.Valter.getInteractableByName('baseFrame').DEV.menu.unshift(
                {
                    label: 'Get RGBD from SLAM Kinect',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">gradient</i>',
                    action: (menuItem) => {
                        if (this.getNavKinectRGBDWebSocketMessageInterval == undefined) {
                            this.Valter.ValterSLAM.slamKinectRGBImageCanvas.style.visibility = 'visible';
                            this.Valter.ValterSLAM.slamKinectDepthImageCanvas.style.visibility = 'visible';
                            menuItem.selected = true;
                            this.slamRGBDCmdVelOrientationTuples = [];
                            this.getNavKinectRGBDWebSocketMessageInterval = setInterval(this.sendNavKinectRGBDWebSocketMessage, 100);
                        } else {
                            clearInterval(this.getNavKinectRGBDWebSocketMessageInterval);
                            this.getNavKinectRGBDWebSocketMessageInterval = undefined;
                            this.Valter.ValterSLAM.slamKinectRGBImageCanvas.style.visibility = 'hidden';
                            this.Valter.ValterSLAM.slamKinectDepthImageCanvas.style.visibility = 'hidden';
                            menuItem.selected = false;
                        }
                    }
                }
            );

            this.Valter.getInteractableByName('baseFrame').DEV.menu.push(
                {
                    label: 'Save SLAMRGBDCmdVelOrientation tuples',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">save</i>',
                    action: (menuItem) => {
                        this.saveSLAMRGBDCmdVelOrientationTuples();
                    }
                }
            );


            /**
             * SLAM tuples initialization
             */
            this.slamRGBDCmdVelOrientationTuples = [];

            this.sendNavKinectRGBDWebSocketMessage = this.sendNavKinectRGBDWebSocketMessage.bind(this);
            this.getNavKinectRGBDWebSocketMessageInterval = undefined;

            /**
             * Offscreen canvases
             */
            this.rgbImageOffscreenCanvas = new OffscreenCanvas(this.Valter.ValterSLAM.rgbdSize.x, this.Valter.ValterSLAM.rgbdSize.y);
            this.rgbImageOffscreenCanvasCtx = this.rgbImageOffscreenCanvas.getContext('2d');

            this.depthImageOffscreenCanvas = new OffscreenCanvas(this.Valter.ValterSLAM.rgbdSize.x, this.Valter.ValterSLAM.rgbdSize.y);
            this.depthImageOffscreenCanvasCtx = this.depthImageOffscreenCanvas.getContext('2d');

            /**
             * 
             * sendNavKinectRGBDWebSocketMessageWorker
             * 
             */
            this.sendNavKinectRGBDWebSocketMessageWorker = WebWorkerUtils.createInlineWorker(function (event) {
                // console.log(event.data.navKinectRGBDWebSocketMessage.rgbImageData.data.length);

                if (self.socket == undefined) {
                    self.socket = new WebSocket(event.data.socketURL);
                    self.socket.onopen = function (event){
                        self.socketConnected = true;
                    };

                    self.toDataURL = function (data) {
                        return new Promise(resolve => {
                            const reader = new FileReader();
                            reader.addEventListener('load', () => resolve(reader.result));
                            reader.readAsDataURL(data);
                        });
                    }
                    self.rgbImageCanvas = new OffscreenCanvas(event.data.rgbdSize.x, event.data.rgbdSize.y);
                    self.rgbImageCanvasCtx = self.rgbImageCanvas.getContext('2d');

                    self.depthImageCanvas = new OffscreenCanvas(event.data.rgbdSize.x, event.data.rgbdSize.y);
                    self.depthImageCanvasCtx = self.depthImageCanvas.getContext('2d');
                }
                if (self.socketConnected == true) {
                    self.rgbImageCanvasCtx.putImageData(event.data.navKinectRGBDWebSocketMessage.rgbImageData, 0, 0);
                    self.depthImageCanvasCtx.putImageData(event.data.navKinectRGBDWebSocketMessage.depthImageData, 0, 0);

                    Promise.all([
                        self.rgbImageCanvas.convertToBlob().then((rgbImageBlob) => self.toDataURL(rgbImageBlob)),
                        self.depthImageCanvas.convertToBlob().then((depthImageBlob) => self.toDataURL(depthImageBlob))
                    ])
                    .then((rgbdResult) => {
                        event.data.navKinectRGBDWebSocketMessage.rgbImageData   = rgbdResult[0];
                        event.data.navKinectRGBDWebSocketMessage.depthImageData = rgbdResult[1];

                        self.socket.send(JSON.stringify(event.data.navKinectRGBDWebSocketMessage));
                    });
                }
            });
        }
    }

    sendNavKinectRGBDWebSocketMessage() {
        this.vLab.renderPaused = true;

        this.Valter.ValterSLAM.renderRGBD();

        if (Math.abs(this.Valter.cmd_vel.linear.z) > 0.0 || Math.abs(this.Valter.cmd_vel.angular)) {
            let cmd_vel = {
                linear:  parseFloat((this.Valter.cmd_vel.linear.z / (1 / 60)).toFixed(4)),
                angular: parseFloat(this.Valter.cmd_vel.angular.toFixed(4))
            };
            let orientation = {
                x: parseFloat(this.Valter.baseFrame.position.x.toFixed(3)),
                z: parseFloat(this.Valter.baseFrame.position.z.toFixed(3)),
                r: parseFloat(this.Valter.baseFrame.rotation.y.toFixed(3))
            };
            // console.log(cmd_vel, orientation);

            this.Valter.ValterSLAM.slamKinectRGBImageCanvas.style.outline = 'red 2px solid';
            this.Valter.ValterSLAM.slamKinectDepthImageCanvas.style.outline = 'red 2px solid';

            let rgbJSImageData = this.Valter.ValterSLAM.slamKinectRGBImageCanvasCtx.getImageData(0, 0, this.Valter.ValterSLAM.rgbdSize.x, this.Valter.ValterSLAM.rgbdSize.y);
            let depthJSImageData = this.Valter.ValterSLAM.slamKinectDepthImageCanvasCtx.getImageData(0, 0, this.Valter.ValterSLAM.rgbdSize.x, this.Valter.ValterSLAM.rgbdSize.y);

            /**
             * Save SLAMRGBDCmdVelOrientation tuple
             */
            let slamRGBDCmdVelOrientation = new SLAMRGBDCmdVelOrientation();
            slamRGBDCmdVelOrientation.rgbImageData   = rgbJSImageData;
            slamRGBDCmdVelOrientation.depthImageData = depthJSImageData;
            slamRGBDCmdVelOrientation.cmd_vel_linear  = cmd_vel.linear;
            slamRGBDCmdVelOrientation.cmd_vel_angular = cmd_vel.angular;
            slamRGBDCmdVelOrientation.orientation_x = orientation.x;
            slamRGBDCmdVelOrientation.orientation_z = orientation.z;
            slamRGBDCmdVelOrientation.orientation_r = orientation.r;

            this.slamRGBDCmdVelOrientationTuples.push(slamRGBDCmdVelOrientation);
            console.log(this.slamRGBDCmdVelOrientationTuples.length + ' SLAM tuples accumulated');

            /**
             * Send NavKinectRGBDWebSocketMessage to VLabsRESTWS
             */
            // let navKinectRGBDWebSocketMessage = new NavKinectRGBDWebSocketMessage();
            // navKinectRGBDWebSocketMessage.rgbImageData   = rgbJSImageData;
            // navKinectRGBDWebSocketMessage.depthImageData = depthJSImageData;
            // /**
            //  * Send in UI thread
            //  */
            // // this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.send(navKinectRGBDWebSocketMessage);
            // /**
            //  * Send in worker thread
            //  */
            // this.sendNavKinectRGBDWebSocketMessageWorker.postMessage({
            //     socketURL: this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.getFullyQualifiedURL(),
            //     navKinectRGBDWebSocketMessage: navKinectRGBDWebSocketMessage,
            //     rgbdSize: this.Valter.ValterSLAM.rgbdSize
            // });
        } else {
            this.Valter.ValterSLAM.slamKinectRGBImageCanvas.style.outline = '';
            this.Valter.ValterSLAM.slamKinectDepthImageCanvas.style.outline = '';
        }

        this.vLab.renderPaused = false;
    }

    async saveSLAMRGBDCmdVelOrientationTuples() {
        let savedCnt = 0;

        Promise.all(this.slamRGBDCmdVelOrientationTuples.map(async (slamRGBDCmdVelOrientationTuple) => {
            await new Promise((resolve) => {
                this.rgbImageOffscreenCanvasCtx.putImageData(slamRGBDCmdVelOrientationTuple.rgbImageData, 0, 0);
                this.depthImageOffscreenCanvasCtx.putImageData(slamRGBDCmdVelOrientationTuple.depthImageData, 0, 0);

                Promise.all([
                    this.rgbImageOffscreenCanvas.convertToBlob().then((rgbImageBlob) => ImageUtils.canvasBlobToDataURL(rgbImageBlob)),
                    this.depthImageOffscreenCanvas.convertToBlob().then((depthImageBlob) => ImageUtils.canvasBlobToDataURL(depthImageBlob))
                ])
                .then((rgbdResult) => {
                    slamRGBDCmdVelOrientationTuple.rgbImageData   = rgbdResult[0];
                    slamRGBDCmdVelOrientationTuple.depthImageData = rgbdResult[1];

                    this.vLab.VLabsRESTClientManager
                    .ValterSLAMService
                    .saveSLAMRGBDCmdVelOrientationTuple(slamRGBDCmdVelOrientationTuple)
                    .then(() => {
                        savedCnt++;
                        console.log(savedCnt + '/' + this.slamRGBDCmdVelOrientationTuples.length + ' SLAM tuples persisted');
                        resolve();
                    });
                });
            });
        }))
        .then(() => {
            this.slamRGBDCmdVelOrientationTuples = [];
        });
    }

    /**
     * 
     * Get RGBDCmdVelOrientation tuples
     * 
     */
    getAllSLAMRGBDCmdVelOrientationTuplesNormalized() {
        this.vLab.VLabsRESTClientManager
        .ValterSLAMService
        .getAllSLAMRGBDCmdVelOrientationTuplesNormalized()
        .then((slamRGBDCmdVelOrientationNormalizedTuples) => {
            console.log(slamRGBDCmdVelOrientationNormalizedTuples[0].rgbImageData);
        });
    }

    getStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized() {
        this.vLab.VLabsRESTClientManager
        .ValterSLAMService
        .getStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized({
            context: this,
            onMessage: this.onMessageStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized,
            onLastMessage: this.onLastMessageStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized,
        });
    }

    onMessageStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized(slamRGBDCmdVelOrientationTuplesNormalized) {
        console.log(slamRGBDCmdVelOrientationTuplesNormalized);
    }

    onLastMessageStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized() {
        console.log('onLastMessageStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized');
    }
}
export default ValterSLAMDev; 