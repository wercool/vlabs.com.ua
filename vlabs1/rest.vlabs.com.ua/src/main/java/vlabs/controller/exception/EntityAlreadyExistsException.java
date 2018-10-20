package vlabs.controller.exception;

@SuppressWarnings("serial")
public class EntityAlreadyExistsException extends Exception {

    private String message;
    private String causedClassName = "VLabs REST controller";

    public EntityAlreadyExistsException(String message) {
        super(message);
        setMessage(message);
    }
    
    public EntityAlreadyExistsException(String message, String causedClassName) {
        super(message);
        setMessage(message);
        setCausedClassName(causedClassName);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCausedClassName() {
        return causedClassName;
    }

    public void setCausedClassName(String causedClassName) {
        this.causedClassName = causedClassName;
    }
}
