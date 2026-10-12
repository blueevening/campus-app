// 浏览器内 mock API：静态托管时无需 Node 后端
// 与 campus-app-backend/server.js 数据/接口对齐

const users = [
  { id: 1, studentId: '2021001', passwordPlain: '123456', username: '张三', role: 0, status: 1, avatar: null, college: '人工智能学院', major: '移动互联应用技术' },
  { id: 2, studentId: '2021002', passwordPlain: '123456', username: '李四', role: 0, status: 1, avatar: null, college: '人工智能学院', major: '移动互联应用技术' },
  { id: 7, studentId: 'admin', passwordPlain: '123456', username: '系统管理员', role: 2, status: 1, avatar: null, college: '信息中心', major: null }
]

// 权限定义
const PERMISSION_DEFS = [
  { value: 'publish_activity', label: '发布第二课堂活动' },
  { value: 'review_certificate', label: '审核证书申请' },
  { value: 'manage_content', label: '内容管理（资讯/失物）' }
]

// 班长（role=1）默认拥有的权限（管理员在用户管理中任命）
const MONITOR_PERMISSIONS = [
  'publish_activity',
  'review_certificate',
  'manage_content'
]

function isAdminUser(tokenData) {
  return !!tokenData && Number(tokenData.role) === 2
}

function isMonitorUser(tokenData) {
  return !!tokenData && Number(tokenData.role) === 1
}

function hasPermission(tokenData, permission) {
  if (!tokenData) return false
  if (isAdminUser(tokenData)) return true
  if (isMonitorUser(tokenData) && MONITOR_PERMISSIONS.includes(permission)) return true
  return false
}

function requireAdmin(tokenData) {
  if (!tokenData) return unauthorized()
  if (!isAdminUser(tokenData)) {
    return fail('权限不足：仅管理员可执行此操作', 403)
  }
  return null
}

function requirePermission(tokenData, permission) {
  if (!tokenData) return unauthorized()
  if (!hasPermission(tokenData, permission)) {
    return fail('权限不足：请联系管理员任命班长或开通账号权限', 403)
  }
  return null
}

// 通知
const notifications = []
function notify(targetUserId, title, body) {
  notifications.unshift({
    id: notifications.reduce((m, n) => Math.max(m, n.id), 0) + 1,
    userId: targetUserId === '*' ? null : targetUserId,
    broadcast: targetUserId === '*',
    title,
    body: body || '',
    read: false,
    readBy: [],
    createTime: new Date().toISOString()
  })
}

// 图书预约
const bookReservations = []

const courses = [
  { id: 1, courseName: '移动应用开发', courseCode: 'CS2001', teacherName: '刘老师', credit: 4, location: '教学楼A301', classTime: '[{"day":1,"start":1,"end":2},{"day":3,"start":3,"end":4}]', semester: '2024-2025-2' },
  { id: 2, courseName: 'Java程序设计', courseCode: 'CS2002', teacherName: '刘老师', credit: 3, location: '教学楼B201', classTime: '[{"day":2,"start":1,"end":2},{"day":4,"start":5,"end":6}]', semester: '2024-2025-2' },
  { id: 3, courseName: '数据库原理与应用', courseCode: 'CS2003', teacherName: '王老师', credit: 3, location: '实验楼C101', classTime: '[{"day":1,"start":3,"end":4},{"day":5,"start":1,"end":2}]', semester: '2024-2025-2' },
  { id: 4, courseName: 'Web前端开发', courseCode: 'CS2004', teacherName: '李老师', credit: 4, location: '实验楼C202', classTime: '[{"day":2,"start":3,"end":4},{"day":4,"start":1,"end":2}]', semester: '2024-2025-2' },
  { id: 5, courseName: '计算机网络', courseCode: 'CS2005', teacherName: '赵老师', credit: 3, location: '教学楼A201', classTime: '[{"day":3,"start":1,"end":2},{"day":5,"start":3,"end":4}]', semester: '2024-2025-2' },
  { id: 6, courseName: '大学英语', courseCode: 'GE1001', teacherName: '陈老师', credit: 2, location: '教学楼D105', classTime: '[{"day":1,"start":5,"end":6},{"day":3,"start":5,"end":6}]', semester: '2024-2025-2' },
  { id: 7, courseName: '体育（篮球）', courseCode: 'PE2001', teacherName: '周老师', credit: 1, location: '体育馆', classTime: '[{"day":4,"start":7,"end":8}]', semester: '2024-2025-2' },
  { id: 8, courseName: '形势与政策', courseCode: 'GE1002', teacherName: '吴老师', credit: 1, location: '教学楼B302', classTime: '[{"day":5,"start":5,"end":6}]', semester: '2024-2025-2' }
]

const scores = [
  { id: 1, studentId: 1, courseId: 1, courseName: '移动应用开发', courseCode: 'CS2001', credit: 4, dailyScore: 85, midtermScore: 78, finalScore: 82, totalScore: 82, gpa: 3.2, semester: '2024-2025-2' },
  { id: 2, studentId: 1, courseId: 2, courseName: 'Java程序设计', courseCode: 'CS2002', credit: 3, dailyScore: 90, midtermScore: 88, finalScore: 92, totalScore: 90, gpa: 4.0, semester: '2024-2025-2' },
  { id: 3, studentId: 1, courseId: 3, courseName: '数据库原理与应用', courseCode: 'CS2003', credit: 3, dailyScore: 78, midtermScore: 75, finalScore: 80, totalScore: 78, gpa: 2.8, semester: '2024-2025-2' },
  { id: 4, studentId: 1, courseId: 4, courseName: 'Web前端开发', courseCode: 'CS2004', credit: 4, dailyScore: 92, midtermScore: 90, finalScore: 94, totalScore: 93, gpa: 4.0, semester: '2024-2025-2' },
  { id: 5, studentId: 1, courseId: 5, courseName: '计算机网络', courseCode: 'CS2005', credit: 3, dailyScore: 80, midtermScore: 82, finalScore: 85, totalScore: 83, gpa: 3.5, semester: '2024-2025-2' },
  { id: 6, studentId: 1, courseId: 6, courseName: '大学英语', courseCode: 'GE1001', credit: 2, dailyScore: 88, midtermScore: 85, finalScore: 86, totalScore: 86, gpa: 3.6, semester: '2024-2025-2' }
]

const books = [
  { id: 1, bookName: 'Java编程思想', author: 'Bruce Eckel', isbn: '9787111213826', publisher: '机械工业出版社', category: '计算机', totalCopies: 5, availableCopies: 3, location: '图书馆3楼A区', status: 1 },
  { id: 2, bookName: 'Android开发艺术探索', author: '任玉刚', isbn: '9787121269394', publisher: '电子工业出版社', category: '计算机', totalCopies: 3, availableCopies: 2, location: '图书馆3楼A区', status: 1 },
  { id: 3, bookName: '数据结构与算法分析', author: 'Mark Allen Weiss', isbn: '9787111528340', publisher: '机械工业出版社', category: '计算机', totalCopies: 4, availableCopies: 4, location: '图书馆3楼B区', status: 1 },
  { id: 4, bookName: '红楼梦', author: '曹雪芹', isbn: '9787020002207', publisher: '人民文学出版社', category: '文学', totalCopies: 10, availableCopies: 8, location: '图书馆2楼C区', status: 1 },
  { id: 5, bookName: 'Spring实战', author: 'Craig Walls', isbn: '9787115417305', publisher: '人民邮电出版社', category: '计算机', totalCopies: 4, availableCopies: 2, location: '图书馆3楼A区', status: 1 },
  { id: 6, bookName: 'Vue.js设计与实现', author: '霍春阳', isbn: '9787115583888', publisher: '人民邮电出版社', category: '计算机', totalCopies: 6, availableCopies: 5, location: '图书馆3楼A区', status: 1 },
  { id: 7, bookName: '深入理解计算机系统', author: 'Randal E. Bryant', isbn: '9787111544937', publisher: '机械工业出版社', category: '计算机', totalCopies: 3, availableCopies: 0, location: '图书馆3楼B区', status: 1 },
  { id: 8, bookName: '活着', author: '余华', isbn: '9787506365437', publisher: '作家出版社', category: '文学', totalCopies: 8, availableCopies: 6, location: '图书馆2楼C区', status: 1 },
  { id: 9, bookName: '三体', author: '刘慈欣', isbn: '9787536692930', publisher: '重庆出版社', category: '文学', totalCopies: 7, availableCopies: 4, location: '图书馆2楼C区', status: 1 },
  { id: 10, bookName: '经济学原理', author: '曼昆', isbn: '9787301150894', publisher: '北京大学出版社', category: '经济', totalCopies: 5, availableCopies: 3, location: '图书馆2楼A区', status: 1 },
  { id: 11, bookName: '国富论', author: '亚当·斯密', isbn: '9787100023245', publisher: '商务印书馆', category: '经济', totalCopies: 3, availableCopies: 2, location: '图书馆2楼A区', status: 1 },
  { id: 12, bookName: '万历十五年', author: '黄仁宇', isbn: '9787101052038', publisher: '中华书局', category: '历史', totalCopies: 4, availableCopies: 3, location: '图书馆2楼B区', status: 1 },
  { id: 13, bookName: '中国历代政治得失', author: '钱穆', isbn: '9787108043640', publisher: '生活·读书·新知三联书店', category: '历史', totalCopies: 3, availableCopies: 2, location: '图书馆2楼B区', status: 1 },
  { id: 14, bookName: '时间简史', author: '霍金', isbn: '9787535684882', publisher: '湖南科学技术出版社', category: '科学', totalCopies: 5, availableCopies: 4, location: '图书馆2楼D区', status: 1 },
  { id: 15, bookName: '物种起源', author: '达尔文', isbn: '9787532774493', publisher: '上海译文出版社', category: '科学', totalCopies: 2, availableCopies: 1, location: '图书馆2楼D区', status: 1 },
  { id: 16, bookName: '教育心理学', author: '皮连生', isbn: '9787543442122', publisher: '上海教育出版社', category: '教育', totalCopies: 4, availableCopies: 3, location: '图书馆2楼E区', status: 1 },
  { id: 17, bookName: '如何阅读一本书', author: '莫提默·艾德勒', isbn: '9787100040303', publisher: '商务印书馆', category: '教育', totalCopies: 6, availableCopies: 5, location: '图书馆2楼E区', status: 1 },
  { id: 18, bookName: '计算机网络：自顶向下方法', author: 'James F. Kurose', isbn: '9787111598701', publisher: '机械工业出版社', category: '计算机', totalCopies: 4, availableCopies: 2, location: '图书馆3楼B区', status: 1 },
  { id: 19, bookName: '百年孤独', author: '加西亚·马尔克斯', isbn: '9787544253994', publisher: '南海出版公司', category: '文学', totalCopies: 5, availableCopies: 0, location: '图书馆2楼C区', status: 1 },
  { id: 20, bookName: '人类简史', author: '尤瓦尔·赫拉利', isbn: '9787508647357', publisher: '中信出版社', category: '历史', totalCopies: 6, availableCopies: 4, location: '图书馆2楼B区', status: 1 }
]

const news = [
  { id: 1, title: '2025-2026学年第一学期开学通知', summary: '2025-2026学年第一学期将于9月1日正式开学', content: '各位同学：\n\n2025-2026学年第一学期将于9月1日正式开学，请各位同学提前做好返校准备。', category: 4, source: '教务处', publishTime: '2025-09-01 10:00:00', viewCount: 1250 },
  { id: 2, title: '人工智能学院学术讲座预告', summary: '大语言模型技术前沿与应用讲座', content: '主题：大语言模型技术前沿与应用\n\n主讲人：张教授（清华大学）\n\n时间：2025年10月15日 14:00-16:00', category: 2, source: '人工智能学院', publishTime: '2025-09-10 09:00:00', viewCount: 856 },
  { id: 3, title: '校园歌手大赛报名开始', summary: '校园歌手大赛火热报名中', content: '一年一度的校园歌手大赛即将开始！\n\n报名时间：9月10日-10月25日', category: 3, source: '校学生会', publishTime: '2025-09-08 14:00:00', viewCount: 2340 }
]

const lostFound = [
  { id: 1, title: '丢失校园卡', description: '本人于9月10日下午在食堂二楼丢失校园卡一张', type: 'LOST', category: 1, location: '食堂二楼', contact: '13800138001', userId: 1, status: 0, createTime: '2025-09-10 15:00:00' },
  { id: 2, title: '拾获黑色耳机', description: '在图书馆三楼自习室拾获黑色无线耳机一副', type: 'FOUND', category: 2, location: '图书馆三楼自习室', contact: '13800138002', userId: 2, status: 0, createTime: '2025-09-11 10:00:00' },
  { id: 3, title: '丢失学生证', description: '在操场看台丢失学生证，姓名张三', type: 'LOST', category: 1, location: '田径场看台', contact: '13800138001', userId: 1, status: 0, createTime: '2025-09-20 17:30:00' }
]

const borrowRecords = [
  { id: 1, userId: 1, bookId: 1, bookName: 'Java编程思想', author: 'Bruce Eckel', borrowDate: '2025-09-01 10:00:00', dueDate: '2025-10-01 10:00:00', returnDate: null, status: 1, renewCount: 0 },
  { id: 2, userId: 1, bookId: 2, bookName: 'Android开发艺术探索', author: '任玉刚', borrowDate: '2025-09-01 14:00:00', dueDate: '2025-10-15 14:00:00', returnDate: '2025-09-10 16:00:00', status: 2, renewCount: 0 }
]

const secondClassActivities = [
  { id: 1, activityName: '社区志愿服务活动', description: '为社区居民提供志愿服务，包括环境清洁、关爱老人等。', activityType: 1, location: '阳光社区', startTime: '2025-09-15 09:00:00', endTime: '2025-09-15 12:00:00', score: 10, maxParticipants: 30, currentParticipants: 15, publisherId: 7, status: 2, coverImage: null },
  { id: 2, activityName: '创新创业大赛', description: '校级创新创业大赛，展示你的创意和项目。', activityType: 4, location: '创新创业中心', startTime: '2025-10-20 14:00:00', endTime: '2025-10-20 17:00:00', score: 15, maxParticipants: 50, currentParticipants: 25, publisherId: 7, status: 0, coverImage: null },
  { id: 3, activityName: '摄影技能培训', description: '专业摄影师讲解摄影技巧，提升摄影水平。', activityType: 5, location: '艺术楼A201', startTime: '2025-10-18 19:00:00', endTime: '2025-10-18 21:00:00', score: 8, maxParticipants: 40, currentParticipants: 35, publisherId: 7, status: 0, coverImage: null },
  { id: 4, activityName: '人工智能前沿讲座', description: '邀请知名专家讲解人工智能最新发展动态。', activityType: 6, location: '图书馆报告厅', startTime: '2025-10-22 14:00:00', endTime: '2025-10-22 16:00:00', score: 12, maxParticipants: 100, currentParticipants: 60, publisherId: 7, status: 0, coverImage: null },
  { id: 5, activityName: '篮球友谊赛', description: '院系篮球友谊赛，强身健体，增进友谊。', activityType: 3, location: '体育馆', startTime: '2025-09-25 15:00:00', endTime: '2025-09-25 17:00:00', score: 5, maxParticipants: 20, currentParticipants: 12, publisherId: 7, status: 2, coverImage: null },
  { id: 6, activityName: '校园环保实践周', description: '垃圾分类宣传与校园清洁实践。', activityType: 2, location: '全校', startTime: '2025-10-10 08:00:00', endTime: '2025-10-12 18:00:00', score: 10, maxParticipants: 80, currentParticipants: 40, publisherId: 7, status: 1, coverImage: null },
  { id: 7, activityName: '职业规划工作坊', description: '简历诊断与面试技巧工作坊。', activityType: 5, location: '就业指导中心', startTime: '2025-10-30 14:00:00', endTime: '2025-10-30 16:30:00', score: 8, maxParticipants: 35, currentParticipants: 10, publisherId: 7, status: 0, coverImage: null }
]

const secondClassRecords = [
  { id: 1, userId: 1, activityId: 1, activityName: '社区志愿服务活动', score: 10, status: 2, reviewStatus: 'approved', createTime: '2025-09-10 10:00:00' },
  { id: 2, userId: 1, activityId: 3, activityName: '摄影技能培训', score: 8, status: 1, reviewStatus: 'approved', createTime: '2025-09-12 14:00:00' }
]

const userCredits = [
  { userId: 1, secondClassScore: 10, integrityScore: 95 },
  { userId: 2, secondClassScore: 25, integrityScore: 100 }
]

const certificates = [
  { id: 1, userId: 1, certificateName: '全国大学生数学建模竞赛', level: 1, score: 20, certificateType: 1, issuer: '教育部', obtainDate: '2025-09-15', status: 1, remark: '国家级一等奖', reviewerId: 7, reviewTime: '2025-09-20 10:00:00', createTime: '2025-09-20 14:00:00' },
  { id: 2, userId: 1, certificateName: '省级程序设计大赛', level: 2, score: 15, certificateType: 1, issuer: '省教育厅', obtainDate: '2025-09-05', status: 0, remark: null, reviewerId: null, reviewTime: null, createTime: '2025-09-08 16:00:00' }
]

const certificateLevels = [
  { value: 1, label: '国家级', score: 20, description: '全国性比赛、国家级证书' },
  { value: 2, label: '省级', score: 15, description: '省级比赛、省级证书' },
  { value: 3, label: '市级', score: 10, description: '市级比赛、市级证书' },
  { value: 4, label: '校级', score: 5, description: '校级比赛、校级证书' },
  { value: 5, label: '院级', score: 3, description: '院级比赛、院级证书' },
  { value: 6, label: '其他', score: 2, description: '其他类型证书' }
]

const certificateTypes = [
  { value: 1, label: '学科竞赛' },
  { value: 2, label: '科技创新' },
  { value: 3, label: '文体活动' },
  { value: 4, label: '社会实践' },
  { value: 5, label: '志愿服务' },
  { value: 6, label: '其他' }
]

// btoa 不支持中文，需 UTF-8 安全编码
function b64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(escape(atob(str)))
}

function generateToken(userId, username, role) {
  return b64EncodeUnicode(JSON.stringify({ userId, username, role, exp: Date.now() + 86400000 }))
}

function parseToken(token) {
  try {
    if (!token) return null
    const data = JSON.parse(b64DecodeUnicode(token))
    if (!data || !data.exp || data.exp < Date.now()) return null
    return data
  } catch (e) {
    return null
  }
}

function ok(data, message) {
  return { code: 200, message: message || 'success', data }
}

function fail(message, code) {
  return { code: code || 500, message: message || 'error' }
}

function unauthorized() {
  return fail('未登录', 401)
}

function handle(path, method, query, body, token) {
  const tokenData = parseToken(token)
  const p = path.replace(/\/+$/, '') || '/'

  if (p === '/api/user/login' && method === 'POST') {
    const user = users.find(u => u.studentId === body.studentId)
    if (!user) return fail('用户不存在')
    if (user.status === 0) return fail('账号已禁用，请联系管理员')
    if (user.passwordPlain !== body.password) return fail('密码错误')
    return ok({
      token: generateToken(user.id, user.username, user.role),
      userId: user.id,
      username: user.username,
      studentId: user.studentId,
      role: user.role,
      avatar: user.avatar
    }, '登录成功')
  }

  if (p === '/api/user/register' && method === 'POST') {
    const { studentId, username, password } = body
    if (!studentId || !username || !password) return fail('学号、用户名和密码不能为空')
    if (String(password).length < 6) return fail('密码至少 6 位')
    if (users.find(u => u.studentId === studentId)) return fail('该学号已被注册')
    const nextId = users.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1
    const newUser = { id: nextId, studentId, username, passwordPlain: password, role: 0, status: 1, avatar: null, college: '人工智能学院', major: '移动互联应用技术' }
    users.push(newUser)
    return ok({ ...newUser, passwordPlain: undefined }, '注册成功')
  }

  if (p === '/api/user/info' && method === 'GET') {
    if (!tokenData) return unauthorized()
    const user = users.find(u => u.id === tokenData.userId)
    if (!user) return fail('用户不存在')
    return ok({ ...user, passwordPlain: undefined })
  }

  if (p === '/api/user/update' && method === 'PUT') {
    if (!tokenData) return unauthorized()
    const user = users.find(u => u.id === tokenData.userId)
    if (!user) return fail('用户不存在')
    Object.assign(user, body, { id: user.id, studentId: user.studentId })
    return ok({ ...user, passwordPlain: undefined }, '更新成功')
  }

  if (p === '/api/user/change-password' && method === 'POST') {
    if (!tokenData) return unauthorized()
    const user = users.find(u => u.id === tokenData.userId)
    if (!user) return fail('用户不存在')
    if (!body.oldPassword || !body.newPassword) return fail('请输入原密码和新密码')
    if (user.passwordPlain !== body.oldPassword) return fail('原密码错误')
    if (String(body.newPassword).length < 6) return fail('新密码至少 6 位')
    user.passwordPlain = body.newPassword
    return ok(null, '密码修改成功')
  }

  if (p === '/api/course/list' && method === 'GET') {
    return ok({ total: courses.length, records: courses, pageNum: 1, pageSize: 20 })
  }

  if (p === '/api/course/current-semester' && method === 'GET') {
    return ok({ semester: '2024-2025-2' })
  }

  const courseSelect = p.match(/^\/api\/course\/select\/(\d+)$/)
  if (courseSelect && method === 'POST') {
    if (!tokenData) return unauthorized()
    const course = courses.find(c => c.id === parseInt(courseSelect[1], 10))
    if (!course) return fail('课程不存在')
    return ok(course, '选课成功')
  }

  const courseDrop = p.match(/^\/api\/course\/drop\/(\d+)$/)
  if (courseDrop && method === 'POST') {
    if (!tokenData) return unauthorized()
    const id = parseInt(courseDrop[1], 10)
    const idx = courses.findIndex(c => c.id === id)
    if (idx < 0) return fail('课程不存在')
    // 演示：从课表移除（内存）
    const dropped = courses.splice(idx, 1)[0]
    return ok(dropped, '退选成功')
  }

  if (p === '/api/news/publish' && method === 'POST') {
    if (!tokenData) return unauthorized()
    if (!body.title) return fail('请填写标题')
    const item = {
      id: news.reduce((m, n) => Math.max(m, n.id), 0) + 1,
      title: body.title,
      summary: body.summary || body.content || '',
      content: body.content || body.summary || body.title,
      category: body.category || 1,
      source: body.source || users.find(u => u.id === tokenData.userId)?.username || '匿名',
      publishTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      viewCount: 0
    }
    news.unshift(item)
    return ok(item, '发布成功')
  }

  if (p === '/api/lost-found/publish' && method === 'POST') {
    if (!tokenData) return unauthorized()
    if (!body.title) return fail('请填写标题')
    const item = {
      id: lostFound.reduce((m, x) => Math.max(m, x.id), 0) + 1,
      title: body.title,
      description: body.description || '',
      type: body.type || 'LOST',
      category: body.category || 1,
      location: body.location || '',
      contact: body.contactPhone || body.contact || '',
      userId: tokenData.userId,
      status: 0,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    lostFound.unshift(item)
    return ok(item, '发布成功')
  }

  const lfDetail = p.match(/^\/api\/lost-found\/(\d+)$/)
  if (lfDetail && method === 'GET') {
    const item = lostFound.find(x => x.id === parseInt(lfDetail[1], 10))
    if (!item) return fail('信息不存在')
    return ok(item)
  }

  const lfStatus = p.match(/^\/api\/lost-found\/(\d+)\/status$/)
  if (lfStatus && method === 'PUT') {
    if (!tokenData) return unauthorized()
    const item = lostFound.find(x => x.id === parseInt(lfStatus[1], 10))
    if (!item) return fail('信息不存在')
    item.status = body.status
    return ok(item, '状态已更新')
  }

  const lfDelete = p.match(/^\/api\/lost-found\/(\d+)$/)
  if (lfDelete && method === 'DELETE') {
    if (!tokenData) return unauthorized()
    const idx = lostFound.findIndex(x => x.id === parseInt(lfDelete[1], 10))
    if (idx < 0) return fail('信息不存在')
    lostFound.splice(idx, 1)
    return ok(null, '删除成功')
  }

  const checkIn = p.match(/^\/api\/second-class\/check-in\/(\d+)$/)
  if (checkIn && method === 'POST') {
    if (!tokenData) return unauthorized()
    const a = secondClassActivities.find(x => x.id === parseInt(checkIn[1], 10))
    if (!a) return fail('活动不存在')
    const rec = secondClassRecords.find(r => r.userId === tokenData.userId && r.activityId === a.id)
    if (!rec) return fail('请先报名')
    if (rec.reviewStatus === 'pending') return fail('报名审核中，请等待自动审核通过')
    if (rec.reviewStatus === 'rejected') return fail('报名未通过审核')
    if (rec.status >= 1) return fail('已签到')
    rec.status = 1
    return ok(null, '签到成功')
  }

  const completeAct = p.match(/^\/api\/second-class\/complete\/(\d+)$/)
  if (completeAct && method === 'POST') {
    if (!tokenData) return unauthorized()
    const rec = secondClassRecords.find(r => r.userId === tokenData.userId && r.activityId === parseInt(completeAct[1], 10))
    if (!rec) return fail('未找到参与记录')
    if (rec.reviewStatus === 'pending') return fail('报名审核中，暂不能完成')
    if (rec.reviewStatus === 'rejected') return fail('报名未通过')
    if (rec.status < 1) return fail('请先签到')
    if (rec.status === 2) return fail('已完成')
    rec.status = 2
    let credit = userCredits.find(c => c.userId === tokenData.userId)
    if (!credit) {
      credit = { userId: tokenData.userId, secondClassScore: 0, integrityScore: 100 }
      userCredits.push(credit)
    }
    credit.secondClassScore += rec.score
    return ok(credit, '已完成并计分')
  }

  if (p === '/api/second-class/publish' && method === 'POST') {
    const denied = requirePermission(tokenData, 'publish_activity')
    if (denied) return denied
    if (!body.activityName) return fail('请填写活动名称')
    const a = {
      id: secondClassActivities.reduce((m, x) => Math.max(m, x.id), 0) + 1,
      activityName: body.activityName,
      description: body.description || '',
      activityType: body.activityType || 1,
      location: body.location || '',
      startTime: body.startTime || new Date().toISOString(),
      endTime: body.endTime || new Date().toISOString(),
      score: body.score || 5,
      maxParticipants: body.maxParticipants || 50,
      currentParticipants: 0,
      publisherId: tokenData.userId,
      status: 0,
      coverImage: null
    }
    secondClassActivities.unshift(a)
    return ok(a, '发布成功')
  }

  if (p === '/api/second-class/restore-integrity' && method === 'POST') {
    if (!tokenData) return unauthorized()
    let credit = userCredits.find(c => c.userId === tokenData.userId)
    if (!credit) {
      credit = { userId: tokenData.userId, secondClassScore: 0, integrityScore: 100 }
      userCredits.push(credit)
    }
    if (credit.integrityScore >= 100) return fail('诚信值已满')
    credit.integrityScore = Math.min(100, credit.integrityScore + 1)
    return ok(credit, '诚信值 +1')
  }

  if (p === '/api/certificate/apply' && method === 'POST') {
    if (!tokenData) return unauthorized()
    if (!body.certificateName) return fail('请填写证书名称')
    const level = certificateLevels.find(l => l.value === body.level) || certificateLevels[5]
    const item = {
      id: certificates.reduce((m, c) => Math.max(m, c.id), 0) + 1,
      userId: tokenData.userId,
      certificateName: body.certificateName,
      level: body.level || 6,
      score: level.score,
      certificateType: body.certificateType || 1,
      issuer: body.issuer || '',
      obtainDate: body.obtainDate || new Date().toISOString().slice(0, 10),
      status: 0,
      remark: null,
      reviewerId: null,
      reviewTime: null,
      createTime: new Date().toISOString()
    }
    certificates.push(item)
    return ok(item, '提交成功，待审核')
  }

  if (p === '/api/certificate/list' && method === 'GET') {
    const denied = requirePermission(tokenData, 'review_certificate')
    if (denied) return denied
    return ok({ total: certificates.length, records: certificates, pageNum: 1, pageSize: 20 })
  }

  const certReview = p.match(/^\/api\/certificate\/review\/(\d+)$/)
  if (certReview && method === 'POST') {
    const denied = requirePermission(tokenData, 'review_certificate')
    if (denied) return denied
    const cert = certificates.find(c => c.id === parseInt(certReview[1], 10))
    if (!cert) return fail('证书不存在')
    if (cert.status !== 0) return fail('该证书已审核')
    cert.status = body.status
    cert.remark = body.remark
    cert.reviewerId = tokenData.userId
    cert.reviewTime = new Date().toISOString()
    if (body.status === 1) {
      let credit = userCredits.find(c => c.userId === cert.userId)
      if (!credit) {
        credit = { userId: cert.userId, secondClassScore: 0, integrityScore: 100 }
        userCredits.push(credit)
      }
      credit.secondClassScore += cert.score
    }
    notify(cert.userId,
      body.status === 1 ? '证书审核通过' : '证书审核未通过',
      body.status === 1 ? `${cert.certificateName} +${cert.score} 分` : `${cert.certificateName}：${body.remark || '不符合要求'}`)
    return ok(null, body.status === 1 ? '审核通过' : '审核拒绝')
  }

  if (p === '/api/course/schedule' && method === 'GET') {
    if (!tokenData) return unauthorized()
    const sem = query.semester
    const list = sem ? courses.filter(c => c.semester === sem) : courses
    return ok(list)
  }

  if (p === '/api/score/list' && method === 'GET') {
    if (!tokenData) return unauthorized()
    let list = scores.filter(s => s.studentId === tokenData.userId)
    if (query.semester) {
      list = list.filter(s => s.semester === query.semester)
    }
    return ok(list)
  }

  if (p === '/api/score/gpa' && method === 'GET') {
    if (!tokenData) return unauthorized()
    const userScores = scores.filter(s => s.studentId === tokenData.userId)
    const totalGPA = userScores.reduce((sum, s) => sum + s.gpa * s.credit, 0)
    const totalCredits = userScores.reduce((sum, s) => sum + s.credit, 0)
    const totalScoreSum = userScores.reduce((sum, s) => sum + s.totalScore, 0)
    return ok({
      averageGPA: totalCredits > 0 ? Math.round(totalGPA / totalCredits * 100) / 100 : 0,
      totalCredits,
      passedCourses: userScores.length,
      averageScore: userScores.length > 0 ? Math.round(totalScoreSum / userScores.length) : 0
    })
  }

  if (p === '/api/score/semesters' && method === 'GET') {
    return ok(['2024-2025-2', '2025-2026-2', '2024-2025-1', '2024-2025-2'])
  }

  if (p === '/api/book/list' && method === 'GET') {
    let list = [...books]
    if (query.keyword) list = list.filter(b => b.bookName.includes(query.keyword) || b.author.includes(query.keyword))
    if (query.category) list = list.filter(b => b.category === query.category)
    return ok({ total: list.length, records: list, pageNum: 1, pageSize: 10 })
  }

  const bookDetail = p.match(/^\/api\/book\/(\d+)$/)
  if (bookDetail && method === 'GET') {
    const book = books.find(b => b.id === parseInt(bookDetail[1], 10))
    if (!book) return fail('图书不存在')
    return ok(book)
  }

  const borrow = p.match(/^\/api\/book\/borrow\/(\d+)$/)
  if (borrow && method === 'POST') {
    if (!tokenData) return unauthorized()
    const book = books.find(b => b.id === parseInt(borrow[1], 10))
    if (!book) return fail('图书不存在')
    if (book.availableCopies <= 0) return fail('图书已被借完')
    const count = borrowRecords.filter(r => r.userId === tokenData.userId && r.status === 1).length
    if (count >= 5) return fail('借阅数量已达上限（最多5本）')
    borrowRecords.push({
      id: borrowRecords.reduce((m, r) => Math.max(m, r.id), 0) + 1,
      userId: tokenData.userId,
      bookId: book.id,
      bookName: book.bookName,
      author: book.author,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      returnDate: null,
      status: 1,
      renewCount: 0
    })
    book.availableCopies--
    return ok(null, '借阅成功')
  }

  const ret = p.match(/^\/api\/book\/return\/(\d+)$/)
  if (ret && method === 'POST') {
    if (!tokenData) return unauthorized()
    const rec = borrowRecords.find(r => r.id === parseInt(ret[1], 10))
    if (!rec) return fail('借阅记录不存在')
    if (rec.userId !== tokenData.userId) return fail('无权操作此记录', 403)
    if (rec.status !== 1) return fail('该书已归还')
    rec.returnDate = new Date().toISOString()
    rec.status = 2
    const book = books.find(b => b.id === rec.bookId)
    if (book) book.availableCopies++
    return ok(null, '归还成功')
  }

  const renew = p.match(/^\/api\/book\/renew\/(\d+)$/)
  if (renew && method === 'POST') {
    if (!tokenData) return unauthorized()
    const rec = borrowRecords.find(r => r.id === parseInt(renew[1], 10))
    if (!rec) return fail('借阅记录不存在')
    if (rec.userId !== tokenData.userId) return fail('无权操作此记录', 403)
    if (rec.status !== 1) return fail('该书已归还，无法续借')
    if (rec.renewCount >= 2) return fail('续借次数已达上限（最多2次）')
    const due = new Date(rec.dueDate)
    due.setDate(due.getDate() + 15)
    rec.dueDate = due.toISOString()
    rec.renewCount++
    return ok(null, '续借成功')
  }

  if (p === '/api/book/borrow-records' && method === 'GET') {
    if (!tokenData) return unauthorized()
    return ok(borrowRecords.filter(r => r.userId === tokenData.userId))
  }

  if (p === '/api/news/list' && method === 'GET') {
    let list = [...news].filter(n => !n.hidden)
    if (query.category) list = list.filter(n => n.category === parseInt(query.category, 10))
    return ok({ total: list.length, records: list, pageNum: 1, pageSize: 10 })
  }

  const newsDetail = p.match(/^\/api\/news\/(\d+)$/)
  if (newsDetail && method === 'GET') {
    const item = news.find(n => n.id === parseInt(newsDetail[1], 10))
    if (!item) return fail('资讯不存在')
    return ok(item)
  }

  if (p === '/api/lost-found/list' && method === 'GET') {
    let list = [...lostFound].filter(l => !l.hidden)
    if (query.type) list = list.filter(l => String(l.type) === String(query.type))
    return ok({ total: list.length, records: list, pageNum: 1, pageSize: 10 })
  }

  if (p === '/api/second-class/list' && method === 'GET') {
    let list = [...secondClassActivities]
    if (query.activityType) list = list.filter(a => a.activityType === parseInt(query.activityType, 10))
    if (query.phase === 'enrolled' && tokenData) {
      const ids = new Set(secondClassRecords
        .filter(r => r.userId === tokenData.userId)
        .map(r => r.activityId))
      list = list.filter(a => ids.has(a.id))
    } else if (query.phase === 'active') {
      list = list.filter(a => a.status !== 2)
    } else if (query.phase === 'ended') {
      list = list.filter(a => a.status === 2)
    }
    if (tokenData) {
      const joined = new Set(secondClassRecords
        .filter(r => r.userId === tokenData.userId)
        .map(r => r.activityId))
      list = list.map(a => ({ ...a, joined: joined.has(a.id) }))
    }
    return ok({ total: list.length, records: list, pageNum: 1, pageSize: 20 })
  }

  const actDetail = p.match(/^\/api\/second-class\/(\d+)$/)
  if (actDetail && method === 'GET') {
    const a = secondClassActivities.find(x => x.id === parseInt(actDetail[1], 10))
    if (!a) return fail('活动不存在')
    return ok(a)
  }

  const join = p.match(/^\/api\/second-class\/join\/(\d+)$/)
  if (join && method === 'POST') {
    if (!tokenData) return unauthorized()
    const a = secondClassActivities.find(x => x.id === parseInt(join[1], 10))
    if (!a) return fail('活动不存在')
    if (a.status === 2) return fail('活动已结束，无法报名')
    if (a.currentParticipants >= a.maxParticipants) return fail('名额已满')
    const exist = secondClassRecords.find(r =>
      r.userId === tokenData.userId && r.activityId === a.id)
    if (exist) {
      if (exist.reviewStatus === 'pending') return fail('报名审核中，请稍候')
      return fail('已报名该活动')
    }
    a.currentParticipants++
    const rec = {
      id: secondClassRecords.reduce((m, r) => Math.max(m, r.id), 0) + 1,
      userId: tokenData.userId,
      activityId: a.id,
      activityName: a.activityName,
      score: a.score,
      status: 0,
      reviewStatus: 'pending',
      createTime: new Date().toISOString()
    }
    secondClassRecords.push(rec)
    // 后台自动审核（约 2.5 秒后通过）
    setTimeout(() => {
      if (rec.reviewStatus === 'pending') {
        rec.reviewStatus = 'approved'
        rec.status = 1
        notify(tokenData.userId, '活动报名审核通过',
          `「${a.activityName}」报名已自动审核通过，请按时签到`)
      }
    }, 2500)
    return ok({ ...rec }, '报名已提交，等待系统自动审核')
  }

  const cancelJoin = p.match(/^\/api\/second-class\/cancel\/(\d+)$/)
  if (cancelJoin && method === 'POST') {
    if (!tokenData) return unauthorized()
    const a = secondClassActivities.find(x => x.id === parseInt(cancelJoin[1], 10))
    if (!a) return fail('活动不存在')
    const idx = secondClassRecords.findIndex(r =>
      r.userId === tokenData.userId && r.activityId === a.id)
    if (idx < 0) return fail('未报名该活动')
    const rec = secondClassRecords[idx]
    if (rec.status === 2) return fail('活动已完成，无法取消报名')
    secondClassRecords.splice(idx, 1)
    if (a.currentParticipants > 0) a.currentParticipants--
    notify(tokenData.userId, '已取消活动报名', `「${a.activityName}」报名已取消`)
    return ok(null, '已取消报名')
  }

  if (p === '/api/second-class/records' && method === 'GET') {
    if (!tokenData) return unauthorized()
    return ok(secondClassRecords.filter(r => r.userId === tokenData.userId))
  }

  if (p === '/api/second-class/credit' && method === 'GET') {
    if (!tokenData) return unauthorized()
    const c = userCredits.find(x => x.userId === tokenData.userId) || { userId: tokenData.userId, secondClassScore: 0, integrityScore: 100 }
    return ok({ ...c, targetScore: 120 })
  }

  if (p === '/api/certificate/levels' && method === 'GET') return ok(certificateLevels)
  if (p === '/api/certificate/types' && method === 'GET') return ok(certificateTypes)

  if (p === '/api/permission/defs' && method === 'GET') return ok(PERMISSION_DEFS)

  // 角色权限查询（管理员 / 班长 / 学生）
  if (p === '/api/permission/my' && method === 'GET') {
    if (!tokenData) return unauthorized()
    const role = Number(tokenData.role) || 0
    return ok({
      role,
      isAdmin: isAdminUser(tokenData),
      isMonitor: isMonitorUser(tokenData),
      permissions: isAdminUser(tokenData)
        ? PERMISSION_DEFS.map(d => d.value)
        : (isMonitorUser(tokenData) ? MONITOR_PERMISSIONS.slice() : [])
    })
  }

  // ---- 用户管理 ----
  if (p === '/api/admin/users' && method === 'GET') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    return ok(users.map(u => ({
      id: u.id,
      studentId: u.studentId,
      username: u.username,
      role: u.role,
      college: u.college,
      major: u.major,
      status: u.status !== 0 ? 1 : 0
    })))
  }

  const userStatus = p.match(/^\/api\/admin\/users\/(\d+)\/status$/)
  if (userStatus && method === 'PUT') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    const u = users.find(x => x.id === parseInt(userStatus[1], 10))
    if (!u) return fail('用户不存在')
    if (u.id === tokenData.userId) return fail('不能修改自己的状态')
    if (u.role === 2 && body.status === 0) return fail('不能禁用管理员')
    u.status = body.status === 0 ? 0 : 1
    notify(u.id, u.status === 0 ? '账号已禁用' : '账号已启用',
      u.status === 0 ? '如有疑问请联系管理员' : '您可以正常登录使用')
    return ok({ id: u.id, status: u.status }, u.status === 0 ? '已禁用' : '已启用')
  }

  const userReset = p.match(/^\/api\/admin\/users\/(\d+)\/reset-password$/)
  if (userReset && method === 'POST') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    const u = users.find(x => x.id === parseInt(userReset[1], 10))
    if (!u) return fail('用户不存在')
    u.passwordPlain = '123456'
    notify(u.id, '密码已重置', '管理员已将您的密码重置为 123456，请及时修改')
    return ok(null, '密码已重置为 123456')
  }

  const userRole = p.match(/^\/api\/admin\/users\/(\d+)\/role$/)
  if (userRole && method === 'PUT') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    const u = users.find(x => x.id === parseInt(userRole[1], 10))
    if (!u) return fail('用户不存在')
    if (u.role === 2) return fail('不可修改超级管理员角色')
    const next = Number(body.role) === 1 ? 1 : 0
    u.role = next
    notify(u.id, next === 1 ? '已任命为班长' : '已取消班长',
      next === 1 ? '您已获得班长权限：发布活动、审核证书、内容管理等' : '您已恢复为学生基础权限')
    return ok({ id: u.id, role: u.role }, next === 1 ? '已设为班长' : '已取消班长')
  }

  // ---- 通知（广播按用户独立已读） ----
  if (p === '/api/notifications' && method === 'GET') {
    if (!tokenData) return unauthorized()
    const uid = tokenData.userId
    const list = notifications.filter(n => n.broadcast || n.userId === uid).map(n => ({
      id: n.id,
      userId: n.userId,
      broadcast: n.broadcast,
      title: n.title,
      body: n.body,
      createTime: n.createTime,
      read: n.broadcast
        ? Array.isArray(n.readBy) && n.readBy.includes(uid)
        : n.read
    }))
    return ok({ list, unread: list.filter(n => !n.read).length })
  }

  if (p === '/api/notifications/read-all' && method === 'POST') {
    if (!tokenData) return unauthorized()
    const uid = tokenData.userId
    notifications.forEach(n => {
      if (n.broadcast) {
        if (!Array.isArray(n.readBy)) n.readBy = []
        if (!n.readBy.includes(uid)) n.readBy.push(uid)
      } else if (n.userId === uid) {
        n.read = true
      }
    })
    return ok(null, '已全部标记已读')
  }

  // ---- 成绩录入 ----
  if (p === '/api/admin/scores' && method === 'GET') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    return ok({ records: scores, courses, users: users.map(u => ({ id: u.id, studentId: u.studentId, username: u.username, role: u.role })) })
  }

  if (p === '/api/admin/scores' && method === 'POST') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    const studentId = Number(body.studentId)
    const courseId = Number(body.courseId)
    const course = courses.find(c => c.id === courseId)
    const student = users.find(u => u.id === studentId)
    if (!course || !student) return fail('学生或课程不存在')
    const daily = Number(body.dailyScore) || 0
    const mid = Number(body.midtermScore) || 0
    const fin = Number(body.finalScore) || 0
    const total = Math.round(daily * 0.3 + mid * 0.2 + fin * 0.5)
    const gpa = total >= 90 ? 4.0 : total >= 80 ? 3.0 : total >= 70 ? 2.0 : total >= 60 ? 1.0 : 0
    const exist = scores.find(s => s.studentId === studentId && s.courseId === courseId)
    const payload = {
      dailyScore: daily,
      midtermScore: mid,
      finalScore: fin,
      totalScore: total,
      gpa,
      semester: body.semester || '2024-2025-2',
      courseName: course.courseName,
      courseCode: course.courseCode,
      credit: course.credit
    }
    if (exist) Object.assign(exist, payload)
    else {
      scores.push({
        id: scores.reduce((m, s) => Math.max(m, s.id), 0) + 1,
        studentId,
        courseId,
        ...payload
      })
    }
    notify(studentId, '成绩已更新', `${course.courseName} 总分 ${total}`)
    return ok(null, '成绩已保存')
  }

  // ---- 内容审核 ----
  const contentVis = p.match(/^\/api\/admin\/content\/([\w-]+)\/(\d+)\/visibility$/)
  if (contentVis && method === 'PUT') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    const type = contentVis[1]
    const id = parseInt(contentVis[2], 10)
    const target = type === 'news'
      ? news.find(n => n.id === id)
      : lostFound.find(l => l.id === id)
    if (!target) return fail('内容不存在')
    target.hidden = body.hidden === true || body.hidden === 1
    const kind = (type === 'news') ? '资讯' : '失物信息'
    notify(target.userId || '*', '内容审核通知',
      `您的${kind}「${target.title}」${target.hidden ? '已被下架' : '已恢复展示'}`)
    return ok(target, target.hidden ? '已下架' : '已恢复展示')
  }

  if (p === '/api/admin/content' && method === 'GET') {
    const denied = requireAdmin(tokenData)
    if (denied) return denied
    return ok({
      news: news.map(n => ({ ...n, hidden: !!n.hidden })),
      lostFound: lostFound.map(l => ({ ...l, hidden: !!l.hidden }))
    })
  }

  // ---- 图书预约 ----
  const bookReserve = p.match(/^\/api\/book\/reserve\/(\d+)$/)
  if (bookReserve && method === 'POST') {
    if (!tokenData) return unauthorized()
    const book = books.find(b => b.id === parseInt(bookReserve[1], 10))
    if (!book) return fail('图书不存在')
    if (book.availableCopies > 0) return fail('当前有库存可直接借阅')
    if (bookReservations.find(r => r.bookId === book.id && r.userId === tokenData.userId && r.status === 0)) {
      return fail('您已预约该书')
    }
    bookReservations.push({
      id: bookReservations.reduce((m, r) => Math.max(m, r.id), 0) + 1,
      bookId: book.id,
      bookName: book.bookName,
      userId: tokenData.userId,
      status: 0,
      createTime: new Date().toISOString()
    })
    notify(tokenData.userId, '图书预约成功', `《${book.bookName}》到馆后将通知您`)
    return ok(null, '预约成功')
  }

  if (p === '/api/book/reservations' && method === 'GET') {
    if (!tokenData) return unauthorized()
    return ok(bookReservations.filter(r => r.userId === tokenData.userId))
  }

  if (p === '/api/certificate/my' && method === 'GET') {
    if (!tokenData) return unauthorized()
    return ok(certificates.filter(c => c.userId === tokenData.userId))
  }

  return fail('接口不存在', 404)
}

export function installBrowserMock(axiosInstance) {
  axiosInstance.defaults.adapter = function mockAdapter(config) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const url = config.url || ''
        // 支持 baseURL + path
        let path = url
        try {
          if (/^https?:/i.test(url)) path = new URL(url).pathname
        } catch (e) { /* keep url */ }
        if (!path.startsWith('/')) {
          const base = config.baseURL || ''
          try {
            path = new URL(url, base.startsWith('http') ? base : 'http://local.mock').pathname
          } catch (e) {
            path = '/' + url.replace(/^\/+/, '')
          }
        }
        // strip /api prefix duplication if baseURL already ends with /api
        if (path.includes('/api/')) {
          path = path.slice(path.indexOf('/api/'))
        } else if (!path.startsWith('/api')) {
          path = '/api' + (path.startsWith('/') ? path : '/' + path)
        }

        const query = { ...(config.params || {}) }
        // parse query from path
        const qi = path.indexOf('?')
        if (qi >= 0) {
          const usp = new URLSearchParams(path.slice(qi + 1))
          usp.forEach((v, k) => { query[k] = v })
          path = path.slice(0, qi)
        }

        let body = config.data
        if (typeof body === 'string') {
          try { body = JSON.parse(body) } catch (e) { body = {} }
        }
        if (!body || typeof body !== 'object') body = {}

        const headers = config.headers || {}
        let auth = ''
        if (typeof headers.get === 'function') {
          auth = headers.get('Authorization') || headers.get('authorization') || ''
        } else {
          auth = headers.Authorization || headers.authorization || ''
        }
        const token = String(auth).replace(/^Bearer\s+/i, '')

        const method = (config.method || 'get').toUpperCase()
        let payload
        try {
          payload = handle(path, method, query, body, token)
        } catch (e) {
          payload = fail(e.message || 'mock error')
        }

        resolve({
          data: payload,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config,
          request: {}
        })
      }, 80)
    })
  }
  return axiosInstance
}
