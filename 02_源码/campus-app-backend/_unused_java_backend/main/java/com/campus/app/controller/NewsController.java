package com.campus.app.controller;

import com.campus.app.entity.News;
import com.campus.app.service.NewsService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 校园资讯控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/news")
@Api(tags = "校园资讯")
@CrossOrigin
public class NewsController {

    @Autowired
    private NewsService newsService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 分页查询资讯
     */
    @GetMapping("/list")
    @ApiOperation("查询资讯列表")
    public Result<PageResult<News>> getNewsList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer category) {
        PageResult<News> result = newsService.pageNews(pageNum, pageSize, category);
        return Result.success(result);
    }

    /**
     * 获取资讯详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取资讯详情")
    public Result<News> getNewsDetail(@PathVariable Long id) {
        return newsService.getNewsDetail(id);
    }

    /**
     * 发布资讯（管理员）
     */
    @PostMapping("/publish")
    @ApiOperation("发布资讯")
    public Result<News> publishNews(@RequestHeader("Authorization") String token,
                                    @RequestBody News news) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        Integer role = jwtUtils.getRole(token.replace("Bearer ", ""));

        if (userId == null) {
            return Result.unauthorized();
        }
        if (role == null || role < 1) {
            return Result.forbidden();
        }

        news.setPublisherId(userId);
        return newsService.publishNews(news);
    }

    /**
     * 更新资讯（管理员）
     */
    @PutMapping("/{id}")
    @ApiOperation("更新资讯")
    public Result<News> updateNews(@RequestHeader("Authorization") String token,
                                   @PathVariable Long id,
                                   @RequestBody News news) {
        Integer role = jwtUtils.getRole(token.replace("Bearer ", ""));
        if (role == null || role < 1) {
            return Result.forbidden();
        }

        news.setId(id);
        return newsService.updateNews(news);
    }

    /**
     * 删除资讯（管理员）
     */
    @DeleteMapping("/{id}")
    @ApiOperation("删除资讯")
    public Result<Void> deleteNews(@RequestHeader("Authorization") String token,
                                   @PathVariable Long id) {
        Integer role = jwtUtils.getRole(token.replace("Bearer ", ""));
        if (role == null || role < 1) {
            return Result.forbidden();
        }

        return newsService.deleteNews(id);
    }
}
