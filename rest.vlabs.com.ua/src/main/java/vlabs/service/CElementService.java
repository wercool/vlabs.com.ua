package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.CElement;
import vlabs.model.CElementItem;
import vlabs.repository.CElementItemRepository;
import vlabs.repository.CElementRepository;

@Service
public class CElementService
{
    @Autowired
    private CElementRepository cElementRepository;
    
    @Autowired
    private CElementItemRepository cElementItemRepository;

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public CElement updateCElement(CElement cElement) throws AccessDeniedException {
        return cElementRepository.save(cElement);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public CElementItem updateCElementItem(CElementItem cElementItem) throws AccessDeniedException {
        return cElementItemRepository.save(cElementItem);
    }

    @PreAuthorize("hasRole('USER')")
    public CElementItem getCElementItem(Long cElementItemId) throws AccessDeniedException {
        return cElementItemRepository.getOne(cElementItemId);
    }

    @PreAuthorize("hasRole('USER')")
    public List<CElementItem> getCElementItems(Long cElementId) throws AccessDeniedException {
        return cElementItemRepository.findAllByCelementId(cElementId);
    }

}
