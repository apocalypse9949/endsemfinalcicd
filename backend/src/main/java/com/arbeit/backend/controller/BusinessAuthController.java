package com.arbeit.backend.controller;

import com.arbeit.backend.dto.AuthRequest;
import com.arbeit.backend.dto.AuthResponse;
import com.arbeit.backend.dto.BusinessRegistrationRequest;
import com.arbeit.backend.dto.LoginResponse;
import com.arbeit.backend.service.BusinessAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/business")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BusinessAuthController {

    private final BusinessAuthService businessAuthService;

    public BusinessAuthController(BusinessAuthService businessAuthService) {
        this.businessAuthService = businessAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            LoginResponse loginResponse = businessAuthService.login(request);

            // Set JWT token as HTTP-only cookie (single token, 30 min)
            ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", loginResponse.getAccessToken())
                    .httpOnly(true)
                    .secure(false) // Set to true in production with HTTPS
                    .path("/")
                    .domain("localhost") // Explicitly set domain for localhost
                    .maxAge(1800) // 30 minutes
                    .sameSite("Lax") // Allow cross-site requests
                    .build();
            response.addHeader("Set-Cookie", accessTokenCookie.toString());

            // Don't send tokens in response body for security
            AuthResponse authResponse = new AuthResponse(loginResponse.getMessage(),
                    loginResponse.getBid(), loginResponse.getEmail(), loginResponse.getRole());

            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Business login failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Internal server error"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody BusinessRegistrationRequest request) {
        try {
            AuthResponse authResponse = businessAuthService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Business registration failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Internal server error"));
        }
    }

    // Refresh endpoint removed
}
