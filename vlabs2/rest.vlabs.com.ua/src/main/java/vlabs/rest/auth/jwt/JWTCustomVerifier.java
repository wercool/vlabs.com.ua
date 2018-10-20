package vlabs.rest.auth.jwt;

import java.text.ParseException;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;

import reactor.core.publisher.Mono;

/**
 *  Decides when a JWT string is valid.
 *  First  try to parse it, then check that
 *  the signature is correct.
 *  If something fails an empty Mono is returning
 *  meaning that is not valid
 */
public class JWTCustomVerifier {

    public static Mono<SignedJWT> check(String token) {
        SignedJWT signedJWT;
        JWSVerifier jwsVerifier;
        boolean status;

        try {
            jwsVerifier = new MACVerifier(JWTSecrets.DEFAULT_SECRET);
        } catch (JOSEException e) {
            return Mono.empty();
        }

        try {
            signedJWT = SignedJWT.parse(token);
        } catch (ParseException e) {
          return Mono.empty();
        }

        try {
            status =   signedJWT.verify(jwsVerifier);
        } catch (JOSEException e) {
            return Mono.empty();
        }

        return status ? Mono.just(signedJWT) : Mono.empty();
    }
}
