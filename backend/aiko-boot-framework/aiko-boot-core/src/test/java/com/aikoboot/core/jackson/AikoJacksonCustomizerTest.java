package com.aikoboot.core.jackson;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDateTime;
import java.util.TimeZone;

import static org.assertj.core.api.Assertions.assertThat;

class AikoJacksonCustomizerTest {

    @Test
    void customize_setsShanghaiTimezone() {
        Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.json();

        new AikoJacksonCustomizer().customize(builder);

        ObjectMapper mapper = builder.build();
        assertThat(mapper.getSerializationConfig().getTimeZone())
                .isEqualTo(TimeZone.getTimeZone("Asia/Shanghai"));
    }

    @Test
    void customize_formatsLocalDateTimeAsYyyyMmDdHhMmSs() throws Exception {
        Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.json();

        new AikoJacksonCustomizer().customize(builder);

        ObjectMapper mapper = builder.build();
        String json = mapper.writeValueAsString(LocalDateTime.of(2026, 7, 10, 15, 30, 0));

        assertThat(json).isEqualTo("\"2026-07-10 15:30:00\"");
    }
}
