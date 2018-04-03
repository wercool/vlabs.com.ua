package vlabs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.Group;
import vlabs.model.user.User;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long>
{
    Group findByName(String name);

    @Query("SELECT g.members FROM Group AS g WHERE g.id = :groupId")
    List<User> findGroupMemebers(@Param("groupId") Long groupId);

    @Query("SELECT u FROM User AS u WHERE u.id NOT IN (:groupMemberIds) AND u.authorities IS NOT EMPTY")
    List<User> findAllNonGroupMembers(@Param("groupMemberIds") List<Long> groupMemberIds);
}
