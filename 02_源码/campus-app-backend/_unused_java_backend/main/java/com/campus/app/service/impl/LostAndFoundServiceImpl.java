package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.LostAndFound;
import com.campus.app.mapper.LostAndFoundMapper;
import com.campus.app.service.LostAndFoundService;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import org.springframework.stereotype.Service;

/**
 * 失物招领服务实现类
 *
 * @author CampusApp
 */
@Service
public class LostAndFoundServiceImpl extends ServiceImpl<LostAndFoundMapper, LostAndFound> implements LostAndFoundService {

    @Override
    public PageResult<LostAndFound> pageLostAndFound(Integer pageNum, Integer pageSize, Integer type, Integer category) {
        Page<LostAndFound> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<LostAndFound> wrapper = new LambdaQueryWrapper<>();

        if (type != null) {
            wrapper.eq(LostAndFound::getType, type);
        }

        if (category != null) {
            wrapper.eq(LostAndFound::getCategory, category);
        }

        wrapper.eq(LostAndFound::getDeleted, 0);
        wrapper.orderByDesc(LostAndFound::getCreateTime);

        Page<LostAndFound> result = page(page, wrapper);

        return new PageResult<>(
            result.getTotal(),
            result.getRecords(),
            result.getCurrent(),
            result.getSize()
        );
    }

    @Override
    public Result<LostAndFound> publish(LostAndFound lostAndFound) {
        // 设置默认值
        if (lostAndFound.getStatus() == null) {
            lostAndFound.setStatus(0);
        }

        boolean success = save(lostAndFound);
        if (success) {
            return Result.success("发布成功", lostAndFound);
        }
        return Result.error("发布失败");
    }

    @Override
    public Result<Void> updateStatus(Long id, Integer status) {
        LostAndFound info = getById(id);
        if (info == null) {
            return Result.error("信息不存在");
        }

        info.setStatus(status);
        boolean success = updateById(info);

        if (success) {
            return Result.success("状态更新成功");
        }
        return Result.error("状态更新失败");
    }

    @Override
    public Result<Void> deleteInfo(Long id) {
        LostAndFound info = getById(id);
        if (info == null) {
            return Result.error("信息不存在");
        }

        // 逻辑删除
        info.setDeleted(1);
        boolean success = updateById(info);

        if (success) {
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }
}
