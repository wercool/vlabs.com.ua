package vlabs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.boot.web.servlet.error.ErrorController;

@Controller
public class MainPageFallBackController implements ErrorController{

    private static final String PATH = "/error";

    @RequestMapping(value = PATH)
    public String forward() {
        return "forward:/index.html";
    }
    
    @Override
    public String getErrorPath() {
        return PATH;
    }
}