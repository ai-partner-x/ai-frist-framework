package com.aikoboot.identity.service;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.core.context.CurrentUserContext;
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
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
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

        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BizException(IdentityErrorCode.ACCOUNT_DISABLED);
        }

        UserCredential credential = userCredentialMapper.selectOne(
                new QueryWrapper<UserCredential>().eq("user_id", user.getId()));
        if (credential == null) {
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }

        if (credential.getLockedUntil() != null) {
            if (credential.getLockedUntil().isAfter(LocalDateTime.now())) {
                throw new BizException(IdentityErrorCode.ACCOUNT_LOCKED);
            }
            // 锁定窗口已过期：必须在校验密码前把失败计数清零，否则下一次输错密码会
            // 立刻把计数从 5（上次锁定时的值）加到 6，重新触发锁定阈值，导致账号
            // 锁定一次之后再也拿不到正常的 5 次尝试机会。
            resetLoginFailure(credential);
            credential.setLoginFailCount(0);
            credential.setLockedUntil(null);
        }

        if (!passwordEncoder.matches(request.getPassword(), credential.getPasswordHash())) {
            handleLoginFailure(credential);
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }

        resetLoginFailure(credential);

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

    /**
     * 原子自增失败计数，避免并发错误密码请求"读旧值再写回"导致计数少加、绕过锁定阈值的竞态条件。
     * 达到阈值后再做一次原子更新设置 locked_until——即使多个并发请求都判定"该锁了"，
     * 重复设置同一个字段是幂等的，不会有安全问题。
     */
    private void handleLoginFailure(UserCredential credential) {
        userCredentialMapper.update(null, new UpdateWrapper<UserCredential>()
                .setSql("login_fail_count = login_fail_count + 1")
                .set("updated_at", LocalDateTime.now())
                .set("updated_by", CurrentUserContext.getUserId())
                .eq("id", credential.getId()));

        UserCredential refreshed = userCredentialMapper.selectById(credential.getId());
        if (refreshed.getLoginFailCount() != null && refreshed.getLoginFailCount() >= MAX_LOGIN_FAIL_COUNT) {
            userCredentialMapper.update(null, new UpdateWrapper<UserCredential>()
                    .set("locked_until", LocalDateTime.now().plusMinutes(LOCK_MINUTES))
                    .set("updated_at", LocalDateTime.now())
                    .set("updated_by", CurrentUserContext.getUserId())
                    .eq("id", refreshed.getId()));
        }
    }

    private void resetLoginFailure(UserCredential credential) {
        userCredentialMapper.update(null, new UpdateWrapper<UserCredential>()
                .set("login_fail_count", 0)
                .set("locked_until", null)
                .set("updated_at", LocalDateTime.now())
                .set("updated_by", CurrentUserContext.getUserId())
                .eq("id", credential.getId()));
    }

    @Override
    public void logout(String token) {
        StpUtil.logoutByTokenValue(token);
    }

    @Override
    public CurrentUserDTO getCurrentUser(Long userId) {
        UserDTO user = userApi.getById(userId);
        if (user == null) {
            // 独立部署下 UserApi 走 Feign：远程用户在会话签发之后被删除/不可达时，
            // unwrap() 返回 null 而不是抛异常（合并部署下本地 UserServiceImpl.getById
            // 查不到会直接抛 USER_NOT_FOUND，这里补上同样的保护，避免裸 NPE 变成 500）。
            throw new BizException(IdentityErrorCode.USER_NOT_FOUND);
        }
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
