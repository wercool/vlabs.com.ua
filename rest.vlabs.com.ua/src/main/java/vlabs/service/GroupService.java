package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Group;
import vlabs.repository.GroupRepository;


@Service
public class GroupService
{
    @Autowired
    private GroupRepository groupRepository;

    public Group findById(Long id) throws AccessDeniedException {
        Group group = groupRepository.getOne(id);
        return group;
    }

    public Group findByName(String name) throws AccessDeniedException {
        Group group = groupRepository.findByName(name);
        return group;
    }

    public List<Group> findAll() throws AccessDeniedException {
        List<Group> groups = groupRepository.findAll();
        return groups;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Group addNew(Group group) throws AccessDeniedException {
        return groupRepository.save(group);
    }
}
