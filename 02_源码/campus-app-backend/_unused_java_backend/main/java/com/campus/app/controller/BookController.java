package com.campus.app.controller;

import com.campus.app.entity.Book;
import com.campus.app.entity.BookReservation;
import com.campus.app.service.BookService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 图书控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/book")
@Api(tags = "图书管理")
@CrossOrigin
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 分页查询图书
     */
    @GetMapping("/list")
    @ApiOperation("查询图书列表")
    public Result<PageResult<Book>> getBookList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        PageResult<Book> result = bookService.pageBooks(pageNum, pageSize, keyword, category);
        return Result.success(result);
    }

    /**
     * 获取图书详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取图书详情")
    public Result<Book> getBookDetail(@PathVariable Long id) {
        Book book = bookService.getById(id);
        if (book != null) {
            return Result.success(book);
        }
        return Result.error("图书不存在");
    }

    /**
     * 借阅图书
     */
    @PostMapping("/borrow/{bookId}")
    @ApiOperation("借阅图书")
    public Result<Void> borrowBook(@RequestHeader("Authorization") String token,
                                   @PathVariable Long bookId) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return bookService.borrowBook(userId, bookId);
    }

    /**
     * 归还图书
     */
    @PostMapping("/return/{reservationId}")
    @ApiOperation("归还图书")
    public Result<Void> returnBook(@RequestHeader("Authorization") String token,
                                   @PathVariable Long reservationId) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return bookService.returnBook(userId, reservationId);
    }

    /**
     * 续借图书
     */
    @PostMapping("/renew/{reservationId}")
    @ApiOperation("续借图书")
    public Result<Void> renewBook(@RequestHeader("Authorization") String token,
                                  @PathVariable Long reservationId) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return bookService.renewBook(userId, reservationId);
    }

    /**
     * 查询用户借阅记录
     */
    @GetMapping("/borrow-records")
    @ApiOperation("查询借阅记录")
    public Result<List<BookReservation>> getBorrowRecords(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        List<BookReservation> records = bookService.getUserReservations(userId);
        return Result.success(records);
    }
}
