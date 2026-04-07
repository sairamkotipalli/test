package com.edutech.healthcare_appointment_management_system.config;

import com.edutech.healthcare_appointment_management_system.jwt.JwtRequestFilter;
import com.edutech.healthcare_appointment_management_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService).passwordEncoder(passwordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeRequests()

            // ─── PUBLIC: Login & Registration (no token required) ──────────
            .antMatchers(
                "/api/user/login",
                "/api/patient/register",
                "/api/doctor/register",
                "/api/receptionist/register"
            ).permitAll()

            // ─── PATIENT only endpoints ────────────────────────────────────
            .antMatchers(
                "/api/patient/profile",
                "/api/patient/doctors",
                "/api/patient/doctors/search",
                "/api/patient/appointment",
                "/api/patient/appointments",
                "/api/patient/medicalrecords"
            ).hasRole("PATIENT")

            // ─── DOCTOR only endpoints ─────────────────────────────────────
            .antMatchers(
                "/api/doctor/profile",
                "/api/doctor/appointments",
                "/api/doctor/appointments/range",
                "/api/doctor/appointments/filter",
                "/api/doctor/appointments/*/status",
                "/api/doctor/appointments/*/medicalrecord",
                "/api/doctor/patients/*/history",
                "/api/doctor/availability"
            ).hasRole("DOCTOR")

            // ─── RECEPTIONIST only endpoints ───────────────────────────────
            .antMatchers(
                "/api/receptionist/profile",
                "/api/receptionist/patients",
                "/api/receptionist/patients/search",
                "/api/receptionist/patients/*/history",
                "/api/receptionist/appointments",
                "/api/receptionist/appointments/today",
                "/api/receptionist/appointments/yesterday",
                "/api/receptionist/appointments/range",
                "/api/receptionist/appointments/filter",
                "/api/receptionist/doctors/search",
                "/api/receptionist/appointment",
                "/api/receptionist/appointment-reschedule/**"
            ).hasRole("RECEPTIONIST")

            // ─── SHARED: Paginated appointments (Doctor + Receptionist) ────
            .antMatchers("/api/appointments/**")
                .hasAnyRole("DOCTOR", "RECEPTIONIST")

            // ─── Deny everything else ──────────────────────────────────────
            .anyRequest().authenticated()

            .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration config =
                new org.springframework.web.cors.CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList("Authorization"));
        config.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source =
                new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}