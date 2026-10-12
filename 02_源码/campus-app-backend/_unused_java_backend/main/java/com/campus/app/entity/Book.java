package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 图书实体类
 *
 * @author CampusApp
 */
@Data
@TableName("book")
public class Book {

    /**
     * 图书ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 书名
     */
    private String bookName;

    /**
     * 作者
     */
    private String author;

    /**
     * ISBN
     */
    private String isbn;

    /**
     * 出版社
     */
    private String publisher;

    /**
     * 出版日期
     */
    private String publishDate;

    /**
     * 分类
     */
    private String category;

    /**
     * 封面图片
     */
    private String cover;

    /**
     * 简介
     */
    private String description;

    /**
     * 馆藏数量
     */
    private Integer totalCopies;

    /**
     * 可借数量
     */
    private Integer availableCopies;

    /**
     * 位置
     */
    private String location;

    /**
     * 状态：0-不可借 1-可借
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
