package com.aikoboot.message.api;

import com.aikoboot.message.api.dto.InboxMessageDTO;
import com.aikoboot.message.api.dto.SendEmailRequest;
import com.aikoboot.message.api.dto.SendInAppRequest;
import com.aikoboot.message.api.dto.SendPushRequest;
import com.aikoboot.message.api.dto.SendSmsRequest;

import java.util.List;

public interface MessageApi {

    void sendSms(SendSmsRequest request);

    void sendEmail(SendEmailRequest request);

    void sendInApp(SendInAppRequest request);

    void sendPush(SendPushRequest request);

    List<InboxMessageDTO> listInbox(Long userId, boolean unreadOnly);

    void markInboxRead(Long messageId);
}
