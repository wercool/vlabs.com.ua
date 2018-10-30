package vlabs.rest.api.ws;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.UnicastProcessor;

public class BasicWebSocketHandler extends AuthorizedWebSocketHandler {

    private UnicastProcessor<BasicWebSocketMessage> messagePublisher;
    private Flux<String> outputMessages;
    private ObjectMapper mapper;

    public BasicWebSocketHandler(UnicastProcessor<BasicWebSocketMessage> messagePublisher, Flux<BasicWebSocketMessage> messages){
        this.authorizedRoles.addAll(Arrays.asList("ROLE_USER"));
        this.messagePublisher = messagePublisher;
        this.mapper = new ObjectMapper();
        this.outputMessages = Flux.from(messages).map(this::toJSON);
    }

    @Override
    Mono<Void> doHandle(WebSocketSession session) {
        WebSocketMessageSubscriber subscriber = new WebSocketMessageSubscriber(messagePublisher);
        session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .map(this::toChatMessage)
                .subscribe(subscriber::onNext, subscriber::onError, subscriber::onComplete);
        return session.send(outputMessages.map(session::textMessage));
    }

    private static class WebSocketMessageSubscriber {

        private UnicastProcessor<BasicWebSocketMessage> messagePublisher;
        private Optional<BasicWebSocketMessage> lastReceivedMessage = Optional.empty();

        public WebSocketMessageSubscriber(UnicastProcessor<BasicWebSocketMessage> messagePublisher) {
            this.messagePublisher = messagePublisher;
        }

        public void onNext(BasicWebSocketMessage message) {
            lastReceivedMessage = Optional.of(message);
            messagePublisher.onNext(message);
        }

        public void onError(Throwable error) {
            error.printStackTrace();
        }

        public void onComplete() {
            lastReceivedMessage.ifPresent(messagePublisher::onNext);
        }
    }

    private BasicWebSocketMessage toChatMessage(String json) {
        try {
            return mapper.readValue(json, BasicWebSocketMessage.class);
        } catch (IOException e) {
            throw new RuntimeException("Invalid JSON:" + json, e);
        }
    }

    private String toJSON(BasicWebSocketMessage message) {
        try {
            return mapper.writeValueAsString(message);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}