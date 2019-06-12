package vlabs.rest.api.ws.valter.handlers;

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
import vlabs.rest.api.ws.AuthorizedWebSocketHandler;
import vlabs.rest.api.ws.valter.messages.NavKinectRGBDWebSocketMessage;

public class NavKinectRGBDWebSocketMessageHandler extends AuthorizedWebSocketHandler {

    private UnicastProcessor<NavKinectRGBDWebSocketMessage> messagePublisher;
    private Flux<String> outputMessages;
    private ObjectMapper mapper;

    public NavKinectRGBDWebSocketMessageHandler(UnicastProcessor<NavKinectRGBDWebSocketMessage> messagePublisher, Flux<NavKinectRGBDWebSocketMessage> messages){
        this.authorizedRoles.addAll(Arrays.asList("ROLE_USER"));
        this.messagePublisher = messagePublisher;
        this.mapper = new ObjectMapper();
        this.outputMessages = Flux.from(messages).map(this::toJSON);
    }

    @Override
    public Mono<Void> doHandle(WebSocketSession session) {
        WebSocketMessageSubscriber subscriber = new WebSocketMessageSubscriber(messagePublisher);

        session.receive()
               .map(WebSocketMessage::getPayloadAsText)
               .map(this::toNavKinectRGBDWebSocketMessage)
               .subscribe(subscriber::onNext,
                          subscriber::onError,
                          subscriber::onComplete);

        return session.send(outputMessages.map(session::textMessage));
    }

    public void terminate() {
        outputMessages.subscribe().dispose();
        messagePublisher.cancel();
    }

    private static class WebSocketMessageSubscriber {

        private UnicastProcessor<NavKinectRGBDWebSocketMessage> messagePublisher;
        private Optional<NavKinectRGBDWebSocketMessage> lastReceivedMessage = Optional.empty();

        public WebSocketMessageSubscriber(UnicastProcessor<NavKinectRGBDWebSocketMessage> messagePublisher) {
            this.messagePublisher = messagePublisher;
        }

        public void onNext(NavKinectRGBDWebSocketMessage message) {
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

    private NavKinectRGBDWebSocketMessage toNavKinectRGBDWebSocketMessage(String json) {
        try {
            return mapper.readValue(json, NavKinectRGBDWebSocketMessage.class);
        } catch (IOException e) {
            throw new RuntimeException("Invalid JSON:" + json, e);
        }
    }

    private String toJSON(NavKinectRGBDWebSocketMessage message) {
        try {
            return mapper.writeValueAsString(message);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}