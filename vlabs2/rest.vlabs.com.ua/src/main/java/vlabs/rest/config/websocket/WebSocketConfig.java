package vlabs.rest.config.websocket;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.WebSocketService;
import org.springframework.web.reactive.socket.server.support.HandshakeWebSocketService;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;
import org.springframework.web.reactive.socket.server.upgrade.ReactorNettyRequestUpgradeStrategy;

import reactor.core.publisher.Flux;
import reactor.core.publisher.UnicastProcessor;
import vlabs.rest.api.ws.BasicWebSocketMessageHandler;
import vlabs.rest.api.ws.valter.handlers.NavKinectRGBDWebSocketMessageHandler;
import vlabs.rest.api.ws.valter.messages.NavKinectRGBDWebSocketMessage;
import vlabs.rest.api.ws.BasicWebSocketMessage;

@Configuration
public class WebSocketConfig {

    @Value("${ws.maxFramePayloadLength}")
    Integer maxFramePayloadLength;

    /**
     * 
     * BasicWebSocketMessage
     * 
     */
    @Bean
    public UnicastProcessor<BasicWebSocketMessage> basicWebSocketMessagePublisher(){
        return UnicastProcessor.create();
    }
    @Bean
    public Flux<BasicWebSocketMessage> basicWebSocketMessages(UnicastProcessor<BasicWebSocketMessage> basicWebSocketMessagePublisher) {
        return basicWebSocketMessagePublisher
               .replay(0)
               .autoConnect();
    }
    @Bean
    public BasicWebSocketMessageHandler basicWebSocketMessageHandler(UnicastProcessor<BasicWebSocketMessage> basicWebSocketMessagePublisher, Flux<BasicWebSocketMessage> basicWebSocketMessages)
    {
        return new BasicWebSocketMessageHandler(basicWebSocketMessagePublisher, basicWebSocketMessages);
    }

    /**
     * 
     * NavKinectRGBDWebSocketMessage
     * 
     */
    @Bean
    public UnicastProcessor<NavKinectRGBDWebSocketMessage> navKinectRGBDWebSocketMessagePublisher(){
        return UnicastProcessor.create();
    }
    @Bean
    public Flux<NavKinectRGBDWebSocketMessage> navKinectRGBDWebSocketMessages(UnicastProcessor<NavKinectRGBDWebSocketMessage> navKinectRGBDWebSocketMessagePublisher) {
        return navKinectRGBDWebSocketMessagePublisher
               .replay(0)
               .autoConnect();
    }
    @Bean
    public NavKinectRGBDWebSocketMessageHandler navKinectRGBDWebSocketMessageHandler(UnicastProcessor<NavKinectRGBDWebSocketMessage> navKinectRGBDWebSocketMessagePublisher, Flux<NavKinectRGBDWebSocketMessage> navKinectRGBDWebSocketMessages)
    {
        return new NavKinectRGBDWebSocketMessageHandler(navKinectRGBDWebSocketMessagePublisher, navKinectRGBDWebSocketMessages);
    }

    @Bean
    public SimpleUrlHandlerMapping handlerMapping(
            BasicWebSocketMessageHandler basicWebSocketMessageHandler,
            NavKinectRGBDWebSocketMessageHandler navKinectRGBDWebSocketMessageHandler
            ) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/api/ws/basic", basicWebSocketMessageHandler);
        
        /**
         * Valter
         */
        map.put("/api/ws/valter/nav_kinect_rgbd", navKinectRGBDWebSocketMessageHandler);

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
        ReactorNettyRequestUpgradeStrategy reactorNettyRequestUpgradeStrategy = new ReactorNettyRequestUpgradeStrategy();
        reactorNettyRequestUpgradeStrategy.setMaxFramePayloadLength(maxFramePayloadLength);

        return new HandshakeWebSocketService(reactorNettyRequestUpgradeStrategy);
    }
}
