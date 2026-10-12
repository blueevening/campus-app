package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 第二课堂参与记录实体类
 *
 * @author CampusApp
 */
@Data
@TableName("second_class_record")
public class SecondClassRecord {

    /**
     * 记录ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户姓名
     */
    @TableField(exist = false)
    private String username;

    /**
     * 学号
     */
    @TableField(exist = false)
    private String studentId;

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 活动名称
     */
    @TableField(exist = false)
    private String activityName;

    /**
     * 获得积分
     */
    private Integer score;

    /**
     * 状态：0-已报名 1-已签到 2-已完成 3-已取消
     */
    private Integer status;

    /**
     * 签到时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime checkInTime;

    /**
     * 完成时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completeTime;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
