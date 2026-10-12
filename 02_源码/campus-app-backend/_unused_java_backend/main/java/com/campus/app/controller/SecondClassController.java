package com.campus.app.controller;

import com.campus.app.entity.SecondClass;
import com.campus.app.entity.SecondClassRecord;
import com.campus.app.service.SecondClassService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 第二课堂控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/second-class")
@Api(tags = "第二课堂")
@CrossOrigin
public class SecondClassController {

    @Autowired
    private SecondClassService secondClassService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 查询活动列表
     */
    @GetMapping("/list")
    @ApiOperation("查询活动列表")
    public Result<PageResult<SecondClass>> getActivityList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer activityType,
            @RequestParam(required = false) Integer status) {
        PageResult<SecondClass> result = secondClassService.pageActivities(pageNum, pageSize, activityType, status);
        return Result.success(result);
    }

    /**
     * 获取活动详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取活动详情")
    public Result<SecondClass> getActivityDetail(@PathVariable Long id) {
        SecondClass activity = secondClassService.getById(id);
        if (activity != null) {
            return Result.success(activity);
        }
        return Result.error("活动不存在");
    }

    /**
     * 发布活动（管理员）
     */
    @PostMapping("/publish")
    @ApiOperation("发布活动")
    public Result<SecondClass> publishActivity(@RequestHeader("Authorization") String token,
                                                @RequestBody SecondClass activity) {
        Integer role = jwtUtils.getRole(token.replace("Bearer ", ""));
        if (role == null || role < 1) {
            return Result.error("无权限发布活动");
        }

        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        activity.setPublisherId(userId);
        return secondClassService.publishActivity(activity);
    }

    /**
     * 报名活动
     */
    @PostMapping("/join/{activityId}")
    @ApiOperation("报名活动")
    public Result<Void> joinActivity(@RequestHeader("Authorization") String token,
                                      @PathVariable Long activityId) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return secondClassService.joinActivity(userId, activityId);
    }

    /**
     * 签到
     */
    @PostMapping("/check-in/{activityId}")
    @ApiOperation("签到")
    public Result<Void> checkIn(@RequestHeader("Authorization") String token,
                                 @PathVariable Long activityId) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return secondClassService.checkIn(userId, activityId);
    }

    /**
     * 完成活动（管理员）
     */
    @PostMapping("/complete/{activityId}")
    @ApiOperation("完成活动")
    public Result<Void> completeActivity(@RequestHeader("Authorization") String token,
                                          @PathVariable Long activityId) {
        Integer role = jwtUtils.getRole(token.replace("Bearer ", ""));
        if (role == null || role < 1) {
            return Result.error("无权限操作");
        }
        return secondClassService.completeActivity(activityId);
    }

    /**
     * 查询用户参与记录
     */
    @GetMapping("/records")
    @ApiOperation("查询用户参与记录")
    public Result<List<SecondClassRecord>> getUserRecords(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        List<SecondClassRecord> records = secondClassService.getUserRecords(userId);
        return Result.success(records);
    }

    /**
     * 查询用户积分和诚信值
     */
    @GetMapping("/credit")
    @ApiOperation("查询用户积分")
    public Result<Map<String, Object>> getUserCredit(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        Map<String, Object> credit = secondClassService.getUserCredit(userId);
        return Result.success(credit);
    }

    /**
     * 恢复诚信值
     */
    @PostMapping("/restore-integrity")
    @ApiOperation("恢复诚信值")
    public Result<Void> restoreIntegrity(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return secondClassService.restoreIntegrity(userId);
    }
}
