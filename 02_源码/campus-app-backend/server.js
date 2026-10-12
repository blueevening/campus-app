const http = require('http');
const url = require('url');
const crypto = require('crypto');

// 生产环境务必通过环境变量设置；演示默认值仅供本机使用
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'campus-app-demo-secret-change-me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// 模拟数据
const users = [
  { id: 1, studentId: '2021001', password: 'e10adc3949ba59abbe56e057f20f883e', username: '张三', role: 0, avatar: null, college: '人工智能学院', major: '移动互联应用技术' },
  { id: 2, studentId: '2021002', password: 'e10adc3949ba59abbe56e057f20f883e', username: '李四', role: 0, avatar: null, college: '人工智能学院', major: '移动互联应用技术' },
  { id: 7, studentId: 'admin', password: 'e10adc3949ba59abbe56e057f20f883e', username: '系统管理员', role: 2, avatar: null, college: '信息中心', major: null }
];

const courses = [
  { id: 1, courseName: '移动应用开发', courseCode: 'CS2001', teacherName: '刘老师', credit: 4, location: '教学楼A301', classTime: '[{"day":1,"start":1,"end":2},{"day":3,"start":3,"end":4}]', semester: '2024-2025-2' },
  { id: 2, courseName: 'Java程序设计', courseCode: 'CS2002', teacherName: '刘老师', credit: 3, location: '教学楼B201', classTime: '[{"day":2,"start":1,"end":2},{"day":4,"start":1,"end":2}]', semester: '2024-2025-2' },
  { id: 3, courseName: '数据库原理与应用', courseCode: 'CS2003', teacherName: '王老师', credit: 3, location: '实验楼C101', classTime: '[{"day":1,"start":3,"end":4},{"day":5,"start":1,"end":2}]', semester: '2024-2025-2' },
  { id: 4, courseName: 'Web前端开发', courseCode: 'CS2004', teacherName: '李老师', credit: 4, location: '实验楼C202', classTime: '[{"day":2,"start":3,"end":4},{"day":4,"start":3,"end":4}]', semester: '2024-2025-2' },
  { id: 5, courseName: '计算机网络', courseCode: 'CS2005', teacherName: '赵老师', credit: 3, location: '教学楼A201', classTime: '[{"day":3,"start":1,"end":2},{"day":5,"start":3,"end":4}]', semester: '2024-2025-2' }
];

const scores = [
  { id: 1, studentId: 1, courseId: 1, courseName: '移动应用开发', courseCode: 'CS2001', credit: 4, dailyScore: 85, midtermScore: 78, finalScore: 82, totalScore: 82, gpa: 3.2, semester: '2024-2025-1' },
  { id: 2, studentId: 1, courseId: 2, courseName: 'Java程序设计', courseCode: 'CS2002', credit: 3, dailyScore: 90, midtermScore: 88, finalScore: 92, totalScore: 90, gpa: 4.0, semester: '2024-2025-1' },
  { id: 3, studentId: 1, courseId: 3, courseName: '数据库原理与应用', courseCode: 'CS2003', credit: 3, dailyScore: 78, midtermScore: 75, finalScore: 80, totalScore: 78, gpa: 2.8, semester: '2024-2025-1' }
];

const books = [
  { id: 1, bookName: 'Java编程思想', author: 'Bruce Eckel', isbn: '9787111213826', publisher: '机械工业出版社', category: '计算机', totalCopies: 5, availableCopies: 3, location: '图书馆3楼A区', status: 1 },
  { id: 2, bookName: 'Android开发艺术探索', author: '任玉刚', isbn: '9787121269394', publisher: '电子工业出版社', category: '计算机', totalCopies: 3, availableCopies: 2, location: '图书馆3楼A区', status: 1 },
  { id: 3, bookName: '数据结构与算法分析', author: 'Mark Allen Weiss', isbn: '9787111528340', publisher: '机械工业出版社', category: '计算机', totalCopies: 4, availableCopies: 4, location: '图书馆3楼B区', status: 1 },
  { id: 4, bookName: '红楼梦', author: '曹雪芹', isbn: '9787020002207', publisher: '人民文学出版社', category: '文学', totalCopies: 10, availableCopies: 8, location: '图书馆2楼C区', status: 1 },
  { id: 5, bookName: 'Spring实战', author: 'Craig Walls', isbn: '9787115417305', publisher: '人民邮电出版社', category: '计算机', totalCopies: 4, availableCopies: 2, location: '图书馆3楼A区', status: 1 }
];

const news = [
  { id: 1, title: '2025年春季学期开学通知', summary: '2025年春季学期将于2月24日正式开学', content: '各位同学：\n\n2025年春季学期将于2月24日正式开学，请各位同学提前做好返校准备。', category: 4, source: '教务处', publishTime: '2025-02-15 10:00:00', viewCount: 1250 },
  { id: 2, title: '人工智能学院学术讲座预告', summary: '大语言模型技术前沿与应用讲座', content: '主题：大语言模型技术前沿与应用\n\n主讲人：张教授（清华大学）\n\n时间：2025年3月15日 14:00-16:00', category: 2, source: '人工智能学院', publishTime: '2025-03-10 09:00:00', viewCount: 856 },
  { id: 3, title: '校园歌手大赛报名开始', summary: '校园歌手大赛火热报名中', content: '一年一度的校园歌手大赛即将开始！\n\n报名时间：3月10日-3月25日', category: 3, source: '校学生会', publishTime: '2025-03-08 14:00:00', viewCount: 2340 }
];

const lostFound = [
  { id: 1, title: '丢失校园卡', description: '本人于3月10日下午在食堂二楼丢失校园卡一张', type: 1, category: 1, location: '食堂二楼', contact: '13800138001', userId: 1, status: 0, createTime: '2025-03-10 15:00:00' },
  { id: 2, title: '拾获黑色耳机', description: '在图书馆三楼自习室拾获黑色无线耳机一副', type: 2, category: 2, location: '图书馆三楼自习室', contact: '13800138002', userId: 2, status: 0, createTime: '2025-03-11 10:00:00' }
];

const borrowRecords = [
  { id: 1, userId: 1, bookId: 1, bookName: 'Java编程思想', author: 'Bruce Eckel', borrowDate: '2025-03-01 10:00:00', dueDate: '2025-04-01 10:00:00', returnDate: null, status: 1, renewCount: 0 },
  { id: 2, userId: 1, bookId: 2, bookName: 'Android开发艺术探索', author: '任玉刚', borrowDate: '2025-02-15 14:00:00', dueDate: '2025-03-15 14:00:00', returnDate: '2025-03-10 16:00:00', status: 2, renewCount: 0 }
];

// 第二课堂活动数据
const secondClassActivities = [
  { id: 1, activityName: '社区志愿服务活动', description: '为社区居民提供志愿服务，包括环境清洁、关爱老人等。', activityType: 1, location: '阳光社区', startTime: '2025-03-15 09:00:00', endTime: '2025-03-15 12:00:00', score: 10, maxParticipants: 30, currentParticipants: 15, publisherId: 7, status: 0, coverImage: null },
  { id: 2, activityName: '创新创业大赛', description: '校级创新创业大赛，展示你的创意和项目。', activityType: 4, location: '创新创业中心', startTime: '2025-03-20 14:00:00', endTime: '2025-03-20 17:00:00', score: 15, maxParticipants: 50, currentParticipants: 25, publisherId: 7, status: 0, coverImage: null },
  { id: 3, activityName: '摄影技能培训', description: '专业摄影师讲解摄影技巧，提升摄影水平。', activityType: 5, location: '艺术楼A201', startTime: '2025-03-18 19:00:00', endTime: '2025-03-18 21:00:00', score: 8, maxParticipants: 40, currentParticipants: 35, publisherId: 7, status: 0, coverImage: null },
  { id: 4, activityName: '人工智能前沿讲座', description: '邀请知名专家讲解人工智能最新发展动态。', activityType: 6, location: '图书馆报告厅', startTime: '2025-03-22 14:00:00', endTime: '2025-03-22 16:00:00', score: 12, maxParticipants: 100, currentParticipants: 60, publisherId: 7, status: 0, coverImage: null },
  { id: 5, activityName: '篮球友谊赛', description: '院系篮球友谊赛，强身健体，增进友谊。', activityType: 3, location: '体育馆', startTime: '2025-03-25 15:00:00', endTime: '2025-03-25 17:00:00', score: 5, maxParticipants: 20, currentParticipants: 12, publisherId: 7, status: 0, coverImage: null }
];

// 第二课堂参与记录
const secondClassRecords = [
  { id: 1, userId: 1, activityId: 1, score: 10, status: 2, createTime: '2025-03-10 10:00:00' },
  { id: 2, userId: 1, activityId: 3, score: 8, status: 0, createTime: '2025-03-12 14:00:00' }
];

// 用户积分数据
const userCredits = [
  { userId: 1, secondClassScore: 10, integrityScore: 95 },
  { userId: 2, secondClassScore: 25, integrityScore: 100 }
];

// 证书申请数据
const certificates = [
  { id: 1, userId: 1, certificateName: '全国大学生数学建模竞赛', level: 1, score: 20, certificateType: 1, issuer: '教育部', obtainDate: '2024-10-15', status: 1, remark: '国家级一等奖', reviewerId: 7, reviewTime: '2024-11-01 10:00:00', createTime: '2024-10-20 14:00:00' },
  { id: 2, userId: 1, certificateName: '省级程序设计大赛', level: 2, score: 15, certificateType: 1, issuer: '省教育厅', obtainDate: '2024-09-20', status: 0, remark: null, reviewerId: null, reviewTime: null, createTime: '2024-09-25 16:00:00' }
];

// 证书等级积分对照表
const certificateLevels = [
  { value: 1, label: '国家级', score: 20, description: '全国性比赛、国家级证书' },
  { value: 2, label: '省级', score: 15, description: '省级比赛、省级证书' },
  { value: 3, label: '市级', score: 10, description: '市级比赛、市级证书' },
  { value: 4, label: '校级', score: 5, description: '校级比赛、校级证书' },
  { value: 5, label: '院级', score: 3, description: '院级比赛、院级证书' },
  { value: 6, label: '其他', score: 2, description: '其他类型证书' }
];

// 证书类型
const certificateTypes = [
  { value: 1, label: '学科竞赛' },
  { value: 2, label: '科技创新' },
  { value: 3, label: '文体活动' },
  { value: 4, label: '社会实践' },
  { value: 5, label: '志愿服务' },
  { value: 6, label: '其他' }
];

// 选课记录（学生已选课程）
const selectedCourses = [
  { id: 1, userId: 1, courseId: 1, semester: '2024-2025-2', createTime: '2025-02-20 10:00:00' },
  { id: 2, userId: 1, courseId: 2, semester: '2024-2025-2', createTime: '2025-02-20 10:05:00' },
  { id: 3, userId: 1, courseId: 3, semester: '2024-2025-2', createTime: '2025-02-20 10:10:00' }
];

// 图书预约
const bookReservations = [];

// 通知消息
const notifications = [
  { id: 1, userId: 1, title: '欢迎使用校园服务平台', body: '您已成功登录系统，祝学习愉快！', type: 'system', read: false, createTime: '2025-03-01 09:00:00' },
  { id: 2, userId: 1, title: '借阅到期提醒', body: '您借阅的《Java编程思想》将于3天后到期，请及时归还或续借。', type: 'borrow', read: false, createTime: '2025-03-10 08:00:00' },
  { id: 3, userId: 1, title: '证书审核通知', body: '您申请的「全国大学生数学建模竞赛」证书已审核通过。', type: 'certificate', read: true, createTime: '2024-11-01 10:30:00' }
];

// 权限定义
const permissionDefs = [
  { key: 'student', label: '学生', role: 0, perms: ['view_schedule', 'view_score', 'borrow_book', 'publish_news', 'join_activity'] },
  { key: 'monitor', label: '班长', role: 1, perms: ['view_schedule', 'view_score', 'borrow_book', 'publish_news', 'join_activity', 'publish_activity', 'review_certificate'] },
  { key: 'admin', label: '管理员', role: 2, perms: ['*'] }
];

// MD5 简化实现（仅用于演示；生产应改为 bcrypt/argon2）
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function hmacSign(payload) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
}

// 生成带 HMAC 签名与过期时间的 token
function generateToken(userId, username, role) {
  const payload = b64url(JSON.stringify({
    userId,
    username,
    role,
    exp: Date.now() + 86400000
  }));
  return `${payload}.${hmacSign(payload)}`;
}

// 校验签名与过期时间
function parseToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!payload || !signature) return null;
    const expected = hmacSign(payload);
    if (signature.length !== expected.length) return null;
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
}

const server = http.createServer((req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // 获取请求体
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    let requestData = {};
    try {
      requestData = body ? JSON.parse(body) : {};
    } catch (e) {
      requestData = {};
    }

    // 获取 token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const tokenData = parseToken(token);

    // 路由处理
    if (path === '/api/user/login' && method === 'POST') {
      // 登录
      const { studentId, password } = requestData;
      const user = users.find(u => u.studentId === studentId);
      if (!user) {
        res.end(JSON.stringify({ code: 500, message: '用户不存在' }));
        return;
      }
      const encryptedPassword = md5(password);
      if (user.password !== encryptedPassword) {
        res.end(JSON.stringify({ code: 500, message: '密码错误' }));
        return;
      }
      const newToken = generateToken(user.id, user.username, user.role);
      res.end(JSON.stringify({
        code: 200,
        message: '登录成功',
        data: {
          token: newToken,
          userId: user.id,
          username: user.username,
          studentId: user.studentId,
          role: user.role,
          avatar: user.avatar
        }
      }));
    } else if (path === '/api/user/register' && method === 'POST') {
      // 注册
      const { studentId, username, password } = requestData;
      if (!studentId || !username || !password) {
        res.end(JSON.stringify({ code: 500, message: '学号、用户名和密码不能为空' }));
        return;
      }
      if (String(password).length < 6) {
        res.end(JSON.stringify({ code: 500, message: '密码至少 6 位' }));
        return;
      }
      if (users.find(u => u.studentId === studentId)) {
        res.end(JSON.stringify({ code: 500, message: '该学号已被注册' }));
        return;
      }
      const nextId = users.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
      const newUser = {
        id: nextId,
        studentId,
        username,
        password: md5(password),
        role: 0,
        status: 1
      };
      users.push(newUser);
      userCredits.push({ userId: nextId, secondClassScore: 0, integrityScore: 100 });
      notifications.push({
        id: notifications.length ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
        userId: nextId,
        title: '欢迎使用校园服务平台',
        body: '注册成功！完善个人资料后即可使用课程表、图书馆等全部功能。',
        type: 'system',
        read: false,
        createTime: new Date().toISOString()
      });
      res.end(JSON.stringify({ code: 200, message: '注册成功', data: { ...newUser, password: undefined } }));
    } else if (path === '/api/user/info' && method === 'GET') {
      // 获取用户信息
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const user = users.find(u => u.id === tokenData.userId);
      if (!user) {
        res.end(JSON.stringify({ code: 500, message: '用户不存在' }));
        return;
      }
      res.end(JSON.stringify({ code: 200, data: { ...user, password: undefined } }));
    } else if (path === '/api/course/schedule' && method === 'GET') {
      // 获取课程表（按学生选课过滤）
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const mySelected = selectedCourses
        .filter(s => s.userId === tokenData.userId)
        .map(s => s.courseId);
      // 管理员或未选课时返回全部，便于演示
      const list = (tokenData.role === 2 || mySelected.length === 0)
        ? courses
        : courses.filter(c => mySelected.includes(c.id));
      res.end(JSON.stringify({ code: 200, data: list }));
    } else if (path === '/api/score/list' && method === 'GET') {
      // 获取成绩
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const userScores = scores.filter(s => s.studentId === tokenData.userId);
      res.end(JSON.stringify({ code: 200, data: userScores }));
    } else if (path === '/api/score/gpa' && method === 'GET') {
      // 获取GPA
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const userScores = scores.filter(s => s.studentId === tokenData.userId);
      const totalGPA = userScores.reduce((sum, s) => sum + s.gpa * s.credit, 0);
      const totalCredits = userScores.reduce((sum, s) => sum + s.credit, 0);
      const totalScoreSum = userScores.reduce((sum, s) => sum + s.totalScore, 0);
      res.end(JSON.stringify({
        code: 200,
        data: {
          averageGPA: totalCredits > 0 ? Math.round(totalGPA / totalCredits * 100) / 100 : 0,
          totalCredits,
          passedCourses: userScores.length,
          averageScore: userScores.length > 0 ? Math.round(totalScoreSum / userScores.length) : 0
        }
      }));
    } else if (path === '/api/score/semesters' && method === 'GET') {
      // 获取学期列表
      res.end(JSON.stringify({ code: 200, data: ['2024-2025-2', '2024-2025-1', '2023-2024-2'] }));
    } else if (path === '/api/book/list' && method === 'GET') {
      // 获取图书列表
      const { keyword, category } = parsedUrl.query;
      let filteredBooks = [...books];
      if (keyword) {
        filteredBooks = filteredBooks.filter(b => b.bookName.includes(keyword) || b.author.includes(keyword));
      }
      if (category) {
        filteredBooks = filteredBooks.filter(b => b.category === category);
      }
      res.end(JSON.stringify({
        code: 200,
        data: {
          total: filteredBooks.length,
          records: filteredBooks,
          pageNum: 1,
          pageSize: 10
        }
      }));
    } else if (path.match(/^\/api\/book\/\d+$/) && method === 'GET') {
      // 获取图书详情
      const bookId = parseInt(path.split('/').pop());
      const book = books.find(b => b.id === bookId);
      if (!book) {
        res.end(JSON.stringify({ code: 500, message: '图书不存在' }));
        return;
      }
      res.end(JSON.stringify({ code: 200, data: book }));
    } else if (path.match(/^\/api\/book\/borrow\/\d+$/) && method === 'POST') {
      // 借阅图书
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const borrowBookId = parseInt(path.split('/').pop());
      const borrowBook = books.find(b => b.id === borrowBookId);
      if (!borrowBook) {
        res.end(JSON.stringify({ code: 500, message: '图书不存在' }));
        return;
      }
      if (borrowBook.availableCopies <= 0) {
        res.end(JSON.stringify({ code: 500, message: '图书已被借完' }));
        return;
      }
      // 检查用户借阅数量
      const userBorrowCount = borrowRecords.filter(r => r.userId === tokenData.userId && r.status === 1).length;
      if (userBorrowCount >= 5) {
        res.end(JSON.stringify({ code: 500, message: '借阅数量已达上限（最多5本）' }));
        return;
      }
      // 创建借阅记录
      const now = new Date();
      const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const fmt = (d) => d.toISOString().slice(0, 10);
      const newBorrowRecord = {
        id: borrowRecords.length ? Math.max(...borrowRecords.map(r => r.id)) + 1 : 1,
        userId: tokenData.userId,
        bookId: borrowBookId,
        bookName: borrowBook.bookName,
        author: borrowBook.author,
        borrowDate: fmt(now),
        dueDate: fmt(due),
        returnDate: null,
        status: 1,
        renewCount: 0
      };
      borrowRecords.push(newBorrowRecord);
      // 更新库存
      borrowBook.availableCopies--;
      res.end(JSON.stringify({ code: 200, message: '借阅成功' }));
    } else if (path.match(/^\/api\/book\/return\/\d+$/) && method === 'POST') {
      // 归还图书
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const returnRecordId = parseInt(path.split('/').pop());
      const returnRecord = borrowRecords.find(r => r.id === returnRecordId);
      if (!returnRecord) {
        res.end(JSON.stringify({ code: 500, message: '借阅记录不存在' }));
        return;
      }
      if (returnRecord.userId !== tokenData.userId) {
        res.end(JSON.stringify({ code: 403, message: '无权操作此记录' }));
        return;
      }
      if (returnRecord.status !== 1) {
        res.end(JSON.stringify({ code: 500, message: '该书已归还' }));
        return;
      }
      // 更新借阅记录
      returnRecord.returnDate = new Date().toISOString();
      returnRecord.status = 2;
      // 更新库存
      const returnBook = books.find(b => b.id === returnRecord.bookId);
      if (returnBook) {
        returnBook.availableCopies++;
      }
      res.end(JSON.stringify({ code: 200, message: '归还成功' }));
    } else if (path.match(/^\/api\/book\/renew\/\d+$/) && method === 'POST') {
      // 续借图书
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const renewRecordId = parseInt(path.split('/').pop());
      const renewRecord = borrowRecords.find(r => r.id === renewRecordId);
      if (!renewRecord) {
        res.end(JSON.stringify({ code: 500, message: '借阅记录不存在' }));
        return;
      }
      if (renewRecord.userId !== tokenData.userId) {
        res.end(JSON.stringify({ code: 403, message: '无权操作此记录' }));
        return;
      }
      if (renewRecord.status !== 1) {
        res.end(JSON.stringify({ code: 500, message: '该书已归还，无法续借' }));
        return;
      }
      if (renewRecord.renewCount >= 2) {
        res.end(JSON.stringify({ code: 500, message: '续借次数已达上限（最多2次）' }));
        return;
      }
      // 续借15天
      const dueDate = new Date(renewRecord.dueDate);
      dueDate.setDate(dueDate.getDate() + 15);
      renewRecord.dueDate = dueDate.toISOString();
      renewRecord.renewCount++;
      res.end(JSON.stringify({ code: 200, message: '续借成功' }));
    } else if (path === '/api/book/borrow-records' && method === 'GET') {
      // 获取借阅记录
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const userRecords = borrowRecords.filter(r => r.userId === tokenData.userId);
      res.end(JSON.stringify({ code: 200, data: userRecords }));
    } else if (path === '/api/news/list' && method === 'GET') {
      // 获取资讯列表
      const { category } = parsedUrl.query;
      let filteredNews = [...news];
      if (category) {
        filteredNews = filteredNews.filter(n => n.category === parseInt(category));
      }
      res.end(JSON.stringify({
        code: 200,
        data: {
          total: filteredNews.length,
          records: filteredNews,
          pageNum: 1,
          pageSize: 10
        }
      }));
    } else if (path.match(/^\/api\/news\/\d+$/) && method === 'GET') {
      // 获取资讯详情
      const newsId = parseInt(path.split('/').pop());
      const newsItem = news.find(n => n.id === newsId);
      if (!newsItem) {
        res.end(JSON.stringify({ code: 500, message: '资讯不存在' }));
        return;
      }
      res.end(JSON.stringify({ code: 200, data: newsItem }));
    } else if (path === '/api/lost-found/list' && method === 'GET') {
      // 获取失物招领列表
      const { type } = parsedUrl.query;
      let filteredList = [...lostFound];
      if (type) {
        filteredList = filteredList.filter(l => l.type === parseInt(type));
      }
      res.end(JSON.stringify({
        code: 200,
        data: {
          total: filteredList.length,
          records: filteredList,
          pageNum: 1,
          pageSize: 10
        }
      }));
    } else if (path === '/api/second-class/list' && method === 'GET') {
      // 获取第二课堂活动列表
      const { activityType } = parsedUrl.query;
      let filteredActivities = [...secondClassActivities];
      if (activityType) {
        filteredActivities = filteredActivities.filter(a => a.activityType === parseInt(activityType));
      }
      res.end(JSON.stringify({
        code: 200,
        data: {
          total: filteredActivities.length,
          records: filteredActivities,
          pageNum: 1,
          pageSize: 10
        }
      }));
    } else if (path.match(/^\/api\/second-class\/\d+$/) && method === 'GET') {
      // 获取活动详情
      const activityId = parseInt(path.split('/').pop());
      const activity = secondClassActivities.find(a => a.id === activityId);
      if (!activity) {
        res.end(JSON.stringify({ code: 500, message: '活动不存在' }));
        return;
      }
      res.end(JSON.stringify({ code: 200, data: activity }));
    } else if (path === '/api/second-class/publish' && method === 'POST') {
      // 发布活动（管理员）
      if (!tokenData || tokenData.role < 1) {
        res.end(JSON.stringify({ code: 403, message: '无权限发布活动' }));
        return;
      }
      const newActivity = {
        id: secondClassActivities.length + 1,
        ...requestData,
        publisherId: tokenData.userId,
        currentParticipants: 0,
        status: 0
      };
      secondClassActivities.push(newActivity);
      res.end(JSON.stringify({ code: 200, message: '发布成功', data: newActivity }));
    } else if (path.match(/^\/api\/second-class\/join\/\d+$/) && method === 'POST') {
      // 报名活动
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const activityId = parseInt(path.split('/').pop());
      const activity = secondClassActivities.find(a => a.id === activityId);
      if (!activity) {
        res.end(JSON.stringify({ code: 500, message: '活动不存在' }));
        return;
      }
      // 检查是否已报名
      const existingRecord = secondClassRecords.find(r => r.userId === tokenData.userId && r.activityId === activityId);
      if (existingRecord) {
        res.end(JSON.stringify({ code: 500, message: '已报名该活动' }));
        return;
      }
      // 创建记录
      const newRecord = {
        id: secondClassRecords.length + 1,
        userId: tokenData.userId,
        activityId: activityId,
        score: activity.score,
        status: 0,
        createTime: new Date().toISOString()
      };
      secondClassRecords.push(newRecord);
      activity.currentParticipants++;
      res.end(JSON.stringify({ code: 200, message: '报名成功' }));
    } else if (path === '/api/second-class/records' && method === 'GET') {
      // 获取用户参与记录
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const userRecords = secondClassRecords.filter(r => r.userId === tokenData.userId);
      // 添加活动名称
      const recordsWithNames = userRecords.map(r => {
        const activity = secondClassActivities.find(a => a.id === r.activityId);
        return { ...r, activityName: activity?.activityName || '活动' };
      });
      res.end(JSON.stringify({ code: 200, data: recordsWithNames }));
    } else if (path === '/api/second-class/credit' && method === 'GET') {
      // 获取用户积分
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const userCredit = userCredits.find(c => c.userId === tokenData.userId);
      if (!userCredit) {
        res.end(JSON.stringify({
          code: 200,
          data: { secondClassScore: 0, integrityScore: 100, targetScore: 120, reachedTarget: false }
        }));
        return;
      }
      res.end(JSON.stringify({
        code: 200,
        data: { ...userCredit, targetScore: 120, reachedTarget: userCredit.secondClassScore >= 120 }
      }));
    } else if (path === '/api/second-class/restore-integrity' && method === 'POST') {
      // 恢复诚信值
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      let userCredit = userCredits.find(c => c.userId === tokenData.userId);
      if (!userCredit) {
        userCredit = { userId: tokenData.userId, secondClassScore: 0, integrityScore: 100 };
        userCredits.push(userCredit);
      }
      if (userCredit.integrityScore >= 100) {
        res.end(JSON.stringify({ code: 500, message: '诚信值已满，无需恢复' }));
        return;
      }
      userCredit.integrityScore++;
      res.end(JSON.stringify({ code: 200, message: '诚信值恢复成功，当前诚信值：' + userCredit.integrityScore }));
    } else if (path === '/api/news/publish' && method === 'POST') {
      // 发布资讯（所有用户可发布）
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const newNews = {
        id: news.length + 1,
        ...requestData,
        publisherId: tokenData.userId,
        source: tokenData.username,
        viewCount: 0,
        status: 1,
        publishTime: new Date().toISOString()
      };
      news.push(newNews);
      res.end(JSON.stringify({ code: 200, message: '发布成功', data: newNews }));
    } else if (path === '/api/certificate/levels' && method === 'GET') {
      // 获取证书等级
      res.end(JSON.stringify({ code: 200, data: certificateLevels }));
    } else if (path === '/api/certificate/types' && method === 'GET') {
      // 获取证书类型
      res.end(JSON.stringify({ code: 200, data: certificateTypes }));
    } else if (path === '/api/certificate/apply' && method === 'POST') {
      // 申请证书
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const levelScore = certificateLevels.find(l => l.value === requestData.level);
      if (!levelScore) {
        res.end(JSON.stringify({ code: 500, message: '无效的证书等级' }));
        return;
      }
      const newCert = {
        id: certificates.length + 1,
        userId: tokenData.userId,
        certificateName: requestData.certificateName,
        level: requestData.level,
        score: levelScore.score,
        certificateType: requestData.certificateType,
        issuer: requestData.issuer,
        obtainDate: requestData.obtainDate,
        certificateImage: requestData.certificateImage,
        status: 0,
        remark: null,
        reviewerId: null,
        reviewTime: null,
        createTime: new Date().toISOString()
      };
      certificates.push(newCert);
      res.end(JSON.stringify({ code: 200, message: '申请成功，等待审核', data: newCert }));
    } else if (path === '/api/certificate/my' && method === 'GET') {
      // 查询我的证书
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const userCerts = certificates.filter(c => c.userId === tokenData.userId);
      res.end(JSON.stringify({ code: 200, data: userCerts }));
    } else if (path === '/api/certificate/list' && method === 'GET') {
      // 查询证书列表（管理员）
      if (!tokenData || tokenData.role < 1) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const { status } = parsedUrl.query;
      let filteredCerts = [...certificates];
      if (status !== undefined) {
        filteredCerts = filteredCerts.filter(c => c.status === parseInt(status));
      }
      res.end(JSON.stringify({
        code: 200,
        data: {
          total: filteredCerts.length,
          records: filteredCerts,
          pageNum: 1,
          pageSize: 10
        }
      }));
    } else if (path.match(/^\/api\/certificate\/review\/\d+$/) && method === 'POST') {
      // 审核证书（管理员）
      if (!tokenData || tokenData.role < 1) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const certId = parseInt(path.split('/').pop());
      const cert = certificates.find(c => c.id === certId);
      if (!cert) {
        res.end(JSON.stringify({ code: 500, message: '证书申请不存在' }));
        return;
      }
      if (cert.status !== 0) {
        res.end(JSON.stringify({ code: 500, message: '该证书已审核' }));
        return;
      }
      cert.status = requestData.status;
      cert.remark = requestData.remark;
      cert.reviewerId = tokenData.userId;
      cert.reviewTime = new Date().toISOString();
      // 如果审核通过，增加积分
      if (requestData.status === 1) {
        let userCredit = userCredits.find(c => c.userId === cert.userId);
        if (!userCredit) {
          userCredit = { userId: cert.userId, secondClassScore: 0, integrityScore: 100 };
          userCredits.push(userCredit);
        }
        userCredit.secondClassScore += cert.score;
      }
      res.end(JSON.stringify({ code: 200, message: requestData.status === 1 ? '审核通过' : '审核拒绝' }));
    } else if (path === '/api/user/update' && method === 'PUT') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const user = users.find(u => u.id === tokenData.userId);
      if (!user) {
        res.end(JSON.stringify({ code: 500, message: '用户不存在' }));
        return;
      }
      const { username, phone, email, college, major, className, gender, avatar } = requestData;
      if (username) user.username = username;
      if (phone !== undefined) user.phone = phone;
      if (email !== undefined) user.email = email;
      if (college !== undefined) user.college = college;
      if (major !== undefined) user.major = major;
      if (className !== undefined) user.className = className;
      if (gender !== undefined) user.gender = gender;
      if (avatar !== undefined) user.avatar = avatar;
      res.end(JSON.stringify({ code: 200, message: '更新成功', data: { ...user, password: undefined } }));
    } else if (path === '/api/user/change-password' && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const user = users.find(u => u.id === tokenData.userId);
      if (!user) {
        res.end(JSON.stringify({ code: 500, message: '用户不存在' }));
        return;
      }
      const { oldPassword, newPassword } = requestData;
      if (!oldPassword || !newPassword) {
        res.end(JSON.stringify({ code: 500, message: '请输入原密码和新密码' }));
        return;
      }
      if (user.password !== md5(oldPassword)) {
        res.end(JSON.stringify({ code: 500, message: '原密码错误' }));
        return;
      }
      if (String(newPassword).length < 6) {
        res.end(JSON.stringify({ code: 500, message: '新密码至少 6 位' }));
        return;
      }
      user.password = md5(newPassword);
      res.end(JSON.stringify({ code: 200, message: '密码修改成功，请重新登录' }));
    } else if (path === '/api/course/list' && method === 'GET') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      res.end(JSON.stringify({ code: 200, data: courses }));
    } else if (path === '/api/course/current-semester' && method === 'GET') {
      res.end(JSON.stringify({ code: 200, data: '2024-2025-2' }));
    } else if (path.match(/^\/api\/course\/select\/\d+$/) && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const courseId = parseInt(path.split('/').pop());
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        res.end(JSON.stringify({ code: 500, message: '课程不存在' }));
        return;
      }
      const exists = selectedCourses.find(s => s.userId === tokenData.userId && s.courseId === courseId);
      if (exists) {
        res.end(JSON.stringify({ code: 500, message: '已选修该课程' }));
        return;
      }
      selectedCourses.push({
        id: selectedCourses.length + 1,
        userId: tokenData.userId,
        courseId,
        semester: course.semester,
        createTime: new Date().toISOString()
      });
      res.end(JSON.stringify({ code: 200, message: '选课成功' }));
    } else if (path.match(/^\/api\/course\/drop\/\d+$/) && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const courseId = parseInt(path.split('/').pop());
      const idx = selectedCourses.findIndex(s => s.userId === tokenData.userId && s.courseId === courseId);
      if (idx === -1) {
        res.end(JSON.stringify({ code: 500, message: '未选修该课程' }));
        return;
      }
      selectedCourses.splice(idx, 1);
      res.end(JSON.stringify({ code: 200, message: '退课成功' }));
    } else if (path === '/api/book/reservations' && method === 'GET') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const mine = bookReservations.filter(r => r.userId === tokenData.userId);
      res.end(JSON.stringify({ code: 200, data: mine }));
    } else if (path.match(/^\/api\/book\/reserve\/\d+$/) && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const bookId = parseInt(path.split('/').pop());
      const book = books.find(b => b.id === bookId);
      if (!book) {
        res.end(JSON.stringify({ code: 500, message: '图书不存在' }));
        return;
      }
      const already = bookReservations.find(r => r.userId === tokenData.userId && r.bookId === bookId && r.status === 0);
      if (already) {
        res.end(JSON.stringify({ code: 500, message: '已预约该图书' }));
        return;
      }
      const reservation = {
        id: bookReservations.length + 1,
        userId: tokenData.userId,
        bookId,
        bookName: book.bookName,
        status: 0,
        createTime: new Date().toISOString()
      };
      bookReservations.push(reservation);
      res.end(JSON.stringify({ code: 200, message: '预约成功', data: reservation }));
    } else if (path.match(/^\/api\/lost-found\/\d+\/status$/) && method === 'PUT') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const parts = path.split('/');
      const id = parseInt(parts[3]);
      const item = lostFound.find(l => l.id === id);
      if (!item) {
        res.end(JSON.stringify({ code: 500, message: '信息不存在' }));
        return;
      }
      if (item.userId !== tokenData.userId && tokenData.role < 1) {
        res.end(JSON.stringify({ code: 403, message: '无权操作' }));
        return;
      }
      item.status = requestData.status;
      res.end(JSON.stringify({ code: 200, message: '状态已更新' }));
    } else if (path.match(/^\/api\/lost-found\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/').pop());
      const item = lostFound.find(l => l.id === id);
      if (!item) {
        res.end(JSON.stringify({ code: 500, message: '信息不存在' }));
        return;
      }
      res.end(JSON.stringify({ code: 200, data: item }));
    } else if (path.match(/^\/api\/lost-found\/\d+$/) && method === 'DELETE') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const id = parseInt(path.split('/').pop());
      const idx = lostFound.findIndex(l => l.id === id);
      if (idx === -1) {
        res.end(JSON.stringify({ code: 500, message: '信息不存在' }));
        return;
      }
      if (lostFound[idx].userId !== tokenData.userId && tokenData.role < 1) {
        res.end(JSON.stringify({ code: 403, message: '无权操作' }));
        return;
      }
      lostFound.splice(idx, 1);
      res.end(JSON.stringify({ code: 200, message: '删除成功' }));
    } else if (path === '/api/lost-found/publish' && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const newItem = {
        id: lostFound.length ? Math.max(...lostFound.map(l => l.id)) + 1 : 1,
        title: requestData.title,
        description: requestData.description,
        type: requestData.type || 1,
        category: requestData.category || 1,
        location: requestData.location,
        contact: requestData.contact,
        userId: tokenData.userId,
        status: 0,
        createTime: new Date().toISOString()
      };
      lostFound.push(newItem);
      res.end(JSON.stringify({ code: 200, message: '发布成功', data: newItem }));
    } else if (path.match(/^\/api\/second-class\/cancel\/\d+$/) && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const activityId = parseInt(path.split('/').pop());
      const idx = secondClassRecords.findIndex(r => r.userId === tokenData.userId && r.activityId === activityId);
      if (idx === -1) {
        res.end(JSON.stringify({ code: 500, message: '未报名该活动' }));
        return;
      }
      const activity = secondClassActivities.find(a => a.id === activityId);
      if (activity && activity.currentParticipants > 0) activity.currentParticipants--;
      // 取消报名扣诚信值
      let userCredit = userCredits.find(c => c.userId === tokenData.userId);
      if (!userCredit) {
        userCredit = { userId: tokenData.userId, secondClassScore: 0, integrityScore: 100 };
        userCredits.push(userCredit);
      }
      userCredit.integrityScore = Math.max(0, userCredit.integrityScore - 5);
      secondClassRecords.splice(idx, 1);
      res.end(JSON.stringify({ code: 200, message: '取消报名成功，诚信值 -5' }));
    } else if (path.match(/^\/api\/second-class\/check-in\/\d+$/) && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const activityId = parseInt(path.split('/').pop());
      const record = secondClassRecords.find(r => r.userId === tokenData.userId && r.activityId === activityId);
      if (!record) {
        res.end(JSON.stringify({ code: 500, message: '请先报名该活动' }));
        return;
      }
      if (record.status !== 0) {
        res.end(JSON.stringify({ code: 500, message: '当前状态无法签到' }));
        return;
      }
      record.status = 1;
      res.end(JSON.stringify({ code: 200, message: '签到成功' }));
    } else if (path.match(/^\/api\/second-class\/complete\/\d+$/) && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const activityId = parseInt(path.split('/').pop());
      const record = secondClassRecords.find(r => r.userId === tokenData.userId && r.activityId === activityId);
      if (!record) {
        res.end(JSON.stringify({ code: 500, message: '未找到参与记录' }));
        return;
      }
      if (record.status !== 1) {
        res.end(JSON.stringify({ code: 500, message: '需签到后才能完成活动' }));
        return;
      }
      record.status = 2;
      let userCredit = userCredits.find(c => c.userId === tokenData.userId);
      if (!userCredit) {
        userCredit = { userId: tokenData.userId, secondClassScore: 0, integrityScore: 100 };
        userCredits.push(userCredit);
      }
      userCredit.secondClassScore += record.score;
      res.end(JSON.stringify({ code: 200, message: '活动完成，积分 +' + record.score }));
    } else if (path === '/api/permission/defs' && method === 'GET') {
      res.end(JSON.stringify({ code: 200, data: permissionDefs }));
    } else if (path === '/api/permission/my' && method === 'GET') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const def = permissionDefs.find(p => p.role === tokenData.role) || permissionDefs[0];
      res.end(JSON.stringify({ code: 200, data: def }));
    } else if (path === '/api/notifications' && method === 'GET') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      const list = notifications.filter(n => n.userId === tokenData.userId);
      const unread = list.filter(n => !n.read).length;
      res.end(JSON.stringify({ code: 200, data: { list, records: list, total: list.length, unread } }));
    } else if (path === '/api/notifications/read-all' && method === 'POST') {
      if (!tokenData) {
        res.end(JSON.stringify({ code: 401, message: '未登录' }));
        return;
      }
      notifications.forEach(n => {
        if (n.userId === tokenData.userId) n.read = true;
      });
      res.end(JSON.stringify({ code: 200, message: '已全部标记为已读' }));
    } else if (path === '/api/admin/users' && method === 'GET') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const list = users.map(u => ({ ...u, password: undefined }));
      res.end(JSON.stringify({ code: 200, data: list }));
    } else if (path.match(/^\/api\/admin\/users\/\d+\/status$/) && method === 'PUT') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const id = parseInt(path.split('/')[4]);
      const user = users.find(u => u.id === id);
      if (!user) {
        res.end(JSON.stringify({ code: 500, message: '用户不存在' }));
        return;
      }
      user.status = requestData.status;
      res.end(JSON.stringify({ code: 200, message: '状态已更新' }));
    } else if (path.match(/^\/api\/admin\/users\/\d+\/reset-password$/) && method === 'POST') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const id = parseInt(path.split('/')[4]);
      const user = users.find(u => u.id === id);
      if (!user) {
        res.end(JSON.stringify({ code: 500, message: '用户不存在' }));
        return;
      }
      user.password = md5('123456');
      res.end(JSON.stringify({ code: 200, message: '密码已重置为 123456' }));
    } else if (path.match(/^\/api\/admin\/users\/\d+\/role$/) && method === 'PUT') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const id = parseInt(path.split('/')[4]);
      const user = users.find(u => u.id === id);
      if (!user) {
        res.end(JSON.stringify({ code: 500, message: '用户不存在' }));
        return;
      }
      user.role = Number(requestData.role);
      res.end(JSON.stringify({ code: 200, message: '角色已更新' }));
    } else if (path === '/api/admin/scores' && method === 'GET') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      res.end(JSON.stringify({ code: 200, data: scores }));
    } else if (path === '/api/admin/scores' && method === 'POST') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const exists = scores.find(s => s.studentId === requestData.studentId && s.courseId === requestData.courseId);
      const recalc = (s) => {
        s.totalScore = (s.dailyScore || 0) * 0.3 + (s.midtermScore || 0) * 0.2 + (s.finalScore || 0) * 0.5;
        s.totalScore = Math.round(s.totalScore * 10) / 10;
        const t = s.totalScore;
        s.gpa = t >= 90 ? 4.0 : t >= 80 ? 3.0 : t >= 70 ? 2.0 : t >= 60 ? 1.0 : 0;
      };
      if (exists) {
        Object.assign(exists, requestData);
        recalc(exists);
        res.end(JSON.stringify({ code: 200, message: '成绩已更新' }));
        return;
      }
      const newScore = {
        id: scores.length ? Math.max(...scores.map(s => s.id)) + 1 : 1,
        ...requestData
      };
      recalc(newScore);
      scores.push(newScore);
      res.end(JSON.stringify({ code: 200, message: '成绩已保存', data: newScore }));
    } else if (path === '/api/admin/content' && method === 'GET') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const newsItems = news.map(n => ({ ...n, type: 'news', hidden: n.status === 0 }));
      const lostItems = lostFound.map(l => ({ ...l, type: 'lost-found', hidden: l.status === 2 }));
      res.end(JSON.stringify({ code: 200, data: [...newsItems, ...lostItems] }));
    } else if (path.match(/^\/api\/admin\/content\/[^/]+\/\d+\/visibility$/) && method === 'PUT') {
      if (!tokenData || tokenData.role < 2) {
        res.end(JSON.stringify({ code: 403, message: '无权限' }));
        return;
      }
      const parts = path.split('/');
      const contentType = parts[4];
      const id = parseInt(parts[5]);
      if (contentType === 'news') {
        const item = news.find(n => n.id === id);
        if (item) item.status = requestData.hidden ? 0 : 1;
      } else if (contentType === 'lost-found') {
        const item = lostFound.find(l => l.id === id);
        if (item) item.status = requestData.hidden ? 2 : 0;
      }
      res.end(JSON.stringify({ code: 200, message: '可见性已更新' }));
    } else {
      res.end(JSON.stringify({ code: 404, message: '接口不存在' }));
    }
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log('============================================');
  console.log('   校园综合服务App后端启动成功！');
  console.log('   访问地址: http://localhost:' + PORT);
  console.log('============================================');
});
