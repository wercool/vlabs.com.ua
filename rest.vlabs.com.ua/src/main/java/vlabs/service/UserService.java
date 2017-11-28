package vlabs.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mysql.cj.api.xdevapi.Collection;

import vlabs.model.Authority;
import vlabs.model.User;
import vlabs.repository.AuthorityRepository;
import vlabs.repository.UserRepository;

@Service
public class UserService
{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PreAuthorize("hasRole('USER')")
    public User findByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        return user;
    }

    @PreAuthorize("hasRole('USER')")
    public User updateProfile(User userProfile) throws AccessDeniedException {

        User user = (User)SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();
        user.setFirstName(userProfile.getFirstName());
        user.setLastName(userProfile.getLastName());
        user.setEmail(userProfile.getEmail());
        user.setPhoneNumber(userProfile.getPhoneNumber());
        return userRepository.save(user);
    }

    @PreAuthorize("hasRole('USER')")
    public User updateProfilePhoto(Long userId, MultipartFile photo) throws AccessDeniedException {

        User user = (User)SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();

        return user;

//        user.setFirstName(userProfile.getFirstName());
//        user.setLastName(userProfile.getLastName());
//        user.setEmail(userProfile.getEmail());
//        user.setPhoneNumber(userProfile.getPhoneNumber());
//        return userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User updateUserAuthorities(List<String> userAuthorities, Long userId) throws AccessDeniedException {
        User user = userRepository.getOne(userId);
        List<Authority> grantedAuthorities = new ArrayList<Authority>();
        for (String authorityName : userAuthorities)
        {
            Authority userAuthority = authorityRepository.findByName(authorityName);
            if (userAuthority != null)
            {
                grantedAuthorities.add(userAuthority);
            }
        }
        user.setAuthorities(grantedAuthorities);
        return userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void resetPassword(Long userId) throws AccessDeniedException {
        User user = userRepository.getOne(userId);
        user.setPassword(passwordEncoder.encode("123"));
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User findById(Long id) throws AccessDeniedException {
        User user = userRepository.getOne(id);
        return user;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findAll() throws AccessDeniedException {
        List<User> result = userRepository.findAll();
        return result;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void authorizeAndActivateUser(Long userId) throws AccessDeniedException {
        User user = userRepository.getOne(userId);
        Authority userAuthority = authorityRepository.findByName("ROLE_USER");
        List<Authority> grantedAuthorities = new ArrayList<Authority>();
        grantedAuthorities.add(userAuthority);
        user.setAuthorities(grantedAuthorities);
        user.setEnabled(true);
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findAllWithoutAuthorites() {
        List<User> result = userRepository.findAllWithoutAuthorities();
        return result;
    }

    public void createNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

}
