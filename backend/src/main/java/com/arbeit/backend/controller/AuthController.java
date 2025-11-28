package com.arbeit.backend.controller;

import com.arbeit.backend.dto.AuthRequest;
import com.arbeit.backend.dto.AuthResponse;
import com.arbeit.backend.dto.LoginResponse;
import com.arbeit.backend.dto.UserRegistrationRequest;
import com.arbeit.backend.service.AuthService;
import com.arbeit.backend.security.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    public AuthController(AuthService authService, JwtUtils jwtUtils) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            // Normalize email to avoid case or whitespace mismatches
            if (request.getEmail() != null) {
                request.setEmail(request.getEmail().trim().toLowerCase());
            }
            LoginResponse loginResponse = authService.login(request);

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
                    loginResponse.getUserId(), loginResponse.getEmail(), loginResponse.getRole());

            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Login failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Internal server error"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            if (request.getEmail() != null) {
                request.setEmail(request.getEmail().trim().toLowerCase());
            }
            AuthResponse authResponse = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Registration failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Internal server error"));
        }
    }

    // Refresh endpoint removed

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        try {
            // Clear JWT cookies
            Cookie accessTokenCookie = new Cookie("accessToken", "");
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setSecure(false);
            accessTokenCookie.setPath("/");
            accessTokenCookie.setMaxAge(0);

            response.addCookie(accessTokenCookie);
            // No refresh cookie to clear

            return ResponseEntity.ok(new AuthResponse("Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Logout failed"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@CookieValue(value = "accessToken", required = false) String accessToken,
                                            @RequestBody java.util.Map<String, String> body) {
        try {
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse("Unauthorized"));
            }

            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(new AuthResponse("Invalid request"));
            }

            String username = jwtUtils.getUsernameFromToken(accessToken);
            authService.changePassword(username, currentPassword, newPassword);
            return ResponseEntity.ok(new AuthResponse("Password updated"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Failed to update password"));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> sendVerification(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new AuthResponse("Email is required"));
        }
        // Mock success; integrate real email later
        return ResponseEntity.ok(new AuthResponse("Verification code sent"));
    }

    @PutMapping("/verify-email")
    public ResponseEntity<?> verifyCode(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(new AuthResponse("Invalid request"));
        }
        // Mock acceptance of any code
        return ResponseEntity.ok(new AuthResponse("Email verified"));
    }
}
