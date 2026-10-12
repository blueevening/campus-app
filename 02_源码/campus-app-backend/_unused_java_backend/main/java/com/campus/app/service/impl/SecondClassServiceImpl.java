package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.SecondClass;
import com.campus.app.entity.SecondClassRecord;
import com.campus.app.entity.UserCredit;
import com.campus.app.mapper.SecondClassMapper;
import com.campus.app.mapper.SecondClassRecordMapper;
import com.campus.app.mapper.UserCreditMapper;
import com.campus.app.service.SecondClassService;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 第二课堂服务实现类
 *
 * @author CampusApp
 */
@Service
public class SecondClassServiceImpl extends ServiceImpl<SecondClassMapper, SecondClass> implements SecondClassService {

    @Autowired
    private SecondClassMapper secondClassMapper;

    @Autowired
    private SecondClassRecordMapper recordMapper;

    @Autowired
    private UserCreditMapper userCreditMapper;

    @Override
    public PageResult<SecondClass> pageActivities(Integer pageNum, Integer pageSize, Integer activityType, Integer status) {
        Page<SecondClass> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SecondClass> wrapper = new LambdaQueryWrapper<>();

        if (activityType != null) {
            wrapper.eq(SecondClass::getActivityType, activityType);
        }
        if (status != null) {
            wrapper.eq(SecondClass::getStatus, status);
        }

        wrapper.eq(SecondClass::getDeleted, 0);
        wrapper.orderByDesc(SecondClass::getCreateTime);

        Page<SecondClass> result = secondClassMapper.selectPage(page, wrapper);

        return new PageResult<>(
            result.getTotal(),
            result.getRecords(),
            result.getCurrent(),
            result.getSize()
        );
    }

    @Override
    public Result<SecondClass> publishActivity(SecondClass activity) {
        // 设置默认值
        if (activity.getCurrentParticipants() == null) {
            activity.setCurrentParticipants(0);
        }
        if (activity.getStatus() == null) {
            activity.setStatus(0);
        }

        boolean success = save(activity);
        if (success) {
            return Result.success("发布成功", activity);
        }
        return Result.error("发布失败");
    }

    @Override
    @Transactional
    public Result<Void> joinActivity(Long userId, Long activityId) {
        // 查询活动
        SecondClass activity = getById(activityId);
        if (activity == null) {
            return Result.error("活动不存在");
        }

        // 检查活动状态
        if (activity.getStatus() != 0 && activity.getStatus() != 1) {
            return Result.error("活动已结束或已取消");
        }

        // 检查是否已报名
        LambdaQueryWrapper<SecondClassRecord> checkWrapper = new LambdaQueryWrapper<>();
        checkWrapper.eq(SecondClassRecord::getUserId, userId);
        checkWrapper.eq(SecondClassRecord::getActivityId, activityId);
        Long count = recordMapper.selectCount(checkWrapper);
        if (count > 0) {
            return Result.error("已报名该活动");
        }

        // 检查人数限制
        if (activity.getMaxParticipants() != null &&
            activity.getCurrentParticipants() >= activity.getMaxParticipants()) {
            return Result.error("活动人数已满");
        }

        // 检查诚信值
        LambdaQueryWrapper<UserCredit> creditWrapper = new LambdaQueryWrapper<>();
        creditWrapper.eq(UserCredit::getUserId, userId);
        UserCredit userCredit = userCreditMapper.selectOne(creditWrapper);

        if (userCredit != null && userCredit.getIntegrityScore() < 80) {
            return Result.error("诚信值不足80，请先恢复诚信值");
        }

        // 创建参与记录
        SecondClassRecord record = new SecondClassRecord();
        record.setUserId(userId);
        record.setActivityId(activityId);
        record.setScore(activity.getScore());
        record.setStatus(0); // 已报名
        recordMapper.insert(record);

        // 更新参与人数
        activity.setCurrentParticipants(activity.getCurrentParticipants() + 1);
        updateById(activity);

        return Result.success("报名成功");
    }

    @Override
    public Result<Void> checkIn(Long userId, Long activityId) {
        LambdaQueryWrapper<SecondClassRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SecondClassRecord::getUserId, userId);
        wrapper.eq(SecondClassRecord::getActivityId, activityId);
        SecondClassRecord record = recordMapper.selectOne(wrapper);

        if (record == null) {
            return Result.error("未报名该活动");
        }

        if (record.getStatus() != 0) {
            return Result.error("已签到或已完成");
        }

        record.setStatus(1); // 已签到
        record.setCheckInTime(LocalDateTime.now());
        recordMapper.updateById(record);

        return Result.success("签到成功");
    }

    @Override
    @Transactional
    public Result<Void> completeActivity(Long activityId) {
        // 查询活动
        SecondClass activity = getById(activityId);
        if (activity == null) {
            return Result.error("活动不存在");
        }

        // 更新活动状态
        activity.setStatus(2); // 已结束
        updateById(activity);

        // 为所有已签到的参与者发放积分
        LambdaQueryWrapper<SecondClassRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SecondClassRecord::getActivityId, activityId);
        wrapper.eq(SecondClassRecord::getStatus, 1); // 已签到
        List<SecondClassRecord> records = recordMapper.selectList(wrapper);

        for (SecondClassRecord record : records) {
            record.setStatus(2); // 已完成
            record.setCompleteTime(LocalDateTime.now());
            recordMapper.updateById(record);

            // 更新用户积分
            LambdaQueryWrapper<UserCredit> creditWrapper = new LambdaQueryWrapper<>();
            creditWrapper.eq(UserCredit::getUserId, record.getUserId());
            UserCredit userCredit = userCreditMapper.selectOne(creditWrapper);

            if (userCredit == null) {
                userCredit = new UserCredit();
                userCredit.setUserId(record.getUserId());
                userCredit.setSecondClassScore(record.getScore());
                userCredit.setIntegrityScore(100); // 默认诚信值
                userCreditMapper.insert(userCredit);
            } else {
                userCredit.setSecondClassScore(
                    userCredit.getSecondClassScore() + record.getScore()
                );
                userCreditMapper.updateById(userCredit);
            }
        }

        return Result.success("活动已完成，积分已发放");
    }

    @Override
    public List<SecondClassRecord> getUserRecords(Long userId) {
        LambdaQueryWrapper<SecondClassRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SecondClassRecord::getUserId, userId);
        wrapper.orderByDesc(SecondClassRecord::getCreateTime);
        return recordMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> getUserCredit(Long userId) {
        LambdaQueryWrapper<UserCredit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCredit::getUserId, userId);
        UserCredit userCredit = userCreditMapper.selectOne(wrapper);

        Map<String, Object> result = new HashMap<>();
        if (userCredit == null) {
            result.put("secondClassScore", 0);
            result.put("integrityScore", 100);
            result.put("reachedTarget", false);
        } else {
            result.put("secondClassScore", userCredit.getSecondClassScore());
            result.put("integrityScore", userCredit.getIntegrityScore());
            result.put("reachedTarget", userCredit.getSecondClassScore() >= 120);
        }
        result.put("targetScore", 120);

        return result;
    }

    @Override
    @Transactional
    public Result<Void> restoreIntegrity(Long userId) {
        LambdaQueryWrapper<UserCredit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCredit::getUserId, userId);
        UserCredit userCredit = userCreditMapper.selectOne(wrapper);

        if (userCredit == null) {
            return Result.error("用户积分信息不存在");
        }

        if (userCredit.getIntegrityScore() >= 100) {
            return Result.error("诚信值已满，无需恢复");
        }

        // 恢复1分
        userCredit.setIntegrityScore(userCredit.getIntegrityScore() + 1);
        userCreditMapper.updateById(userCredit);

        return Result.success("诚信值恢复成功，当前诚信值：" + userCredit.getIntegrityScore());
    }
}
