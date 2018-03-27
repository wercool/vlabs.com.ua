package vlabs.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
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
import javax.persistence.Transient;

import org.joda.time.DateTime;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

@SuppressWarnings("serial")
@Entity
@Table(name="users")
public class User implements UserDetails
{
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username")
    private String username;

    @JsonProperty(access = Access.WRITE_ONLY)
    @Column(name = "password")
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "enabled")
    private boolean enabled;

    @Column(name = "last_password_reset_date")
    private Timestamp lastPasswordResetDate;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(name = "user_authority",
               joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "authority_id", referencedColumnName = "id"))
    private List<Authority> authorities;

    @Transient
    private UserMedia userMedia;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        Timestamp now = new Timestamp(DateTime.now().getMillis());
        this.setLastPasswordResetDate(now);
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setAuthorities(List<Authority> authorities) {
        this.authorities = authorities;
    }

    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> grantedAuthorities = new ArrayList<GrantedAuthority>();
        grantedAuthorities.addAll(this.authorities);
        return grantedAuthorities;
    }

    @JsonIgnore
    public List<Authority> getAuthoritiesList() {
        List<Authority> authorities = new ArrayList<Authority>();
        authorities.addAll(this.authorities);
        return authorities;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "user", fetch = FetchType.LAZY, optional=false)
    @JsonIgnore
    public UserMedia getUserMedia() {
        return (this.userMedia == null) ? new UserMedia(this) : userMedia;
    }

    public void setUserMedia(UserMedia userMedia) {
        this.userMedia = userMedia;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Timestamp getLastPasswordResetDate() {
        return lastPasswordResetDate;
    }

    public void setLastPasswordResetDate(Timestamp lastPasswordResetDate) {
        this.lastPasswordResetDate = lastPasswordResetDate;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }


    @JsonIgnore
    public boolean isRegularUser() {
        for (Authority authority : getAuthoritiesList()) {
            if (authority.getName().equals("ROLE_ADMIN")
             || authority.getName().equals("ROLE_MANAGER"))
                return false;
        }
        return true;
    }
}
