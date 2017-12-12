package vlabs.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinColumns;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name="eclasses")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EClass
{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "description", length = 2048)
    private String description;

    @Column(name = "active")
    private Boolean active;

    @Lob
    @Column(name = "summary")
    private String summary;

    @Column(name = "format_id")
    private Long format_id;

    @Column(name = "structure_id")
    private Long structure_id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "format_id", referencedColumnName = "id", insertable=false, updatable=false)
    private EClassFormat format;

    @Transient
    private EClassStructure structure;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    @JsonIgnore
    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Long getFormat_id() {
        return format_id;
    }

    public void setFormat_id(Long format_id) {
        this.format_id = format_id;
    }

    public EClassFormat getFormat() {
        return format;
    }

    public Long getStructure_id() {
        return structure_id;
    }

    public void setStructure_id(Long structure_id) {
        this.structure_id = structure_id;
    }

    public void setFormat(EClassFormat format) {
        this.format = format;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "structure_id", referencedColumnName = "id", insertable = false, updatable = false),
        @JoinColumn(name = "format_id", referencedColumnName = "format_id", insertable = false, updatable = false)
    })
    public EClassStructure getStructure() {
        return structure;
    }

    public void setStructure(EClassStructure structure) {
        this.structure = structure;
    }
}
