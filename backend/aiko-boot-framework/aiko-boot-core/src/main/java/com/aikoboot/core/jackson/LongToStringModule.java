package com.aikoboot.core.jackson;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

/**
 * 雪花 ID（BaseEntity.id，见 Task 3）是 Long，超过 2^53 时前端 JS 处理会丢精度。
 * 全局把 Long/long 序列化成字符串，避免这个问题。
 */
public class LongToStringModule extends SimpleModule {

    public LongToStringModule() {
        super("LongToStringModule");
        addSerializer(Long.class, ToStringSerializer.instance);
        addSerializer(Long.TYPE, ToStringSerializer.instance);
    }
}
