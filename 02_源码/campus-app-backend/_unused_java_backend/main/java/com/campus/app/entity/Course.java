package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 课程实体类
 *
 * @author CampusApp
 */
@Data
@TableName("course")
public class Course {

    /**
     * 课程ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 课程名称
     */
    private String courseName;

    /**
     * 课程编号
     */
    private String courseCode;

    /**
     * 教师姓名
     */
    private String teacherName;

    /**
     * 教师ID
     */
    private Long teacherId;

    /**
     * 学分
     */
    private Integer credit;

    /**
     * 上课地点
     */
    private String location;

    /**
     * 上课时间（JSON格式存储）
     * 例如：[{"day":1,"start":1,"end":2},{"day":3,"start":3,"end":4}]
     */
    private String classTime;

    /**
     * 学期
     */
    private String semester;

    /**
     * 课程描述
     */
    private String description;

    /**
     * 最大选课人数
     */
    private Integer maxStudents;

    /**
     * 已选人数
     */
    private Integer currentStudents;

    /**
     * 状态：0-未开始 1-进行中 2-已结束
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
}
