package com.campus.app.controller;

import com.campus.app.entity.User;
import com.campus.app.service.UserService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

/**
 * 用户控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/user")
@Api(tags = "用户管理")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @ApiOperation("用户登录")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String studentId = params.get("studentId");
        String password = params.get("password");
        return userService.login(studentId, password);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @ApiOperation("用户注册")
    public Result<User> register(@Valid @RequestBody User user) {
        return userService.register(user);
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/info")
    @ApiOperation("获取用户信息")
    public Result<User> getUserInfo(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        User user = userService.getById(userId);
        if (user != null) {
            user.setPassword(null);
            return Result.success(user);
        }
        return Result.error("用户不存在");
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/update")
    @ApiOperation("更新用户信息")
    public Result<User> updateUserInfo(@RequestHeader("Authorization") String token,
                                       @RequestBody User user) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        user.setId(userId);
        return userService.updateUserInfo(user);
    }

    /**
     * 修改密码
     */
    @PostMapping("/change-password")
    @ApiOperation("修改密码")
    public Result<Void> changePassword(@RequestHeader("Authorization") String token,
                                       @RequestBody Map<String, String> params) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        String oldPassword = params.get("oldPassword");
        String newPassword = params.get("newPassword");
        return userService.changePassword(userId, oldPassword, newPassword);
    }
}
