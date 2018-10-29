package vlabs.rest.config.security;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import vlabs.rest.config.security.model.Role;
import vlabs.rest.service.UserService;

//@Component
//public class AuthenticationManager implements ReactiveAuthenticationManager {
//
//    @SuppressWarnings("unused")
//    private static final Logger log = LoggerFactory.getLogger(AuthenticationManager.class);
//
//    @Autowired
//    private JWTUtil jwtUtil;
//
//    @Override
//    public Mono<Authentication> authenticate(Authentication authentication) {
//        String authToken = authentication.getCredentials().toString();
//        String username;
//        try {
//            username = jwtUtil.getUsernameFromToken(authToken);
//        } catch (Exception e) {
//            username = null;
//        }
//
//        if (username != null && jwtUtil.validateToken(authToken)) {
//            Claims claims = jwtUtil.getAllClaimsFromToken(authToken);
//            @SuppressWarnings("unchecked")
//            List<String> rolesMap = claims.get("role", List.class);
//            List<Role> roles = new ArrayList<>();
//            for (String rolemap : rolesMap) {
//                roles.add(Role.valueOf(rolemap));
//            }
//
//            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
//                username,
//                null,
//                roles.stream().map(authority -> new SimpleGrantedAuthority(authority.name())).collect(Collectors.toList())
//            );
//
//            return Mono.just(auth);
//        } else {
//            return Mono.empty();
//        }
//    }
//}

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
            String bearerRequestHeader = jwtPreAuthenticationToken.getBearerRequestHeader();

            log.info("checking authentication for user " + username);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtTokenUtil.validateToken(authToken)) {
                    log.info("authenticated user " + username + ", setting security context");
                    final String token = authToken;
                    return userService.findByUsername(username);
                }
            }
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid token...");
        }

        return null;
    }
}
