package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.celement.CElement;
import vlabs.model.celement.CElementItem;
import vlabs.service.CElementService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class CElementContoller
{
    @Autowired
    private CElementService cElementService;

    @RequestMapping(method = RequestMethod.POST, value = "/celement/update")
    public CElement updateCElement(@RequestBody CElement cElement) {
        return cElementService.updateCElement(cElement);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/celement/item/update")
    public CElementItem updateCElementItem(@RequestBody CElementItem cElementItem) {
        return cElementService.updateCElementItem(cElementItem);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/celement/item/{cElementItemId}")
    public CElementItem getCElementItem(@PathVariable Long cElementItemId) {
        return cElementService.getCElementItem(cElementItemId);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/celement/items/{cElementId}")
    public List<CElementItem> getCElementItems(@PathVariable Long cElementId) {
        return cElementService.getCElementItems(cElementId);
    }
}
