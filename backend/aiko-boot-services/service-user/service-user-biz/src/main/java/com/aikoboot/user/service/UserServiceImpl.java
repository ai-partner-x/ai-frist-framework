package com.aikoboot.user.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.user.api.UserApi;
import com.aikoboot.user.api.dto.CreateUserRequest;
import com.aikoboot.user.api.dto.UpdateUserRequest;
import com.aikoboot.user.api.dto.UserDTO;
import com.aikoboot.user.entity.User;
import com.aikoboot.user.exception.UserErrorCode;
import com.aikoboot.user.mapper.UserMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserApi {

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDTO getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(UserErrorCode.USER_NOT_FOUND);
        }
        return toDTO(user);
    }

    @Override
    public List<UserDTO> list() {
        return userMapper.selectList(null).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO create(CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setStatus(1);
        userMapper.insert(user);
        return toDTO(user);
    }

    @Override
    public UserDTO update(Long id, UpdateUserRequest request) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(UserErrorCode.USER_NOT_FOUND);
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        userMapper.updateById(user);
        return toDTO(user);
    }

    @Override
    public void delete(Long id) {
        userMapper.deleteById(id);
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }
}
