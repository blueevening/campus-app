package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.LostAndFound;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;

/**
 * 失物招领服务接口
 *
 * @author CampusApp
 */
public interface LostAndFoundService extends IService<LostAndFound> {

    /**
     * 分页查询失物招领
     */
    PageResult<LostAndFound> pageLostAndFound(Integer pageNum, Integer pageSize, Integer type, Integer category);

    /**
     * 发布失物招领
     */
    Result<LostAndFound> publish(LostAndFound lostAndFound);

    /**
     * 更新状态
     */
    Result<Void> updateStatus(Long id, Integer status);

    /**
     * 删除信息
     */
    Result<Void> deleteInfo(Long id);
}
