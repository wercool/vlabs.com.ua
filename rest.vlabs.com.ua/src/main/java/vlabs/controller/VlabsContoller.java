package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Vlab;
import vlabs.service.VlabService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class VlabsContoller
{
    @Autowired
    private VlabService vlabService;

    @RequestMapping(method = RequestMethod.POST, value= "/vlab/add")
    public Vlab addNewVlab(@RequestBody Vlab vlab) {
        return vlabService.addNew(vlab);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/vlab/all")
    public List<Vlab> getAllVlabs() {
        return vlabService.findAll();
    }
}
