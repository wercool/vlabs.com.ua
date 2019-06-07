package vlabs.rest.model.valter.ik.palm.right;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import vlabs.rest.model.three.Vector3;

@Document(collection = "valter_right_palm_fk_tuples")
public class ValterRightPalmFKTuple {
    @Id
    private String id;

    Vector3 rightPalmTargetPosition;
    double shoulderRightLinkValue;
    double limbRightLinkValue;
    double armRightLinkValue;
    double forearmRollRightLinkValue;

    public Vector3 getRightPalmTargetPosition() {
        return rightPalmTargetPosition;
    }
    public void setRightPalmTargetPosition(Vector3 rightPalmTargetPosition) {
        this.rightPalmTargetPosition = rightPalmTargetPosition;
    }
    public double getShoulderRightLinkValue() {
        return shoulderRightLinkValue;
    }
    public void setShoulderRightLinkValue(double shoulderRightLinkValue) {
        this.shoulderRightLinkValue = shoulderRightLinkValue;
    }
    public double getLimbRightLinkValue() {
        return limbRightLinkValue;
    }
    public void setLimbRightLinkValue(double limbRightLinkValue) {
        this.limbRightLinkValue = limbRightLinkValue;
    }
    public double getArmRightLinkValue() {
        return armRightLinkValue;
    }
    public void setArmRightLinkValue(double armRightLinkValue) {
        this.armRightLinkValue = armRightLinkValue;
    }
    public double getForearmRollRightLinkValue() {
        return forearmRollRightLinkValue;
    }
    public void setForearmRollRightLinkValue(double forearmRollRightLinkValue) {
        this.forearmRollRightLinkValue = forearmRollRightLinkValue;
    }
}
