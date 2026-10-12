package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.LostAndFound;
import org.apache.ibatis.annotations.Mapper;

/**
 * 失物招领Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface LostAndFoundMapper extends BaseMapper<LostAndFound> {
}
