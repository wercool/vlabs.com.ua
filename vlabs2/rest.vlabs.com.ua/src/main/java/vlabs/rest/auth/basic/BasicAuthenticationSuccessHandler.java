package vlabs.rest.auth.basic;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import vlabs.rest.auth.jwt.JWTTokenService;

/**
 * On success authentication a signed JWT object is serialized and added
 * in the authorization header as a bearer token
 */
@Component
public class BasicAuthenticationSuccessHandler implements ServerAuthenticationSuccessHandler {

    /**
     * A successful authentication object us used to create a JWT object and
     * added in the authorization header of the current WebExchange
     *
     * @param webFilterExchange
     * @param authentication
     * @return
     */
    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        ServerWebExchange exchange = webFilterExchange.getExchange();
        exchange.getResponse()
                .getHeaders()
                .add(HttpHeaders.AUTHORIZATION, getHttpAuthHeaderValue(authentication));
        return webFilterExchange.getChain().filter(exchange);
    }

    private static String getHttpAuthHeaderValue(Authentication authentication){
        return String.join(" ","Bearer",tokenFromAuthentication(authentication));
    }

    private static String tokenFromAuthentication(Authentication authentication){
        return new JWTTokenService().generateToken(
                                            authentication.getName(),
                                            authentication.getCredentials(),
                                            authentication.getAuthorities());
    }
}