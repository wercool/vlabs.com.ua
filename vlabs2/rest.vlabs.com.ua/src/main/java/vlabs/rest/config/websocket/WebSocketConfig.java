package vlabs.rest.config.websocket;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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
    public HandlerMapping handlerMapping(UnicastProcessor<BasicWebSocketMessage> messagePublisher, Flux<BasicWebSocketMessage> messages) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/api/ws/basic", new BasicWebSocketHandler(messagePublisher, messages));

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