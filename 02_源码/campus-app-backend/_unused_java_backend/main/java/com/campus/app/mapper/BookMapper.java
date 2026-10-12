package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.Book;
import org.apache.ibatis.annotations.Mapper;

/**
 * 图书Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface BookMapper extends BaseMapper<Book> {
}
