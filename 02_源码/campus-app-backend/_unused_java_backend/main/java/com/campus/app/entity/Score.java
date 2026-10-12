package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 成绩实体类
 *
 * @author CampusApp
 */
@Data
@TableName("score")
public class Score {

    /**
     * 成绩ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 学生ID
     */
    private Long studentId;

    /**
     * 学生姓名
     */
    @TableField(exist = false)
    private String studentName;

    /**
     * 学号
     */
    @TableField(exist = false)
    private String studentNo;

    /**
     * 课程ID
     */
    private Long courseId;

    /**
     * 课程名称
     */
    @TableField(exist = false)
    private String courseName;

    /**
     * 平时成绩
     */
    private BigDecimal dailyScore;

    /**
     * 期中成绩
     */
    private BigDecimal midtermScore;

    /**
     * 期末成绩
     */
    private BigDecimal finalScore;

    /**
     * 总评成绩
     */
    private BigDecimal totalScore;

    /**
     * 绩点
     */
    private BigDecimal gpa;

    /**
     * 学期
     */
    private String semester;

    /**
     * 状态：0-未录入 1-已录入 2-已确认
     */
    private Integer status;

    /**
     * 录入时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime recordTime;

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
