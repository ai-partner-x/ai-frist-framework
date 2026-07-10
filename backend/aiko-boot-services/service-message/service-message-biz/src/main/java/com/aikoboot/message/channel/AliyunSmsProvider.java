package com.aikoboot.message.channel;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.teaopenapi.models.Config;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 阿里云短信通道实现，只有配置 aiko.message.sms.provider=aliyun 时才会被创建。
 * SDK 坐标是新版 com.aliyun:dysmsapi20170525（Tea 框架风格的 OpenAPI 客户端），
 * 不是旧版 com.aliyuncs:aliyun-java-sdk-dysmsapi，两者构造方式完全不同，不要混用。
 */
@Component
@ConditionalOnProperty(prefix = "aiko.message.sms", name = "provider", havingValue = "aliyun")
public class AliyunSmsProvider implements SmsProvider {

    private final Client client;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AliyunSmsProvider(@Value("${aiko.message.sms.aliyun.access-key-id}") String accessKeyId,
                              @Value("${aiko.message.sms.aliyun.access-key-secret}") String accessKeySecret) throws Exception {
        Config config = new Config()
                .setAccessKeyId(accessKeyId)
                .setAccessKeySecret(accessKeySecret);
        config.endpoint = "dysmsapi.aliyuncs.com";
        this.client = new Client(config);
    }

    @Override
    public void send(String phone, String providerTemplateId, Map<String, String> params, String signName) {
        try {
            SendSmsRequest request = new SendSmsRequest()
                    .setPhoneNumbers(phone)
                    .setSignName(signName)
                    .setTemplateCode(providerTemplateId)
                    .setTemplateParam(objectMapper.writeValueAsString(params));
            client.sendSms(request);
        } catch (Exception e) {
            throw new RuntimeException("阿里云短信发送失败: " + e.getMessage(), e);
        }
    }
}
