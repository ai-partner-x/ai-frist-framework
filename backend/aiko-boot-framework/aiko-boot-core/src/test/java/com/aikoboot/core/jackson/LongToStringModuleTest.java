package com.aikoboot.core.jackson;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LongToStringModuleTest {

    private static class SampleWithLongId {
        public Long id = 2075261484678266881L; // beyond 2^53, the exact class of value this module exists to protect
    }

    @Test
    void longField_isSerializedAsQuotedJsonString() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new LongToStringModule());

        String json = mapper.writeValueAsString(new SampleWithLongId());

        assertThat(json).isEqualTo("{\"id\":\"2075261484678266881\"}");
    }

    @Test
    void withoutTheModule_longFieldWouldSerializeAsBareNumber() throws Exception {
        // Control case: proves the module is doing something, not just coincidentally passing.
        ObjectMapper mapper = new ObjectMapper();

        String json = mapper.writeValueAsString(new SampleWithLongId());

        assertThat(json).isEqualTo("{\"id\":2075261484678266881}");
    }
}
