package vlabs.service.helpclip;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import vlabs.model.helpclip.HelpClipSubscription;
import vlabs.model.user.User;
import vlabs.repository.helpclip.HelpClipSubscriptionRepository;

@Service
public class HelpClipSubscriptionService {
    @Autowired
    private HelpClipSubscriptionRepository helpClipSubscriptionRepository;


    @PreAuthorize("hasRole('USER')")
    public HelpClipSubscription addNew(HelpClipSubscription helpClipSubscription) throws AccessDeniedException {
        return helpClipSubscriptionRepository.save(helpClipSubscription);
    }

    @PreAuthorize("hasRole('USER')")
    public List<HelpClipSubscription> findUserSubscriptions() throws AccessDeniedException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User)authentication.getPrincipal();
        List<HelpClipSubscription> helpClipSubscriptions = helpClipSubscriptionRepository.findUserSubscriptions(user.getId());
        return helpClipSubscriptions;
    }
}
