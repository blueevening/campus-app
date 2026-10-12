package com.campus.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.app.entity.UserCredit;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户积分Mapper接口
 *
 * @author CampusApp
 */
@Mapper
public interface UserCreditMapper extends BaseMapper<UserCredit> {
}
