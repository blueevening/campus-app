package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.User;
import com.campus.app.utils.Result;

import java.util.Map;

/**
 * 用户服务接口
 *
 * @author CampusApp
 */
public interface UserService extends IService<User> {

    /**
     * 用户登录
     */
    Result<Map<String, Object>> login(String studentId, String password);

    /**
     * 用户注册
     */
    Result<User> register(User user);

    /**
     * 根据学号查询用户
     */
    User findByStudentId(String studentId);

    /**
     * 修改密码
     */
    Result<Void> changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 更新用户信息
     */
    Result<User> updateUserInfo(User user);
}
