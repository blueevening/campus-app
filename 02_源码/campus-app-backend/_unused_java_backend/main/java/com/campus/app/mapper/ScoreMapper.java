package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.Score;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 成绩Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface ScoreMapper extends BaseMapper<Score> {

    /**
     * 查询学生成绩（包含课程信息）
     */
    @Select("SELECT s.*, c.course_name, c.course_code, c.credit FROM score s " +
            "INNER JOIN course c ON s.course_id = c.id " +
            "WHERE s.student_id = #{studentId} AND s.semester = #{semester} " +
            "ORDER BY c.course_code")
    List<Score> selectStudentScores(@Param("studentId") Long studentId, @Param("semester") String semester);

    /**
     * 查询学生所有学期成绩
     */
    @Select("SELECT s.*, c.course_name, c.course_code, c.credit FROM score s " +
            "INNER JOIN course c ON s.course_id = c.id " +
            "WHERE s.student_id = #{studentId} ORDER BY s.semester DESC, c.course_code")
    List<Score> selectAllScores(@Param("studentId") Long studentId);
}
