package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Department;
import vlabs.repository.DepartmentRepository;

@Service
public class DepartmentService
{
    @Autowired
    private DepartmentRepository departmentRepository;

    public Department findById(Long id) throws AccessDeniedException {
        Department department = departmentRepository.getOne(id);
        return department;
    }

    public Department findByTitle(String title) throws AccessDeniedException {
        Department department = departmentRepository.findByTitle(title);
        return department;
    }

    public List<Department> findAll() throws AccessDeniedException {
        List<Department> departments = departmentRepository.findAll();
        return departments;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Department addNew(Department department) throws AccessDeniedException {
        return departmentRepository.save(department);
    }
}
