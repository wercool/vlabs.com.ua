package vlabs.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.MapsId;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.springframework.lang.Nullable;

@Entity
@Table(name="user_media")
public class UserMedia {

    @Id
    @Column(name="user_id")
    private Long id;

    @Lob
    @Nullable
    @Column(name="photo")
    private byte[] photo;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    private User user;

    UserMedia(){
        super();
    }

    public UserMedia(User user){
        this();
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public byte[] getPhoto() {
        return photo;
    }

    public void setPhoto(byte[] photo) {
        this.photo = photo;
    }

}
