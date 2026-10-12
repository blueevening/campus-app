package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.User;
import com.campus.app.mapper.UserMapper;
import com.campus.app.service.UserService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户服务实现类
 *
 * @author CampusApp
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public Result<Map<String, Object>> login(String studentId, String password) {
        // 参数校验
        if (!StringUtils.hasText(studentId) || !StringUtils.hasText(password)) {
            return Result.error("学号和密码不能为空");
        }

        // 查询用户
        User user = findByStudentId(studentId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 验证密码
        String encryptedPassword = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!encryptedPassword.equals(user.getPassword())) {
            return Result.error("密码错误");
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            return Result.error("账号已被禁用");
        }

        // 生成Token
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());

        // 返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("studentId", user.getStudentId());
        result.put("role", user.getRole());
        result.put("avatar", user.getAvatar());

        return Result.success("登录成功", result);
    }

    @Override
    public Result<User> register(User user) {
        // 参数校验
        if (!StringUtils.hasText(user.getStudentId()) || !StringUtils.hasText(user.getPassword())) {
            return Result.error("学号和密码不能为空");
        }

        // 检查学号是否已存在
        User existingUser = findByStudentId(user.getStudentId());
        if (existingUser != null) {
            return Result.error("该学号已被注册");
        }

        // 加密密码
        String encryptedPassword = DigestUtils.md5DigestAsHex(user.getPassword().getBytes());
        user.setPassword(encryptedPassword);

        // 设置默认值
        if (user.getRole() == null) {
            user.setRole(0); // 默认为学生
        }
        if (user.getStatus() == null) {
            user.setStatus(1); // 默认启用
        }
        if (user.getGender() == null) {
            user.setGender(0); // 默认未知
        }

        // 保存用户
        boolean success = save(user);
        if (success) {
            user.setPassword(null); // 不返回密码
            return Result.success("注册成功", user);
        }
        return Result.error("注册失败");
    }

    @Override
    public User findByStudentId(String studentId) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getStudentId, studentId);
        wrapper.eq(User::getDeleted, 0);
        return getOne(wrapper);
    }

    @Override
    public Result<Void> changePassword(Long userId, String oldPassword, String newPassword) {
        // 参数校验
        if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
            return Result.error("密码不能为空");
        }

        // 查询用户
        User user = getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 验证旧密码
        String encryptedOldPassword = DigestUtils.md5DigestAsHex(oldPassword.getBytes());
        if (!encryptedOldPassword.equals(user.getPassword())) {
            return Result.error("原密码错误");
        }

        // 更新密码
        String encryptedNewPassword = DigestUtils.md5DigestAsHex(newPassword.getBytes());
        user.setPassword(encryptedNewPassword);
        boolean success = updateById(user);

        if (success) {
            return Result.success("密码修改成功");
        }
        return Result.error("密码修改失败");
    }

    @Override
    public Result<User> updateUserInfo(User user) {
        // 查询原用户信息
        User existingUser = getById(user.getId());
        if (existingUser == null) {
            return Result.error("用户不存在");
        }

        // 更新允许修改的字段
        if (StringUtils.hasText(user.getUsername())) {
            existingUser.setUsername(user.getUsername());
        }
        if (StringUtils.hasText(user.getPhone())) {
            existingUser.setPhone(user.getPhone());
        }
        if (StringUtils.hasText(user.getEmail())) {
            existingUser.setEmail(user.getEmail());
        }
        if (StringUtils.hasText(user.getAvatar())) {
            existingUser.setAvatar(user.getAvatar());
        }
        if (user.getGender() != null) {
            existingUser.setGender(user.getGender());
        }

        boolean success = updateById(existingUser);
        if (success) {
            existingUser.setPassword(null);
            return Result.success("更新成功", existingUser);
        }
        return Result.error("更新失败");
    }
}
