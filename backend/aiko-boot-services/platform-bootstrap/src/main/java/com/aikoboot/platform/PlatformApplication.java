package com.aikoboot.platform;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 合并部署壳：扫描 com.aikoboot 下全部 biz 模块的组件，单进程启动。
 * 各服务的配置必须挂在自己的命名空间前缀下（合并部署规约，见 spec 必答清单第 2 条）。
 *
 * @MapperScan 用和 scanBasePackages 一样宽的 "com.aikoboot"——MyBatis 的 Mapper 接口
 * 不会被普通 Spring 组件扫描自动发现，必须显式 @MapperScan。这里故意扫描整个
 * com.aikoboot 而不是逐个服务列举包名，这样以后新服务加入 platform-bootstrap 时
 * 不需要回来改这个文件（各服务自己的独立部署 *ServiceApplication 里仍然各自
 * 只扫描自己的 mapper 包，因为那边的 classpath 上本来就只有一个服务的代码）。
 *
 * markerInterface = BaseMapper.class 是必需的：不加的话 @MapperScan 会把扫描到的
 * com.aikoboot 包下*所有*接口（包括 UserApi 这类普通业务接口）都当成 MyBatis
 * Mapper 注册成代理 Bean，导致 UserServiceImpl 注入到的其实是指向 UserApi 的
 * MyBatis 代理而不是真正的 UserMapper，运行时报
 * "Invalid bound statement (not found): com.aikoboot.user.api.UserApi.list"。
 * 加上 markerInterface 后只有真正 extends BaseMapper 的接口才会被注册，
 * 和逐服务列包名同样安全，但不需要跟着新服务的加入维护包名列表。
 */
@SpringBootApplication(scanBasePackages = "com.aikoboot")
@MapperScan(value = "com.aikoboot", markerInterface = BaseMapper.class)
public class PlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformApplication.class, args);
    }
}
