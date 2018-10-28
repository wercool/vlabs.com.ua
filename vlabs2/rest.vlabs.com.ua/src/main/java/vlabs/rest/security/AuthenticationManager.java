package vlabs.rest.security;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;
import vlabs.rest.security.model.Role;

@Component
public class AuthenticationManager implements ReactiveAuthenticationManager {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationManager.class);

    @Autowired
    private JWTUtil jwtUtil;

    public Boolean wsAuthentication = false;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String authToken = authentication.getCredentials().toString();
        String username;
        try {
            username = jwtUtil.getUsernameFromToken(authToken);
        } catch (Exception e) {
            username = null;
        }
        if (username != null && jwtUtil.validateToken(authToken)) {
            Claims claims = jwtUtil.getAllClaimsFromToken(authToken);
            @SuppressWarnings("unchecked")
            List<String> rolesMap = claims.get("role", List.class);
            List<Role> roles = new ArrayList<>();
            for (String rolemap : rolesMap) {
                roles.add(Role.valueOf(rolemap));
            }
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                username,
                null,
                roles.stream().map(authority -> new SimpleGrantedAuthority(authority.name())).collect(Collectors.toList())
            );
            if (wsAuthentication) log.info("WebSocket authentication attempt succeeded { username: \"" + authentication.getPrincipal().toString() + "\" }");
            wsAuthentication = false;
            return Mono.just(auth);
        } else {
            if (wsAuthentication) log.info("WebSocket authentication attempt failed { username: \"" + authentication.getPrincipal().toString() + "\" }");
            wsAuthentication = false;
            return Mono.empty();
        }
    }
}
