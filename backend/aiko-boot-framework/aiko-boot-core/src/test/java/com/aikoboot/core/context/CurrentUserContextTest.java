package com.aikoboot.core.context;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CurrentUserContextTest {

    @AfterEach
    void cleanup() {
        CurrentUserContext.clear();
    }

    @Test
    void getUserId_whenNeverSet_returnsSystem() {
        assertThat(CurrentUserContext.getUserId()).isEqualTo("system");
    }

    @Test
    void getUserId_afterSet_returnsTheSetValue() {
        CurrentUserContext.setUserId("user-42");

        assertThat(CurrentUserContext.getUserId()).isEqualTo("user-42");
    }

    @Test
    void clear_resetsToSystem() {
        CurrentUserContext.setUserId("user-42");

        CurrentUserContext.clear();

        assertThat(CurrentUserContext.getUserId()).isEqualTo("system");
    }
}
