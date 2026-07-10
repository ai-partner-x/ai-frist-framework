package com.aikoboot.message.service;

import cn.jiguang.sdk.api.PushApi;
import cn.jiguang.sdk.bean.push.PushSendParam;
import cn.jiguang.sdk.bean.push.audience.Audience;
import cn.jiguang.sdk.bean.push.message.notification.NotificationMessage;
import cn.jiguang.sdk.enums.platform.Platform;
import com.aikoboot.core.context.CurrentUserContext;
import com.aikoboot.core.exception.BizException;
import com.aikoboot.message.api.MessageApi;
import com.aikoboot.message.api.dto.InboxMessageDTO;
import com.aikoboot.message.api.dto.SendEmailRequest;
import com.aikoboot.message.api.dto.SendInAppRequest;
import com.aikoboot.message.api.dto.SendPushRequest;
import com.aikoboot.message.api.dto.SendSmsRequest;
import com.aikoboot.message.channel.SmsProvider;
import com.aikoboot.message.entity.InboxMessage;
import com.aikoboot.message.exception.MessageErrorCode;
import com.aikoboot.message.entity.MessageLog;
import com.aikoboot.message.entity.SmsTemplate;
import com.aikoboot.message.mapper.InboxMessageMapper;
import com.aikoboot.message.mapper.MessageLogMapper;
import com.aikoboot.message.mapper.SmsTemplateMapper;
import com.aikoboot.message.util.CurrentUserResolver;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageApi {

    private final SmsTemplateMapper smsTemplateMapper;
    private final MessageLogMapper messageLogMapper;
    private final InboxMessageMapper inboxMessageMapper;
    private final SmsProvider smsProvider;
    private final JavaMailSender mailSender;
    private final PushApi pushApi;

    public MessageServiceImpl(SmsTemplateMapper smsTemplateMapper, MessageLogMapper messageLogMapper,
                               InboxMessageMapper inboxMessageMapper, SmsProvider smsProvider,
                               JavaMailSender mailSender, PushApi pushApi) {
        this.smsTemplateMapper = smsTemplateMapper;
        this.messageLogMapper = messageLogMapper;
        this.inboxMessageMapper = inboxMessageMapper;
        this.smsProvider = smsProvider;
        this.mailSender = mailSender;
        this.pushApi = pushApi;
    }

    @Override
    public void sendSms(SendSmsRequest request) {
        String status = "SUCCESS";
        String errorMessage = null;
        try {
            SmsTemplate template = smsTemplateMapper.selectOne(
                    new QueryWrapper<SmsTemplate>().eq("template_code", request.getTemplateCode()));
            if (template == null) {
                throw new BizException(MessageErrorCode.SMS_TEMPLATE_NOT_FOUND);
            }
            smsProvider.send(request.getPhone(), template.getProviderTemplateId(), request.getParams(), template.getSignName());
        } catch (Exception e) {
            status = "FAILED";
            errorMessage = e.getMessage();
        }
        writeLog("SMS", request.getPhone(), null, request.getTemplateCode(), status, errorMessage);
    }

    @Override
    public void sendEmail(SendEmailRequest request) {
        String status = "SUCCESS";
        String errorMessage = null;
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(request.getContent(), request.isHtml());
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            status = "FAILED";
            errorMessage = e.getMessage();
        }
        writeLog("EMAIL", request.getTo(), request.getSubject(), request.getContent(), status, errorMessage);
    }

    @Override
    public void sendInApp(SendInAppRequest request) {
        String status = "SUCCESS";
        String errorMessage = null;
        try {
            InboxMessage message = new InboxMessage();
            message.setUserId(request.getUserId());
            message.setTitle(request.getTitle());
            message.setContent(request.getContent());
            message.setReadStatus(0);
            inboxMessageMapper.insert(message);
        } catch (Exception e) {
            status = "FAILED";
            errorMessage = e.getMessage();
        }
        writeLog("IN_APP", String.valueOf(request.getUserId()), request.getTitle(), request.getContent(), status, errorMessage);
    }

    @Override
    public void sendPush(SendPushRequest request) {
        String status = "SUCCESS";
        String errorMessage = null;
        try {
            NotificationMessage notification = new NotificationMessage();
            notification.setAlert(request.getContent());

            Audience audience = new Audience();
            audience.setAliasList(List.of(String.valueOf(request.getUserId())));

            PushSendParam param = new PushSendParam();
            param.setNotification(notification);
            param.setAudience(audience);
            param.setPlatform(List.of(Platform.android, Platform.ios));

            pushApi.send(param);
        } catch (Exception e) {
            status = "FAILED";
            errorMessage = e.getMessage();
        }
        writeLog("PUSH", String.valueOf(request.getUserId()), request.getTitle(), request.getContent(), status, errorMessage);
    }

    @Override
    public List<InboxMessageDTO> listInbox(Long userId, boolean unreadOnly) {
        QueryWrapper<InboxMessage> wrapper = new QueryWrapper<InboxMessage>().eq("user_id", userId);
        if (unreadOnly) {
            wrapper.eq("read_status", 0);
        }
        wrapper.orderByDesc("created_at");
        return inboxMessageMapper.selectList(wrapper).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void markInboxRead(Long messageId) {
        // 只按 id 限定的话，任何登录用户都能标记别人的站内信为已读（水平越权）——
        // 这里额外限定 user_id = 当前登录用户，非本人的消息这条 UPDATE 会匹配 0 行，
        // 静默无效果，不对外暴露"这条消息是否存在/属于别人"的信息。
        inboxMessageMapper.update(null, new UpdateWrapper<InboxMessage>()
                .set("read_status", 1)
                .set("read_at", LocalDateTime.now())
                .set("updated_at", LocalDateTime.now())
                .set("updated_by", CurrentUserContext.getUserId())
                .eq("id", messageId)
                .eq("user_id", CurrentUserResolver.requireUserId()));
    }

    private void writeLog(String channel, String target, String subject, String content, String status, String errorMessage) {
        MessageLog log = new MessageLog();
        log.setChannel(channel);
        log.setTarget(target);
        log.setSubject(subject);
        log.setContent(content);
        log.setStatus(status);
        log.setErrorMessage(errorMessage);
        log.setSentAt(LocalDateTime.now());
        messageLogMapper.insert(log);
    }

    private InboxMessageDTO toDto(InboxMessage entity) {
        InboxMessageDTO dto = new InboxMessageDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setReadStatus(entity.getReadStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
