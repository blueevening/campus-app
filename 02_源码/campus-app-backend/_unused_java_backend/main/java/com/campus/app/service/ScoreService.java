package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.Score;
import com.campus.app.utils.Result;

import java.util.List;
import java.util.Map;

/**
 * 成绩服务接口
 *
 * @author CampusApp
 */
public interface ScoreService extends IService<Score> {

    /**
     * 查询学生指定学期成绩
     */
    List<Score> getStudentScores(Long studentId, String semester);

    /**
     * 查询学生所有成绩
     */
    List<Score> getAllScores(Long studentId);

    /**
     * 计算学生GPA
     */
    Map<String, Object> calculateGPA(Long studentId);

    /**
     * 获取可用学期列表
     */
    List<String> getAvailableSemesters(Long studentId);
}
