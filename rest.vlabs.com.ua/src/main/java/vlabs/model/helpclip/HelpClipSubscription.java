package vlabs.model.helpclip;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name="helpclip_subscriptions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HelpClipSubscription {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "helpclip_id")
    private Long helpClipId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getHelpClipId() {
        return helpClipId;
    }

    public void setHelpClipId(Long helpClipId) {
        this.helpClipId = helpClipId;
    }
}
