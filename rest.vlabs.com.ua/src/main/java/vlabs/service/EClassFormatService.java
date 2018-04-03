package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.eclass.EClassFormat;
import vlabs.repository.eclass.EClassFormatRepository;

@Service
public class EClassFormatService
{
    @Autowired
    private EClassFormatRepository eClassFormatRepository;

    public EClassFormat findById(Long id) throws AccessDeniedException {
        EClassFormat eClassFormat = eClassFormatRepository.getOne(id);
        return eClassFormat;
    }

    public EClassFormat findByTitle(String title) throws AccessDeniedException {
        EClassFormat eClassFormat = eClassFormatRepository.findByTitle(title);
        return eClassFormat;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<EClassFormat> findAll() throws AccessDeniedException {
        List<EClassFormat> eClassFormats = eClassFormatRepository.findAll();
        return eClassFormats;
    }
}
