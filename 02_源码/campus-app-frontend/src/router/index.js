import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/course',
    name: 'Course',
    component: () => import('../views/Course.vue'),
    meta: { title: '课程表', requiresAuth: true }
  },
  {
    path: '/score',
    name: 'Score',
    component: () => import('../views/Score.vue'),
    meta: { title: '成绩查询', requiresAuth: true }
  },
  {
    path: '/library',
    name: 'Library',
    component: () => import('../views/Library.vue'),
    meta: { title: '图书馆', requiresAuth: true }
  },
  {
    path: '/library/:id',
    name: 'BookDetail',
    component: () => import('../views/BookDetail.vue'),
    meta: { title: '图书详情', requiresAuth: true }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/News.vue'),
    meta: { title: '校园资讯', requiresAuth: true }
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetail.vue'),
    meta: { title: '资讯详情', requiresAuth: true }
  },
  {
    path: '/news/publish',
    name: 'PublishNews',
    component: () => import('../views/PublishNews.vue'),
    meta: { title: '发布资讯', requiresAuth: true }
  },
  {
    path: '/lost-found',
    name: 'LostFound',
    component: () => import('../views/LostFound.vue'),
    meta: { title: '失物招领', requiresAuth: true }
  },
  {
    path: '/lost-found/publish',
    name: 'PublishLostFound',
    component: () => import('../views/PublishLostFound.vue'),
    meta: { title: '发布失物招领', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    component: () => import('../views/EditProfile.vue'),
    meta: { title: '编辑资料', requiresAuth: true }
  },
  {
    path: '/profile/password',
    name: 'ChangePassword',
    component: () => import('../views/ChangePassword.vue'),
    meta: { title: '修改密码', requiresAuth: true }
  },
  {
    path: '/borrow-records',
    name: 'BorrowRecords',
    component: () => import('../views/BorrowRecords.vue'),
    meta: { title: '借阅记录', requiresAuth: true }
  },
  {
    path: '/second-class',
    name: 'SecondClass',
    component: () => import('../views/SecondClass.vue'),
    meta: { title: '第二课堂', requiresAuth: true }
  },
  {
    path: '/second-class/records',
    name: 'SecondClassRecords',
    component: () => import('../views/SecondClassRecords.vue'),
    meta: { title: '参与记录', requiresAuth: true }
  },
  {
    path: '/second-class/:id',
    name: 'SecondClassDetail',
    component: () => import('../views/SecondClassDetail.vue'),
    meta: { title: '活动详情', requiresAuth: true }
  },
  {
    path: '/certificate/apply',
    name: 'CertificateApply',
    component: () => import('../views/CertificateApply.vue'),
    meta: { title: '证书申请', requiresAuth: true }
  },
  {
    path: '/certificate/my',
    name: 'MyCertificates',
    component: () => import('../views/MyCertificates.vue'),
    meta: { title: '我的证书', requiresAuth: true }
  },
  {
    path: '/notices',
    name: 'Notices',
    component: () => import('../views/Notices.vue'),
    meta: { title: '消息通知', requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/AdminUsers.vue'),
    meta: { title: '用户管理', requiresAuth: true }
  },
  {
    path: '/admin/scores',
    name: 'AdminScores',
    component: () => import('../views/AdminScores.vue'),
    meta: { title: '成绩录入', requiresAuth: true }
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    component: () => import('../views/AdminContent.vue'),
    meta: { title: '内容审核', requiresAuth: true }
  },
  {
    path: '/second-class/dashboard',
    name: 'CreditDashboard',
    component: () => import('../views/CreditDashboard.vue'),
    meta: { title: '学分看板', requiresAuth: true }
  }
]

const router = createRouter({
  // Hash 模式：GitHub Pages / Netlify 等静态托管无需服务端 rewrite
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 校园服务平台` : '校园服务平台'

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  next()
})

export default router
