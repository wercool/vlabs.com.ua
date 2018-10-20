package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Partner;
import vlabs.repository.PartnerRepository;


@Service
public class PartnerService
{
    @Autowired
    private PartnerRepository partnerRepository;

    public Partner findById(Long id) throws AccessDeniedException {
        Partner partner = partnerRepository.getOne(id);
        return partner;
    }

    public Partner findByName(String name) throws AccessDeniedException {
        Partner partner = partnerRepository.findByName(name);
        return partner;
    }

    public List<Partner> findAll() throws AccessDeniedException {
        List<Partner> partners = partnerRepository.findAll();
        return partners;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Partner addNew(Partner partner) throws AccessDeniedException {
        return partnerRepository.save(partner);
    }
}
