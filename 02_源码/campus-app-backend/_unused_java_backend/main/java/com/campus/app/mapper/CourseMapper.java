package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 课程Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface CourseMapper extends BaseMapper<Course> {

    /**
     * 查询学生已选课程
     */
    @Select("SELECT c.* FROM course c INNER JOIN student_course sc ON c.id = sc.course_id WHERE sc.user_id = #{userId} AND c.semester = #{semester}")
    List<Course> selectStudentCourses(@Param("userId") Long userId, @Param("semester") String semester);
}
