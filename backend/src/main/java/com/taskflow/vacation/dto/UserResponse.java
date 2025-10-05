package com.taskflow.vacation.dto;

import com.taskflow.vacation.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private Role role;
    private Long managerId;
}