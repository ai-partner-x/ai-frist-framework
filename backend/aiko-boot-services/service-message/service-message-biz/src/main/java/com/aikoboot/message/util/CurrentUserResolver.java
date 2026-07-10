package com.aikoboot.message.util;

import com.aikoboot.core.context.CurrentUserContext;
import com.aikoboot.core.exception.BizException;
import com.aikoboot.message.exception.MessageErrorCode;

/**
 * CurrentUserContext.getUserId() 未登录时默认返回字符串 "system"，不是数字——
 * 站内信这类必须按"当前用户"限定的接口如果直接 Long.valueOf() 会在未登录场景下
 * 抛 NumberFormatException，被 GlobalExceptionHandler 的兜底逻辑吞成一个语义不明的
 * 500。这里统一转换成明确的 401 未登录。
 */
public final class CurrentUserResolver {

    private CurrentUserResolver() {
    }

    public static Long requireUserId() {
        try {
            return Long.valueOf(CurrentUserContext.getUserId());
        } catch (NumberFormatException e) {
            throw new BizException(MessageErrorCode.NOT_LOGIN);
        }
    }
}
