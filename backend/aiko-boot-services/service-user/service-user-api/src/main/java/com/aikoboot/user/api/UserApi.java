package com.aikoboot.user.api;

import com.aikoboot.user.api.dto.CreateUserRequest;
import com.aikoboot.user.api.dto.UpdateUserRequest;
import com.aikoboot.user.api.dto.UserDTO;

import java.util.List;

public interface UserApi {

    UserDTO getById(Long id);

    List<UserDTO> list();

    UserDTO create(CreateUserRequest request);

    UserDTO update(Long id, UpdateUserRequest request);

    void delete(Long id);
}
