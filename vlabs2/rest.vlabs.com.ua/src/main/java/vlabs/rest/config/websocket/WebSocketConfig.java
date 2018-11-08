package vlabs.rest.config.websocket;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.WebSocketService;
import org.springframework.web.reactive.socket.server.support.HandshakeWebSocketService;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;
import org.springframework.web.reactive.socket.server.upgrade.ReactorNettyRequestUpgradeStrategy;

import reactor.core.publisher.Flux;
import reactor.core.publisher.UnicastProcessor;
import vlabs.rest.api.ws.BasicWebSocketHandler;
import vlabs.rest.api.ws.BasicWebSocketMessage;

@Configuration
public class WebSocketConfig {

    @Bean
    public UnicastProcessor<BasicWebSocketMessage> messagePublisher(){
        return UnicastProcessor.create();
    }

    @Bean
    public Flux<BasicWebSocketMessage> messages(UnicastProcessor<BasicWebSocketMessage> messagePublisher) {
        return messagePublisher
               .replay(0)
               .autoConnect();
    }

    @Bean
    public BasicWebSocketHandler basicWebSocketHandler(UnicastProcessor<BasicWebSocketMessage> messagePublisher, Flux<BasicWebSocketMessage> messages)
    {
        return new BasicWebSocketHandler(messagePublisher, messages);
    }

    @Bean
    public SimpleUrlHandlerMapping handlerMapping(BasicWebSocketHandler basicWebSocketHandler) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/api/ws/basic", basicWebSocketHandler);

        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.initApplicationContext();
        mapping.setOrder(-1); // before annotated controllers
        mapping.setUrlMap(map);
        return mapping;
    }

    @Bean
    public SimpleUrlHandlerMapping handlerMapping1() {
        UnicastProcessor<BasicWebSocketMessage> messagePublisher = UnicastProcessor.create();
        Flux<BasicWebSocketMessage> messages = messagePublisher.replay(0).autoConnect();

        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/api/ws/basic1", new BasicWebSocketHandler(messagePublisher, messages));

        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.initApplicationContext();
        mapping.setOrder(-1); // before annotated controllers
        mapping.setUrlMap(map);
        return mapping;
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter(webSocketService());
    }

//   /*
//    * For Tomcat
//    */
//    @Bean
//    public WebSocketService webSocketService() {
//        TomcatRequestUpgradeStrategy strategy = new TomcatRequestUpgradeStrategy();
//        strategy.setMaxSessionIdleTimeout(0L);
//        return new HandshakeWebSocketService(strategy);
//    }

    @Bean
    public WebSocketService webSocketService() {
        return new HandshakeWebSocketService(new ReactorNettyRequestUpgradeStrategy());
    }
}
