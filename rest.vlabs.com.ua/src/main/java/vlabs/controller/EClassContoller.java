package vlabs.controller;

import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.common.EmptyJsonResponse;
import vlabs.model.EClass;
import vlabs.model.EClassFormat;
import vlabs.model.EClassStructure;
import vlabs.repository.EClassStructureRepository;
import vlabs.service.EClassFormatService;
import vlabs.service.EClassService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class EClassContoller
{
    @Autowired
    private EClassService eclassService;

    @Autowired
    private EClassFormatService eClassFormatService;

    @Autowired
    private EClassStructureRepository eClassStructureRepository;

    @RequestMapping(method = RequestMethod.GET, value = "/eclass/{eclassId}")
    public EClass loadById(@PathVariable Long eclassId) {
        return eclassService.findById(eclassId);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/eclass/summary/{eclassId}")
    public String getSummaryById(@PathVariable Long eclassId) throws AccessDeniedException, JSONException {
        JSONObject eclassSummaryJSON = new JSONObject();
        eclassSummaryJSON.put("data", eclassService.findById(eclassId).getSummary());
        return eclassSummaryJSON.toString();
    }

    @RequestMapping(method = RequestMethod.POST, value= "/eclass/update-summary/{eclassId}")
    public ResponseEntity<EmptyJsonResponse> updateEClassSummary(@PathVariable Long eclassId, 
                                                          @RequestBody String eclassSummary) {
        EClass eclass = eclassService.findById(eclassId);
        eclass.setSummary(eclassSummary);
        eclassService.updateEclass(eclass);
        return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/eclass/add")
    public EClass addNewEClass(@RequestBody EClass eclass) {
        return eclassService.addEclass(eclass);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/eclass/update")
    public EClass updateClass(@RequestBody EClass eclass) {
        return eclassService.updateEclass(eclass);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/eclass/all")
    public List<EClass> getAllEClasses() {
        return eclassService.findAll();
    }

    // EClass formats
    @RequestMapping(method = RequestMethod.GET, value = "/eclass/formats")
    public List<EClassFormat> getAllEClassFormats() {
        return eClassFormatService.findAll();
    }

    // EClass structure
    @RequestMapping(method = RequestMethod.GET, value = "/eclass/structure/{eClassId}/{formatId}")
    public EClassStructure getEClassStructure(@PathVariable Long eClassId,
                                                    @PathVariable Long formatId) {
        return eClassStructureRepository.findOneByEclassIdAndFormatId(eClassId, formatId);
    }
}
