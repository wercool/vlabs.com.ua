package vlabs.config;


import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RESTExceptionHandler extends ResponseEntityExceptionHandler {
 
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotWritable(HttpMessageNotWritableException ex, HttpHeaders headers, HttpStatus status, WebRequest request) {

        JSONObject responseBody = new JSONObject();
        try {
            responseBody.put("errorCause", ex.getCause().getMessage());
            responseBody.put("detailMessage", ex.getMessage());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        headers.add("errorDetails", responseBody.toString());
        return handleExceptionInternal(ex, responseBody.toString(), headers, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }
}
