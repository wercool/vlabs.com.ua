package vlabs.rest.model.valter.ik.palm.left;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import vlabs.rest.model.three.Vector3;

@Document(collection = "valter_left_palm_fk_tuples")
public class ValterLeftPalmFKTuple {
    @Id
    private String id;

    Vector3 leftPalmTargetPosition;
    double shoulderLeftLinkValue;
    double limbLeftLinkValue;
    double armLeftLinkValue;
    double forearmRollLeftLinkValue;

    public Vector3 getLeftPalmTargetPosition() {
        return leftPalmTargetPosition;
    }
    public void setLeftPalmTargetPosition(Vector3 leftPalmTargetPosition) {
        this.leftPalmTargetPosition = leftPalmTargetPosition;
    }
    public double getShoulderLeftLinkValue() {
        return shoulderLeftLinkValue;
    }
    public void setShoulderLeftLinkValue(double shoulderLeftLinkValue) {
        this.shoulderLeftLinkValue = shoulderLeftLinkValue;
    }
    public double getLimbLeftLinkValue() {
        return limbLeftLinkValue;
    }
    public void setLimbLeftLinkValue(double limbLeftLinkValue) {
        this.limbLeftLinkValue = limbLeftLinkValue;
    }
    public double getArmLeftLinkValue() {
        return armLeftLinkValue;
    }
    public void setArmLeftLinkValue(double armLeftLinkValue) {
        this.armLeftLinkValue = armLeftLinkValue;
    }
    public double getForearmRollLeftLinkValue() {
        return forearmRollLeftLinkValue;
    }
    public void setForearmRollLeftLinkValue(double forearmRollLeftLinkValue) {
        this.forearmRollLeftLinkValue = forearmRollLeftLinkValue;
    }
}
