# service-identity：RBAC 管理接口 + 遗留加固项详细设计

- 日期：2026-07-10
- 状态：设计稿，供 Cursor 生成代码用
- 前置：
  - [2026-07-10-service-identity-design.md](2026-07-10-service-identity-design.md)（`service-identity` 原始设计，RBAC 五张表在这里定义）
  - service-identity 已实现登录/鉴权核心流程（Sa-Token + BCrypt + 本地调用/Feign 兜底），已合并进 `main`

## 背景

`service-identity` 目前有完整的登录鉴权流程（`login`/`logout`/`getCurrentUser`/`hasPermission`），RBAC 数据模型（`sys_user_credential`/`sys_role`/`sys_permission`/`sys_role_permission`/`sys_user_role`）也已经建表，但**没有任何 API 能创建凭证、创建角色/权限、做任何分配**。此前唯一验证过登录流程的方式是用一个临时的种子工具（`DevCredentialSeeder`，验证后已删除）直接写库。这意味着 RBAC 从设计出来到现在，从未真正跑通过完整链路。

同时，`service-identity` 最终审查阶段发现的几个非阻塞项一直没处理：
1. 用户名枚举攻击的时序侧信道（无此用户 vs 密码错误两条路径耗时不一致）
2. `MultiServiceFlywayConfig`（`platform-bootstrap`）的服务清单只防"列了但没脚本"，没防"有脚本但忘了列"

这份 spec 把这些都补上。

## 范围（用户已确认）

- **补全 RBAC 管理 API**：创建凭证、改密码（自助，需旧密码）、角色 CRUD、权限 CRUD、角色-权限分配/撤销、用户-角色分配/撤销。**不做**管理员强制重置他人密码。
- **管理接口只要求登录**（`@SaCheckLogin`），不做权限自治——避免"第一个管理员的权限从哪来"的引导问题。真正的访问控制留给以后接网关/中台前置鉴权时处理。
- **不加进 `IdentityApi`**：这些管理操作没有其他服务需要跨服务调用，加进 `IdentityApi` 只会让独立部署的 Feign 兜底平白多出一堆用不到的方法。新建 `CredentialServiceImpl`/`RoleServiceImpl`/`PermissionServiceImpl` 三个内部服务类，配三个 Controller，都不实现 `IdentityApi`。
- **用户名枚举加固**：只修时序侧信道（无此用户时也跑一次 `BCrypt.matches`），保留 `ACCOUNT_DISABLED`（403）与 `INVALID_CREDENTIALS`（401）的错误码区分——中台/内部系统的客服支持场景需要区分"密码错"和"账号被禁用联系管理员"，完全合并成一个泛泛错误会丢失这个信号，是有意的权衡，不是遗漏。
- **`SERVICES_WITH_MIGRATIONS` 反向守卫**：用 classpath 扫描找到所有 `db/migration/*` 子目录，比对数组，发现"有脚本但没列入数组"就 fail-fast。这一项和 RBAC 主题无关，是 `platform-bootstrap` 自身的基础设施问题，顺带一起做。
- **验收方式**：用新增的管理 API 真实跑一遍角色/权限/分配/凭证/登录全流程，确认 `/api/auth/current` 返回真实的 `roles`/`permissions`；`PUT /api/users/{id}` 把 `status` 改成 `0` 验证账号禁用返回 403；`logout` 后再调 `/api/auth/current` 验证 401。账号锁定只验证能触发锁定（423），不实际等待 15 分钟验证过期重置——那部分已经有单元测试覆盖（`IdentityServiceImplTest.login_whenLockWindowExpired_...`）。

## 模块结构

新增文件都在 `service-identity-biz` 里（不新建 Maven 模块）：

```
service-identity-biz/
└── com.aikoboot.identity/
    ├── dto/                                # 内部 DTO，不进 service-identity-api
    │   ├── CreateCredentialRequest.java    # userId, initialPassword
    │   ├── ChangePasswordRequest.java      # oldPassword, newPassword
    │   ├── CreateRoleRequest.java          # roleCode, roleName
    │   ├── UpdateRoleRequest.java          # roleName
    │   ├── RoleDTO.java                    # id, roleCode, roleName
    │   ├── CreatePermissionRequest.java    # permissionCode, permissionName
    │   ├── UpdatePermissionRequest.java     # permissionName
    │   └── PermissionDTO.java              # id, permissionCode, permissionName
    ├── exception/
    │   └── IdentityErrorCode.java          # 追加新错误码（见下）
    ├── service/
    │   ├── CredentialServiceImpl.java      # 新建
    │   ├── RoleServiceImpl.java            # 新建
    │   └── PermissionServiceImpl.java      # 新建
    └── controller/
        ├── CredentialController.java       # 新建
        ├── RoleController.java             # 新建
        ├── PermissionController.java       # 新建
        └── UserRoleController.java         # 新建（见"四、用户-角色分配接口"）
```

**关于 DTO 放的位置**：这些 DTO 只在 `service-identity-biz` 内部用（Controller ↔ ServiceImpl），不需要被其他服务引用，所以不进 `service-identity-api`——放在 `service-identity-biz` 自己的 `com.aikoboot.identity.dto` 包下即可。

**Controller 放在 `-biz` 里**——和现有 `AuthController` 一致，这条规约已经是这个项目反复验证过的铁律，不再重复解释。

## 数据模型

不新建表，复用 `service-identity-design.md` 里已经定义的五张表。字段回顾（供实现时对照）：

- `sys_user_credential`：`id`/`tenant_id`/`user_id`/`password_hash`/`password_updated_at`/`login_fail_count`/`locked_until` + 4 审计字段 + `deleted`，唯一约束 `(tenant_id, user_id)`
- `sys_role`：`id`/`tenant_id`/`role_code`/`role_name` + 审计 + `deleted`，唯一约束 `(tenant_id, role_code)`
- `sys_permission`：`id`/`tenant_id`/`permission_code`/`permission_name` + 审计 + `deleted`，唯一约束 `(tenant_id, permission_code)`
- `sys_role_permission`：`id`/`tenant_id`/`role_id`/`permission_id` + 审计 + `deleted`，唯一约束 `(tenant_id, role_id, permission_id)`
- `sys_user_role`：`id`/`tenant_id`/`user_id`/`role_id` + 审计 + `deleted`，唯一约束 `(tenant_id, user_id, role_id)`

对应的 5 个 entity（`UserCredential`/`Role`/`Permission`/`RolePermission`/`UserRole`）和 5 个 mapper 都已经存在，直接复用，不用改。

## 新增错误码

`IdentityErrorCode.java` 追加（当前已有 `INVALID_CREDENTIALS(401)`/`ACCOUNT_LOCKED(423)`/`ACCOUNT_DISABLED(403)`/`USER_NOT_FOUND(404)`）：

```java
    CREDENTIAL_ALREADY_EXISTS(409, "该用户已存在登录凭证"),
    OLD_PASSWORD_INCORRECT(401, "原密码不正确"),
    ROLE_NOT_FOUND(404, "角色不存在"),
    ROLE_CODE_DUPLICATE(409, "角色编码已存在"),
    PERMISSION_NOT_FOUND(404, "权限不存在"),
    PERMISSION_CODE_DUPLICATE(409, "权限编码已存在");
```

## 一、凭证管理

### DTO

```java
package com.aikoboot.identity.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCredentialRequest {

    @NotNull(message = "用户 ID 不能为空")
    private Long userId;

    @NotBlank(message = "初始密码不能为空")
    @Size(min = 8, message = "密码长度不能少于 8 位")
    private String initialPassword;

    // getter/setter
}
```

```java
package com.aikoboot.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    @NotBlank(message = "原密码不能为空")
    private String oldPassword;

    @NotBlank(message = "新密码不能为空")
    @Size(min = 8, message = "密码长度不能少于 8 位")
    private String newPassword;

    // getter/setter
}
```

（`@Size(min = 8)` 是这次唯一加的密码强度校验——不做复杂度规则（大小写/数字/特殊字符），YAGNI，够用即可，真需要更严格的规则时再加。）

### CredentialServiceImpl.java

```java
package com.aikoboot.identity.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.identity.dto.ChangePasswordRequest;
import com.aikoboot.identity.dto.CreateCredentialRequest;
import com.aikoboot.identity.entity.UserCredential;
import com.aikoboot.identity.exception.IdentityErrorCode;
import com.aikoboot.identity.mapper.UserCredentialMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CredentialServiceImpl {

    private final UserCredentialMapper userCredentialMapper;
    private final PasswordEncoder passwordEncoder;

    public CredentialServiceImpl(UserCredentialMapper userCredentialMapper, PasswordEncoder passwordEncoder) {
        this.userCredentialMapper = userCredentialMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public void createCredential(CreateCredentialRequest request) {
        UserCredential existing = userCredentialMapper.selectOne(
                new QueryWrapper<UserCredential>().eq("user_id", request.getUserId()));
        if (existing != null) {
            throw new BizException(IdentityErrorCode.CREDENTIAL_ALREADY_EXISTS);
        }
        UserCredential credential = new UserCredential();
        credential.setUserId(request.getUserId());
        credential.setPasswordHash(passwordEncoder.encode(request.getInitialPassword()));
        credential.setPasswordUpdatedAt(LocalDateTime.now());
        credential.setLoginFailCount(0);
        userCredentialMapper.insert(credential);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        UserCredential credential = userCredentialMapper.selectOne(
                new QueryWrapper<UserCredential>().eq("user_id", userId));
        if (credential == null) {
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }
        if (!passwordEncoder.matches(request.getOldPassword(), credential.getPasswordHash())) {
            throw new BizException(IdentityErrorCode.OLD_PASSWORD_INCORRECT);
        }
        userCredentialMapper.update(null, new UpdateWrapper<UserCredential>()
                .set("password_hash", passwordEncoder.encode(request.getNewPassword()))
                .set("password_updated_at", LocalDateTime.now())
                .set("updated_at", LocalDateTime.now())
                .set("updated_by", com.aikoboot.core.context.CurrentUserContext.getUserId())
                .eq("id", credential.getId()));
    }
}
```

**改密码用 `UpdateWrapper` 不用 `updateById`**——和 `IdentityServiceImpl.resetLoginFailure`/`MessageServiceImpl.markInboxRead` 同一个已经踩过的坑：`updateById(entity)` 会把整个实体的其他字段（比如 `login_fail_count`/`locked_until`）也一起覆盖，如果这里构造的 `credential` 对象没有把这些字段带上就会被误清空。用 `UpdateWrapper` 精确指定只改 `password_hash`/`password_updated_at`，同时手动补 `updated_at`/`updated_by`（这条路径不会触发 `AikoMetaObjectHandler` 自动填充）。

### CredentialController.java

```java
package com.aikoboot.identity.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.identity.dto.ChangePasswordRequest;
import com.aikoboot.identity.dto.CreateCredentialRequest;
import com.aikoboot.identity.service.CredentialServiceImpl;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/identity/credentials")
public class CredentialController {

    private final CredentialServiceImpl credentialService;

    public CredentialController(CredentialServiceImpl credentialService) {
        this.credentialService = credentialService;
    }

    @PostMapping
    public void createCredential(@Valid @RequestBody CreateCredentialRequest request) {
        StpUtil.checkLogin();
        credentialService.createCredential(request);
    }

    @PutMapping("/password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        StpUtil.checkLogin();
        Long userId = StpUtil.getLoginIdAsLong();
        credentialService.changePassword(userId, request);
    }
}
```

**`StpUtil.checkLogin()`**——这是 Sa-Token 提供的"未登录直接抛 `NotLoginException`"检查方法，已有的 `SaTokenExceptionHandler` 会把它转成 `Result.fail(401, "未登录")`。这次三个新 Controller 的所有写操作端点都手动调用它做登录检查（不用注解式的 `@SaCheckLogin`，因为这个项目目前没有全局启用 Sa-Token 的注解式鉴权拦截器，直接在方法体里调用最简单可靠，和现有 `AuthController.logout()`/`current()` 用 `StpUtil` 静态方法的风格一致）。

## 二、角色管理

### DTO

```java
package com.aikoboot.identity.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateRoleRequest {

    @NotBlank(message = "角色编码不能为空")
    private String roleCode;

    @NotBlank(message = "角色名称不能为空")
    private String roleName;

    // getter/setter
}
```

```java
package com.aikoboot.identity.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateRoleRequest {

    @NotBlank(message = "角色名称不能为空")
    private String roleName;

    // getter/setter
}
```

（`UpdateRoleRequest` 只能改 `roleName`，不能改 `roleCode`——`roleCode` 是业务上引用的稳定标识，改了会破坏已有的引用关系，这是常见的约定，不是遗漏。）

```java
package com.aikoboot.identity.dto;

public class RoleDTO {

    private Long id;
    private String roleCode;
    private String roleName;

    // getter/setter
}
```

### RoleServiceImpl.java

```java
package com.aikoboot.identity.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.identity.dto.CreateRoleRequest;
import com.aikoboot.identity.dto.RoleDTO;
import com.aikoboot.identity.dto.UpdateRoleRequest;
import com.aikoboot.identity.entity.Role;
import com.aikoboot.identity.entity.RolePermission;
import com.aikoboot.identity.entity.UserRole;
import com.aikoboot.identity.exception.IdentityErrorCode;
import com.aikoboot.identity.mapper.RoleMapper;
import com.aikoboot.identity.mapper.RolePermissionMapper;
import com.aikoboot.identity.mapper.UserRoleMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl {

    private final RoleMapper roleMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final UserRoleMapper userRoleMapper;

    public RoleServiceImpl(RoleMapper roleMapper, RolePermissionMapper rolePermissionMapper,
                            UserRoleMapper userRoleMapper) {
        this.roleMapper = roleMapper;
        this.rolePermissionMapper = rolePermissionMapper;
        this.userRoleMapper = userRoleMapper;
    }

    public RoleDTO createRole(CreateRoleRequest request) {
        Role existing = roleMapper.selectOne(new QueryWrapper<Role>().eq("role_code", request.getRoleCode()));
        if (existing != null) {
            throw new BizException(IdentityErrorCode.ROLE_CODE_DUPLICATE);
        }
        Role role = new Role();
        role.setRoleCode(request.getRoleCode());
        role.setRoleName(request.getRoleName());
        roleMapper.insert(role);
        return toDto(role);
    }

    public List<RoleDTO> listRoles() {
        return roleMapper.selectList(null).stream().map(this::toDto).collect(Collectors.toList());
    }

    public RoleDTO updateRole(Long id, UpdateRoleRequest request) {
        Role role = requireRole(id);
        role.setRoleName(request.getRoleName());
        roleMapper.updateById(role);
        return toDto(role);
    }

    public void deleteRole(Long id) {
        requireRole(id);
        roleMapper.deleteById(id);
        // 角色删除后，关联的角色-权限、用户-角色映射一并清理，避免留下悬空引用
        rolePermissionMapper.delete(new QueryWrapper<RolePermission>().eq("role_id", id));
        userRoleMapper.delete(new QueryWrapper<UserRole>().eq("role_id", id));
    }

    public void assignPermission(Long roleId, Long permissionId) {
        requireRole(roleId);
        RolePermission existing = rolePermissionMapper.selectOne(new QueryWrapper<RolePermission>()
                .eq("role_id", roleId).eq("permission_id", permissionId));
        if (existing != null) {
            return; // 已经分配过，幂等
        }
        RolePermission rolePermission = new RolePermission();
        rolePermission.setRoleId(roleId);
        rolePermission.setPermissionId(permissionId);
        rolePermissionMapper.insert(rolePermission);
    }

    public void revokePermission(Long roleId, Long permissionId) {
        rolePermissionMapper.delete(new QueryWrapper<RolePermission>()
                .eq("role_id", roleId).eq("permission_id", permissionId));
    }

    public void assignRoleToUser(Long userId, Long roleId) {
        requireRole(roleId);
        UserRole existing = userRoleMapper.selectOne(new QueryWrapper<UserRole>()
                .eq("user_id", userId).eq("role_id", roleId));
        if (existing != null) {
            return; // 已经分配过，幂等
        }
        UserRole userRole = new UserRole();
        userRole.setUserId(userId);
        userRole.setRoleId(roleId);
        userRoleMapper.insert(userRole);
    }

    public void revokeRoleFromUser(Long userId, Long roleId) {
        userRoleMapper.delete(new QueryWrapper<UserRole>().eq("user_id", userId).eq("role_id", roleId));
    }

    private Role requireRole(Long id) {
        Role role = roleMapper.selectById(id);
        if (role == null) {
            throw new BizException(IdentityErrorCode.ROLE_NOT_FOUND);
        }
        return role;
    }

    private RoleDTO toDto(Role entity) {
        RoleDTO dto = new RoleDTO();
        dto.setId(entity.getId());
        dto.setRoleCode(entity.getRoleCode());
        dto.setRoleName(entity.getRoleName());
        return dto;
    }
}
```

**`deleteRole` 级联清理关联表**——这是这次设计里唯一一个"删除时需要处理关联数据"的地方：角色删了但 `sys_role_permission`/`sys_user_role` 里还留着指向这个已删除角色 ID 的行，会变成悬空引用（虽然不会报错，因为 MyBatis-Plus 的逻辑删除不设外键约束，但会造成脏数据，且 `AikoStpInterfaceImpl.getRoleIds` 之类的查询会查出"用户名下有个角色 ID，但这个角色其实已经不存在"的情况）。`assignPermission`/`assignRoleToUser` 重复分配时做成幂等（已存在就直接返回，不报错）——这是分配类接口的常见设计，调用方不需要先查询"是否已分配"再决定调不调用。

### RoleController.java

```java
package com.aikoboot.identity.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.identity.dto.CreateRoleRequest;
import com.aikoboot.identity.dto.RoleDTO;
import com.aikoboot.identity.dto.UpdateRoleRequest;
import com.aikoboot.identity.service.RoleServiceImpl;
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

@RestController
@RequestMapping("/api/identity/roles")
public class RoleController {

    private final RoleServiceImpl roleService;

    public RoleController(RoleServiceImpl roleService) {
        this.roleService = roleService;
    }

    @PostMapping
    public RoleDTO createRole(@Valid @RequestBody CreateRoleRequest request) {
        StpUtil.checkLogin();
        return roleService.createRole(request);
    }

    @GetMapping
    public List<RoleDTO> listRoles() {
        StpUtil.checkLogin();
        return roleService.listRoles();
    }

    @PutMapping("/{id}")
    public RoleDTO updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        StpUtil.checkLogin();
        return roleService.updateRole(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteRole(@PathVariable Long id) {
        StpUtil.checkLogin();
        roleService.deleteRole(id);
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    public void assignPermission(@PathVariable Long roleId, @PathVariable Long permissionId) {
        StpUtil.checkLogin();
        roleService.assignPermission(roleId, permissionId);
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public void revokePermission(@PathVariable Long roleId, @PathVariable Long permissionId) {
        StpUtil.checkLogin();
        roleService.revokePermission(roleId, permissionId);
    }
}
```

## 三、权限管理

### DTO

```java
package com.aikoboot.identity.dto;

import jakarta.validation.constraints.NotBlank;

public class CreatePermissionRequest {

    @NotBlank(message = "权限编码不能为空")
    private String permissionCode;

    @NotBlank(message = "权限名称不能为空")
    private String permissionName;

    // getter/setter
}
```

```java
package com.aikoboot.identity.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdatePermissionRequest {

    @NotBlank(message = "权限名称不能为空")
    private String permissionName;

    // getter/setter
}
```

```java
package com.aikoboot.identity.dto;

public class PermissionDTO {

    private Long id;
    private String permissionCode;
    private String permissionName;

    // getter/setter
}
```

### PermissionServiceImpl.java

```java
package com.aikoboot.identity.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.identity.dto.CreatePermissionRequest;
import com.aikoboot.identity.dto.PermissionDTO;
import com.aikoboot.identity.dto.UpdatePermissionRequest;
import com.aikoboot.identity.entity.Permission;
import com.aikoboot.identity.entity.RolePermission;
import com.aikoboot.identity.exception.IdentityErrorCode;
import com.aikoboot.identity.mapper.PermissionMapper;
import com.aikoboot.identity.mapper.RolePermissionMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionServiceImpl {

    private final PermissionMapper permissionMapper;
    private final RolePermissionMapper rolePermissionMapper;

    public PermissionServiceImpl(PermissionMapper permissionMapper, RolePermissionMapper rolePermissionMapper) {
        this.permissionMapper = permissionMapper;
        this.rolePermissionMapper = rolePermissionMapper;
    }

    public PermissionDTO createPermission(CreatePermissionRequest request) {
        Permission existing = permissionMapper.selectOne(
                new QueryWrapper<Permission>().eq("permission_code", request.getPermissionCode()));
        if (existing != null) {
            throw new BizException(IdentityErrorCode.PERMISSION_CODE_DUPLICATE);
        }
        Permission permission = new Permission();
        permission.setPermissionCode(request.getPermissionCode());
        permission.setPermissionName(request.getPermissionName());
        permissionMapper.insert(permission);
        return toDto(permission);
    }

    public List<PermissionDTO> listPermissions() {
        return permissionMapper.selectList(null).stream().map(this::toDto).collect(Collectors.toList());
    }

    public PermissionDTO updatePermission(Long id, UpdatePermissionRequest request) {
        Permission permission = requirePermission(id);
        permission.setPermissionName(request.getPermissionName());
        permissionMapper.updateById(permission);
        return toDto(permission);
    }

    public void deletePermission(Long id) {
        requirePermission(id);
        permissionMapper.deleteById(id);
        rolePermissionMapper.delete(new QueryWrapper<RolePermission>().eq("permission_id", id));
    }

    private Permission requirePermission(Long id) {
        Permission permission = permissionMapper.selectById(id);
        if (permission == null) {
            throw new BizException(IdentityErrorCode.PERMISSION_NOT_FOUND);
        }
        return permission;
    }

    private PermissionDTO toDto(Permission entity) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(entity.getId());
        dto.setPermissionCode(entity.getPermissionCode());
        dto.setPermissionName(entity.getPermissionName());
        return dto;
    }
}
```

### PermissionController.java

```java
package com.aikoboot.identity.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.identity.dto.CreatePermissionRequest;
import com.aikoboot.identity.dto.PermissionDTO;
import com.aikoboot.identity.dto.UpdatePermissionRequest;
import com.aikoboot.identity.service.PermissionServiceImpl;
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

@RestController
@RequestMapping("/api/identity/permissions")
public class PermissionController {

    private final PermissionServiceImpl permissionService;

    public PermissionController(PermissionServiceImpl permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping
    public PermissionDTO createPermission(@Valid @RequestBody CreatePermissionRequest request) {
        StpUtil.checkLogin();
        return permissionService.createPermission(request);
    }

    @GetMapping
    public List<PermissionDTO> listPermissions() {
        StpUtil.checkLogin();
        return permissionService.listPermissions();
    }

    @PutMapping("/{id}")
    public PermissionDTO updatePermission(@PathVariable Long id, @Valid @RequestBody UpdatePermissionRequest request) {
        StpUtil.checkLogin();
        return permissionService.updatePermission(id, request);
    }

    @DeleteMapping("/{id}")
    public void deletePermission(@PathVariable Long id) {
        StpUtil.checkLogin();
        permissionService.deletePermission(id);
    }
}
```

## 四、用户-角色分配接口

放在一个新的小 Controller 里（不塞进 `RoleController`，因为这是"用户的角色集合"，语义上属于用户资源，不属于角色资源——和 `RoleController` 里"给角色分配权限"那两个端点不是同一个资源维度）：

```java
package com.aikoboot.identity.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.identity.service.RoleServiceImpl;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/identity/users")
public class UserRoleController {

    private final RoleServiceImpl roleService;

    public UserRoleController(RoleServiceImpl roleService) {
        this.roleService = roleService;
    }

    @PostMapping("/{userId}/roles/{roleId}")
    public void assignRole(@PathVariable Long userId, @PathVariable Long roleId) {
        StpUtil.checkLogin();
        roleService.assignRoleToUser(userId, roleId);
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    public void revokeRole(@PathVariable Long userId, @PathVariable Long roleId) {
        StpUtil.checkLogin();
        roleService.revokeRoleFromUser(userId, roleId);
    }
}
```

（复用 `RoleServiceImpl` 里已经写好的 `assignRoleToUser`/`revokeRoleFromUser`，不用再建一个新的 service 类。）

## 五、用户名枚举时序加固

`IdentityServiceImpl.login` 当前逻辑（`INVALID_CREDENTIALS` 场景之一）：

```java
UserDTO user = userApi.getByUsername(request.getUsername());
if (user == null) {
    throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
}
```

无此用户时直接返回，不跑 `BCrypt.matches`；密码错误时会跑一次 `BCrypt.matches`（这一步本身很慢，是 BCrypt 故意设计成慢哈希）。两条路径耗时差异明显，可以用来批量探测用户名是否存在。

**修复**：无此用户时也跑一次 `BCrypt.matches`，对照一个固定的占位哈希（不是真实密码的哈希，纯粹用来拉平耗时）：

```java
    // 占位哈希，用于在"用户不存在"这条路径上也执行一次 BCrypt 校验，拉平和
    // "密码错误"路径的响应耗时——BCrypt.matches 本身就是故意设计成慢速的，
    // 耗时差异会被用来批量探测用户名是否存在，这是修复目标。这个哈希对应的
    // 明文密码是什么完全不重要（下面传入的 request.getPassword() 几乎不可能
    // 正好等于它，恒定判定为不匹配），只是借用它的计算耗时。
    //
    // 用 passwordEncoder.encode(...) 在类加载时现算，不要手写一个 BCrypt 格式的
    // 字符串字面量——BCrypt 编码对格式（版本前缀/cost/盐长度）要求严格，手写拼错
    // 一个字符就会在这条路径上被 BCryptPasswordEncoder 解析成 IllegalArgumentException，
    // 反而让"用户不存在"这个本该安静失败的分支直接抛出未处理异常。
    private static final String DUMMY_PASSWORD_HASH =
            new BCryptPasswordEncoder().encode("dummy-placeholder-for-timing-equalization");

    @Override
    public LoginResponse login(LoginRequest request) {
        UserDTO user = userApi.getByUsername(request.getUsername());
        if (user == null) {
            passwordEncoder.matches(request.getPassword(), DUMMY_PASSWORD_HASH);
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }
        ...
```

（需要加 `import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;`——这里现算占位哈希用的是具体实现类 `BCryptPasswordEncoder`，不是字段里注入的 `PasswordEncoder` 接口类型，两者不冲突，`DUMMY_PASSWORD_HASH` 只是一次性生成的静态常量。）

同样，`credential == null`（用户存在但没建凭证）这条路径也要补上：

```java
        UserCredential credential = userCredentialMapper.selectOne(
                new QueryWrapper<UserCredential>().eq("user_id", user.getId()));
        if (credential == null) {
            passwordEncoder.matches(request.getPassword(), DUMMY_PASSWORD_HASH);
            throw new BizException(IdentityErrorCode.INVALID_CREDENTIALS);
        }
```

**不改的部分**：`ACCOUNT_DISABLED`（403）和 `ACCOUNT_LOCKED`（423）这两个分支继续保持独立的错误码，不合并进 `INVALID_CREDENTIALS`——这是本次明确的范围决定（见"范围"一节），账号禁用/锁定这两种场景客服支持需要能区分，接受"能推断出该用户名存在"这个较小的信息泄露换取更好的运维体验。

## 六、SERVICES_WITH_MIGRATIONS 反向守卫

当前 `platform-bootstrap` 的 `MultiServiceFlywayConfig`：

```java
    private static final String[] SERVICES_WITH_MIGRATIONS = {"user", "identity", "message", "storage"};

    @Override
    public void afterPropertiesSet() {
        for (String service : SERVICES_WITH_MIGRATIONS) {
            // ... 对每个列出的服务跑 Flyway，且已经防了"列了但没脚本"（fail-fast）
        }
    }
```

现在补上反向检查：**有脚本但没列进数组**——用 Spring 的 `PathMatchingResourcePatternResolver` 扫描 classpath 下所有 `db/migration/*/` 子目录，取出目录名，比对 `SERVICES_WITH_MIGRATIONS`，发现有目录但不在数组里就 fail-fast。

```java
package com.aikoboot.platform.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import javax.sql.DataSource;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class MultiServiceFlywayConfig implements InitializingBean {

    private static final String[] SERVICES_WITH_MIGRATIONS = {"user", "identity", "message", "storage"};

    private final DataSource dataSource;

    public MultiServiceFlywayConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void afterPropertiesSet() throws IOException {
        checkForUnlistedMigrationDirectories();

        for (String service : SERVICES_WITH_MIGRATIONS) {
            // ...（已有的 Flyway 单服务迁移逻辑，原样保留，不改）
        }
    }

    /**
     * 反向守卫：SERVICES_WITH_MIGRATIONS 只防了"列了但目录/脚本不存在"（已有的
     * fail-fast），没防"目录/脚本存在但忘了列进数组"——后者会导致这个服务的表
     * 永远不会在合并部署下被创建，且不会有任何启动期报错，直到真正调用相关接口
     * 才会暴露（这正是 identity 那次真实踩过的坑的镜像版本）。这里用 classpath
     * 扫描找出所有 db/migration/&lt;service&gt;/ 子目录，比对数组，发现有目录但没
     * 列入就在启动期直接失败。
     */
    private void checkForUnlistedMigrationDirectories() throws IOException {
        Set<String> listedServices = new HashSet<>(Arrays.asList(SERVICES_WITH_MIGRATIONS));
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath*:db/migration/*/");

        for (Resource resource : resources) {
            String uri = resource.getURI().toString();
            // uri 形如 .../db/migration/identity/ 或 jar 包内的等价路径，
            // 取最后一段非空目录名即为服务名
            String normalized = uri.endsWith("/") ? uri.substring(0, uri.length() - 1) : uri;
            String serviceName = normalized.substring(normalized.lastIndexOf('/') + 1);
            if (!listedServices.contains(serviceName)) {
                throw new IllegalStateException(
                        "Found migrations at classpath:db/migration/" + serviceName
                                + " but '" + serviceName + "' is not listed in SERVICES_WITH_MIGRATIONS"
                                + " -- its tables would silently never be created in merged deployment");
            }
        }
    }
}
```

**实现时需要验证**：`PathMatchingResourcePatternResolver.getResources("classpath*:db/migration/*/")` 这个通配符写法在 Spring 当前版本下，对着"多个 jar 包各自在 `db/migration/<service>/` 下有一个 `.sql` 文件"这种场景（`platform-bootstrap` 合并部署下，`db/migration` 目录本身分散在 4 个不同的 `-biz` jar 里，不是同一个 jar），能不能正确枚举出全部 4 个子目录——这是这个方案里唯一有实现风险的地方，需要在 Cursor 里写完之后**用 `platform-bootstrap` 真实启动一次验证**（比如临时打印 `resources` 数组内容确认确实扫到了 4 个：`user`/`identity`/`message`/`storage`），不能只凭代码编译通过就认为它工作正常。如果这个通配符方式在 uber-jar/合并 classpath 场景下表现不如预期（常见的坑是 `classpath*:` 前缀在某些打包方式下枚举不全），退一步的方案是 `resolver.getResources("classpath*:db/migration/**")` 拿到所有文件（不只是目录）再从文件路径里解析出服务名段，这个方式对目录本身是否被独立列为一个"resource"不敏感，更稳妥——如果第一种方式验证失败，切换到这个备选方案。

## 验收标准

- [ ] `mvn -f backend/pom.xml package -DskipTests` 全量构建成功
- [ ] 单元测试：`CredentialServiceImpl`/`RoleServiceImpl`/`PermissionServiceImpl` 各自的正常路径 + 关键异常路径（重复创建、找不到资源、旧密码错误）都有覆盖，参照 `IdentityServiceImplTest`/`MessageServiceImplTest` 的既有风格（纯 Mockito，不启 Spring 上下文）
- [ ] `login` 的时序加固：单元测试验证"用户不存在"和"密码错误"两条路径都会调用 `passwordEncoder.matches`（用 Mockito `verify` 断言调用次数，不是真的测耗时——真实耗时差异属于集成/性能测试范畴，不在这个验收标准里）
- [ ] **真实起服务跑通完整 RBAC 链路**（standalone 或 merged 部署任一种即可，不需要重复跑两种）：
  1. `POST /api/identity/roles` 建一个角色，`POST /api/identity/permissions` 建一个权限
  2. `POST /api/identity/roles/{roleId}/permissions/{permissionId}` 把权限分配给角色
  3. 用 `POST /api/users` 建一个测试用户，`POST /api/identity/credentials` 给这个用户建凭证
  4. `POST /api/identity/users/{userId}/roles/{roleId}` 把角色分配给这个用户
  5. `POST /api/auth/login` 登录，确认 `LoginResponse.roles`/`permissions` 里能看到刚分配的角色编码/权限编码
  6. `GET /api/auth/current` 确认同样能看到
- [ ] 用 `PUT /api/users/{id}` 把 `status` 改成 `0`，用该用户登录，确认返回 403 `ACCOUNT_DISABLED`
- [ ] `POST /api/auth/logout` 后再调 `GET /api/auth/current`，确认返回 401 `未登录`
- [ ] 连续 5 次用错误密码登录同一账号，确认第 5 次触发 423 `ACCOUNT_LOCKED`（不需要真的等待 15 分钟验证过期重置）
- [ ] `platform-bootstrap` 真实启动，确认 `MultiServiceFlywayConfig` 的反向守卫扫描到全部 4 个服务的迁移目录且不误报（临时改动验证：故意把某个服务名从数组里删掉，确认启动失败并报出清晰的错误信息，验证完后改回来）
