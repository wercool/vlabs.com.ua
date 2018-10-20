package vlabs.rest.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Flux;
import vlabs.rest.entity.FormattedMessage;
import vlabs.rest.service.MessageService;

@RestController
public class PublicController {
    @Autowired
    MessageService messageService;

    /**
     * Root end-point serves as a resource for Basic Authentication
     *
     * @return A publisher that serves a welcoming message
     */
    @GetMapping("/")
    public Flux<FormattedMessage> root() {
        return messageService.getDefaultMessage();
    }
}
