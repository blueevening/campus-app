package com.campus.app.controller;

import com.campus.app.entity.Course;
import com.campus.app.service.CourseService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 课程控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/course")
@Api(tags = "课程管理")
@CrossOrigin
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 分页查询课程列表
     */
    @GetMapping("/list")
    @ApiOperation("查询课程列表")
    public Result<PageResult<Course>> getCourseList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String semester) {
        PageResult<Course> result = courseService.pageCourses(pageNum, pageSize, keyword, semester);
        return Result.success(result);
    }

    /**
     * 获取学生课表
     */
    @GetMapping("/schedule")
    @ApiOperation("获取学生课表")
    public Result<List<Course>> getStudentSchedule(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String semester) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        if (semester == null || semester.isEmpty()) {
            semester = courseService.getCurrentSemester();
        }

        List<Course> courses = courseService.getStudentCourses(userId, semester);
        return Result.success(courses);
    }

    /**
     * 选课
     */
    @PostMapping("/select/{courseId}")
    @ApiOperation("选课")
    public Result<Void> selectCourse(@RequestHeader("Authorization") String token,
                                     @PathVariable Long courseId) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return courseService.selectCourse(userId, courseId);
    }

    /**
     * 退选课程
     */
    @PostMapping("/drop/{courseId}")
    @ApiOperation("退选课程")
    public Result<Void> dropCourse(@RequestHeader("Authorization") String token,
                                   @PathVariable Long courseId) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        return courseService.dropCourse(userId, courseId);
    }

    /**
     * 获取当前学期
     */
    @GetMapping("/current-semester")
    @ApiOperation("获取当前学期")
    public Result<String> getCurrentSemester() {
        return Result.success(courseService.getCurrentSemester());
    }
}
