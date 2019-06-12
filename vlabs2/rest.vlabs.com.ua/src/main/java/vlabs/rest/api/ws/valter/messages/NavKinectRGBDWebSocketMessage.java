package vlabs.rest.api.ws.valter.messages;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class NavKinectRGBDWebSocketMessage {

    public String rgbImageData;
    public String depthImageData;

    @JsonCreator
    public NavKinectRGBDWebSocketMessage(@JsonProperty("rgbImageData") String rgbImageData, @JsonProperty("depthImageData") String depthImageData) {
        this.rgbImageData = rgbImageData;
        this.depthImageData = depthImageData;
    }

    @JsonIgnore
    public String getRgbImageData(){
        return rgbImageData;
    }
}
