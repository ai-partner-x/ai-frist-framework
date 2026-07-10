package com.aikoboot.message.service;

import cn.jiguang.sdk.api.PushApi;
import com.aikoboot.core.context.CurrentUserContext;
import com.aikoboot.message.api.dto.SendEmailRequest;
import com.aikoboot.message.api.dto.SendInAppRequest;
import com.aikoboot.message.api.dto.SendPushRequest;
import com.aikoboot.message.api.dto.SendSmsRequest;
import com.aikoboot.message.channel.SmsProvider;
import com.aikoboot.message.entity.InboxMessage;
import com.aikoboot.message.entity.MessageLog;
import com.aikoboot.message.entity.SmsTemplate;
import com.aikoboot.message.mapper.InboxMessageMapper;
import com.aikoboot.message.mapper.MessageLogMapper;
import com.aikoboot.message.mapper.SmsTemplateMapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MessageServiceImplTest {

    private SmsTemplateMapper smsTemplateMapper;
    private MessageLogMapper messageLogMapper;
    private InboxMessageMapper inboxMessageMapper;
    private SmsProvider smsProvider;
    private JavaMailSender mailSender;
    private PushApi pushApi;
    private MessageServiceImpl service;

    @BeforeEach
    void setUp() {
        smsTemplateMapper = mock(SmsTemplateMapper.class);
        messageLogMapper = mock(MessageLogMapper.class);
        inboxMessageMapper = mock(InboxMessageMapper.class);
        smsProvider = mock(SmsProvider.class);
        mailSender = mock(JavaMailSender.class);
        pushApi = mock(PushApi.class);
        service = new MessageServiceImpl(smsTemplateMapper, messageLogMapper, inboxMessageMapper,
                smsProvider, mailSender, pushApi);
    }

    @Test
    void sendSms_whenTemplateMissing_logsFailureWithoutThrowing() {
        when(smsTemplateMapper.selectOne(any())).thenReturn(null);

        SendSmsRequest request = new SendSmsRequest();
        request.setPhone("13800000000");
        request.setTemplateCode("not_exist");
        request.setParams(Map.of("code", "1234"));

        // 关键断言：模板不存在这种失败场景，不应该抛异常给调用方
        service.sendSms(request);

        verify(messageLogMapper, times(1)).insert(argThat((MessageLog log) ->
                "SMS".equals(log.getChannel()) && "FAILED".equals(log.getStatus())
                        && "短信模板不存在".equals(log.getErrorMessage())));
    }

    @Test
    void sendSms_whenTemplateFound_callsProviderAndLogsSuccess() {
        SmsTemplate template = new SmsTemplate();
        template.setProviderTemplateId("SMS_123");
        template.setSignName("测试签名");
        when(smsTemplateMapper.selectOne(any())).thenReturn(template);

        SendSmsRequest request = new SendSmsRequest();
        request.setPhone("13800000000");
        request.setTemplateCode("verify_code");
        request.setParams(Map.of("code", "1234"));

        service.sendSms(request);

        verify(smsProvider, times(1)).send("13800000000", "SMS_123", Map.of("code", "1234"), "测试签名");
        verify(messageLogMapper, times(1)).insert(argThat((MessageLog log) -> "SUCCESS".equals(log.getStatus())));
    }

    @Test
    void sendSms_whenProviderThrows_logsFailureWithoutThrowing() {
        SmsTemplate template = new SmsTemplate();
        template.setProviderTemplateId("SMS_123");
        template.setSignName("测试签名");
        when(smsTemplateMapper.selectOne(any())).thenReturn(template);
        doThrow(new RuntimeException("网关超时")).when(smsProvider).send(any(), any(), any(), any());

        SendSmsRequest request = new SendSmsRequest();
        request.setPhone("13800000000");
        request.setTemplateCode("verify_code");

        // 关键断言：供应商调用失败不应该向上抛异常
        service.sendSms(request);

        verify(messageLogMapper, times(1)).insert(argThat((MessageLog log) ->
                "FAILED".equals(log.getStatus()) && "网关超时".equals(log.getErrorMessage())));
    }

    @Test
    void sendEmail_whenMailSenderThrows_logsFailureWithoutThrowing() {
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("SMTP 连接失败"));

        SendEmailRequest request = new SendEmailRequest();
        request.setTo("a@test.com");
        request.setSubject("subject");
        request.setContent("content");

        service.sendEmail(request);

        verify(messageLogMapper, times(1)).insert(argThat((MessageLog log) ->
                "EMAIL".equals(log.getChannel()) && "FAILED".equals(log.getStatus())));
    }

    @Test
    void sendInApp_insertsInboxRowAndLogsSuccess() {
        SendInAppRequest request = new SendInAppRequest();
        request.setUserId(1L);
        request.setTitle("标题");
        request.setContent("内容");

        service.sendInApp(request);

        verify(inboxMessageMapper, times(1)).insert(argThat((InboxMessage m) ->
                m.getUserId().equals(1L) && m.getReadStatus() == 0));
        verify(messageLogMapper, times(1)).insert(argThat((MessageLog log) -> "SUCCESS".equals(log.getStatus())));
    }

    @Test
    void sendPush_whenPushApiThrows_logsFailureWithoutThrowing() {
        when(pushApi.send(any())).thenThrow(new RuntimeException("极光服务不可用"));

        SendPushRequest request = new SendPushRequest();
        request.setUserId(1L);
        request.setTitle("标题");
        request.setContent("内容");

        service.sendPush(request);

        verify(messageLogMapper, times(1)).insert(argThat((MessageLog log) ->
                "PUSH".equals(log.getChannel()) && "FAILED".equals(log.getStatus())));
    }

    @Test
    void markInboxRead_updatesViaUpdateWrapper_notUpdateById() {
        CurrentUserContext.setUserId("42");
        try {
            service.markInboxRead(100L);

            // 关键断言：用 UpdateWrapper 精确指定列，不是 updateById(entity) 整体覆盖
            verify(inboxMessageMapper, times(1)).update(isNull(), any());
        } finally {
            CurrentUserContext.clear();
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    void markInboxRead_scopesUpdateToCurrentUser_preventsHorizontalIdor() {
        // 回归测试：修复前只按 id 限定，任何登录用户都能标记别人的站内信为已读
        // （水平越权）。修复后 UpdateWrapper 的 WHERE 条件里必须同时带上 user_id。
        CurrentUserContext.setUserId("42");
        try {
            service.markInboxRead(100L);

            ArgumentCaptor<UpdateWrapper<InboxMessage>> captor = ArgumentCaptor.forClass(UpdateWrapper.class);
            verify(inboxMessageMapper, times(1)).update(isNull(), captor.capture());

            assertThat(captor.getValue().getSqlSegment()).contains("user_id");
        } finally {
            CurrentUserContext.clear();
        }
    }
}
