package com.campus.app.controller;

import com.campus.app.entity.Score;
import com.campus.app.service.ScoreService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 成绩控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/score")
@Api(tags = "成绩管理")
@CrossOrigin
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 查询学生成绩
     */
    @GetMapping("/list")
    @ApiOperation("查询学生成绩")
    public Result<List<Score>> getStudentScores(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String semester) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        List<Score> scores;
        if (semester != null && !semester.isEmpty()) {
            scores = scoreService.getStudentScores(userId, semester);
        } else {
            scores = scoreService.getAllScores(userId);
        }
        return Result.success(scores);
    }

    /**
     * 计算GPA
     */
    @GetMapping("/gpa")
    @ApiOperation("计算GPA")
    public Result<Map<String, Object>> calculateGPA(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        Map<String, Object> gpaInfo = scoreService.calculateGPA(userId);
        return Result.success(gpaInfo);
    }

    /**
     * 获取可用学期列表
     */
    @GetMapping("/semesters")
    @ApiOperation("获取可用学期列表")
    public Result<List<String>> getAvailableSemesters(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        List<String> semesters = scoreService.getAvailableSemesters(userId);
        return Result.success(semesters);
    }
}
