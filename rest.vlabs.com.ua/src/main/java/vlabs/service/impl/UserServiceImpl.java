package vlabs.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vlabs.model.User;
import vlabs.repository.UserRepository;
import vlabs.service.UserService;

@Service
public class UserServiceImpl implements UserService
{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

//    public void resetCredentials() {
//        List<User> users = userRepository.findAll();
//        for (User user : users) {
//            user.setPassword(passwordEncoder.encode("123"));
//            userRepository.save(user);
//        }
//    }

    @Override
    @PreAuthorize("hasRole('USER')")
    public User findByUsername(String username) throws UsernameNotFoundException {
        User u = userRepository.findByUsername(username);
        return u;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User findById(Long id) throws AccessDeniedException {
        User u = userRepository.getOne(id);
        return u;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findAll() throws AccessDeniedException {
        List<User> result = userRepository.findAll();
        return result;
    }

    @Override
    public void createNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public List<User> findAllWithoutAuthorites() {
        List<User> result = userRepository.findAllWithoutAuthorities();
        return result;
    }

}
