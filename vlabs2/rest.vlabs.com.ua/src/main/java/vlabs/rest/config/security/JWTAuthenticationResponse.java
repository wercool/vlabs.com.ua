package vlabs.rest.config.security;

import java.io.Serializable;

public class JWTAuthenticationResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String token;
    private String username;

    public JWTAuthenticationResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
