package vlabs.rest.common;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize
public class ManagedResponse {

    public enum Status {
        OK,
        ALREADY_DONE;
    }

    Status status;
    String message;

    public ManagedResponse(Status status, String message) {
        super();
        this.status = status;
        this.message = message;
    }
    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
