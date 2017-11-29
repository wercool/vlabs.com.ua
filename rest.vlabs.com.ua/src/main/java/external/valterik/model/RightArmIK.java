package external.valterik.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="rightArm")
public class RightArmIK
{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "eefX", columnDefinition="Double(5, 3)")
    private Double eefX;

    @Column(name = "eefY", columnDefinition="Double(5, 3)")
    private Double eefY;

    @Column(name = "eefZ", columnDefinition="Double(5, 3)")
    private Double eefZ;

    @JsonIgnore
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getEefX() {
        return eefX;
    }

    public void setEefX(Double eefX) {
        this.eefX = eefX;
    }

    public Double getEefY() {
        return eefY;
    }

    public void setEefY(Double eefY) {
        this.eefY = eefY;
    }

    public Double getEefZ() {
        return eefZ;
    }

    public void setEefZ(Double eefZ) {
        this.eefZ = eefZ;
    }

}
