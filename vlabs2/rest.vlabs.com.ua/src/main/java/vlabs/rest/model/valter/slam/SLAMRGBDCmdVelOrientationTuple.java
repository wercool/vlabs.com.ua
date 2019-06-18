package vlabs.rest.model.valter.slam;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "valter_slam_tuples")
public class SLAMRGBDCmdVelOrientationTuple {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    String rgbImageData;
    String depthImageData;
    double cmd_vel_linear;
    double cmd_vel_angular;
    double orientation_x;
    double orientation_z;
    double orientation_r;

    public String getRgbImageData() {
        return rgbImageData;
    }
    public void setRgbImageData(String rgbImageData) {
        this.rgbImageData = rgbImageData;
    }
    public String getDepthImageData() {
        return depthImageData;
    }
    public void setDepthImageData(String depthImageData) {
        this.depthImageData = depthImageData;
    }
    public double getCmd_vel_linear() {
        return cmd_vel_linear;
    }
    public void setCmd_vel_linear(double cmd_vel_linear) {
        this.cmd_vel_linear = cmd_vel_linear;
    }
    public double getCmd_vel_angular() {
        return cmd_vel_angular;
    }
    public void setCmd_vel_angular(double cmd_vel_angular) {
        this.cmd_vel_angular = cmd_vel_angular;
    }
    public double getOrientation_x() {
        return orientation_x;
    }
    public void setOrientation_x(double orientation_x) {
        this.orientation_x = orientation_x;
    }
    public double getOrientation_z() {
        return orientation_z;
    }
    public void setOrientation_z(double orientation_z) {
        this.orientation_z = orientation_z;
    }
    public double getOrientation_r() {
        return orientation_r;
    }
    public void setOrientation_r(double orientation_r) {
        this.orientation_r = orientation_r;
    }
}
