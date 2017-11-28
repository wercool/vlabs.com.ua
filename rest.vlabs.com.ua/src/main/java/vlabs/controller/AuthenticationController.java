package vlabs.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.common.EmptyJsonResponse;
import vlabs.model.User;
import vlabs.model.UserTokenState;
import vlabs.security.TokenHelper;
import vlabs.service.CustomUserDetailsService;
import vlabs.service.UserService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthenticationController
{
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserService userService;
    
    @Autowired
    TokenHelper tokenHelper;

    @Value("${jwt.expires_in}")
    private int EXPIRES_IN;

    @Value("${jwt.cookie}")
    private String TOKEN_COOKIE;

    @RequestMapping(value = "/refresh", method = RequestMethod.GET)
    public ResponseEntity<?> refreshAuthenticationToken(HttpServletRequest request, HttpServletResponse response) {

        String authToken = tokenHelper.getToken(request);
        if (authToken != null && tokenHelper.canTokenBeRefreshed(authToken)) {
            // TODO check user password last update
            String refreshedToken = tokenHelper.refreshToken(authToken);

            Cookie authCookie = new Cookie(TOKEN_COOKIE, (refreshedToken));
            authCookie.setPath("/");
            authCookie.setHttpOnly(true);
            authCookie.setMaxAge(EXPIRES_IN);
            // Add cookie to response
            response.addCookie(authCookie);

            UserTokenState userTokenState = new UserTokenState(refreshedToken, EXPIRES_IN);
            return ResponseEntity.ok(userTokenState);
        } else {
           UserTokenState userTokenState = new UserTokenState();
           return ResponseEntity.accepted().body(userTokenState);
        }
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, consumes="application/json")
    public ResponseEntity<?> register(@RequestBody User newlyRegisteredUser) {

        Map<String, String> result = new HashMap<>();

        try
        {
            userDetailsService.loadUserByUsername(newlyRegisteredUser.getUsername());

            result.put("message", "User record with the username <h4><i>" + newlyRegisteredUser.getUsername() + "</i></h4> already exists in VLabs");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }
        catch (UsernameNotFoundException ex)
        {
            // exactly what we need - no user found under given username

            newlyRegisteredUser.setEnabled(false);
            userService.createNewUser(newlyRegisteredUser);

            result.put("message", "Registration request has been successfully accepted");
            return ResponseEntity.accepted().body(result);
        }
    }

    /*
     *  We are not using userService.findByUsername here(we could),
     *  so it is good that we are making sure that the user has role "ROLE_USER"
     *  to access this endpoint.
     */
    @RequestMapping("/whoami")
    @PreAuthorize("hasRole('USER')")
    public User user() {
        return (User)SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    @RequestMapping(value = "/change-password", method = RequestMethod.POST)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChanger passwordChanger) {
        userDetailsService.changePassword(passwordChanger.oldPassword, passwordChanger.newPassword);
        Map<String, String> result = new HashMap<>();
        result.put("result", "success");
        return ResponseEntity.accepted().body(result);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/authorize/{userId}")
    public ResponseEntity<EmptyJsonResponse> authorizeUser(@PathVariable Long userId) {
        this.userService.authorizeAndActivateUser(userId);
        return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.OK);
    }

    static class PasswordChanger
    {
        public String oldPassword;
        public String newPassword;
    }
}
