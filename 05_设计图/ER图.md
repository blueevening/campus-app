# 数据库ER图

## 一、ER图说明

本系统的数据库设计遵循关系型数据库设计规范，包含8个核心实体，各实体之间通过外键建立关联关系。

## 二、ER图

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   数据库ER图                                          │
│                                                                                       │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐               │
│    │   sys_user   │         │   course     │         │    score     │               │
│    │   (用户表)   │         │  (课程表)    │         │   (成绩表)   │               │
│    ├──────────────┤         ├──────────────┤         ├──────────────┤               │
│    │ PK id        │────┐    │ PK id        │────┐    │ PK id        │               │
│    │    student_id │    │    │    course_name│    │    │ FK student_id│◄──┐          │
│    │    password   │    │    │    course_code│    │    │ FK course_id │◄──┤          │
│    │    username   │    │    │    teacher_   │    │    │    daily_    │   │          │
│    │    phone      │    │    │      name    │    │    │      score   │   │          │
│    │    email      │    │    │    credit    │    │    │    midterm_  │   │          │
│    │    avatar     │    │    │    location  │    │    │      score   │   │          │
│    │    gender     │    │    │    class_time│    │    │    final_    │   │          │
│    │    college    │    │    │    semester  │    │    │      score   │   │          │
│    │    major      │    │    │    max_      │    │    │    total_    │   │          │
│    │    class_name │    │    │      students│    │    │      score   │   │          │
│    │    role       │    │    │    current_  │    │    │    gpa       │   │          │
│    │    status     │    │    │      students│    │    │    semester  │   │          │
│    │    create_time│    │    │    status    │    │    │    status    │   │          │
│    │    update_time│    │    │    create_   │    │    │    record_   │   │          │
│    │    deleted    │    │    │      time    │    │    │      time    │   │          │
│    └──────────────┘    │    └──────────────┘    │    └──────────────┘   │          │
│           │             │           │            │                      │          │
│           │             │           │            │                      │          │
│           ▼             │           ▼            │                      │          │
│    ┌──────────────┐    │    ┌──────────────┐    │    ┌──────────────┐   │          │
│    │student_course│    │    │  (选课表)    │    │    │    (关联)    │   │          │
│    │  (选课表)    │    │    ├──────────────┤    │    └──────────────┘   │          │
│    ├──────────────┤    │    │ PK id        │    │                       │          │
│    │ PK id        │    │    │ FK user_id   │◄───┼───────────────────────┘          │
│    │ FK user_id   │◄───┘    │ FK course_id │◄───┘                                   │
│    │ FK course_id │◄────────│    semester  │                                          │
│    │    semester  │         │    status    │                                          │
│    │    status    │         │    create_   │                                          │
│    │    create_   │         │      time    │                                          │
│    │      time    │         │    update_   │                                          │
│    │    update_   │         │      time    │                                          │
│    │      time    │         └──────────────┘                                          │
│    └──────────────┘                                                                    │
│                                                                                       │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐               │
│    │    book      │         │book_reserv.  │         │    news      │               │
│    │  (图书表)    │         │ (借阅表)     │         │  (资讯表)    │               │
│    ├──────────────┤         ├──────────────┤         ├──────────────┤               │
│    │ PK id        │────┐    │ PK id        │         │ PK id        │               │
│    │    book_name │    │    │ FK user_id   │◄──┐    │    title     │               │
│    │    author    │    │    │ FK book_id   │◄──┤    │    content   │               │
│    │    isbn      │    │    │    borrow_   │   │    │    summary   │               │
│    │    publisher │    │    │      date    │   │    │    cover_    │               │
│    │    publish_  │    │    │    due_date  │   │    │      image   │               │
│    │      date    │    │    │    return_   │   │    │    category  │               │
│    │    category  │    │    │      date    │   │    │    source    │               │
│    │    cover     │    │    │    status    │   │    │ FK publisher_│◄──┐          │
│    │    description│   │    │    renew_    │   │    │        id    │   │          │
│    │    total_    │    │    │      count   │   │    │    view_count│   │          │
│    │      copies  │    │    │    create_   │   │    │    status    │   │          │
│    │    available_│    │    │      time    │   │    │    publish_  │   │          │
│    │      copies  │    │    │    update_   │   │    │      time    │   │          │
│    │    location  │    │    │      time    │   │    │    create_   │   │          │
│    │    status    │    │    └──────────────┘   │    │      time    │   │          │
│    │    create_   │    │                       │    │    update_   │   │          │
│    │      time    │    │                       │    │      time    │   │          │
│    │    update_   │    │                       │    │    deleted   │   │          │
│    │      time    │    │                       │    └──────────────┘   │          │
│    └──────────────┘    │                       │                       │          │
│           │             │                       │                       │          │
│           │             │                       │                       │          │
│           ▼             │                       │                       │          │
│    ┌──────────────┐    │    ┌──────────────┐   │    ┌──────────────┐   │          │
│    │ (图书详情)   │    │    │ (借阅详情)   │   │    │lost_and_found│   │          │
│    └──────────────┘    │    └──────────────┘   │    │ (失物招领)   │   │          │
│                        │                       │    ├──────────────┤   │          │
│                        │                       │    │ PK id        │   │          │
│                        │                       │    │    title     │   │          │
│                        │                       │    │    description│   │          │
│                        │                       │    │    type      │   │          │
│                        │                       │    │    category  │   │          │
│                        │                       │    │    images    │   │          │
│                        │                       │    │    location  │   │          │
│                        │                       │    │    contact   │   │          │
│                        │                       │    │ FK user_id   │◄──┼──────────┘
│                        │                       │    │    status    │              │
│                        │                       │    │    create_   │              │
│                        │                       │    │      time    │              │
│                        │                       │    │    update_   │              │
│                        │                       │    │      time    │              │
│                        │                       │    │    deleted   │              │
│                        │                       │    └──────────────┘              │
│                        │                       │                                  │
│                        │                       │                                  │
│                        ▼                       ▼                                  │
│                   sys_user                   sys_user                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 三、实体关系说明

### 3.1 用户与选课（1:N）

一个学生可以选择多门课程，一门课程可以被多个学生选择。通过 `student_course` 表实现多对多关系。

- **关系类型：** 多对多（M:N）
- **关联表：** student_course
- **外键：** user_id（关联sys_user表）、course_id（关联course表）

### 3.2 用户与成绩（1:N）

一个学生有多门课程的成绩。

- **关系类型：** 一对多（1:N）
- **外键：** student_id（关联sys_user表）、course_id（关联course表）

### 3.3 用户与借阅记录（1:N）

一个用户可以有多条借阅记录。

- **关系类型：** 一对多（1:N）
- **外键：** user_id（关联sys_user表）、book_id（关联book表）

### 3.4 图书与借阅记录（1:N）

一本图书可以被多次借阅。

- **关系类型：** 一对多（1:N）
- **外键：** book_id（关联book表）

### 3.5 用户与资讯（1:N）

一个管理员可以发布多条资讯。

- **关系类型：** 一对多（1:N）
- **外键：** publisher_id（关联sys_user表）

### 3.6 用户与失物招领（1:N）

一个用户可以发布多条失物招领信息。

- **关系类型：** 一对多（1:N）
- **外键：** user_id（关联sys_user表）

## 四、主要实体属性

### 4.1 用户实体（sys_user）

| 属性名 | 数据类型 | 说明 | 约束 |
|--------|----------|------|------|
| id | bigint | 用户ID | 主键，自增 |
| student_id | varchar(20) | 学号 | 唯一，非空 |
| password | varchar(100) | 密码 | 非空，MD5加密 |
| username | varchar(50) | 用户名 | 非空 |
| phone | varchar(20) | 手机号 | 可选 |
| email | varchar(100) | 邮箱 | 可选 |
| avatar | varchar(255) | 头像URL | 可选 |
| gender | tinyint(1) | 性别 | 0-未知 1-男 2-女 |
| college | varchar(100) | 学院 | 可选 |
| major | varchar(100) | 专业 | 可选 |
| class_name | varchar(50) | 班级 | 可选 |
| role | tinyint(1) | 角色 | 0-学生 1-教师 2-管理员 |
| status | tinyint(1) | 状态 | 0-禁用 1-启用 |
| deleted | tinyint(1) | 逻辑删除 | 0-未删除 1-已删除 |

### 4.2 课程实体（course）

| 属性名 | 数据类型 | 说明 | 约束 |
|--------|----------|------|------|
| id | bigint | 课程ID | 主键，自增 |
| course_name | varchar(100) | 课程名称 | 非空 |
| course_code | varchar(30) | 课程编号 | 非空，联合唯一 |
| teacher_name | varchar(50) | 教师姓名 | 可选 |
| credit | int(2) | 学分 | 可选 |
| location | varchar(100) | 上课地点 | 可选 |
| class_time | text | 上课时间 | JSON格式 |
| semester | varchar(20) | 学期 | 非空，联合唯一 |
| max_students | int(4) | 最大选课人数 | 默认60 |
| current_students | int(4) | 已选人数 | 默认0 |

### 4.3 成绩实体（score）

| 属性名 | 数据类型 | 说明 | 约束 |
|--------|----------|------|------|
| id | bigint | 成绩ID | 主键，自增 |
| student_id | bigint | 学生ID | 外键，非空 |
| course_id | bigint | 课程ID | 外键，非空 |
| daily_score | decimal(5,2) | 平时成绩 | 可选 |
| midterm_score | decimal(5,2) | 期中成绩 | 可选 |
| final_score | decimal(5,2) | 期末成绩 | 可选 |
| total_score | decimal(5,2) | 总评成绩 | 可选 |
| gpa | decimal(3,2) | 绩点 | 可选 |
| semester | varchar(20) | 学期 | 非空 |

### 4.4 图书实体（book）

| 属性名 | 数据类型 | 说明 | 约束 |
|--------|----------|------|------|
| id | bigint | 图书ID | 主键，自增 |
| book_name | varchar(200) | 书名 | 非空 |
| author | varchar(100) | 作者 | 可选 |
| isbn | varchar(30) | ISBN | 可选 |
| publisher | varchar(100) | 出版社 | 可选 |
| category | varchar(50) | 分类 | 可选 |
| total_copies | int(4) | 馆藏数量 | 默认0 |
| available_copies | int(4) | 可借数量 | 默认0 |
| location | varchar(100) | 位置 | 可选 |

### 4.5 借阅记录实体（book_reservation）

| 属性名 | 数据类型 | 说明 | 约束 |
|--------|----------|------|------|
| id | bigint | 借阅ID | 主键，自增 |
| user_id | bigint | 用户ID | 外键，非空 |
| book_id | bigint | 图书ID | 外键，非空 |
| borrow_date | datetime | 借阅日期 | 可选 |
| due_date | datetime | 应还日期 | 可选 |
| return_date | datetime | 实际归还日期 | 可选 |
| status | tinyint(1) | 状态 | 0-已预约 1-借阅中 2-已归还 3-已逾期 |
| renew_count | int(2) | 续借次数 | 默认0 |

### 4.6 资讯实体（news）

| 属性名 | 数据类型 | 说明 | 约束 |
|--------|----------|------|------|
| id | bigint | 资讯ID | 主键，自增 |
| title | varchar(200) | 标题 | 非空 |
| content | text | 内容 | 可选 |
| summary | varchar(500) | 摘要 | 可选 |
| cover_image | varchar(255) | 封面图片 | 可选 |
| category | tinyint(1) | 分类 | 1-校园新闻 2-学术讲座 3-社团活动 4-通知公告 |
| source | varchar(100) | 来源 | 可选 |
| publisher_id | bigint | 发布者ID | 外键 |
| view_count | int(8) | 浏览量 | 默认0 |
| status | tinyint(1) | 状态 | 0-草稿 1-已发布 2-已下架 |

### 4.7 失物招领实体（lost_and_found）

| 属性名 | 数据类型 | 说明 | 约束 |
|--------|----------|------|------|
| id | bigint | ID | 主键，自增 |
| title | varchar(200) | 标题 | 非空 |
| description | text | 描述 | 可选 |
| type | tinyint(1) | 类型 | 1-失物 2-拾获 |
| category | tinyint(1) | 分类 | 1-证件 2-电子设备 3-书籍 4-衣物 5-其他 |
| images | text | 图片 | 多个用逗号分隔 |
| location | varchar(200) | 地点 | 可选 |
| contact | varchar(100) | 联系方式 | 可选 |
| user_id | bigint | 发布者ID | 外键，非空 |
| status | tinyint(1) | 状态 | 0-待处理 1-已认领 2-已关闭 |
