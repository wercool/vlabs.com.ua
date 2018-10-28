package vlabs.rest.api.ws;

import java.time.Duration;
import java.util.Arrays;

import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;


import reactor.core.publisher.Mono;

public class DefaultWebSocketHandler extends AuthorizedWebSocketHandler {

    public DefaultWebSocketHandler(){
        this.authorizedRoles.addAll(Arrays.asList("ROLE_USER"));
    }

    @Override
    Mono<Void> doHandle(WebSocketSession session) {
        // Use retain() for Reactor Netty
        return session.send(session.receive().doOnNext(WebSocketMessage::retain).delayElements(Duration.ofSeconds(2)));
    }

}
