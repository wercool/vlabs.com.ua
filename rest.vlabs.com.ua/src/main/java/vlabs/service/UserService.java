package vlabs.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

//    public void resetCredentials() {
//        List<User> users = userRepository.findAll();
//        for (User user : users) {
//            user.setPassword(passwordEncoder.encode("123"));
//            userRepository.save(user);
//        }
//    }

    @PreAuthorize("hasRole('USER')")
    public User findByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        return user;
    }

    @PreAuthorize("hasRole('USER')")
    public User updateProfile(User userProfile) throws AccessDeniedException {
        User user = userRepository.getOne(userProfile.getId());
        userProfile.setPassword(user.getPassword());
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
    public void authorizeAndActivateUser(Long id) throws AccessDeniedException {
        User user = userRepository.getOne(id);
        Authority userAuthority = authorityRepository.findByName("ROLE_USER");
        List<Authority> grantedAuthorities = new ArrayList<Authority>();
        grantedAuthorities.add(userAuthority);
        user.setAuthorities(grantedAuthorities);
        user.setEnabled(true);
        userRepository.save(user);
    }

    public void createNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findAllWithoutAuthorites() {
        List<User> result = userRepository.findAllWithoutAuthorities();
        return result;
    }

}
