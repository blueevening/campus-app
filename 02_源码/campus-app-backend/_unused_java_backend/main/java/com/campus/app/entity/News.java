package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 校园资讯实体类
 *
 * @author CampusApp
 */
@Data
@TableName("news")
public class News {

    /**
     * 资讯ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 摘要
     */
    private String summary;

    /**
     * 封面图片
     */
    private String coverImage;

    /**
     * 分类：1-校园新闻 2-学术讲座 3-社团活动 4-通知公告
     */
    private Integer category;

    /**
     * 作者/来源
     */
    private String source;

    /**
     * 发布者ID
     */
    private Long publisherId;

    /**
     * 浏览量
     */
    private Integer viewCount;

    /**
     * 状态：0-草稿 1-已发布 2-已下架
     */
    private Integer status;

    /**
     * 发布时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishTime;

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
