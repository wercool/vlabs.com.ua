package vlabs.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
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

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "structure_id", referencedColumnName = "id")
    @OrderBy("sid DESC")
    private List<CElement> cElements = new ArrayList<>();

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

    public List<CElement> getcElements() {
        return cElements;
    }

    public void setcElements(List<CElement> cElements) {
        this.cElements = cElements;
    }
}
