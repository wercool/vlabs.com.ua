package vlabs.rest.model.valter.ik.head;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import vlabs.rest.model.three.Vector3;

@Document(collection = "valter_head_fk_tuples")
public class ValterHeadFKTuple {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    Vector3 targetDirectionFromHeadYawLinkOrigin;
    double headYawLinkValue;
    double headTiltLinkValue;

    public Vector3 getTargetDirectionFromHeadYawLinkOrigin() {
        return targetDirectionFromHeadYawLinkOrigin;
    }
    public void setTargetDirectionFromHeadYawLinkOrigin(Vector3 targetDirectionFromHeadYawLinkOrigin) {
        this.targetDirectionFromHeadYawLinkOrigin = targetDirectionFromHeadYawLinkOrigin;
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
