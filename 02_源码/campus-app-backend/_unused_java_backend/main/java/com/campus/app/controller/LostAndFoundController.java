package com.campus.app.controller;

import com.campus.app.entity.LostAndFound;
import com.campus.app.service.LostAndFoundService;
import com.campus.app.utils.JwtUtils;
import com.campus.app.utils.PageResult;
import com.campus.app.utils.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 失物招领控制器
 *
 * @author CampusApp
 */
@RestController
@RequestMapping("/api/lost-found")
@Api(tags = "失物招领")
@CrossOrigin
public class LostAndFoundController {

    @Autowired
    private LostAndFoundService lostAndFoundService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 分页查询失物招领
     */
    @GetMapping("/list")
    @ApiOperation("查询失物招领列表")
    public Result<PageResult<LostAndFound>> getLostAndFoundList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) Integer category) {
        PageResult<LostAndFound> result = lostAndFoundService.pageLostAndFound(pageNum, pageSize, type, category);
        return Result.success(result);
    }

    /**
     * 获取详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取失物招领详情")
    public Result<LostAndFound> getDetail(@PathVariable Long id) {
        LostAndFound info = lostAndFoundService.getById(id);
        if (info != null) {
            return Result.success(info);
        }
        return Result.error("信息不存在");
    }

    /**
     * 发布失物招领
     */
    @PostMapping("/publish")
    @ApiOperation("发布失物招领")
    public Result<LostAndFound> publish(@RequestHeader("Authorization") String token,
                                        @RequestBody LostAndFound lostAndFound) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        lostAndFound.setUserId(userId);
        return lostAndFoundService.publish(lostAndFound);
    }

    /**
     * 更新状态
     */
    @PutMapping("/{id}/status")
    @ApiOperation("更新状态")
    public Result<Void> updateStatus(@RequestHeader("Authorization") String token,
                                     @PathVariable Long id,
                                     @RequestParam Integer status) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        return lostAndFoundService.updateStatus(id, status);
    }

    /**
     * 删除信息
     */
    @DeleteMapping("/{id}")
    @ApiOperation("删除信息")
    public Result<Void> deleteInfo(@RequestHeader("Authorization") String token,
                                   @PathVariable Long id) {
        Long userId = jwtUtils.getUserId(token.replace("Bearer ", ""));
        if (userId == null) {
            return Result.unauthorized();
        }

        return lostAndFoundService.deleteInfo(id);
    }
}
