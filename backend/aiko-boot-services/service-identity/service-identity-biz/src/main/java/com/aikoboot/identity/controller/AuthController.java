package com.aikoboot.identity.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.identity.api.IdentityApi;
import com.aikoboot.identity.api.dto.CurrentUserDTO;
import com.aikoboot.identity.api.dto.LoginRequest;
import com.aikoboot.identity.api.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final IdentityApi identityApi;

    public AuthController(IdentityApi identityApi) {
        this.identityApi = identityApi;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return identityApi.login(request);
    }

    @PostMapping("/logout")
    public void logout() {
        identityApi.logout(StpUtil.getTokenValue());
    }

    @GetMapping("/current")
    public CurrentUserDTO current() {
        return identityApi.getCurrentUser(StpUtil.getLoginIdAsLong());
    }
}
