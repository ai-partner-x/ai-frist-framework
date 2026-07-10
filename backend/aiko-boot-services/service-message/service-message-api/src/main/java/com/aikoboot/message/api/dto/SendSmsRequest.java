package com.aikoboot.message.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

public class SendSmsRequest {

    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "模板编码不能为空")
    private String templateCode;

    private Map<String, String> params;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }

    public Map<String, String> getParams() {
        return params;
    }

    public void setParams(Map<String, String> params) {
        this.params = params;
    }
}
