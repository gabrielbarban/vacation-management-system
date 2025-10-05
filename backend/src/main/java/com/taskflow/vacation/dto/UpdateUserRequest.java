package com.taskflow.vacation.dto;

import com.taskflow.vacation.entity.Role;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    
    @Email
    private String email;
    
    private String name;
    
    private Role role;
    
    private Long managerId;
}