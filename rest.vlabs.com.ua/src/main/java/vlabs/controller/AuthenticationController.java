package vlabs.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.mail.MessagingException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import utils.PasswordGenerator;
import vlabs.common.EmptyJsonResponse;
import vlabs.model.Authority;
import vlabs.model.collaborator.Collaborator;
import vlabs.model.user.User;
import vlabs.model.user.UserTokenState;
import vlabs.repository.AuthorityRepository;
import vlabs.security.TokenHelper;
import vlabs.service.CollaboratorService;
import vlabs.service.CustomUserDetailsService;
import vlabs.service.UserService;
import vlabs.service.util.SimpleEmailService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthenticationController
{
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SimpleEmailService simpleEmailService;

    @Autowired
    TokenHelper tokenHelper;

    @Value("${jwt.expires_in}")
    private int EXPIRES_IN;

    @Value("${jwt.cookie}")
    private String TOKEN_COOKIE;

    @Autowired
    private CollaboratorService collaboratorService;

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

    @RequestMapping(method = RequestMethod.GET, value = "/userexists/{usernameEmail}")
    public ResponseEntity<?> userExists(@PathVariable String usernameEmail) throws MessagingException {
        boolean userExists = this.userService.userExists(usernameEmail);
        if (!userExists) {
            String passwd = PasswordGenerator.generatePassword(5, PasswordGenerator.ALPHA_CAPS + PasswordGenerator.NUMERIC);
            String message = "HelpClips temporary password:\n" + passwd;

//            TODO: DO NOT SEND EMAIL IN DEV MODE
//            simpleEmailService.sendEmail(message, usernameEmail, "HelpClips temporary password");

            User newlyRegisteredUser = new User();
            newlyRegisteredUser.setUsername(usernameEmail);
            newlyRegisteredUser.setPassword(passwd);
            newlyRegisteredUser.setEnabled(true);
            newlyRegisteredUser.setEmail(usernameEmail);
            Authority userAuthority = authorityRepository.findByName("ROLE_USER");
            List<Authority> grantedAuthorities = new ArrayList<Authority>();
            grantedAuthorities.add(userAuthority);
            newlyRegisteredUser.setAuthorities(grantedAuthorities);

            userService.createNewUser(newlyRegisteredUser);
        }
        Map<String, Boolean> result = new HashMap<>();
        result.put("userExists", userExists);
        return ResponseEntity.accepted().body(result);
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

    @RequestMapping(value = "/register/collaborator/{collaboratorId}", method = RequestMethod.POST, consumes="application/json")
    public ResponseEntity<?> collaboratorRegister(@PathVariable Long collaboratorId, @RequestBody User newlyRegisteredUser) {
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
            User user = userService.createNewUser(newlyRegisteredUser);

            Collaborator collaborator = collaboratorService.findById(collaboratorId);
            collaborator.setUser_id(user.getId());

            collaboratorService.updateCollaborator(collaborator);

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
        Map<String, String> result = new HashMap<>();
        try
        {
            userDetailsService.changePassword(passwordChanger.oldPassword, passwordChanger.newPassword);
            result.put("result", "success");
        } catch (AuthenticationException ex)
        {
            result.put("result", "error");
        }
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
