package com.taskflow.vacation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.taskflow.vacation.repository")
public class VacationManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(VacationManagementApplication.class, args);
	}

}