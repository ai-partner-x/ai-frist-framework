package com.aikoboot.message.entity;

import com.aikoboot.orm.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("msg_sms_template")
public class SmsTemplate extends BaseEntity {

    private String templateCode;
    private String provider;
    private String providerTemplateId;
    private String signName;

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderTemplateId() {
        return providerTemplateId;
    }

    public void setProviderTemplateId(String providerTemplateId) {
        this.providerTemplateId = providerTemplateId;
    }

    public String getSignName() {
        return signName;
    }

    public void setSignName(String signName) {
        this.signName = signName;
    }
}
