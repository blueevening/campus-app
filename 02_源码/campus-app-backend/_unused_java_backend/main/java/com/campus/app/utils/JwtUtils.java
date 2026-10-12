package com.campus.app.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT工具类
 *
 * @author CampusApp
 */
@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * 生成JWT Token
     */
    public String generateToken(Long userId, String username, Integer role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    /**
     * 从Token中获取Claims
     */
    public Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 获取用户ID
     */
    public Long getUserId(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims != null) {
            return Long.parseLong(claims.getSubject());
        }
        return null;
    }

    /**
     * 获取用户名
     */
    public String getUsername(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims != null) {
            return (String) claims.get("username");
        }
        return null;
    }

    /**
     * 获取用户角色
     */
    public Integer getRole(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims != null) {
            return (Integer) claims.get("role");
        }
        return null;
    }

    /**
     * 验证Token是否过期
     */
    public Boolean isTokenExpired(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims != null) {
            Date expiration = claims.getExpiration();
            return expiration.before(new Date());
        }
        return true;
    }

    /**
     * 验证Token是否有效
     */
    public Boolean validateToken(String token) {
        return getClaimsFromToken(token) != null && !isTokenExpired(token);
    }
}
