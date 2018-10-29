package vlabs.rest.config.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class SecurityContextRepository implements ServerSecurityContextRepository {

    @SuppressWarnings("unused")
    private static final Logger log = LoggerFactory.getLogger(SecurityContextRepository.class);

    @Value("${jwt.prefix}")
    private String jwtPrefix;

    @Value("${jwt.param}")
    private String jwtParam;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public Mono<Void> save(ServerWebExchange swe, SecurityContext sc) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    private <T> Mono<T> raiseBadCredentials() {
        return Mono.empty();
//        return Mono.error(new BadCredentialsException("Invalid Credentials"));
    }

    @Override
    public Mono<SecurityContext> load(ServerWebExchange swe) {
        ServerHttpRequest request = swe.getRequest();
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        MultiValueMap<String, String> queryParams = request.getQueryParams();

        String authToken = null;
        Boolean wsAuth = queryParams.containsKey(jwtParam);

        if (authHeader != null && authHeader.startsWith(jwtPrefix)) {
            authToken = authHeader.substring(7);
        } else if (wsAuth) {
            authToken = queryParams.getFirst(jwtParam);
        }

        if (authToken != null) {
            Authentication auth = new UsernamePasswordAuthenticationToken(authToken, authToken);
            return this.authenticationManager
                   .authenticate(auth)
                   .switchIfEmpty(Mono.defer(this::raiseBadCredentials))
                   .map((authentication) -> {
                       return new SecurityContextImpl(authentication);
                   });
        } else {
            return Mono.empty();
        }
    }
}
