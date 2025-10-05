package com.taskflow.vacation.dto;

import com.taskflow.vacation.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private String name;
    private Role role;
}