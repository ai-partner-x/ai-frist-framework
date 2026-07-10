package com.aikoboot.message.channel;

import com.tencentcloudapi.common.Credential;
import com.tencentcloudapi.common.exception.TencentCloudSDKException;
import com.tencentcloudapi.common.profile.ClientProfile;
import com.tencentcloudapi.common.profile.HttpProfile;
import com.tencentcloudapi.sms.v20210111.SmsClient;
import com.tencentcloudapi.sms.v20210111.models.SendSmsRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 腾讯云短信通道实现，只有配置 aiko.message.sms.provider=tencent 时才会被创建。
 * region 硬编码成 ap-guangzhou（腾讯云短信服务在国内的标准区域，不是每个业务方
 * 都需要跨区域切换，YAGNI——真需要跨区域时再加配置项）。
 */
@Component
@ConditionalOnProperty(prefix = "aiko.message.sms", name = "provider", havingValue = "tencent")
public class TencentSmsProvider implements SmsProvider {

    private final SmsClient smsClient;
    private final String sdkAppId;

    public TencentSmsProvider(@Value("${aiko.message.sms.tencent.secret-id}") String secretId,
                               @Value("${aiko.message.sms.tencent.secret-key}") String secretKey,
                               @Value("${aiko.message.sms.tencent.sdk-app-id}") String sdkAppId) {
        Credential credential = new Credential(secretId, secretKey);
        HttpProfile httpProfile = new HttpProfile();
        httpProfile.setEndpoint("sms.tencentcloudapi.com");
        ClientProfile clientProfile = new ClientProfile();
        clientProfile.setHttpProfile(httpProfile);
        this.smsClient = new SmsClient(credential, "ap-guangzhou", clientProfile);
        this.sdkAppId = sdkAppId;
    }

    @Override
    public void send(String phone, String providerTemplateId, Map<String, String> params, String signName) {
        try {
            SendSmsRequest request = new SendSmsRequest();
            request.setSmsSdkAppId(sdkAppId);
            request.setPhoneNumberSet(new String[]{phone});
            request.setSignName(signName);
            request.setTemplateId(providerTemplateId);
            request.setTemplateParamSet(params.values().toArray(new String[0]));
            smsClient.SendSms(request);
        } catch (TencentCloudSDKException e) {
            throw new RuntimeException("腾讯云短信发送失败: " + e.getMessage(), e);
        }
    }
}
