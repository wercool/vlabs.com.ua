package vlabs.rest.auth.jwt;

/**
 * A a static class that abstracts a secret provider
 * Later this one can be changed with a better approach
 *
 */
public class JWTSecrets {

  /**
   * A default secret for development purposes.
   */
  public final static  String DEFAULT_SECRET = "qwertyuiopasdfghjklzxcvbnmqwerty";
}
