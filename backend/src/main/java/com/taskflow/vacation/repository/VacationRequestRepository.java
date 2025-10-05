package com.taskflow.vacation.repository;

import com.taskflow.vacation.entity.VacationRequest;
import com.taskflow.vacation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VacationRequestRepository extends JpaRepository<VacationRequest, Long> {
    
    List<VacationRequest> findByUser(User user);
    
    @Query("SELECT v FROM VacationRequest v WHERE v.user.id != :userId " +
           "AND v.status = 'APPROVED' " +
           "AND ((v.startDate <= :endDate AND v.endDate >= :startDate))")
    List<VacationRequest> findOverlappingVacations(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}