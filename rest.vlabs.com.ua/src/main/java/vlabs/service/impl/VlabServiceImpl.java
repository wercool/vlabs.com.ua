package vlabs.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import vlabs.model.User;
import vlabs.model.Vlab;
import vlabs.repository.UserRepository;
import vlabs.repository.VlabRepository;
import vlabs.service.UserService;
import vlabs.service.VlabService;

@Service
public class VlabServiceImpl implements VlabService
{
    @Autowired
    private VlabRepository vlabRepository;

    @Override
    public Vlab findById(Long id) throws AccessDeniedException {
        Vlab vlab = vlabRepository.getOne(id);
        return vlab;
    }

    @Override
    public Vlab findByTitle(String title) throws AccessDeniedException {
        Vlab vlab = vlabRepository.findByTitle(title);
        return vlab;
    }

    @Override
    public List<Vlab> findAll() throws AccessDeniedException {
        List<Vlab> vlabs = vlabRepository.findAll();
        return vlabs;
    }

}
