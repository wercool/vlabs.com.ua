package vlabs.model.collaborator;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import vlabs.model.user.User;

@Entity
@Table(name="collaborators")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Collaborator
{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable=true, insertable=false, updatable=false)
    private User user;

    @Column(name = "alias")
    private String alias;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.REMOVE }, fetch = FetchType.LAZY)
    @JoinTable(name = "collaborator_project",
               joinColumns = @JoinColumn(name = "collaborator_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "project_id", referencedColumnName = "id"))
    private List<CollaboratorProject> projects;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public List<CollaboratorProject> getProjects() {
        return projects;
    }

    public void setProjects(List<CollaboratorProject> projects) {
        this.projects = projects;
    }

 
}