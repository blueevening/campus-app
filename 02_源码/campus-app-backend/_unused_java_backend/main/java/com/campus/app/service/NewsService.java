package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.News;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;

/**
 * 校园资讯服务接口
 *
 * @author CampusApp
 */
public interface NewsService extends IService<News> {

    /**
     * 分页查询资讯
     */
    PageResult<News> pageNews(Integer pageNum, Integer pageSize, Integer category);

    /**
     * 获取资讯详情
     */
    Result<News> getNewsDetail(Long id);

    /**
     * 发布资讯
     */
    Result<News> publishNews(News news);

    /**
     * 更新资讯
     */
    Result<News> updateNews(News news);

    /**
     * 删除资讯
     */
    Result<Void> deleteNews(Long id);
}
