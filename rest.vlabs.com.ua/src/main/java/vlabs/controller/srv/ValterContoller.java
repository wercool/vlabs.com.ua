package vlabs.controller.srv;

import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/srv/valter", produces = MediaType.APPLICATION_JSON_VALUE)
public class ValterContoller
{
    @RequestMapping(method = RequestMethod.GET, value= "/rightarmikpcl")
    public String getRightArmIKPCL() {
        return "PCL";
    }
}
