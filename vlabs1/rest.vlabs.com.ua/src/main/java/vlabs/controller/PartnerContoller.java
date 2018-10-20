package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Partner;
import vlabs.service.PartnerService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class PartnerContoller
{
    @Autowired
    private PartnerService partnerService;

    @RequestMapping(method = RequestMethod.POST, value= "/partner/add")
    public Partner addNewPartner(@RequestBody Partner partner) {
        return partnerService.addNew(partner);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/partner/all")
    public List<Partner> getAllPartners() {
        return partnerService.findAll();
    }
}
