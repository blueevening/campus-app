package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 第二课堂活动实体类
 *
 * @author CampusApp
 */
@Data
@TableName("second_class")
public class SecondClass {

    /**
     * 活动ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 活动名称
     */
    @NotBlank(message = "活动名称不能为空")
    private String activityName;

    /**
     * 活动描述
     */
    private String description;

    /**
     * 活动类型：1-志愿服务 2-社会实践 3-文体活动 4-创新创业 5-技能培训 6-讲座报告
     */
    @NotNull(message = "活动类型不能为空")
    private Integer activityType;

    /**
     * 活动地点
     */
    private String location;

    /**
     * 开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;

    /**
     * 积分
     */
    @NotNull(message = "积分不能为空")
    private Integer score;

    /**
     * 最大参与人数
     */
    private Integer maxParticipants;

    /**
     * 当前参与人数
     */
    private Integer currentParticipants;

    /**
     * 发布者ID（管理员）
     */
    private Long publisherId;

    /**
     * 发布者姓名
     */
    @TableField(exist = false)
    private String publisherName;

    /**
     * 活动图片
     */
    private String coverImage;

    /**
     * 状态：0-未开始 1-进行中 2-已结束 3-已取消
     */
    private Integer status;

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

    /**
     * 逻辑删除
     */
    @TableLogic
    private Integer deleted;
}
