package vlabs.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Faculty;
import vlabs.model.Group;
import vlabs.repository.FacultyRepository;
import vlabs.repository.GroupRepository;

@Service
public class FacultyService
{
    @Autowired
    private FacultyRepository facultyRepository;
    @Autowired
    private GroupRepository groupRepository;

    public Faculty findById(Long id) throws AccessDeniedException {
        Faculty faculty = facultyRepository.getOne(id);
        return faculty;
    }

    public Faculty findByTitle(String title) throws AccessDeniedException {
        Faculty faculty = facultyRepository.findByTitle(title);
        return faculty;
    }

    public List<Faculty> findAll() throws AccessDeniedException {
        List<Faculty> faculties = facultyRepository.findAll();
        return faculties;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Faculty addNew(Faculty faculty) throws AccessDeniedException {
        return facultyRepository.save(faculty);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Faculty updateFaculty(Faculty faculty) throws AccessDeniedException {
        Faculty existingGroup = facultyRepository.getOne(faculty.getId());
        existingGroup.setTitle(faculty.getTitle());

        return facultyRepository.save(existingGroup);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<Group> getFacultyGroupsByFacultyId(Long facultyId) throws AccessDeniedException {
        List<Group> facultyGroups = facultyRepository.findFacultyGroups(facultyId);

        return facultyGroups;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<Group> nonFacultyGroupsByFacultyId(Long facultyId) throws AccessDeniedException {
        List<Group> facultyGroups = facultyRepository.findFacultyGroups(facultyId);
        List<Long> facultyGroupsIds = new ArrayList<Long>();
        for (Group g : facultyGroups) {
            facultyGroupsIds.add(g.getId());
        }

        List<Group> allNonFacultyGroups = new ArrayList<Group>();
        if (facultyGroupsIds.size() > 0) {
            allNonFacultyGroups = facultyRepository.findAllNonFacultyGroups(facultyGroupsIds);
        } else {
            allNonFacultyGroups = groupRepository.findAll();
        }
        

        List<Group> potentialFacultyGroups = new ArrayList<Group>();
        for (Group g : allNonFacultyGroups) {
            potentialFacultyGroups.add(g);
        }

        return potentialFacultyGroups;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Faculty updateFacultyGroups(Long facultyId, List<Group> modifiedFacultyGroups, String action) throws AccessDeniedException {
        Faculty existingFaculty = facultyRepository.getOne(facultyId);
        List<Group> facultyGroups = existingFaculty.getGroups();

        if (action.equals("add")) {
            facultyGroups.addAll(modifiedFacultyGroups);
            existingFaculty.setGroups(facultyGroups);
        }

        if (action.equals("remove")) {
            List<Long> facultyGroupsToRemoveIds = new ArrayList<Long>();
            List<Group> udatedfacultyGroups = new ArrayList<Group>();
            for (Group gm : modifiedFacultyGroups) {
                facultyGroupsToRemoveIds.add(gm.getId());
            }
            for (Group g : facultyGroups) {
                if (facultyGroupsToRemoveIds.indexOf(g.getId()) == -1) {
                    udatedfacultyGroups.add(g);
                }
            }
            existingFaculty.setGroups(udatedfacultyGroups);
        }

        return facultyRepository.save(existingFaculty);
    }
}
