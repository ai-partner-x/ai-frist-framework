package com.aikoboot.identity.feign;

import com.aikoboot.core.response.Result;
import com.aikoboot.user.api.UserApi;
import com.aikoboot.user.api.dto.CreateUserRequest;
import com.aikoboot.user.api.dto.UpdateUserRequest;
import com.aikoboot.user.api.dto.UserDTO;

import java.util.List;

/**
 * UserApi 的远程实现——只有在没有本地 UserApi Bean（即 service-user-biz 不在
 * classpath 上）时才会被 UserApiFeignConfig 注册使用。
 */
public class UserApiFeignAdapter implements UserApi {

    private final UserFeignClient userFeignClient;

    public UserApiFeignAdapter(UserFeignClient userFeignClient) {
        this.userFeignClient = userFeignClient;
    }

    @Override
    public UserDTO getById(Long id) {
        return unwrap(userFeignClient.getById(id));
    }

    @Override
    public UserDTO getByUsername(String username) {
        return unwrap(userFeignClient.getByUsername(username));
    }

    @Override
    public List<UserDTO> list() {
        Result<List<UserDTO>> result = userFeignClient.list();
        return result != null && result.isSuccess() ? result.getData() : List.of();
    }

    @Override
    public UserDTO create(CreateUserRequest request) {
        return unwrap(userFeignClient.create(request));
    }

    @Override
    public UserDTO update(Long id, UpdateUserRequest request) {
        return unwrap(userFeignClient.update(id, request));
    }

    @Override
    public void delete(Long id) {
        userFeignClient.delete(id);
    }

    private UserDTO unwrap(Result<UserDTO> result) {
        return result != null && result.isSuccess() ? result.getData() : null;
    }
}
