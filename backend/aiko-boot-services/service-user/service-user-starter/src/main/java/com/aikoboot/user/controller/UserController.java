package com.aikoboot.user.controller;

import com.aikoboot.user.api.UserApi;
import com.aikoboot.user.api.dto.CreateUserRequest;
import com.aikoboot.user.api.dto.UpdateUserRequest;
import com.aikoboot.user.api.dto.UserDTO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 薄层：直接委托 UserApi，不重复业务逻辑。响应自动被 aiko-boot-starter-web 的
 * ResultWrapperAdvice 包装成 Result，不需要在这里手动包一层。
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserApi userApi;

    public UserController(UserApi userApi) {
        this.userApi = userApi;
    }

    @GetMapping("/{id}")
    public UserDTO getById(@PathVariable Long id) {
        return userApi.getById(id);
    }

    @GetMapping
    public List<UserDTO> list() {
        return userApi.list();
    }

    @PostMapping
    public UserDTO create(@Valid @RequestBody CreateUserRequest request) {
        return userApi.create(request);
    }

    @PutMapping("/{id}")
    public UserDTO update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userApi.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userApi.delete(id);
    }
}
