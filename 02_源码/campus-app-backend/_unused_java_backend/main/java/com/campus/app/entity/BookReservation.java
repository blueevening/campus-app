package com.campus.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 图书预约/借阅实体类
 *
 * @author CampusApp
 */
@Data
@TableName("book_reservation")
public class BookReservation {

    /**
     * 预约ID
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
     * 图书ID
     */
    private Long bookId;

    /**
     * 图书名称
     */
    @TableField(exist = false)
    private String bookName;

    /**
     * 借阅日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime borrowDate;

    /**
     * 应还日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueDate;

    /**
     * 实际归还日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime returnDate;

    /**
     * 状态：0-已预约 1-借阅中 2-已归还 3-已逾期
     */
    private Integer status;

    /**
     * 续借次数
     */
    private Integer renewCount;

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
