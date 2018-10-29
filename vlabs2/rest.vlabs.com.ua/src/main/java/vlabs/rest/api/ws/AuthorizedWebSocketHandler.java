package vlabs.rest.api.ws;

import java.security.Principal;
import java.util.ArrayList;

import org.springframework.security.core.Authentication;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;

import reactor.core.publisher.Mono;

abstract class AuthorizedWebSocketHandler implements WebSocketHandler {

    protected ArrayList<String> authorizedRoles = new ArrayList<String>();

    public AuthorizedWebSocketHandler(){
    }

    private <T> Mono<T> raiseBadCredentials() {
        return Mono.empty();
//        return Mono.error(new BadCredentialsException("Invalid Credentials"));
    }

    @Override
    public final Mono<Void> handle(WebSocketSession session) {
        return session
               .getHandshakeInfo()
               .getPrincipal()
               .switchIfEmpty(Mono.defer(this::raiseBadCredentials))
//               .filter(this::isAuthorized)
               .then(doHandle(session));
    }

    private boolean isAuthorized(Principal principal) {
//        Authentication authentication = (Authentication) principal;
//        return authentication.isAuthenticated() &&
//               authentication.getAuthorities().contains("ROLE_USER");
        return false;
    }

    abstract Mono<Void> doHandle(WebSocketSession session);
}
