package vlabs.controller;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.EClass;
import vlabs.service.EClassService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class SubscriptionContoller
{
    @Autowired
    private EClassService eclassService;

    @RequestMapping(method = RequestMethod.GET, value = "/subscription/cards/{subId}")
    public ResponseEntity<?> loadById(@PathVariable String subId) {
        List<JSONObject> subscriptionCards = new ArrayList<JSONObject>();
        try {
            // TODO: get content for Subscription Cards by subId
            EClass eclass1 = eclassService.findById((long) 1);
            JSONObject subscriptionCard1 = new JSONObject();
            subscriptionCard1.put("title", eclass1.getTitle());
            subscriptionCard1.put("subtitle", eclass1.getDescription());
            subscriptionCard1.put("content", eclass1.getSummary());
            subscriptionCards.add(subscriptionCard1);

            EClass eclass2 = eclassService.findById((long) 2);
            JSONObject subscriptionCard2 = new JSONObject();
            subscriptionCard2.put("title", eclass2.getTitle());
            subscriptionCard2.put("subtitle", eclass2.getDescription());
            subscriptionCard2.put("content", eclass2.getSummary());
            subscriptionCards.add(subscriptionCard2);

        } catch (JSONException e) {
            e.printStackTrace();
        }
        return ResponseEntity.accepted().body(subscriptionCards.toString());
    }
}
