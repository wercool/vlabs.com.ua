package vlabs.controller;

import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
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

    @RequestMapping(method = RequestMethod.GET, value = "/vlab/{vlabId}")
    public Vlab loadById(@PathVariable Long vlabId) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        User user = (User)authentication.getPrincipal();
        return vlabService.findById(vlabId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/vlab/add")
    public Vlab addNewVlab(@RequestBody Vlab vlab) {
        return vlabService.addNew(vlab);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/vlab/all")
    public List<Vlab> getAllVlabs() {
        return vlabService.findAll();
    }

    @RequestMapping(method = RequestMethod.POST, value= "/vlab/update")
    public Vlab updateVlab(@RequestBody Vlab vlab) {
        return vlabService.updateVlab(vlab);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/vlab/info/{alias_Base64Encoded}")
    public Vlab getVlabInfoByAlias(@PathVariable String alias_Base64Encoded) {
        String alias = "";
        try {
            alias = new String(Base64.getDecoder().decode(alias_Base64Encoded), "UTF8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return vlabService.findByAlias(alias);
    }
}
