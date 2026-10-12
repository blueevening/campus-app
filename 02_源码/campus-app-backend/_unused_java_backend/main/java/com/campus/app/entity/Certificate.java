package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 证书申请实体类
 *
 * @author CampusApp
 */
@Data
@TableName("certificate")
public class Certificate {

    /**
     * 证书ID
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
     * 证书名称
     */
    private String certificateName;

    /**
     * 证书等级：1-国家级 2-省级 3-市级 4-校级 5-院级
     */
    private Integer level;

    /**
     * 证书等级名称
     */
    @TableField(exist = false)
    private String levelName;

    /**
     * 积分
     */
    private Integer score;

    /**
     * 证书类型：1-学科竞赛 2-科技创新 3-文体活动 4-社会实践 5-志愿服务 6-其他
     */
    private Integer certificateType;

    /**
     * 颁发机构
     */
    private String issuer;

    /**
     * 获得时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime obtainDate;

    /**
     * 证书图片
     */
    private String certificateImage;

    /**
     * 审核状态：0-待审核 1-已通过 2-已拒绝
     */
    private Integer status;

    /**
     * 审核备注
     */
    private String remark;

    /**
     * 审核人ID
     */
    private Long reviewerId;

    /**
     * 审核时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reviewTime;

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
