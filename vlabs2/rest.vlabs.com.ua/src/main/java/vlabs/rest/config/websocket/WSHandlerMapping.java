package vlabs.rest.config.websocket;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;

import reactor.core.publisher.Flux;
import reactor.core.publisher.UnicastProcessor;
import vlabs.rest.api.ws.BasicWebSocketHandler;
import vlabs.rest.api.ws.BasicWebSocketMessage;

public class WSHandlerMapping extends SimpleUrlHandlerMapping {

    public WSHandlerMapping() {
        super();
        UnicastProcessor<BasicWebSocketMessage> messagePublisher = UnicastProcessor.create();
        Flux<BasicWebSocketMessage> messages = messagePublisher.replay(0).autoConnect();
        
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/api/ws/basic2", new BasicWebSocketHandler(messagePublisher, messages));
    
        initApplicationContext();
        setOrder(-1);
        setUrlMap(map);
    }

}
