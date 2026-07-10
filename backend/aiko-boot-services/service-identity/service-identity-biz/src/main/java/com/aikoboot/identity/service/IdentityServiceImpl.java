package com.aikoboot.identity.service;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.core.exception.BizException;
import com.aikoboot.identity.api.IdentityApi;
import com.aikoboot.identity.api.dto.CurrentUserDTO;
import com.aikoboot.identity.api.dto.LoginRequest;
import com.aikoboot.identity.api.dto.LoginResponse;
import com.aikoboot.identity.entity.UserCredential;
import com.aikoboot.identity.exception.IdentityErrorCode;
import com.aikoboot.identity.mapper.UserCredentialMapper;
import com.aikoboot.user.api.UserApi;
import com.aikoboot.user.api.dto.UserDTO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class IdentityServiceImpl implements IdentityApi {

    private static final int MAX_LOGIN_FAIL_COUNT = 5;
    private static final long LOCK_MINUTES = 15;

    private final UserApi userApi;
    private final UserCredentialMapper userCredentialMapper;
    private final PasswordEncoder passwordEncoder;
    private final AikoStpInterfaceImpl stpInterface;

    public IdentityServiceImpl(UserApi userApi, UserCredentialMapper userCredentialMapper,
                                PasswordEncoder passwordEncoder, AikoStpInterfaceImpl stpInterface) {
        this.userApi = userApi;
        this.userCredentialMapper = userCredentialMapper;
        this.passwordEncoder = passwordEncoder;
        this.stpInterface = stpInterface;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        UserDTO user = userApi.getByUsername(request.getUsername());
        if (user == null) {
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }

        UserCredential credential = userCredentialMapper.selectOne(
                new QueryWrapper<UserCredential>().eq("user_id", user.getId()));
        if (credential == null) {
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }

        if (credential.getLockedUntil() != null && credential.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new BizException(IdentityErrorCode.ACCOUNT_LOCKED);
        }

        if (!passwordEncoder.matches(request.getPassword(), credential.getPasswordHash())) {
            handleLoginFailure(credential);
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }

        credential.setLoginFailCount(0);
        credential.setLockedUntil(null);
        userCredentialMapper.updateById(credential);

        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRoles(stpInterface.getRoleList(user.getId(), StpUtil.getLoginType()));
        response.setPermissions(stpInterface.getPermissionList(user.getId(), StpUtil.getLoginType()));
        return response;
    }

    private void handleLoginFailure(UserCredential credential) {
        int failCount = credential.getLoginFailCount() == null ? 0 : credential.getLoginFailCount();
        failCount++;
        credential.setLoginFailCount(failCount);
        if (failCount >= MAX_LOGIN_FAIL_COUNT) {
            credential.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
        }
        userCredentialMapper.updateById(credential);
    }

    @Override
    public void logout(String token) {
        StpUtil.logoutByTokenValue(token);
    }

    @Override
    public CurrentUserDTO getCurrentUser(Long userId) {
        UserDTO user = userApi.getById(userId);
        CurrentUserDTO dto = new CurrentUserDTO();
        dto.setUserId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRoles(stpInterface.getRoleList(userId, StpUtil.getLoginType()));
        dto.setPermissions(stpInterface.getPermissionList(userId, StpUtil.getLoginType()));
        return dto;
    }

    @Override
    public boolean hasPermission(Long userId, String permissionCode) {
        return stpInterface.getPermissionList(userId, StpUtil.getLoginType()).contains(permissionCode);
    }
}
