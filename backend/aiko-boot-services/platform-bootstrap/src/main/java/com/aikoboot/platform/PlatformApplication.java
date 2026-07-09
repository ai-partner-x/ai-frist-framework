package com.aikoboot.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 合并部署壳：扫描 com.aikoboot 下全部 biz 模块的组件，单进程启动。
 * 各服务的配置必须挂在自己的命名空间前缀下（合并部署规约，见 spec 必答清单第 2 条）。
 */
@SpringBootApplication(scanBasePackages = "com.aikoboot")
public class PlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformApplication.class, args);
    }
}
