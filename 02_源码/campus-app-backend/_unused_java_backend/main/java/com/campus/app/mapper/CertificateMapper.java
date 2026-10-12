package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.Certificate;
import org.apache.ibatis.annotations.Mapper;

/**
 * 证书Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface CertificateMapper extends BaseMapper<Certificate> {
}
