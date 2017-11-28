package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import vlabs.common.EmptyJsonResponse;
import vlabs.model.User;
import vlabs.service.UserService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController
{

    @Autowired
    private UserService userService;

    @RequestMapping(method = RequestMethod.GET, value = "/user/{userId}")
    public User loadById(@PathVariable Long userId) {
        return this.userService.findById(userId);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/user/all")
    public List<User> loadAll() {
        return this.userService.findAll();
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

//    @RequestMapping(method = RequestMethod.POST, value= "/user/update-profile-photo/{userId}")
//    public User updateProfilePhoto(@PathVariable Long userId,
//                                   @RequestParam MultipartFile photo) {
//        return this.userService.updateProfilePhoto(userId, photo);
//    }

      @RequestMapping(method = RequestMethod.POST, value= "/user/update-profile-photo/{userId}")
      public void updateProfilePhoto(@PathVariable Long userId,
                                     @RequestPart("photoFile") MultipartFile photo) {
          
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
