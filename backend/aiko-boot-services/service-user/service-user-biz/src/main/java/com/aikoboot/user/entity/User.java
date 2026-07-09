package com.aikoboot.user.entity;

import com.aikoboot.orm.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("sys_user")
public class User extends BaseEntity {

    private String username;
    private String email;
    private String phone;
    private Integer status;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
