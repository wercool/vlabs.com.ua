package vlabs.repository.helpclip;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.helpclip.HelpClipSubscription;

@Repository
public interface HelpClipSubscriptionRepository extends JpaRepository<HelpClipSubscription, Long> {

    @Query("SELECT hcs FROM HelpClipSubscription AS hcs WHERE hcs.userId = :userId")
    List<HelpClipSubscription> findUserSubscriptions(@Param("userId") Long userId);
}
