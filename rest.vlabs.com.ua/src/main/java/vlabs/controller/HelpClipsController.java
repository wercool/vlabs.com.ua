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

import vlabs.model.HelpClip;
import vlabs.service.HelpClipService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class HelpClipsController
{
    @Autowired
    private HelpClipService helpClipService;

    @RequestMapping(method = RequestMethod.GET, value = "/helpclip/{helpClipId}")
    public HelpClip loadById(@PathVariable Long helpClipId) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        User user = (User)authentication.getPrincipal();
        return helpClipService.findById(helpClipId);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/helpclip/add")
    public HelpClip addNewVlab(@RequestBody HelpClip helpClip) {
        return helpClipService.addNew(helpClip);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/helpclip/all")
    public List<HelpClip> getAllHelpClips() {
        return helpClipService.findAll();
    }

    @RequestMapping(method = RequestMethod.POST, value = "/helpclip/update")
    public HelpClip updateHelpClip(@RequestBody HelpClip helpClip) {
        return helpClipService.updateHelpClip(helpClip);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/helpclip/info/{alias_Base64Encoded}")
    public HelpClip getHelpClipInfoByAlias(@PathVariable String alias_Base64Encoded) {
        String alias = "";
        try {
            alias = new String(Base64.getDecoder().decode(alias_Base64Encoded), "UTF8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return helpClipService.findByAlias(alias);
    }
}
