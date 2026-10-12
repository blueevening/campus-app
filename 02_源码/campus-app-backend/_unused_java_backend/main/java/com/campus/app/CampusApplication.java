package com.campus.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 校园综合服务App启动类
 *
 * @author CampusApp
 */
@SpringBootApplication
@MapperScan("com.campus.app.mapper")
public class CampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusApplication.class, args);
        System.out.println("============================================");
        System.out.println("   校园综合服务App后端启动成功！");
        System.out.println("   访问地址: http://localhost:8080");
        System.out.println("============================================");
    }
}
