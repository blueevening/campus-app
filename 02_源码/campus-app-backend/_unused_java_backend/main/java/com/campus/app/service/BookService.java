package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.Book;
import com.campus.app.entity.BookReservation;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;

import java.util.List;

/**
 * 图书服务接口
 *
 * @author CampusApp
 */
public interface BookService extends IService<Book> {

    /**
     * 分页查询图书
     */
    PageResult<Book> pageBooks(Integer pageNum, Integer pageSize, String keyword, String category);

    /**
     * 借阅图书
     */
    Result<Void> borrowBook(Long userId, Long bookId);

    /**
     * 归还图书
     */
    Result<Void> returnBook(Long userId, Long reservationId);

    /**
     * 查询用户借阅记录
     */
    List<BookReservation> getUserReservations(Long userId);

    /**
     * 续借图书
     */
    Result<Void> renewBook(Long userId, Long reservationId);
}
