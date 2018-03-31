package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Vlab;
import vlabs.repository.VlabRepository;

@Service
public class VlabService
{
    @Autowired
    private VlabRepository vlabRepository;

    public Vlab findById(Long id) throws AccessDeniedException {
        Vlab vlab = vlabRepository.getOne(id);
        return vlab;
    }

    public Vlab findByTitle(String title) throws AccessDeniedException {
        Vlab vlab = vlabRepository.findByTitle(title);
        return vlab;
    }

    public List<Vlab> findAll() throws AccessDeniedException {
        List<Vlab> vlabs = vlabRepository.findAll();
        return vlabs;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Vlab addNew(Vlab vlab) throws AccessDeniedException {
        return vlabRepository.save(vlab);
    }

    @PreAuthorize("hasRole('USER')")
    public Vlab findByAlias(String alias) throws AccessDeniedException {
        Vlab vlab = vlabRepository.findByAlias(alias);
        return vlab;
    }
}
