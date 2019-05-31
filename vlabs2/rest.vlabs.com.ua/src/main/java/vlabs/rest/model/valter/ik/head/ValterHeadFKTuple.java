package vlabs.rest.model.valter.ik.head;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import vlabs.rest.model.three.Vector3;

@Document(collection = "valter_head_fk_tuples")
public class ValterHeadFKTuple {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    Vector3 headTargetDirection;
    double headYawLinkValue;
    double headTiltLinkValue;

    public Vector3 getHeadTargetDirection() {
        return headTargetDirection;
    }
    public void setHeadTargetDirection(Vector3 headTargetDirection) {
        this.headTargetDirection = headTargetDirection;
    }
    public double getHeadYawLinkValue() {
        return headYawLinkValue;
    }
    public void setHeadYawLinkValue(double headYawLinkValue) {
        this.headYawLinkValue = headYawLinkValue;
    }
    public double getHeadTiltLinkValue() {
        return headTiltLinkValue;
    }
    public void setHeadTiltLinkValue(double headTiltLinkValue) {
        this.headTiltLinkValue = headTiltLinkValue;
    }
    public static long getSerialversionuid() {
        return serialVersionUID;
    }
}
