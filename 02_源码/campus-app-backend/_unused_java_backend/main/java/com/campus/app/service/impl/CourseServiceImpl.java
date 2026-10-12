package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.Course;
import com.campus.app.mapper.CourseMapper;
import com.campus.app.service.CourseService;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

/**
 * 课程服务实现类
 *
 * @author CampusApp
 */
@Service
public class CourseServiceImpl extends ServiceImpl<CourseMapper, Course> implements CourseService {

    @Autowired
    private CourseMapper courseMapper;

    @Override
    public PageResult<Course> pageCourses(Integer pageNum, Integer pageSize, String keyword, String semester) {
        Page<Course> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w
                .like(Course::getCourseName, keyword)
                .or()
                .like(Course::getCourseCode, keyword)
                .or()
                .like(Course::getTeacherName, keyword)
            );
        }

        if (StringUtils.hasText(semester)) {
            wrapper.eq(Course::getSemester, semester);
        }

        wrapper.eq(Course::getStatus, 1);
        wrapper.orderByDesc(Course::getCreateTime);

        Page<Course> result = courseMapper.selectPage(page, wrapper);

        return new PageResult<>(
            result.getTotal(),
            result.getRecords(),
            result.getCurrent(),
            result.getSize()
        );
    }

    @Override
    public List<Course> getStudentCourses(Long userId, String semester) {
        return courseMapper.selectStudentCourses(userId, semester);
    }

    @Override
    public Result<Void> selectCourse(Long userId, Long courseId) {
        // 查询课程信息
        Course course = getById(courseId);
        if (course == null) {
            return Result.error("课程不存在");
        }

        // 检查课程容量
        if (course.getCurrentStudents() >= course.getMaxStudents()) {
            return Result.error("课程已满");
        }

        // 检查是否已选该课程
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        // 这里简化处理，实际应该查询选课表

        // 更新选课人数
        course.setCurrentStudents(course.getCurrentStudents() + 1);
        updateById(course);

        return Result.success("选课成功");
    }

    @Override
    public Result<Void> dropCourse(Long userId, Long courseId) {
        // 查询课程信息
        Course course = getById(courseId);
        if (course == null) {
            return Result.error("课程不存在");
        }

        // 更新选课人数
        if (course.getCurrentStudents() > 0) {
            course.setCurrentStudents(course.getCurrentStudents() - 1);
            updateById(course);
        }

        return Result.success("退选成功");
    }

    @Override
    public String getCurrentSemester() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        if (month >= 2 && month <= 7) {
            return year + "-" + (year + 1) + "-1";
        } else {
            return (year - 1) + "-" + year + "-2";
        }
    }
}
