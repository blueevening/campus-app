package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.Score;
import com.campus.app.mapper.ScoreMapper;
import com.campus.app.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 成绩服务实现类
 *
 * @author CampusApp
 */
@Service
public class ScoreServiceImpl extends ServiceImpl<ScoreMapper, Score> implements ScoreService {

    @Autowired
    private ScoreMapper scoreMapper;

    @Override
    public List<Score> getStudentScores(Long studentId, String semester) {
        return scoreMapper.selectStudentScores(studentId, semester);
    }

    @Override
    public List<Score> getAllScores(Long studentId) {
        return scoreMapper.selectAllScores(studentId);
    }

    @Override
    public Map<String, Object> calculateGPA(Long studentId) {
        List<Score> scores = getAllScores(studentId);

        double totalGPA = 0;
        double totalCredits = 0;
        int passedCourses = 0;
        double totalScore = 0;

        for (Score score : scores) {
            if (score.getTotalScore() != null && score.getTotalScore().doubleValue() >= 60) {
                if (score.getGpa() != null) {
                    totalGPA += score.getGpa().doubleValue() * score.getCredit();
                }
                totalCredits += score.getCredit();
                passedCourses++;
                totalScore += score.getTotalScore().doubleValue();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("averageGPA", totalCredits > 0 ? Math.round(totalGPA / totalCredits * 100) / 100.0 : 0);
        result.put("totalCredits", totalCredits);
        result.put("passedCourses", passedCourses);
        result.put("averageScore", passedCourses > 0 ? Math.round(totalScore / passedCourses * 100) / 100.0 : 0);

        return result;
    }

    @Override
    public List<String> getAvailableSemesters(Long studentId) {
        LambdaQueryWrapper<Score> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Score::getStudentId, studentId);
        wrapper.select(Score::getSemester);
        wrapper.groupBy(Score::getSemester);
        wrapper.orderByDesc(Score::getSemester);

        List<Score> scores = list(wrapper);
        return scores.stream()
            .map(Score::getSemester)
            .distinct()
            .collect(Collectors.toList());
    }
}
