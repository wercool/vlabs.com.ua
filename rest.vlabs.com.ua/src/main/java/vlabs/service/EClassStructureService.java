package vlabs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.EClassStructure;
import vlabs.repository.EClassStructureRepository;

@Service
public class EClassStructureService
{
    @Autowired
    private EClassStructureRepository eClassStructureRepository;

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public EClassStructure getEClassStructure(Long eClassId, Long formatId) throws AccessDeniedException {
        return eClassStructureRepository.findOneByEclassIdAndFormatId(eClassId, formatId);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public EClassStructure updateEClassStructure(EClassStructure eClassStructure) throws AccessDeniedException {
        return eClassStructureRepository.save(eClassStructure);
    }

}
