package com.aikoboot.identity.service;

import cn.dev33.satoken.stp.StpInterface;
import com.aikoboot.identity.entity.Permission;
import com.aikoboot.identity.entity.Role;
import com.aikoboot.identity.entity.RolePermission;
import com.aikoboot.identity.entity.UserRole;
import com.aikoboot.identity.mapper.PermissionMapper;
import com.aikoboot.identity.mapper.RoleMapper;
import com.aikoboot.identity.mapper.RolePermissionMapper;
import com.aikoboot.identity.mapper.UserRoleMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AikoStpInterfaceImpl implements StpInterface {

    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final PermissionMapper permissionMapper;

    public AikoStpInterfaceImpl(UserRoleMapper userRoleMapper, RoleMapper roleMapper,
                                 RolePermissionMapper rolePermissionMapper, PermissionMapper permissionMapper) {
        this.userRoleMapper = userRoleMapper;
        this.roleMapper = roleMapper;
        this.rolePermissionMapper = rolePermissionMapper;
        this.permissionMapper = permissionMapper;
    }

    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        List<Long> roleIds = getRoleIds(loginId);
        if (roleIds.isEmpty()) {
            return List.of();
        }
        List<Long> permissionIds = rolePermissionMapper.selectList(
                        new QueryWrapper<RolePermission>().in("role_id", roleIds))
                .stream()
                .map(RolePermission::getPermissionId)
                .collect(Collectors.toList());
        if (permissionIds.isEmpty()) {
            return List.of();
        }
        return permissionMapper.selectBatchIds(permissionIds).stream()
                .map(Permission::getPermissionCode)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        List<Long> roleIds = getRoleIds(loginId);
        if (roleIds.isEmpty()) {
            return List.of();
        }
        return roleMapper.selectBatchIds(roleIds).stream()
                .map(Role::getRoleCode)
                .collect(Collectors.toList());
    }

    private List<Long> getRoleIds(Object loginId) {
        Long userId = Long.valueOf(loginId.toString());
        return userRoleMapper.selectList(new QueryWrapper<UserRole>().eq("user_id", userId))
                .stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());
    }
}
