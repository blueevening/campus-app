package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.News;
import org.apache.ibatis.annotations.Mapper;

/**
 * 校园资讯Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface NewsMapper extends BaseMapper<News> {
}
