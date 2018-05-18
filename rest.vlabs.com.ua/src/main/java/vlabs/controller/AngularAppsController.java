package vlabs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AngularAppsController {

    @RequestMapping({
        "/hc", 
        "/hc/dashboard",
        "/hc/helpclips",
        "/hc/helpclips-market",
        "/hc/profile",
        "/hc/reset-password",
        "/hc/helpclip/{alias}",
        "/hc/404",
    })
    public String helpCLipsUIIndex() {
        return "forward:/hc/index.html";
    }

    @RequestMapping({
        "/staff", 
    })
    public String staffUIIndex() {
        return "forward:/staff/index.html";
    }
}
