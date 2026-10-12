package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 失物招领实体类
 *
 * @author CampusApp
 */
@Data
@TableName("lost_and_found")
public class LostAndFound {

    /**
     * ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 标题
     */
    private String title;

    /**
     * 描述
     */
    private String description;

    /**
     * 类型：1-失物 2-拾获
     */
    private Integer type;

    /**
     * 分类：1-证件 2-电子设备 3-书籍 4-衣物 5-其他
     */
    private Integer category;

    /**
     * 图片（多个用逗号分隔）
     */
    private String images;

    /**
     * 地点
     */
    private String location;

    /**
     * 联系方式
     */
    private String contact;

    /**
     * 发布者ID
     */
    private Long userId;

    /**
     * 发布者姓名
     */
    @TableField(exist = false)
    private String username;

    /**
     * 状态：0-待处理 1-已认领 2-已关闭
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
