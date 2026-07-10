package com.aikoboot.message.util;

import com.aikoboot.core.context.CurrentUserContext;
import com.aikoboot.core.exception.BizException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CurrentUserResolverTest {

    @AfterEach
    void tearDown() {
        CurrentUserContext.clear();
    }

    @Test
    void requireUserId_whenNumericUserSet_returnsParsedLong() {
        CurrentUserContext.setUserId("42");

        assertThat(CurrentUserResolver.requireUserId()).isEqualTo(42L);
    }

    @Test
    void requireUserId_whenNotLoggedIn_throwsNotLoginBizException() {
        // CurrentUserContext 未设置时默认返回 "system"，不是数字——修复前这里会让
        // NumberFormatException 直接抛出去，被 GlobalExceptionHandler 兜底成语义不明的 500。
        assertThatThrownBy(CurrentUserResolver::requireUserId)
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(401);
    }
}
