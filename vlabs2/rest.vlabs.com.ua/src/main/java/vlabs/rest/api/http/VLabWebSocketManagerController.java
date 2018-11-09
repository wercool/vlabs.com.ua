package vlabs.rest.api.http;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.common.ManagedResponse;
import vlabs.rest.config.websocket.VLabWebSocketHandlerMapping;

@RestController
@RequestMapping(path = "/api/vlab_websocket_manager")
public class VLabWebSocketManagerController {

    @Autowired
    VLabWebSocketHandlerMapping vLabWebSocketHandlerMapping;

    @RequestMapping(value = "/add_mapping/{suffix}", method = RequestMethod.GET)
    @PreAuthorize("hasRole('USER')")
    public Mono<ManagedResponse> addMapping(@PathVariable("suffix") String suffix) {
        return vLabWebSocketHandlerMapping.addMapping("/api/ws/" + suffix)
                .map((result) -> {
                    if (result) {
                        return new ManagedResponse(ManagedResponse.Status.OK, "/api/ws/" + suffix + " mapping added");
                    } else {
                        return new ManagedResponse(ManagedResponse.Status.ALREADY_DONE, "");
                    }
                });
    }

    @RequestMapping(value = "/remove_mapping/{suffix}", method = RequestMethod.GET)
    @PreAuthorize("hasRole('USER')")
    public Mono<ManagedResponse> removeMapping(@PathVariable("suffix") String suffix) {
        return vLabWebSocketHandlerMapping.removeMapping("/api/ws/" + suffix)
                .map((result) -> {
                    if (result) {
                        return new ManagedResponse(ManagedResponse.Status.OK, "/api/ws/" + suffix + " mapping removed");
                    } else {
                        return new ManagedResponse(ManagedResponse.Status.ALREADY_DONE, "");
                    }
                });
    }
}
