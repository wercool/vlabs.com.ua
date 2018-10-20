package vlabs.rest.auth.jwt;

import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

/**
 * A service to create JWT objects, this one is used when an exchange
 * provides basic authentication.
 * If authentication is successful, a token is added in the response
 */
@Component
public class JWTTokenService {

    /**
     * Create and sign a JWT object using information from the current
     * authenticated principal
     *
     * @param subject     Name of current principal
     * @param credentials Credentials of current principal
     * @param authorities A collection of granted authorities for this principal
     * @return String representing a valid token
     */
    public String generateToken(String subject, Object credentials, Collection<? extends GrantedAuthority> authorities) {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(subject)
                .issuer("VLabs")
                .expirationTime(new Date(new Date().getTime() + 5 * 1000))
                .claim("auths", authorities.parallelStream().map(auth -> (GrantedAuthority) auth).map(a -> a.getAuthority()).collect(Collectors.joining(",")))
                .build();

        SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);

        try {
            signedJWT.sign(new JWTCustomSigner().getSigner());
        } catch (JOSEException e) {
            e.printStackTrace();
        }

        return signedJWT.serialize();
    }
}
