package com.campus.app.controller;

import com.campus.app.entity.Certificate;
import com.campus.app.service.CertificateService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 证书控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/certificate")
@Api(tags = "证书管理")
@CrossOrigin
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 申请证书
     */
    @PostMapping("/apply")
    @ApiOperation("申请证书")
    public Result<Certificate> applyCertificate(@RequestHeader("Authorization") String token,
                                                 @RequestBody Certificate certificate) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        certificate.setUserId(userId);
        return certificateService.applyCertificate(certificate);
    }

    /**
     * 查询用户证书列表
     */
    @GetMapping("/my")
    @ApiOperation("查询我的证书")
    public Result<List<Certificate>> getMyCertificates(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }
        List<Certificate> certificates = certificateService.getUserCertificates(userId);
        return Result.success(certificates);
    }

    /**
     * 分页查询证书（管理员）
     */
    @GetMapping("/list")
    @ApiOperation("查询证书列表")
    public Result<PageResult<Certificate>> getCertificateList(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status) {
        Integer role = jwtUtils.getRole(token.replace("Bearer ", ""));
        if (role == null || role < 1) {
            return Result.forbidden();
        }
        PageResult<Certificate> result = certificateService.pageCertificates(pageNum, pageSize, status);
        return Result.success(result);
    }

    /**
     * 审核证书
     */
    @PostMapping("/review/{id}")
    @ApiOperation("审核证书")
    public Result<Void> reviewCertificate(@RequestHeader("Authorization") String token,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, Object> params) {
        Integer role = jwtUtils.getRole(token.replace("Bearer ", ""));
        if (role == null || role < 1) {
            return Result.forbidden();
        }

        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        Integer status = (Integer) params.get("status");
        String remark = (String) params.get("remark");

        return certificateService.reviewCertificate(id, status, remark, userId);
    }

    /**
     * 获取证书等级和积分对照表
     */
    @GetMapping("/levels")
    @ApiOperation("获取证书等级")
    public Result<List<Map<String, Object>>> getCertificateLevels() {
        return Result.success(certificateService.getCertificateLevels());
    }

    /**
     * 获取证书类型列表
     */
    @GetMapping("/types")
    @ApiOperation("获取证书类型")
    public Result<List<Map<String, Object>>> getCertificateTypes() {
        return Result.success(certificateService.getCertificateTypes());
    }
}
