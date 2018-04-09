package vlabs.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import vlabs.controller.UserController;

public class AccessDeniedHandlerImpl implements AccessDeniedHandler {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {

        String method = ((HttpServletRequest)request).getMethod();
        String url = ((HttpServletRequest)request).getRequestURL().toString();

        log.info("ACCESS FORBIDDEN to [ " + url + " ] requested [ " + method + " ] from " + request.getRemoteAddr());

        JSONObject responseBody = new JSONObject();
        try {
            responseBody.put("errorCause", "Access Forbidden");
            responseBody.put("detailMessage", HttpStatus.FORBIDDEN.getReasonPhrase());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.addHeader("errorDetails", responseBody.toString());

        response.getWriter().write(responseBody.toString());
        response.getWriter().flush();
        response.getWriter().close();
    }

}
