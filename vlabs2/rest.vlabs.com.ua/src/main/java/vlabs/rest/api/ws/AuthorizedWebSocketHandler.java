package vlabs.rest.api.ws;

import java.security.Principal;
import java.util.ArrayList;

import org.springframework.security.core.Authentication;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;

import reactor.core.publisher.Mono;

abstract class AuthorizedWebSocketHandler implements WebSocketHandler {

    protected ArrayList<String> authorizedRoles = new ArrayList<String>();

    @Override
    public final Mono<Void> handle(WebSocketSession session) {
        return session
               .getHandshakeInfo()
               .getPrincipal()
               .filter(this::isAuthorized)
               .then(doHandle(session));
    }

    private boolean isAuthorized(Principal principal) {
        Authentication authentication = (Authentication) principal;
        return authentication.isAuthenticated() &&
               authentication.getAuthorities().contains("ROLE_USER");
    }

    abstract Mono<Void> doHandle(WebSocketSession session);
}
