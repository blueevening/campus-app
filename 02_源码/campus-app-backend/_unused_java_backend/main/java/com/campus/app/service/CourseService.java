package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.Course;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;

import java.util.List;

/**
 * 课程服务接口
 *
 * @author CampusApp
 */
public interface CourseService extends IService<Course> {

    /**
     * 分页查询课程
     */
    PageResult<Course> pageCourses(Integer pageNum, Integer pageSize, String keyword, String semester);

    /**
     * 查询学生课表
     */
    List<Course> getStudentCourses(Long userId, String semester);

    /**
     * 选课
     */
    Result<Void> selectCourse(Long userId, Long courseId);

    /**
     * 退选课程
     */
    Result<Void> dropCourse(Long userId, Long courseId);

    /**
     * 获取当前学期
     */
    String getCurrentSemester();
}
