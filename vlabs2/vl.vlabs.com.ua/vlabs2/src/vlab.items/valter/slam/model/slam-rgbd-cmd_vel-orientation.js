/**
 * SLAMRGBDCmdVelOrientation base class
 * @class
 */
class SLAMRGBDCmdVelOrientation {
    constructor() {
        this.rgbImageData = '';
        this.depthImageData = '';
        this.cmd_vel_linear = 0.0;
        this.cmd_vel_angular = 0.0;
        this.orientation_x = 0.0;
        this.orientation_z = 0.0;
        this.orientation_r = 0.0;
    }
}
export default SLAMRGBDCmdVelOrientation;