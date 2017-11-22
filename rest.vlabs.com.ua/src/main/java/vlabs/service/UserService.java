package vlabs.service;

import java.util.List;

import vlabs.model.User;

public interface UserService
{
//	void resetCredentials();
    User findById(Long id);
    User findByUsername(String username);
    List<User> findAll();
    List<User> findAllWithoutAuthorites();
    void createNewUser(User user);
}
