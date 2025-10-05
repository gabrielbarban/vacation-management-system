package com.taskflow.vacation.service;

import com.taskflow.vacation.entity.Role;
import com.taskflow.vacation.entity.User;
import com.taskflow.vacation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DataInitService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setEmail("admin@taskflow.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Admin User");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            User manager = new User();
            manager.setEmail("manager@taskflow.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setName("Manager User");
            manager.setRole(Role.MANAGER);
            userRepository.save(manager);

            User collaborator = new User();
            collaborator.setEmail("user@taskflow.com");
            collaborator.setPassword(passwordEncoder.encode("user123"));
            collaborator.setName("Collaborator User");
            collaborator.setRole(Role.COLLABORATOR);
            collaborator.setManager(manager);
            userRepository.save(collaborator);
        }
    }
}