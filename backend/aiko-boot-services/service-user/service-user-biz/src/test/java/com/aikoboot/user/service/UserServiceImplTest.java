package com.aikoboot.user.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.user.api.dto.CreateUserRequest;
import com.aikoboot.user.api.dto.UpdateUserRequest;
import com.aikoboot.user.api.dto.UserDTO;
import com.aikoboot.user.entity.User;
import com.aikoboot.user.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceImplTest {

    private UserMapper userMapper;
    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        userMapper = mock(UserMapper.class);
        service = new UserServiceImpl(userMapper);
    }

    private User sampleUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("alice");
        user.setEmail("alice@example.com");
        user.setPhone("13800000000");
        user.setStatus(1);
        return user;
    }

    @Test
    void getById_whenUserExists_returnsMappedDTO() {
        when(userMapper.selectById(1L)).thenReturn(sampleUser(1L));

        UserDTO dto = service.getById(1L);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getUsername()).isEqualTo("alice");
        assertThat(dto.getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void getById_whenUserDoesNotExist_throwsBizExceptionWithNotFoundCode() {
        when(userMapper.selectById(999L)).thenReturn(null);

        assertThatThrownBy(() -> service.getById(999L))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(404);
    }

    @Test
    void getByUsername_whenUserExists_returnsMappedDTO() {
        when(userMapper.selectOne(any())).thenReturn(sampleUser(1L));

        UserDTO dto = service.getByUsername("alice");

        assertThat(dto).isNotNull();
        assertThat(dto.getUsername()).isEqualTo("alice");
    }

    @Test
    void getByUsername_whenUserDoesNotExist_returnsNullWithoutThrowing() {
        when(userMapper.selectOne(any())).thenReturn(null);

        UserDTO dto = service.getByUsername("nonexistent");

        assertThat(dto).isNull();
    }

    @Test
    void list_mapsEveryEntityToADTO() {
        when(userMapper.selectList(null)).thenReturn(List.of(sampleUser(1L), sampleUser(2L)));

        List<UserDTO> result = service.list();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserDTO::getId).containsExactly(1L, 2L);
    }

    @Test
    void create_insertsNewUserWithDefaultStatusOneAndReturnsMappedDTO() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("bob");
        request.setEmail("bob@example.com");
        request.setPhone("13900000000");

        UserDTO dto = service.create(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userMapper).insert(captor.capture());
        User inserted = captor.getValue();
        assertThat(inserted.getUsername()).isEqualTo("bob");
        assertThat(inserted.getEmail()).isEqualTo("bob@example.com");
        assertThat(inserted.getPhone()).isEqualTo("13900000000");
        assertThat(inserted.getStatus()).isEqualTo(1);

        assertThat(dto.getUsername()).isEqualTo("bob");
    }

    @Test
    void update_whenUserExists_appliesOnlyNonNullFieldsAndLeavesRestUnchanged() {
        User existing = sampleUser(1L);
        when(userMapper.selectById(1L)).thenReturn(existing);
        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("new-email@example.com");
        // phone and status intentionally left null on the request -- must NOT overwrite the
        // existing values, this is the exact partial-update branch UserServiceImpl.update()
        // implements via three separate `if (request.getX() != null)` checks

        UserDTO dto = service.update(1L, request);

        assertThat(dto.getEmail()).isEqualTo("new-email@example.com");
        assertThat(dto.getPhone()).isEqualTo("13800000000");
        assertThat(dto.getStatus()).isEqualTo(1);
        verify(userMapper).updateById((User) existing);
    }

    @Test
    void update_whenUserDoesNotExist_throwsBizExceptionAndNeverCallsUpdateById() {
        when(userMapper.selectById(999L)).thenReturn(null);
        UpdateUserRequest request = new UpdateUserRequest();

        assertThatThrownBy(() -> service.update(999L, request))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(404);

        verify(userMapper, never()).updateById(any(User.class));
    }

    @Test
    void delete_delegatesDirectlyToMapperDeleteById() {
        service.delete(1L);

        verify(userMapper).deleteById(1L);
    }
}
