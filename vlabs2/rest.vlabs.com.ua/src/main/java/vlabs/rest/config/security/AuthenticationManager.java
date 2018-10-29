package vlabs.rest.config.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import vlabs.rest.service.UserService;

@Component
public class AuthenticationManager implements ReactiveAuthenticationManager {
    private static final Logger log = LoggerFactory.getLogger(AuthenticationManager.class);

    @Autowired
    UserService userService;
    @Autowired
    JWTTokenUtil jwtTokenUtil;
    @Autowired
    CustomPasswordEncoder passwordEncoder;

    @Override
    public Mono<Authentication> authenticate(final Authentication authentication) {
        if (authentication instanceof JWTPreAuthenticationToken) {
            return Mono.just(authentication)
                    .switchIfEmpty(Mono.defer(this::raiseBadCredentials))
                    .cast(JWTPreAuthenticationToken.class)
                    .flatMap(this::authenticateToken)
                    .publishOn(Schedulers.parallel())
                    .onErrorResume(e -> raiseBadCredentials())
                    .map(u -> new JWTAuthenticationToken(u.getUsername(), u.getAuthorities()));
        }

        return Mono.just(authentication);
    }

    private <T> Mono<T> raiseBadCredentials() {
        return Mono.error(new BadCredentialsException("Invalid Credentials"));
    }

    private Mono<UserDetails> authenticateToken(final JWTPreAuthenticationToken jwtPreAuthenticationToken) {
        try {
            String authToken = jwtPreAuthenticationToken.getAuthToken();
            String username = jwtPreAuthenticationToken.getUsername();

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtTokenUtil.validateToken(authToken)) {
                    return userService.findByUsername(username);
                }
            }
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid token...");
        }

        return null;
    }
}
