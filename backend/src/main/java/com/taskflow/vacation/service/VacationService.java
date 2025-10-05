package com.taskflow.vacation.service;

import com.taskflow.vacation.dto.CreateVacationRequest;
import com.taskflow.vacation.dto.VacationResponse;
import com.taskflow.vacation.entity.Role;
import com.taskflow.vacation.entity.User;
import com.taskflow.vacation.entity.VacationRequest;
import com.taskflow.vacation.entity.VacationStatus;
import com.taskflow.vacation.repository.UserRepository;
import com.taskflow.vacation.repository.VacationRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VacationService {

    @Autowired
    private VacationRequestRepository vacationRepository;

    @Autowired
    private UserRepository userRepository;

    public VacationResponse createVacation(CreateVacationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date must be before end date");
        }

        List<VacationRequest> overlapping = vacationRepository.findOverlappingVacations(
                user.getId(), request.getStartDate(), request.getEndDate()
        );

        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Vacation dates overlap with existing approved vacations");
        }

        VacationRequest vacation = new VacationRequest();
        vacation.setUser(user);
        vacation.setStartDate(request.getStartDate());
        vacation.setEndDate(request.getEndDate());
        vacation.setStatus(VacationStatus.PENDING);

        VacationRequest saved = vacationRepository.save(vacation);
        return mapToResponse(saved);
    }

    public List<VacationResponse> getAllVacations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<VacationRequest> vacations;

        if (currentUser.getRole() == Role.ADMIN) {
            vacations = vacationRepository.findAll();
        } else if (currentUser.getRole() == Role.MANAGER) {
            vacations = vacationRepository.findAll().stream()
                    .filter(v -> v.getUser().getManager() != null && 
                                 v.getUser().getManager().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        } else {
            vacations = vacationRepository.findByUser(currentUser);
        }

        return vacations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public VacationResponse approveVacation(Long id) {
        VacationRequest vacation = vacationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacation not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.COLLABORATOR) {
            throw new RuntimeException("Collaborators cannot approve vacations");
        }

        if (currentUser.getRole() == Role.MANAGER) {
            if (vacation.getUser().getManager() == null || 
                !vacation.getUser().getManager().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You can only approve your team's vacations");
            }
        }

        vacation.setStatus(VacationStatus.APPROVED);
        VacationRequest updated = vacationRepository.save(vacation);
        return mapToResponse(updated);
    }

    public VacationResponse rejectVacation(Long id) {
        VacationRequest vacation = vacationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacation not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.COLLABORATOR) {
            throw new RuntimeException("Collaborators cannot reject vacations");
        }

        if (currentUser.getRole() == Role.MANAGER) {
            if (vacation.getUser().getManager() == null || 
                !vacation.getUser().getManager().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You can only reject your team's vacations");
            }
        }

        vacation.setStatus(VacationStatus.REJECTED);
        VacationRequest updated = vacationRepository.save(vacation);
        return mapToResponse(updated);
    }

    public void deleteVacation(Long id) {
        VacationRequest vacation = vacationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacation not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.COLLABORATOR && 
            !vacation.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own vacations");
        }

        vacationRepository.deleteById(id);
    }

    private VacationResponse mapToResponse(VacationRequest vacation) {
        return new VacationResponse(
                vacation.getId(),
                vacation.getUser().getId(),
                vacation.getUser().getName(),
                vacation.getStartDate(),
                vacation.getEndDate(),
                vacation.getStatus()
        );
    }
}