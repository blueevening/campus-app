-- =====================================================
-- 校园综合服务App数据库脚本
-- 作者：CampusApp
-- 创建日期：2024
-- 数据库：MySQL 8.0+
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_app DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE campus_app;

-- =====================================================
-- 1. 用户表
-- =====================================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `student_id` varchar(20) NOT NULL COMMENT '学号/工号',
  `password` varchar(100) NOT NULL COMMENT '密码（MD5加密）',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint(1) DEFAULT '0' COMMENT '性别：0-未知 1-男 2-女',
  `college` varchar(100) DEFAULT NULL COMMENT '学院',
  `major` varchar(100) DEFAULT NULL COMMENT '专业',
  `class_name` varchar(50) DEFAULT NULL COMMENT '班级',
  `role` tinyint(1) DEFAULT '0' COMMENT '角色：0-学生 1-教师 2-管理员',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：0-禁用 1-启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除：0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =====================================================
-- 2. 课程表
-- =====================================================
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '课程ID',
  `course_name` varchar(100) NOT NULL COMMENT '课程名称',
  `course_code` varchar(30) NOT NULL COMMENT '课程编号',
  `teacher_name` varchar(50) DEFAULT NULL COMMENT '教师姓名',
  `teacher_id` bigint(20) DEFAULT NULL COMMENT '教师ID',
  `credit` int(2) DEFAULT NULL COMMENT '学分',
  `location` varchar(100) DEFAULT NULL COMMENT '上课地点',
  `class_time` text COMMENT '上课时间（JSON格式）',
  `semester` varchar(20) NOT NULL COMMENT '学期',
  `description` text COMMENT '课程描述',
  `max_students` int(4) DEFAULT '60' COMMENT '最大选课人数',
  `current_students` int(4) DEFAULT '0' COMMENT '已选人数',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：0-未开始 1-进行中 2-已结束',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_code_semester` (`course_code`, `semester`),
  KEY `idx_semester` (`semester`),
  KEY `idx_teacher_id` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- =====================================================
-- 3. 学生选课表
-- =====================================================
DROP TABLE IF EXISTS `student_course`;
CREATE TABLE `student_course` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` bigint(20) NOT NULL COMMENT '学生ID',
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `semester` varchar(20) NOT NULL COMMENT '学期',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：0-已退选 1-已选',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生选课表';

-- =====================================================
-- 4. 成绩表
-- =====================================================
DROP TABLE IF EXISTS `score`;
CREATE TABLE `score` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '成绩ID',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `daily_score` decimal(5,2) DEFAULT NULL COMMENT '平时成绩',
  `midterm_score` decimal(5,2) DEFAULT NULL COMMENT '期中成绩',
  `final_score` decimal(5,2) DEFAULT NULL COMMENT '期末成绩',
  `total_score` decimal(5,2) DEFAULT NULL COMMENT '总评成绩',
  `gpa` decimal(3,2) DEFAULT NULL COMMENT '绩点',
  `semester` varchar(20) NOT NULL COMMENT '学期',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态：0-未录入 1-已录入 2-已确认',
  `record_time` datetime DEFAULT NULL COMMENT '录入时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_course` (`student_id`, `course_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_semester` (`semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成绩表';

-- =====================================================
-- 5. 图书表
-- =====================================================
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '图书ID',
  `book_name` varchar(200) NOT NULL COMMENT '书名',
  `author` varchar(100) DEFAULT NULL COMMENT '作者',
  `isbn` varchar(30) DEFAULT NULL COMMENT 'ISBN',
  `publisher` varchar(100) DEFAULT NULL COMMENT '出版社',
  `publish_date` varchar(20) DEFAULT NULL COMMENT '出版日期',
  `category` varchar(50) DEFAULT NULL COMMENT '分类',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面图片',
  `description` text COMMENT '简介',
  `total_copies` int(4) DEFAULT '0' COMMENT '馆藏数量',
  `available_copies` int(4) DEFAULT '0' COMMENT '可借数量',
  `location` varchar(100) DEFAULT NULL COMMENT '位置',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：0-不可借 1-可借',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_isbn` (`isbn`),
  KEY `idx_category` (`category`),
  FULLTEXT KEY `ft_book_name` (`book_name`, `author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书表';

-- =====================================================
-- 6. 图书借阅表
-- =====================================================
DROP TABLE IF EXISTS `book_reservation`;
CREATE TABLE `book_reservation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '借阅ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `book_id` bigint(20) NOT NULL COMMENT '图书ID',
  `borrow_date` datetime DEFAULT NULL COMMENT '借阅日期',
  `due_date` datetime DEFAULT NULL COMMENT '应还日期',
  `return_date` datetime DEFAULT NULL COMMENT '实际归还日期',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态：0-已预约 1-借阅中 2-已归还 3-已逾期',
  `renew_count` int(2) DEFAULT '0' COMMENT '续借次数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书借阅表';

-- =====================================================
-- 7. 校园资讯表
-- =====================================================
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '资讯ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text COMMENT '内容',
  `summary` varchar(500) DEFAULT NULL COMMENT '摘要',
  `cover_image` varchar(255) DEFAULT NULL COMMENT '封面图片',
  `category` tinyint(1) DEFAULT '1' COMMENT '分类：1-校园新闻 2-学术讲座 3-社团活动 4-通知公告',
  `source` varchar(100) DEFAULT NULL COMMENT '作者/来源',
  `publisher_id` bigint(20) DEFAULT NULL COMMENT '发布者ID',
  `view_count` int(8) DEFAULT '0' COMMENT '浏览量',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：0-草稿 1-已发布 2-已下架',
  `publish_time` datetime DEFAULT NULL COMMENT '发布时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_time` (`publish_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校园资讯表';

-- =====================================================
-- 8. 失物招领表
-- =====================================================
DROP TABLE IF EXISTS `lost_and_found`;
CREATE TABLE `lost_and_found` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `description` text COMMENT '描述',
  `type` tinyint(1) NOT NULL COMMENT '类型：1-失物 2-拾获',
  `category` tinyint(1) DEFAULT '5' COMMENT '分类：1-证件 2-电子设备 3-书籍 4-衣物 5-其他',
  `images` text COMMENT '图片（多个用逗号分隔）',
  `location` varchar(200) DEFAULT NULL COMMENT '地点',
  `contact` varchar(100) DEFAULT NULL COMMENT '联系方式',
  `user_id` bigint(20) NOT NULL COMMENT '发布者ID',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态：0-待处理 1-已认领 2-已关闭',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_category` (`category`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='失物招领表';

-- =====================================================
-- 插入测试数据
-- =====================================================

-- 1. 用户测试数据
-- 密码：123456 (MD5加密后为 e10adc3949ba59abbe56e057f20f883e)
INSERT INTO `sys_user` (`student_id`, `password`, `username`, `phone`, `email`, `gender`, `college`, `major`, `class_name`, `role`, `status`) VALUES
('2021001', 'e10adc3949ba59abbe56e057f20f883e', '张三', '13800138001', 'zhangsan@campus.com', 1, '人工智能学院', '移动互联应用技术', '移动2101', 0, 1),
('2021002', 'e10adc3949ba59abbe56e057f20f883e', '李四', '13800138002', 'lisi@campus.com', 2, '人工智能学院', '移动互联应用技术', '移动2101', 0, 1),
('2021003', 'e10adc3949ba59abbe56e057f20f883e', '王五', '13800138003', 'wangwu@campus.com', 1, '人工智能学院', '软件技术', '软件2101', 0, 1),
('2021004', 'e10adc3949ba59abbe56e057f20f883e', '赵六', '13800138004', 'zhaoliu@campus.com', 2, '人工智能学院', '大数据技术', '大数据2101', 0, 1),
('2021005', 'e10adc3949ba59abbe56e057f20f883e', '孙七', '13800138005', 'sunqi@campus.com', 1, '人工智能学院', '人工智能技术', 'AI2101', 0, 1),
('T001', 'e10adc3949ba59abbe56e057f20f883e', '刘老师', '13900139001', 'liulaoshi@campus.com', 1, '人工智能学院', '移动互联应用技术', NULL, 1, 1),
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '13700137001', 'admin@campus.com', 0, '信息中心', NULL, NULL, 2, 1);

-- 2. 课程测试数据
INSERT INTO `course` (`course_name`, `course_code`, `teacher_name`, `teacher_id`, `credit`, `location`, `class_time`, `semester`, `description`, `max_students`, `current_students`, `status`) VALUES
('移动应用开发', 'CS2001', '刘老师', 6, 4, '教学楼A301', '[{"day":1,"start":1,"end":2},{"day":3,"start":3,"end":4}]', '2024-2025-2', '本课程主要讲解Android和iOS移动应用开发技术', 60, 45, 1),
('Java程序设计', 'CS2002', '刘老师', 6, 3, '教学楼B201', '[{"day":2,"start":1,"end":2},{"day":4,"start":1,"end":2}]', '2024-2025-2', 'Java语言基础及面向对象程序设计', 60, 50, 1),
('数据库原理与应用', 'CS2003', '王老师', 6, 3, '实验楼C101', '[{"day":1,"start":3,"end":4},{"day":5,"start":1,"end":2}]', '2024-2025-2', '关系数据库设计、SQL语言及应用', 60, 48, 1),
('Web前端开发', 'CS2004', '李老师', 6, 4, '实验楼C202', '[{"day":2,"start":3,"end":4},{"day":4,"start":3,"end":4}]', '2024-2025-2', 'HTML5、CSS3、JavaScript及Vue.js框架', 60, 42, 1),
('计算机网络', 'CS2005', '赵老师', 6, 3, '教学楼A201', '[{"day":3,"start":1,"end":2},{"day":5,"start":3,"end":4}]', '2024-2025-2', '计算机网络基础、TCP/IP协议', 60, 55, 1),
('软件工程', 'CS2006', '孙老师', 6, 3, '教学楼B301', '[{"day":1,"start":5,"end":6}]', '2024-2025-2', '软件开发流程、需求分析、设计模式', 60, 40, 1),
('大学英语', 'EN1001', '陈老师', 6, 2, '教学楼D101', '[{"day":2,"start":5,"end":6},{"day":4,"start":5,"end":6}]', '2024-2025-2', '大学英语综合课程', 60, 58, 1),
('高等数学', 'MA1001', '周老师', 6, 3, '教学楼A101', '[{"day":1,"start":7,"end":8},{"day":3,"start":7,"end":8}]', '2024-2025-2', '微积分、线性代数基础', 60, 52, 1);

-- 3. 学生选课测试数据
INSERT INTO `student_course` (`user_id`, `course_id`, `semester`, `status`) VALUES
(1, 1, '2024-2025-2', 1),
(1, 2, '2024-2025-2', 1),
(1, 3, '2024-2025-2', 1),
(1, 4, '2024-2025-2', 1),
(1, 5, '2024-2025-2', 1),
(2, 1, '2024-2025-2', 1),
(2, 2, '2024-2025-2', 1),
(2, 3, '2024-2025-2', 1),
(2, 6, '2024-2025-2', 1),
(3, 1, '2024-2025-2', 1),
(3, 4, '2024-2025-2', 1),
(3, 5, '2024-2025-2', 1);

-- 4. 成绩测试数据
INSERT INTO `score` (`student_id`, `course_id`, `daily_score`, `midterm_score`, `final_score`, `total_score`, `gpa`, `semester`, `status`, `record_time`) VALUES
(1, 1, 85.00, 78.00, 82.00, 82.00, 3.20, '2024-2025-1', 2, '2025-01-15 10:00:00'),
(1, 2, 90.00, 88.00, 92.00, 90.00, 4.00, '2024-2025-1', 2, '2025-01-15 10:00:00'),
(1, 3, 78.00, 75.00, 80.00, 78.00, 2.80, '2024-2025-1', 2, '2025-01-15 10:00:00'),
(2, 1, 92.00, 90.00, 95.00, 92.00, 4.00, '2024-2025-1', 2, '2025-01-15 10:00:00'),
(2, 2, 88.00, 85.00, 88.00, 87.00, 3.50, '2024-2025-1', 2, '2025-01-15 10:00:00');

-- 5. 图书测试数据
INSERT INTO `book` (`book_name`, `author`, `isbn`, `publisher`, `publish_date`, `category`, `cover`, `description`, `total_copies`, `available_copies`, `location`, `status`) VALUES
('Java编程思想', 'Bruce Eckel', '9787111213826', '机械工业出版社', '2007-06', '计算机', NULL, 'Java领域经典著作，深入阐述面向对象程序设计思想', 5, 3, '图书馆3楼A区', 1),
('Android开发艺术探索', '任玉刚', '9787121269394', '电子工业出版社', '2015-09', '计算机', NULL, '深入讲解Android开发核心技术', 3, 2, '图书馆3楼A区', 1),
('数据结构与算法分析', 'Mark Allen Weiss', '9787111528340', '机械工业出版社', '2016-01', '计算机', NULL, '数据结构与算法经典教材', 4, 4, '图书馆3楼B区', 1),
('红楼梦', '曹雪芹', '9787020002207', '人民文学出版社', '1996-12', '文学', NULL, '中国古典四大名著之一', 10, 8, '图书馆2楼C区', 1),
('经济学原理', '曼昆', '9787301150894', '北京大学出版社', '2009-04', '经济', NULL, '经济学入门经典教材', 3, 3, '图书馆4楼D区', 1),
('史记', '司马迁', '9787101003048', '中华书局', '2013-08', '历史', NULL, '中国第一部纪传体通史', 5, 4, '图书馆2楼E区', 1),
('Spring实战', 'Craig Walls', '9787115417305', '人民邮电出版社', '2016-03', '计算机', NULL, 'Spring框架权威指南', 4, 2, '图书馆3楼A区', 1),
('计算机网络', '谢希仁', '9787121302953', '电子工业出版社', '2017-01', '计算机', NULL, '计算机网络经典教材', 6, 5, '图书馆3楼B区', 1);

-- 6. 图书借阅测试数据
INSERT INTO `book_reservation` (`user_id`, `book_id`, `borrow_date`, `due_date`, `return_date`, `status`, `renew_count`) VALUES
(1, 1, '2025-03-01 10:00:00', '2025-04-01 10:00:00', NULL, 1, 0),
(1, 2, '2025-02-15 14:00:00', '2025-03-15 14:00:00', '2025-03-10 16:00:00', 2, 0),
(2, 3, '2025-03-05 09:00:00', '2025-04-05 09:00:00', NULL, 1, 1),
(2, 4, '2025-03-10 11:00:00', '2025-04-10 11:00:00', NULL, 1, 0),
(3, 7, '2025-02-20 15:00:00', '2025-03-20 15:00:00', '2025-03-18 10:00:00', 2, 0);

-- 7. 校园资讯测试数据
INSERT INTO `news` (`title`, `content`, `summary`, `cover_image`, `category`, `source`, `publisher_id`, `view_count`, `status`, `publish_time`) VALUES
('2025年春季学期开学通知', '各位同学：\n\n2025年春季学期将于2月24日正式开学，请各位同学提前做好返校准备。\n\n注意事项：\n1. 请于2月23日前完成注册\n2. 开学第一周为选课调整周\n3. 请按时参加各班级班会\n\n祝同学们新学期学业进步！', '2025年春季学期将于2月24日正式开学', NULL, 4, '教务处', 7, 1250, 1, '2025-02-15 10:00:00'),
('人工智能学院学术讲座预告', '主题：大语言模型技术前沿与应用\n\n主讲人：张教授（清华大学）\n\n时间：2025年3月15日 14:00-16:00\n\n地点：图书馆学术报告厅\n\n欢迎各位师生参加！', '大语言模型技术前沿与应用讲座', NULL, 2, '人工智能学院', 7, 856, 1, '2025-03-10 09:00:00'),
('校园歌手大赛报名开始', '一年一度的校园歌手大赛即将开始！\n\n报名时间：3月10日-3月25日\n\n报名方式：\n1. 线上报名：扫描下方二维码\n2. 线下报名：学生会办公室（行政楼201）\n\n比赛时间：4月15日\n\n丰厚奖品等你来拿！', '校园歌手大赛火热报名中', NULL, 3, '校学生会', 7, 2340, 1, '2025-03-08 14:00:00'),
('图书馆延长开放时间通知', '为满足同学们期末复习需求，图书馆将于即日起延长开放时间：\n\n周一至周五：8:00-22:00（延长至22:30）\n周六至周日：9:00-21:00（延长至22:00）\n\n自习室全天开放\n\n请同学们合理安排学习时间。', '图书馆延长开放时间至22:30', NULL, 4, '图书馆', 7, 1560, 1, '2025-03-12 08:00:00'),
('移动应用开发课程项目展示', '移动互联应用技术专业2021级学生课程项目展示圆满结束。\n\n本次展示共展出优秀项目20个，涵盖：\n- 校园服务类App\n- 生活工具类App\n- 游戏娱乐类App\n\n获奖名单将在下周公布。', '移动应用开发课程项目展示圆满结束', NULL, 1, '人工智能学院', 7, 678, 1, '2025-03-05 16:00:00');

-- 8. 失物招领测试数据
INSERT INTO `lost_and_found` (`title`, `description`, `type`, `category`, `images`, `location`, `contact`, `user_id`, `status`) VALUES
('丢失校园卡', '本人于3月10日下午在食堂二楼丢失校园卡一张，卡号2021001，姓名张三。如有拾到请与我联系，万分感谢！', 1, 1, NULL, '食堂二楼', '13800138001', 1, 0),
('拾获黑色耳机', '在图书馆三楼自习室拾获黑色无线耳机一副（AirPods Pro），请失主联系我认领。', 2, 2, NULL, '图书馆三楼自习室', '13800138002', 2, 0),
('丢失U盘', '在实验楼C202机房丢失银色U盘一个（32GB），内有重要课程资料，如有拾到请速联系，必有重谢！', 1, 2, NULL, '实验楼C202', '13800138003', 3, 0),
('拾获蓝色水杯', '在教学楼A301教室拾获蓝色保温杯一个，品牌膳魔师，请失主到教学楼A301教室认领。', 2, 5, NULL, '教学楼A301', '13800138001', 1, 1),
('丢失钱包', '3月12日中午在学生餐厅丢失棕色钱包一个，内有身份证、银行卡等物品，请拾到者联系我，必有酬谢！', 1, 5, NULL, '学生餐厅', '13800138004', 4, 0);

-- =====================================================
-- 创建索引（优化查询性能）
-- =====================================================

-- 用户表索引
CREATE INDEX idx_user_college ON sys_user(college);
CREATE INDEX idx_user_major ON sys_user(major);

-- 课程表索引
CREATE INDEX idx_course_course_name ON course(course_name);

-- 成绩表索引
CREATE INDEX idx_score_total_score ON score(total_score);

-- 图书表索引
CREATE INDEX idx_book_publisher ON book(publisher);

-- 借阅表索引
CREATE INDEX idx_reservation_borrow_date ON book_reservation(borrow_date);
CREATE INDEX idx_reservation_due_date ON book_reservation(due_date);

-- 资讯表索引
CREATE INDEX idx_news_title ON news(title);

-- 失物招领索引
CREATE INDEX idx_lost_found_title ON lost_and_found(title);
CREATE INDEX idx_lost_found_location ON lost_and_found(location);

-- =====================================================
-- 完成
-- =====================================================
SELECT '数据库创建完成！' AS message;
