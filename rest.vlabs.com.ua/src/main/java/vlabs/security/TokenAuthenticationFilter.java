package vlabs.security;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.util.Assert;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final Log log = LogFactory.getLog(this.getClass());

    @Autowired
    TokenHelper tokenHelper;

    @Autowired
    UserDetailsService userDetailsService;

    /*
     * The below paths will get ignored by the filter
     */
    public static final String ROOT_MATCHER                         = "/";
    public static final String FAVICON_MATCHER                      = "/favicon.ico";
    public static final String HTML_MATCHER                         = "/**/*.html";
    public static final String CSS_MATCHER                          = "/**/*.css";
    public static final String JS_MATCHER                           = "/**/*.js";
    public static final String IMG_MATCHER                          = "/images/*";
    public static final String LOGIN_MATCHER                        = "/api/login";
    public static final String REGISTER_MATCHER                     = "/api/register";
    public static final String LOGOUT_MATCHER                       = "/api/logout";
    public static final String SUBSCRIPTION_CARDS_MATCHER           = "/api/subscription/cards/**";

    public static final String SRV_MATCHER                          = "/srv/**";

    public static final String VL_MATCHER                           = "/vl/**";
    public static final String VLABS_MATCHER                        = "/vlabs/**";

    private List<String> pathsToSkip = Arrays.asList(
            ROOT_MATCHER,
            HTML_MATCHER,
            FAVICON_MATCHER,
            CSS_MATCHER,
            JS_MATCHER,
            IMG_MATCHER,
            LOGIN_MATCHER,
            REGISTER_MATCHER,
            LOGOUT_MATCHER,
            SUBSCRIPTION_CARDS_MATCHER,
            SRV_MATCHER,
            VL_MATCHER,
            VLABS_MATCHER
    );

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
    {
        String authToken = tokenHelper.getToken(request);
        if (authToken != null && !skipPathRequest(request, pathsToSkip))
        {
            // get username from token
            try
            {
                String username = tokenHelper.getUsernameFromToken(authToken);
                log.info(username + " authentication attempt");
                // get user
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                // create authentication
                TokenBasedAuthentication authentication = new TokenBasedAuthentication(userDetails);
                authentication.setToken(authToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                SecurityContextHolder.getContext().setAuthentication(new AnonAuthentication());
            }
        } else {
            SecurityContextHolder.getContext().setAuthentication(new AnonAuthentication());
        }

        chain.doFilter(request, response);
    }

    private boolean skipPathRequest(HttpServletRequest request, List<String> pathsToSkip)
    {
        Assert.notNull(pathsToSkip, "path cannot be null.");
        List<RequestMatcher> m = pathsToSkip.stream().map(path -> new AntPathRequestMatcher(path)).collect(Collectors.toList());
        OrRequestMatcher matchers = new OrRequestMatcher(m);
        return matchers.matches(request);
    }

}