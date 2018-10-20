package vlabs.rest.service;

import org.springframework.stereotype.Component;

import reactor.core.publisher.Flux;
import vlabs.rest.entity.FormattedMessage;

@Component
public class MessageService {

    public Flux<FormattedMessage> getDefaultMessage(){
        return Flux.just(new FormattedMessage());
    }

    public Flux<FormattedMessage> getCustomMessage(String name){
        return Flux.just(new FormattedMessage(name));
    }
}
