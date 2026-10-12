package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.Book;
import com.campus.app.entity.BookReservation;
import com.campus.app.mapper.BookMapper;
import com.campus.app.mapper.BookReservationMapper;
import com.campus.app.service.BookService;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 图书服务实现类
 *
 * @author CampusApp
 */
@Service
public class BookServiceImpl extends ServiceImpl<BookMapper, Book> implements BookService {

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private BookReservationMapper bookReservationMapper;

    @Override
    public PageResult<Book> pageBooks(Integer pageNum, Integer pageSize, String keyword, String category) {
        Page<Book> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Book> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w
                .like(Book::getBookName, keyword)
                .or()
                .like(Book::getAuthor, keyword)
                .or()
                .like(Book::getIsbn, keyword)
            );
        }

        if (StringUtils.hasText(category)) {
            wrapper.eq(Book::getCategory, category);
        }

        wrapper.eq(Book::getStatus, 1);
        wrapper.orderByDesc(Book::getCreateTime);

        Page<Book> result = bookMapper.selectPage(page, wrapper);

        return new PageResult<>(
            result.getTotal(),
            result.getRecords(),
            result.getCurrent(),
            result.getSize()
        );
    }

    @Override
    @Transactional
    public Result<Void> borrowBook(Long userId, Long bookId) {
        // 查询图书信息
        Book book = getById(bookId);
        if (book == null) {
            return Result.error("图书不存在");
        }

        // 检查图书是否可借
        if (book.getAvailableCopies() <= 0) {
            return Result.error("图书已被借完");
        }

        // 检查用户借阅数量
        LambdaQueryWrapper<BookReservation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BookReservation::getUserId, userId);
        wrapper.eq(BookReservation::getStatus, 1);
        long count = bookReservationMapper.selectCount(wrapper);
        if (count >= 5) {
            return Result.error("借阅数量已达上限（最多5本）");
        }

        // 创建借阅记录
        BookReservation reservation = new BookReservation();
        reservation.setUserId(userId);
        reservation.setBookId(bookId);
        reservation.setBorrowDate(LocalDateTime.now());
        reservation.setDueDate(LocalDateTime.now().plusDays(30));
        reservation.setStatus(1);
        reservation.setRenewCount(0);
        bookReservationMapper.insert(reservation);

        // 更新图书库存
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        updateById(book);

        return Result.success("借阅成功");
    }

    @Override
    @Transactional
    public Result<Void> returnBook(Long userId, Long reservationId) {
        // 查询借阅记录
        BookReservation reservation = bookReservationMapper.selectById(reservationId);
        if (reservation == null) {
            return Result.error("借阅记录不存在");
        }

        if (!reservation.getUserId().equals(userId)) {
            return Result.error("无权操作此借阅记录");
        }

        if (reservation.getStatus() != 1) {
            return Result.error("该书已归还");
        }

        // 更新借阅记录
        reservation.setReturnDate(LocalDateTime.now());
        reservation.setStatus(2);
        bookReservationMapper.updateById(reservation);

        // 更新图书库存
        Book book = getById(reservation.getBookId());
        if (book != null) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            updateById(book);
        }

        return Result.success("归还成功");
    }

    @Override
    public List<BookReservation> getUserReservations(Long userId) {
        return bookReservationMapper.selectUserReservations(userId);
    }

    @Override
    public Result<Void> renewBook(Long userId, Long reservationId) {
        // 查询借阅记录
        BookReservation reservation = bookReservationMapper.selectById(reservationId);
        if (reservation == null) {
            return Result.error("借阅记录不存在");
        }

        if (!reservation.getUserId().equals(userId)) {
            return Result.error("无权操作此借阅记录");
        }

        if (reservation.getStatus() != 1) {
            return Result.error("该书已归还，无法续借");
        }

        if (reservation.getRenewCount() >= 2) {
            return Result.error("续借次数已达上限（最多2次）");
        }

        // 更新借阅记录
        reservation.setDueDate(reservation.getDueDate().plusDays(15));
        reservation.setRenewCount(reservation.getRenewCount() + 1);
        bookReservationMapper.updateById(reservation);

        return Result.success("续借成功");
    }
}
