package com.campus.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.app.entity.Certificate;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;

import java.util.List;
import java.util.Map;

/**
 * 证书服务接口
 *
 * @author CampusApp
 */
public interface CertificateService extends IService<Certificate> {

    /**
     * 申请证书
     */
    Result<Certificate> applyCertificate(Certificate certificate);

    /**
     * 查询用户证书列表
     */
    List<Certificate> getUserCertificates(Long userId);

    /**
     * 分页查询证书（管理员）
     */
    PageResult<Certificate> pageCertificates(Integer pageNum, Integer pageSize, Integer status);

    /**
     * 审核证书
     */
    Result<Void> reviewCertificate(Long certificateId, Integer status, String remark, Long reviewerId);

    /**
     * 获取证书等级和积分对照表
     */
    List<Map<String, Object>> getCertificateLevels();

    /**
     * 获取证书类型列表
     */
    List<Map<String, Object>> getCertificateTypes();
}
