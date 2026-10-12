package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.News;
import com.campus.app.mapper.NewsMapper;
import com.campus.app.service.NewsService;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 校园资讯服务实现类
 *
 * @author CampusApp
 */
@Service
public class NewsServiceImpl extends ServiceImpl<NewsMapper, News> implements NewsService {

    @Override
    public PageResult<News> pageNews(Integer pageNum, Integer pageSize, Integer category) {
        Page<News> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();

        if (category != null) {
            wrapper.eq(News::getCategory, category);
        }

        wrapper.eq(News::getStatus, 1);
        wrapper.eq(News::getDeleted, 0);
        wrapper.orderByDesc(News::getPublishTime);

        Page<News> result = page(page, wrapper);

        return new PageResult<>(
            result.getTotal(),
            result.getRecords(),
            result.getCurrent(),
            result.getSize()
        );
    }

    @Override
    public Result<News> getNewsDetail(Long id) {
        News news = getById(id);
        if (news == null || news.getDeleted() == 1) {
            return Result.error("资讯不存在");
        }

        // 增加浏览量
        news.setViewCount(news.getViewCount() + 1);
        updateById(news);

        return Result.success(news);
    }

    @Override
    public Result<News> publishNews(News news) {
        // 设置默认值
        if (news.getStatus() == null) {
            news.setStatus(1);
        }
        if (news.getViewCount() == null) {
            news.setViewCount(0);
        }
        news.setPublishTime(LocalDateTime.now());

        boolean success = save(news);
        if (success) {
            return Result.success("发布成功", news);
        }
        return Result.error("发布失败");
    }

    @Override
    public Result<News> updateNews(News news) {
        News existingNews = getById(news.getId());
        if (existingNews == null) {
            return Result.error("资讯不存在");
        }

        // 更新允许修改的字段
        if (StringUtils.hasText(news.getTitle())) {
            existingNews.setTitle(news.getTitle());
        }
        if (StringUtils.hasText(news.getContent())) {
            existingNews.setContent(news.getContent());
        }
        if (StringUtils.hasText(news.getSummary())) {
            existingNews.setSummary(news.getSummary());
        }
        if (news.getCategory() != null) {
            existingNews.setCategory(news.getCategory());
        }

        boolean success = updateById(existingNews);
        if (success) {
            return Result.success("更新成功", existingNews);
        }
        return Result.error("更新失败");
    }

    @Override
    public Result<Void> deleteNews(Long id) {
        News news = getById(id);
        if (news == null) {
            return Result.error("资讯不存在");
        }

        // 逻辑删除
        news.setDeleted(1);
        boolean success = updateById(news);

        if (success) {
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }
}
