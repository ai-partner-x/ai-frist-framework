package com.aikoboot.identity.api;

import com.aikoboot.identity.api.dto.CurrentUserDTO;
import com.aikoboot.identity.api.dto.LoginRequest;
import com.aikoboot.identity.api.dto.LoginResponse;

public interface IdentityApi {

    LoginResponse login(LoginRequest request);

    void logout(String token);

    CurrentUserDTO getCurrentUser(Long userId);

    boolean hasPermission(Long userId, String permissionCode);
}
