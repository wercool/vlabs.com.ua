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

import vlabs.model.helpclip.HelpClip;
import vlabs.model.helpclip.HelpClipInfo;
import vlabs.service.HelpClipService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class HelpClipController
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

    @RequestMapping(method = RequestMethod.GET, value = "/helpclip/alias/{alias_Base64Encoded}")
    public HelpClip getHelpClipByAlias(@PathVariable String alias_Base64Encoded) {
        String alias = "";
        try {
            alias = new String(Base64.getDecoder().decode(alias_Base64Encoded), "UTF8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        return helpClipService.findByAlias(alias);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/helpclip/info/{alias_Base64Encoded}")
    public HelpClipInfo getHelpClipInfoByAlias(@PathVariable String alias_Base64Encoded) {
        HelpClipInfo helpClipInfo = new HelpClipInfo();
        String alias = "";
        try {
            alias = new String(Base64.getDecoder().decode(alias_Base64Encoded), "UTF8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            helpClipInfo.setHelpClip(null);
        }
        HelpClip helpClip = helpClipService.findByAlias(alias);
        helpClipInfo.setHelpClip(helpClip);
        helpClipInfo.setGranted(true);

        return helpClipInfo;
    }
}
