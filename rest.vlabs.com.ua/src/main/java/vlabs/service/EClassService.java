package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.EClass;
import vlabs.repository.EClassRepository;

@Service
public class EClassService
{
    @Autowired
    private EClassRepository eClassRepository;

    public EClass findById(Long id) throws AccessDeniedException {
        EClass eClass = eClassRepository.getOne(id);
        return eClass;
    }

    public EClass findByTitle(String title) throws AccessDeniedException {
        EClass eClass = eClassRepository.findByTitle(title);
        return eClass;
    }

    public List<EClass> findAll() throws AccessDeniedException {
//        List<EClass> eClasses = eClassRepository.findAll();
        List<EClass> eClasses = eClassRepository.findAllByOrderByIdDesc();
        return eClasses;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public EClass saveEclass(EClass eClass) throws AccessDeniedException {
        return eClassRepository.save(eClass);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public EClass updateEclass(EClass eClass) throws AccessDeniedException {
        EClass existingEClass = eClassRepository.getOne(eClass.getId());
        existingEClass.setTitle(eClass.getTitle());
        existingEClass.setDescription(eClass.getDescription());
        existingEClass.setActive(eClass.getActive());
        existingEClass.setFormat_id(eClass.getFormat_id());
        return eClassRepository.save(existingEClass);
    }
}
