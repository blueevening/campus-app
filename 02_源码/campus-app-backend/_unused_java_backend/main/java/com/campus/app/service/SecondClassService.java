package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.SecondClass;
import com.campus.app.entity.SecondClassRecord;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;

import java.util.List;
import java.util.Map;

/**
 * 第二课堂服务接口
 *
 * @author CampusApp
 */
public interface SecondClassService extends IService<SecondClass> {

    /**
     * 分页查询活动
     */
    PageResult<SecondClass> pageActivities(Integer pageNum, Integer pageSize, Integer activityType, Integer status);

    /**
     * 发布活动（管理员）
     */
    Result<SecondClass> publishActivity(SecondClass activity);

    /**
     * 报名活动
     */
    Result<Void> joinActivity(Long userId, Long activityId);

    /**
     * 签到
     */
    Result<Void> checkIn(Long userId, Long activityId);

    /**
     * 完成活动并发放积分
     */
    Result<Void> completeActivity(Long activityId);

    /**
     * 查询用户参与记录
     */
    List<SecondClassRecord> getUserRecords(Long userId);

    /**
     * 查询用户积分和诚信值
     */
    Map<String, Object> getUserCredit(Long userId);

    /**
     * 恢复诚信值（阅读/参加指定项目）
     */
    Result<Void> restoreIntegrity(Long userId);
}
