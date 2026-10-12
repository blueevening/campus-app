package com.campus.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.app.entity.Certificate;
import com.campus.app.entity.UserCredit;
import com.campus.app.mapper.CertificateMapper;
import com.campus.app.mapper.UserCreditMapper;
import com.campus.app.service.CertificateService;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 证书服务实现类
 *
 * @author CampusApp
 */
@Service
public class CertificateServiceImpl extends ServiceImpl<CertificateMapper, Certificate> implements CertificateService {

    @Autowired
    private CertificateMapper certificateMapper;

    @Autowired
    private UserCreditMapper userCreditMapper;

    /**
     * 证书等级积分对照表
     * 等级：1-国家级 2-省级 3-市级 4-校级 5-院级
     * 积分：20, 15, 10, 5, 3, 2
     */
    private static final Map<Integer, Integer> LEVEL_SCORE_MAP = new HashMap<>();
    static {
        LEVEL_SCORE_MAP.put(1, 20);  // 国家级
        LEVEL_SCORE_MAP.put(2, 15);  // 省级
        LEVEL_SCORE_MAP.put(3, 10);  // 市级
        LEVEL_SCORE_MAP.put(4, 5);   // 校级
        LEVEL_SCORE_MAP.put(5, 3);   // 院级
        LEVEL_SCORE_MAP.put(6, 2);   // 其他
    }

    @Override
    public Result<Certificate> applyCertificate(Certificate certificate) {
        // 根据证书等级设置积分
        Integer score = LEVEL_SCORE_MAP.get(certificate.getLevel());
        if (score == null) {
            return Result.error("无效的证书等级");
        }
        certificate.setScore(score);
        certificate.setStatus(0); // 待审核

        boolean success = save(certificate);
        if (success) {
            return Result.success("申请成功，等待审核", certificate);
        }
        return Result.error("申请失败");
    }

    @Override
    public List<Certificate> getUserCertificates(Long userId) {
        LambdaQueryWrapper<Certificate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Certificate::getUserId, userId);
        wrapper.orderByDesc(Certificate::getCreateTime);
        return certificateMapper.selectList(wrapper);
    }

    @Override
    public PageResult<Certificate> pageCertificates(Integer pageNum, Integer pageSize, Integer status) {
        Page<Certificate> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Certificate> wrapper = new LambdaQueryWrapper<>();

        if (status != null) {
            wrapper.eq(Certificate::getStatus, status);
        }
        wrapper.orderByDesc(Certificate::getCreateTime);

        Page<Certificate> result = certificateMapper.selectPage(page, wrapper);

        return new PageResult<>(
            result.getTotal(),
            result.getRecords(),
            result.getCurrent(),
            result.getSize()
        );
    }

    @Override
    @Transactional
    public Result<Void> reviewCertificate(Long certificateId, Integer status, String remark, Long reviewerId) {
        Certificate certificate = getById(certificateId);
        if (certificate == null) {
            return Result.error("证书申请不存在");
        }

        if (certificate.getStatus() != 0) {
            return Result.error("该证书已审核");
        }

        // 更新证书状态
        certificate.setStatus(status);
        certificate.setRemark(remark);
        certificate.setReviewerId(reviewerId);
        certificate.setReviewTime(LocalDateTime.now());
        updateById(certificate);

        // 如果审核通过，增加用户积分
        if (status == 1) {
            LambdaQueryWrapper<UserCredit> creditWrapper = new LambdaQueryWrapper<>();
            creditWrapper.eq(UserCredit::getUserId, certificate.getUserId());
            UserCredit userCredit = userCreditMapper.selectOne(creditWrapper);

            if (userCredit == null) {
                userCredit = new UserCredit();
                userCredit.setUserId(certificate.getUserId());
                userCredit.setSecondClassScore(certificate.getScore());
                userCredit.setIntegrityScore(100);
                userCreditMapper.insert(userCredit);
            } else {
                userCredit.setSecondClassScore(
                    userCredit.getSecondClassScore() + certificate.getScore()
                );
                userCreditMapper.updateById(userCredit);
            }
        }

        return Result.success(status == 1 ? "审核通过" : "审核拒绝");
    }

    @Override
    public List<Map<String, Object>> getCertificateLevels() {
        List<Map<String, Object>> levels = new ArrayList<>();

        Map<String, Object> level1 = new HashMap<>();
        level1.put("value", 1);
        level1.put("label", "国家级");
        level1.put("score", 20);
        level1.put("description", "全国性比赛、国家级证书");
        levels.add(level1);

        Map<String, Object> level2 = new HashMap<>();
        level2.put("value", 2);
        level2.put("label", "省级");
        level2.put("score", 15);
        level2.put("description", "省级比赛、省级证书");
        levels.add(level2);

        Map<String, Object> level3 = new HashMap<>();
        level3.put("value", 3);
        level3.put("label", "市级");
        level3.put("score", 10);
        level3.put("description", "市级比赛、市级证书");
        levels.add(level3);

        Map<String, Object> level4 = new HashMap<>();
        level4.put("value", 4);
        level4.put("label", "校级");
        level4.put("score", 5);
        level4.put("description", "校级比赛、校级证书");
        levels.add(level4);

        Map<String, Object> level5 = new HashMap<>();
        level5.put("value", 5);
        level5.put("label", "院级");
        level5.put("score", 3);
        level5.put("description", "院级比赛、院级证书");
        levels.add(level5);

        Map<String, Object> level6 = new HashMap<>();
        level6.put("value", 6);
        level6.put("label", "其他");
        level6.put("score", 2);
        level6.put("description", "其他类型证书");
        levels.add(level6);

        return levels;
    }

    @Override
    public List<Map<String, Object>> getCertificateTypes() {
        List<Map<String, Object>> types = new ArrayList<>();

        String[] typeNames = {"学科竞赛", "科技创新", "文体活动", "社会实践", "志愿服务", "其他"};
        for (int i = 0; i < typeNames.length; i++) {
            Map<String, Object> type = new HashMap<>();
            type.put("value", i + 1);
            type.put("label", typeNames[i]);
            types.add(type);
        }

        return types;
    }
}
