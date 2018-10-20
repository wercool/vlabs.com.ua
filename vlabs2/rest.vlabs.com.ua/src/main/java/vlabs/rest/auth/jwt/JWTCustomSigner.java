package vlabs.rest.auth.jwt;

import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.KeyLengthException;
import com.nimbusds.jose.crypto.MACSigner;

/**
 *  Creates a JWTSigner using a simple secret string
 */
public class JWTCustomSigner {

    private JWSSigner signer;

    public JWTCustomSigner() {
        JWSSigner init;
        try {
            init = new MACSigner(JWTSecrets.DEFAULT_SECRET);
        } catch (KeyLengthException e) {
            init = null;
        }
        this.signer = init;
    }

    public JWSSigner getSigner() {
        return this.signer;
    }
}