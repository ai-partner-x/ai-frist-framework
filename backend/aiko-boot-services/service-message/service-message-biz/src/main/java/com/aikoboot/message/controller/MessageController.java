package com.aikoboot.message.controller;

import com.aikoboot.message.api.MessageApi;
import com.aikoboot.message.api.dto.InboxMessageDTO;
import com.aikoboot.message.api.dto.SendEmailRequest;
import com.aikoboot.message.api.dto.SendInAppRequest;
import com.aikoboot.message.api.dto.SendPushRequest;
import com.aikoboot.message.api.dto.SendSmsRequest;
import com.aikoboot.core.context.CurrentUserContext;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageApi messageApi;

    public MessageController(MessageApi messageApi) {
        this.messageApi = messageApi;
    }

    @PostMapping("/sms")
    public void sendSms(@Valid @RequestBody SendSmsRequest request) {
        messageApi.sendSms(request);
    }

    @PostMapping("/email")
    public void sendEmail(@Valid @RequestBody SendEmailRequest request) {
        messageApi.sendEmail(request);
    }

    @PostMapping("/push")
    public void sendPush(@Valid @RequestBody SendPushRequest request) {
        messageApi.sendPush(request);
    }

    @PostMapping("/inbox")
    public void sendInApp(@Valid @RequestBody SendInAppRequest request) {
        messageApi.sendInApp(request);
    }

    @GetMapping("/inbox")
    public List<InboxMessageDTO> listInbox(@RequestParam(defaultValue = "false") boolean unreadOnly) {
        Long userId = Long.valueOf(CurrentUserContext.getUserId());
        return messageApi.listInbox(userId, unreadOnly);
    }

    @PutMapping("/inbox/{id}/read")
    public void markInboxRead(@PathVariable Long id) {
        messageApi.markInboxRead(id);
    }
}
