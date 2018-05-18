package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.helpclip.HelpClip;
import vlabs.repository.HelpClipRepository;

@Service
public class HelpClipService {

    @Autowired
    private HelpClipRepository helpClipRepository;

    @PreAuthorize("hasRole('USER')")
    public HelpClip findById(Long id) throws AccessDeniedException {
        HelpClip helpClip = helpClipRepository.getOne(id);
        return helpClip;
    }

    @PreAuthorize("hasRole('USER')")
    public List<HelpClip> findAll() throws AccessDeniedException {
        List<HelpClip> helpClips = helpClipRepository.findAll();
        return helpClips;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public HelpClip addNew(HelpClip helpClip) throws AccessDeniedException {
        return helpClipRepository.save(helpClip);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public HelpClip updateHelpClip(HelpClip helpClip) throws AccessDeniedException {
        HelpClip existingHelpClip = helpClipRepository.getOne(helpClip.getId());
        existingHelpClip.setTitle(helpClip.getTitle());
        existingHelpClip.setAlias(helpClip.getAlias());
        existingHelpClip.setPath(helpClip.getPath());
        existingHelpClip.setShortdesc(helpClip.getShortdesc());
        existingHelpClip.setDescription(helpClip.getDescription());

        return helpClipRepository.save(existingHelpClip);
    }

    @PreAuthorize("hasRole('USER')")
    public HelpClip findByAlias(String alias) throws AccessDeniedException {
        HelpClip helpClip = helpClipRepository.findByAlias(alias);
        return helpClip;
    }
}
