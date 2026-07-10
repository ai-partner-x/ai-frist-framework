package com.aikoboot.message.channel;

import java.util.Map;

public interface SmsProvider {

    void send(String phone, String providerTemplateId, Map<String, String> params, String signName);
}
