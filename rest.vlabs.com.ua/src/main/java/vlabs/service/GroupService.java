package vlabs.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Group;
import vlabs.model.User;
import vlabs.repository.GroupRepository;
import vlabs.repository.UserRepository;

@Service
public class GroupService
{
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;

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

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Group updateGroup(Group group) throws AccessDeniedException {
        Group existingGroup = groupRepository.getOne(group.getId());
        existingGroup.setName(group.getName());

        return groupRepository.save(existingGroup);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Group updateGroupMembers(Long groupId, List<User> modifiedGroupMembers, String action) throws AccessDeniedException {
        Group existingGroup = groupRepository.getOne(groupId);
        List<User> groupMembers = existingGroup.getMembers();

        if (action.equals("add")) {
            groupMembers.addAll(modifiedGroupMembers);
            existingGroup.setMembers(groupMembers);
        }

        if (action.equals("remove")) {
            //TODO: why groupMembers.removeAll(modifiedGroupMembers) is not working here?!!!!
            List<Long> groupMemberToRemoveIds = new ArrayList<Long>();
            List<User> udatedGroupMembers = new ArrayList<User>();
            for (User rm : modifiedGroupMembers) {
                groupMemberToRemoveIds.add(rm.getId());
            }
            for (User m : groupMembers) {
                if (groupMemberToRemoveIds.indexOf(m.getId()) == -1) {
                    udatedGroupMembers.add(m);
                }
            }
            existingGroup.setMembers(udatedGroupMembers);
        }

        return groupRepository.save(existingGroup);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<User> getGroupMembersByGroupId(Long groupId) throws AccessDeniedException {
        List<User> groupMembers = groupRepository.findGroupMemebers(groupId);

        return groupMembers;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<User> getNonGroupMembersByGroupId(Long groupId) throws AccessDeniedException {
        List<User> groupMembers = groupRepository.findGroupMemebers(groupId);
        List<Long> groupMemberIds = new ArrayList<Long>();
        for (User m : groupMembers) {
            groupMemberIds.add(m.getId());
        }

        List<User> allNonGroupMembers = new ArrayList<User>();
        if (groupMemberIds.size() > 0) {
            allNonGroupMembers = groupRepository.findAllNonGroupMembers(groupMemberIds);
        } else {
            allNonGroupMembers = userRepository.findAllWithAuthorities();
        }
        

        List<User> potentialGroupMembers = new ArrayList<User>();
        for (User u : allNonGroupMembers) {
            if (u.isRegularUser()) potentialGroupMembers.add(u);
        }

        return potentialGroupMembers;
    }
}
