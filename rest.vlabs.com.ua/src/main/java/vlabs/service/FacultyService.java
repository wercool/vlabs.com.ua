package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Faculty;
import vlabs.repository.FacultyRepository;

@Service
public class FacultyService
{
    @Autowired
    private FacultyRepository facultyRepository;

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
}
