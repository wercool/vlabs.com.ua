package vlabs.config;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.filter.CommonsRequestLoggingFilter;
import org.springframework.web.filter.OncePerRequestFilter;

@SuppressWarnings("unused")
@Configuration
public class TopMostServletFilter extends OncePerRequestFilter
{

    private final Logger logger = LoggerFactory.getLogger(TopMostServletFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

      //processing before the request is sent to servlet, the request filter

      if (request instanceof HttpServletRequest)
      {
          HttpServletRequest httpRequest = (HttpServletRequest) request;
          String method = ((HttpServletRequest)request).getMethod();
          String url = ((HttpServletRequest)request).getRequestURL().toString();
          String queryString = ((HttpServletRequest)request).getQueryString();
          queryString = (queryString != null) ? (queryString.isEmpty() ? "?" + queryString : ""): "";
          logger.info("[" + method + "] " + url + queryString + " from " + request.getRemoteAddr());
      }


//      filterChain.doFilter(request, response);

      //processing after the request is sent to the servlet, the response filter

      try
      {
          filterChain.doFilter(request, response);
      }
      catch (Exception appEx)
      {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        int status = response.getStatus();
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        PrintWriter responseWriter = response.getWriter();
        JSONObject responseBody = new JSONObject();
        
        try {
            responseBody.put("errorCause", appEx.getCause().getMessage());
        responseBody.put("detailMessage", appEx.getMessage());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        responseWriter.print(responseBody);

        appEx.printStackTrace();
      }

    }

//    @Bean
//    public CommonsRequestLoggingFilter requestLoggingFilter() {
//        CommonsRequestLoggingFilter loggingFilter = new CommonsRequestLoggingFilter();
//        loggingFilter.setIncludeClientInfo(true);
//        loggingFilter.setIncludeQueryString(true);
////        loggingFilter.setIncludePayload(true);
////        loggingFilter.setIncludeHeaders(true);
//        return loggingFilter;
//    }

}
