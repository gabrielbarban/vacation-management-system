package com.taskflow.vacation.dto;

import com.taskflow.vacation.entity.VacationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class VacationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private LocalDate startDate;
    private LocalDate endDate;
    private VacationStatus status;
}