package vlabs.rest.api.ws;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class BasicWebSocketMessage {

    public String type;
    public String message;

    @JsonCreator
    public BasicWebSocketMessage(@JsonProperty("type") String type, @JsonProperty("message") String message) {
        this.type = type;
        this.message = message;
    }

    @JsonIgnore
    public String getMessage(){
        return message;
    }
}
