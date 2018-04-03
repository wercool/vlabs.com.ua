package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.eclass.EClass;
import vlabs.model.eclass.EClassStructure;
import vlabs.repository.eclass.EClassRepository;
import vlabs.repository.eclass.EClassStructureRepository;

@Service
public class EClassService
{
    @Autowired
    private EClassRepository eClassRepository;

    @Autowired
    private EClassStructureRepository eClassStructureRepository;

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
    public EClass addEclass(EClass eClass) throws AccessDeniedException {

        EClass newEClass = eClassRepository.save(eClass);

        EClassStructure eClassStructure = new EClassStructure();
        eClassStructure.setEclassId(newEClass.getId());
        eClassStructure.setFormatId(newEClass.getFormatId());
        eClassStructureRepository.save(eClassStructure);

        return newEClass;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public EClass updateEclass(EClass eClass) throws AccessDeniedException {

        EClass existingEClass = eClassRepository.getOne(eClass.getId());
        existingEClass.setTitle(eClass.getTitle());
        existingEClass.setDescription(eClass.getDescription());
        existingEClass.setActive(eClass.getActive());
        existingEClass.setFormatId(eClass.getFormatId());

        EClassStructure eClassStructure = eClassStructureRepository.findOneByEclassIdAndFormatId(existingEClass.getId(), existingEClass.getFormatId());
        if (eClassStructure == null) {
            eClassStructure = new EClassStructure();
            eClassStructure.setEclassId(existingEClass.getId());
            eClassStructure.setFormatId(existingEClass.getFormatId());
            eClassStructureRepository.save(eClassStructure);
        }

        return eClassRepository.save(existingEClass);
    }
}
