package vlabs.rest.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vlabs.rest.service.UserService;

@RestController
@RequestMapping(path = "/api/user")
public class UserController {

    @Autowired
    UserService userService;
}
