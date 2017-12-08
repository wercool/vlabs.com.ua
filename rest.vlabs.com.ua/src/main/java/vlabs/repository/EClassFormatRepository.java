package vlabs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.EClassFormat;

@Repository
public interface EClassFormatRepository extends JpaRepository<EClassFormat, Long>
{
    EClassFormat findByTitle(String title);
    List<EClassFormat> findAll();
}
