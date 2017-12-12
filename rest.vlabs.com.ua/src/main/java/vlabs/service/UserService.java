package vlabs.service;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;
import javax.persistence.EntityNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import utils.BufferedImageUtils;
import vlabs.model.Authority;
import vlabs.model.User;
import vlabs.model.UserMedia;
import vlabs.repository.AuthorityRepository;
import vlabs.repository.UserMediaRepository;
import vlabs.repository.UserRepository;

@Service
public class UserService
{

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMediaRepository userMediaRepository;

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
    public void updateProfilePhoto(MultipartFile photoFile) throws AccessDeniedException, IOException {
        User user = (User)SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();

        BufferedImage photoImage = null;

        try
        {
            photoImage = ImageIO.read(new ByteArrayInputStream(photoFile.getBytes()));

            photoImage = BufferedImageUtils.resize(photoImage, 150, 150, true);

            BufferedImage photoImageJPG = new BufferedImage(photoImage.getWidth(), photoImage.getHeight(), BufferedImage.TYPE_INT_RGB);
            photoImageJPG.createGraphics().drawImage(photoImage, 0, 0, Color.WHITE, null);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(photoImageJPG, "JPG", baos);

            UserMedia userMedia = user.getUserMedia();
            userMedia.setPhoto(baos.toByteArray());
            baos.close();

            userMediaRepository.save(userMedia);

        } catch (IOException ex){
            throw ex;
        }
    }

    @PreAuthorize("hasRole('USER')")
    public byte[] getProfilePhoto(User user) throws AccessDeniedException {
        byte[] photo = null;
        try
        {
            photo = userMediaRepository.getOne(user.getId()).getPhoto();
        } catch (EntityNotFoundException ex) {
            log.info("No UserMedia set yet for User id:" + user.getId().toString());
        }
        if (photo == null)
        {
            BufferedImage noPhotoBI;
            try {
                noPhotoBI = ImageIO.read(ClassLoader.getSystemResource("static/images/no-profile-photo.jpg"));
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(noPhotoBI, "JPG", baos);
                photo = baos.toByteArray();
                baos.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return photo;
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
    public Page<User> findAllPaged(int page, int size) throws AccessDeniedException {
        PageRequest limit = PageRequest.of(page, size, Direction.ASC, "id");
        Page<User> result = userRepository.findAll(limit);
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

    @PreAuthorize("hasRole('ADMIN')")
    public void updateUser(User user) throws AccessDeniedException {
        User existingUser = userRepository.getOne(user.getId());
        existingUser.setEnabled(user.isEnabled());
        userRepository.save(existingUser);
    }

    public void createNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

}
