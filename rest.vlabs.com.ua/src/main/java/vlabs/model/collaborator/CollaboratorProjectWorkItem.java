package vlabs.model.collaborator;

import java.sql.Timestamp;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import vlabs.model.generic.VLabsFileItem;


@Entity
@Table(name="collaborator_project_work_items")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CollaboratorProjectWorkItem
{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "collaborator_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long collaborator_id;

    @Column(name = "project_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long project_id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaborator_id", referencedColumnName = "id", nullable=true, insertable=false, updatable=false)
    private Collaborator collaborator;

    /*
     * RESOURCE
     * BLENDER_MODEL
     * VLAB_ITEM
     * */
    @Column(name = "type")
    private String type;

    @Column(name = "title")
    private String title;

    @Column(name = "alias")
    private String alias;

    @Column(name = "notes", columnDefinition="TEXT")
    private String notes;

    @Column(name = "last_update_date")
    private Timestamp lastUpdateDate;

    @Transient
    private List<VLabsFileItem> fileItems;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCollaborator_id() {
        return collaborator_id;
    }

    public void setCollaborator_id(Long collaborator_id) {
        this.collaborator_id = collaborator_id;
    }

    public Long getProject_id() {
        return project_id;
    }

    public void setProject_id(Long project_id) {
        this.project_id = project_id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Timestamp getLastUpdateDate() {
        return lastUpdateDate;
    }

    public void setLastUpdateDate(Timestamp lastUpdateDate) {
        this.lastUpdateDate = lastUpdateDate;
    }

    public List<VLabsFileItem> getFileItems() {
        return fileItems;
    }

    public void setFileItems(List<VLabsFileItem> fileItems) {
        this.fileItems = fileItems;
    }

    public Collaborator getCollaborator() {
        return collaborator;
    }

    public void setCollaborator(Collaborator collaborator) {
        this.collaborator = collaborator;
    }

}
