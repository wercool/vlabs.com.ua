package vlabs.rest.common;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize
public class SimpleJSONResponse {

    String body;

    public SimpleJSONResponse(String body) {
        this.setBody(body);
    }

    public String getBody() {
        return body;
    }
    public void setBody(String body) {
        this.body = body;
    }
}
