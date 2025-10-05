package com.taskflow.vacation.controller;

import com.taskflow.vacation.dto.CreateVacationRequest;
import com.taskflow.vacation.dto.VacationResponse;
import com.taskflow.vacation.service.VacationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacations")
public class VacationController {

    @Autowired
    private VacationService vacationService;

    @PostMapping
    public ResponseEntity<VacationResponse> createVacation(@Valid @RequestBody CreateVacationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vacationService.createVacation(request));
    }

    @GetMapping
    public ResponseEntity<List<VacationResponse>> getAllVacations() {
        return ResponseEntity.ok(vacationService.getAllVacations());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<VacationResponse> approveVacation(@PathVariable Long id) {
        return ResponseEntity.ok(vacationService.approveVacation(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<VacationResponse> rejectVacation(@PathVariable Long id) {
        return ResponseEntity.ok(vacationService.rejectVacation(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVacation(@PathVariable Long id) {
        vacationService.deleteVacation(id);
        return ResponseEntity.noContent().build();
    }
}