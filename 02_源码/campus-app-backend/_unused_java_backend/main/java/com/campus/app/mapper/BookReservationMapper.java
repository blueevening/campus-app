package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.BookReservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 图书预约Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface BookReservationMapper extends BaseMapper<BookReservation> {

    /**
     * 查询用户借阅记录（包含图书信息）
     */
    @Select("SELECT br.*, b.book_name, b.author, b.isbn FROM book_reservation br " +
            "INNER JOIN book b ON br.book_id = b.id " +
            "WHERE br.user_id = #{userId} ORDER BY br.create_time DESC")
    List<BookReservation> selectUserReservations(@Param("userId") Long userId);
}
