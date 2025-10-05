package com.taskflow.vacation.service;

import com.taskflow.vacation.dto.AuthResponse;
import com.taskflow.vacation.dto.LoginRequest;
import com.taskflow.vacation.entity.User;
import com.taskflow.vacation.repository.UserRepository;
import com.taskflow.vacation.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtUtil.generateToken(request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
}