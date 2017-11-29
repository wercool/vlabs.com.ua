package vlabs.service.valterik;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import external.valterik.model.RightArmIK;
import external.valterik.repository.RightArmIKRepository;

@Service
public class RightArmIKService
{

    @Autowired
    private RightArmIKRepository rightArmIKRepository;

    public Page<RightArmIK> findAllPaged() throws AccessDeniedException {
        PageRequest limit = PageRequest.of(0, 10, Direction.ASC, "id");
        Page<RightArmIK> result = rightArmIKRepository.findAll(limit);
        return result;
    }

    public List<RightArmIK> findAll() throws AccessDeniedException {
        List<RightArmIK> result = rightArmIKRepository.findAll();
        return result;
    }
}
