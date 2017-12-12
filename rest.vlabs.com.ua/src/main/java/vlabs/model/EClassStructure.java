package vlabs.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name="eclass_structure")
public class EClassStructure
{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "eclass_id")
    private Long eclassId;

    @Column(name = "format_id")
    private Long formatId;

    @OneToMany(mappedBy = "eClassStructure", fetch = FetchType.LAZY)
    private List<CElement> celements = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEclassId() {
        return eclassId;
    }

    public void setEclassId(Long eclassId) {
        this.eclassId = eclassId;
    }

    public Long getFormatId() {
        return formatId;
    }

    public void setFormatId(Long formatId) {
        this.formatId = formatId;
    }

    public List<CElement> getCelements() {
        return celements;
    }

    public void setCelements(List<CElement> celements) {
        this.celements = celements;
    }

    public void addCElement(CElement cElement) {
        celements.add(cElement);
        cElement.seteClassStructure(this);
    }
 
    public void removeCElement(CElement cElement) {
        celements.remove(cElement);
        cElement.seteClassStructure(this);
    }
}
