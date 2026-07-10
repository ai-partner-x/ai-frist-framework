package com.aikoboot.identity.feign;

import com.aikoboot.core.response.Result;
import com.aikoboot.user.api.dto.CreateUserRequest;
import com.aikoboot.user.api.dto.UpdateUserRequest;
import com.aikoboot.user.api.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "service-user", url = "${aiko.services.user.base-url:http://localhost:9101}", path = "/api/users")
public interface UserFeignClient {

    @GetMapping("/{id}")
    Result<UserDTO> getById(@PathVariable("id") Long id);

    @GetMapping("/by-username/{username}")
    Result<UserDTO> getByUsername(@PathVariable("username") String username);

    @GetMapping
    Result<List<UserDTO>> list();

    @PostMapping
    Result<UserDTO> create(@RequestBody CreateUserRequest request);

    @PutMapping("/{id}")
    Result<UserDTO> update(@PathVariable("id") Long id, @RequestBody UpdateUserRequest request);

    @DeleteMapping("/{id}")
    Result<Void> delete(@PathVariable("id") Long id);
}
