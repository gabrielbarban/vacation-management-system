package com.taskflow.vacation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateVacationRequest {
    
    @NotNull
    private LocalDate startDate;
    
    @NotNull
    private LocalDate endDate;
}