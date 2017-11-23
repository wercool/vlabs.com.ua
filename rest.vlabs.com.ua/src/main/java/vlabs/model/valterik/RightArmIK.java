package vlabs.model.valterik;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

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

    
}
