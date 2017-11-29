package vlabs.controller.srv;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import external.valterik.model.RightArmIK;
import vlabs.service.valterik.RightArmIKService;

@RestController
@RequestMapping(value = "/srv/valter", produces = MediaType.APPLICATION_JSON_VALUE)
public class ValterContoller
{
    @Autowired
    private RightArmIKService rightArmIKService;

    @RequestMapping(method = RequestMethod.GET, value= "/rightarmikpcl")
    public List<RightArmIK> getRightArmIKPCL() {
        return this.rightArmIKService.findAll();
    }
}
