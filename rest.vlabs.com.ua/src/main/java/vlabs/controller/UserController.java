package vlabs.controller;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import vlabs.common.EmptyJsonResponse;
import vlabs.common.ImageJsonResponse;
import vlabs.model.user.User;
import vlabs.service.UserService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController
{

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @RequestMapping(method = RequestMethod.GET, value = "/user/{userId}")
    public User loadById(@PathVariable Long userId) {
        return this.userService.findById(userId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/user/update")
    public ResponseEntity<EmptyJsonResponse> updateUser(@RequestBody User user) {
        this.userService.updateUser(user);
        return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/user/all")
    public List<User> loadAll() {
        return this.userService.findAll();
    }

    @RequestMapping(method = RequestMethod.GET, value= "/user/all-paged/{page}/{size}")
    public Page<User> loadAllPaged(@PathVariable int page,
                                   @PathVariable int size) {
        return this.userService.findAllPaged(page, size);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/user/reset-password/{userId}")
    public ResponseEntity<EmptyJsonResponse> resetPassword(@PathVariable Long userId) {
        this.userService.resetPassword(userId);
        return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/user/update-profile")
    public User updateProfile(@RequestBody User user) {
        return this.userService.updateProfile(user);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/user/update-profile-photo")
    public ResponseEntity<EmptyJsonResponse> updateProfilePhoto(@RequestPart("photoFile") MultipartFile photoFile) {
        try
        {
            this.userService.updateProfilePhoto(photoFile);
            return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.OK);
        }
        catch (AccessDeniedException | IOException ex) {
            log.error(ex.getMessage());
            ex.printStackTrace();
            return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(method = RequestMethod.GET, value= "/user/get-profile-photo")
    public ResponseEntity<ImageJsonResponse> getProfilePhoto() {
        User user = (User)SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        byte[] profilePhoto = this.userService.getProfilePhoto(user);
        ImageJsonResponse imageResponse = new ImageJsonResponse();
        imageResponse.setImageData(Base64.getEncoder().encodeToString(profilePhoto));
        ResponseEntity<ImageJsonResponse> response = new ResponseEntity<ImageJsonResponse>(imageResponse, HttpStatus.OK);
        return response;
    }

    @RequestMapping(method = RequestMethod.GET, value= "/user/get-profile-photo/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ImageJsonResponse> getProfilePhotoForUser(@PathVariable Long userId) {
        User user = this.userService.findById(userId);
        byte[] profilePhoto = this.userService.getProfilePhoto(user);
        ImageJsonResponse imageResponse = new ImageJsonResponse();
        imageResponse.setImageData(Base64.getEncoder().encodeToString(profilePhoto));
        ResponseEntity<ImageJsonResponse> response = new ResponseEntity<ImageJsonResponse>(imageResponse, HttpStatus.OK);
        return response;
    }

    @RequestMapping(method = RequestMethod.POST, value= "/user/update-authorities/{userId}")
    public User updateUserAuthorities(@RequestBody List<String> userAuthorities,
                                      @PathVariable Long userId) {
        return this.userService.updateUserAuthorities(userAuthorities, userId);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/user/all-wo-authorites")
    public List<User> loadAllWithoutAuthorites() {
        return this.userService.findAllWithoutAuthorites();
    }

}
