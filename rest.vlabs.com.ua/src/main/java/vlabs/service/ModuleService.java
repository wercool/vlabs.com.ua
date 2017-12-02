package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Module;
import vlabs.repository.ModuleRepository;


@Service
public class ModuleService
{
    @Autowired
    private ModuleRepository moduleRepository;

    public Module findById(Long id) throws AccessDeniedException {
        Module module = moduleRepository.getOne(id);
        return module;
    }

    public Module findByTitle(String title) throws AccessDeniedException {
        Module module = moduleRepository.findByTitle(title);
        return module;
    }

    public List<Module> findAll() throws AccessDeniedException {
        List<Module> modules = moduleRepository.findAll();
        return modules;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Module addNew(Module module) throws AccessDeniedException {
        return moduleRepository.save(module);
    }
}
