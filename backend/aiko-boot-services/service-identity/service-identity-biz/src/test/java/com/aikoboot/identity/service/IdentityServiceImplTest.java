package com.aikoboot.identity.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.identity.api.dto.LoginRequest;
import com.aikoboot.identity.entity.UserCredential;
import com.aikoboot.identity.mapper.UserCredentialMapper;
import com.aikoboot.user.api.UserApi;
import com.aikoboot.user.api.dto.UserDTO;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class IdentityServiceImplTest {

    private UserApi userApi;
    private UserCredentialMapper userCredentialMapper;
    private PasswordEncoder passwordEncoder;
    private AikoStpInterfaceImpl stpInterface;
    private IdentityServiceImpl service;

    @BeforeEach
    void setUp() {
        userApi = mock(UserApi.class);
        userCredentialMapper = mock(UserCredentialMapper.class);
        passwordEncoder = mock(PasswordEncoder.class);
        stpInterface = mock(AikoStpInterfaceImpl.class);
        service = new IdentityServiceImpl(userApi, userCredentialMapper, passwordEncoder, stpInterface);
    }

    private UserDTO activeUser() {
        UserDTO dto = new UserDTO();
        dto.setId(1L);
        dto.setUsername("alice");
        dto.setStatus(1);
        return dto;
    }

    private UserCredential credentialFor(Long userId, String hash) {
        UserCredential credential = new UserCredential();
        credential.setId(100L);
        credential.setUserId(userId);
        credential.setPasswordHash(hash);
        credential.setLoginFailCount(0);
        return credential;
    }

    @Test
    void login_whenUserDisabled_throwsAccountDisabledWithoutCheckingPassword() {
        UserDTO disabledUser = activeUser();
        disabledUser.setStatus(0);
        when(userApi.getByUsername("alice")).thenReturn(disabledUser);

        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("whatever");

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(403);

        verify(userCredentialMapper, times(0)).selectOne(any());
    }

    @Test
    void login_wrongPassword_incrementsFailCountAtomicallyViaUpdateWrapper_notReadModifyWrite() {
        UserDTO user = activeUser();
        when(userApi.getByUsername("alice")).thenReturn(user);
        UserCredential credential = credentialFor(1L, "hashed");
        when(userCredentialMapper.selectOne(any())).thenReturn(credential);
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);
        UserCredential afterIncrement = credentialFor(1L, "hashed");
        afterIncrement.setLoginFailCount(1);
        when(userCredentialMapper.selectById(100L)).thenReturn(afterIncrement);

        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("wrong");

        assertThatThrownBy(() -> service.login(request)).isInstanceOf(BizException.class);

        // 关键断言：验证走的是 update(null, UpdateWrapper) 这条原子更新路径，
        // 不是 updateById(credential) 那种"读到 Java 对象再整体写回"的路径——
        // 后者才是产生竞态条件的根源，这里要确认修复后确实换了实现方式。
        verify(userCredentialMapper, times(1)).update(isNull(), any(UpdateWrapper.class));
    }

    @Test
    void login_whenFailCountReachesThreshold_locksAccount() {
        UserDTO user = activeUser();
        when(userApi.getByUsername("alice")).thenReturn(user);
        UserCredential credential = credentialFor(1L, "hashed");
        when(userCredentialMapper.selectOne(any())).thenReturn(credential);
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);
        UserCredential afterIncrement = credentialFor(1L, "hashed");
        afterIncrement.setLoginFailCount(5); // 达到阈值 MAX_LOGIN_FAIL_COUNT
        when(userCredentialMapper.selectById(100L)).thenReturn(afterIncrement);

        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("wrong");

        assertThatThrownBy(() -> service.login(request)).isInstanceOf(BizException.class);

        // 达到阈值后应该额外触发一次"设置 locked_until"的原子更新，加上增加计数那一次，一共两次
        verify(userCredentialMapper, times(2)).update(isNull(), any(UpdateWrapper.class));
    }

    @Test
    void login_whenAlreadyLocked_rejectsWithoutCheckingPassword() {
        UserDTO user = activeUser();
        when(userApi.getByUsername("alice")).thenReturn(user);
        UserCredential credential = credentialFor(1L, "hashed");
        credential.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(userCredentialMapper.selectOne(any())).thenReturn(credential);

        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("whatever");

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(423);

        verify(passwordEncoder, times(0)).matches(any(), any());
    }

    @Test
    void login_whenLockWindowExpired_resetsCounterBeforeCheckingPassword() {
        // 回归测试：修复前，锁定窗口过期后第一次输错密码会把计数从锁定时的 5
        // 直接加到 6，立刻再次触发锁定阈值，导致账号锁一次之后再也拿不到正常的
        // 5 次尝试机会。修复后，过期的锁定必须先把计数清零，这里验证清零确实发生了。
        UserDTO user = activeUser();
        when(userApi.getByUsername("alice")).thenReturn(user);
        UserCredential credential = credentialFor(1L, "hashed");
        credential.setLoginFailCount(5);
        credential.setLockedUntil(LocalDateTime.now().minusMinutes(1)); // 已过期
        when(userCredentialMapper.selectOne(any())).thenReturn(credential);
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);
        UserCredential afterIncrement = credentialFor(1L, "hashed");
        afterIncrement.setLoginFailCount(1); // 清零后再 +1，应该是 1，不是 6
        when(userCredentialMapper.selectById(100L)).thenReturn(afterIncrement);

        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("wrong");

        assertThatThrownBy(() -> service.login(request)).isInstanceOf(BizException.class);

        // 一次清零更新（resetLoginFailure）+ 一次原子自增（handleLoginFailure）= 2 次，
        // 关键是不应该有第 3 次"设置 locked_until"的更新——afterIncrement 的计数是 1，
        // 远低于阈值，不该重新锁定。
        verify(userCredentialMapper, times(2)).update(isNull(), any(UpdateWrapper.class));
    }

    @Test
    void getCurrentUser_whenUserApiReturnsNull_throwsUserNotFoundInsteadOfNpe() {
        // 独立部署下 UserApi 走 Feign，远程用户在会话签发之后被删除/不可达时
        // unwrap() 返回 null 而不是抛异常——这里验证不会因此产生裸 NPE。
        when(userApi.getById(1L)).thenReturn(null);

        assertThatThrownBy(() -> service.getCurrentUser(1L))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(404);
    }
}
