package com.edutech.healthcare_appointment_management_system.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.edutech.healthcare_appointment_management_system.entity.Campaign;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.HealthTip;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.repository.CampaignRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.HealthTipRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;
import com.edutech.healthcare_appointment_management_system.repository.UserRepository;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private HealthTipRepository healthTipRepository;
    @Autowired private CampaignRepository campaignRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // 1. ALWAYS ensure the admin exists, regardless of other users!
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@healthcare.com")
                    .role("ADMIN")
                    .build();
            userRepository.save(adminUser);
            System.out.println("Admin account created successfully!");
        }
    }

    private void createDoctor(String username, String name, String specialty, String availability, String email) {
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode("doctor123"))
                .email(email)
                .role("DOCTOR")
                .build();
        user = userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .name(name)
                .specialty(specialty)
                .availability(availability)
                .email(email)
                .user(user)
                .build();
        doctorRepository.save(doctor);
    }

    private void createPatient(String username, String name, String phone, String address, String email) {
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode("patient123"))
                .email(email)
                .role("PATIENT")
                .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder()
                .name(name)
                .phone(phone)
                .address(address)
                .user(user)
                .build();
        patientRepository.save(patient);
    }
}