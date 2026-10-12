import axios from 'axios'
import store from '../store'
import router from '../router'

// 创建 axios 实例
// 本机演示默认走 8080；上线请设置 VUE_APP_API_URL（可写相对路径 /api 以便同源托管）
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = store.state.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果返回的状态码不是200，说明出错了
    if (res.code !== 200) {
      // 401: 未登录或Token过期
      if (res.code === 401) {
        store.dispatch('logout')
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    // 网络错误
    if (error.message.includes('Network Error')) {
      console.error('网络连接异常，请检查网络')
    } else if (error.message.includes('timeout')) {
      console.error('请求超时，请稍后重试')
    }

    // 401 未授权
    if (error.response && error.response.status === 401) {
      store.dispatch('logout')
      router.push('/login')
    }

    return Promise.reject(error)
  }
)

export default api

// 用户相关接口
export const userApi = {
  login: (data) => api.post('/user/login', data),
  register: (data) => api.post('/user/register', data),
  getUserInfo: () => api.get('/user/info'),
  updateUserInfo: (data) => api.put('/user/update', data),
  changePassword: (data) => api.post('/user/change-password', data)
}

// 课程相关接口
export const courseApi = {
  getCourseList: (params) => api.get('/course/list', { params }),
  getStudentSchedule: (params) => api.get('/course/schedule', { params }),
  selectCourse: (courseId) => api.post(`/course/select/${courseId}`),
  dropCourse: (courseId) => api.post(`/course/drop/${courseId}`),
  getCurrentSemester: () => api.get('/course/current-semester')
}

// 成绩相关接口
export const scoreApi = {
  getStudentScores: (params) => api.get('/score/list', { params }),
  calculateGPA: () => api.get('/score/gpa'),
  getAvailableSemesters: () => api.get('/score/semesters')
}

// 图书相关接口
export const bookApi = {
  getBookList: (params) => api.get('/book/list', { params }),
  getBookDetail: (id) => api.get(`/book/${id}`),
  borrowBook: (bookId) => api.post(`/book/borrow/${bookId}`),
  returnBook: (reservationId) => api.post(`/book/return/${reservationId}`),
  renewBook: (reservationId) => api.post(`/book/renew/${reservationId}`),
  getBorrowRecords: () => api.get('/book/borrow-records'),
  reserveBook: (bookId) => api.post(`/book/reserve/${bookId}`),
  myReservations: () => api.get('/book/reservations')
}

// 校园资讯接口
export const newsApi = {
  getNewsList: (params) => api.get('/news/list', { params }),
  getNewsDetail: (id) => api.get(`/news/${id}`),
  publishNews: (data) => api.post('/news/publish', data)
}

// 失物招领接口
export const lostFoundApi = {
  getList: (params) => api.get('/lost-found/list', { params }),
  getDetail: (id) => api.get(`/lost-found/${id}`),
  publish: (data) => api.post('/lost-found/publish', data),
  updateStatus: (id, status) => api.put(`/lost-found/${id}/status`, { status }),
  deleteInfo: (id) => api.delete(`/lost-found/${id}`)
}

// 第二课堂接口
export const secondClassApi = {
  getActivityList: (params) => api.get('/second-class/list', { params }),
  getActivityDetail: (id) => api.get(`/second-class/${id}`),
  publishActivity: (data) => api.post('/second-class/publish', data),
  joinActivity: (activityId) => api.post(`/second-class/join/${activityId}`),
  cancelActivity: (activityId) => api.post(`/second-class/cancel/${activityId}`),
  checkIn: (activityId) => api.post(`/second-class/check-in/${activityId}`),
  completeActivity: (activityId) => api.post(`/second-class/complete/${activityId}`),
  getUserRecords: () => api.get('/second-class/records'),
  getUserCredit: () => api.get('/second-class/credit'),
  restoreIntegrity: () => api.post('/second-class/restore-integrity')
}

// 证书接口
export const certificateApi = {
  getLevels: () => api.get('/certificate/levels'),
  getTypes: () => api.get('/certificate/types'),
  apply: (data) => api.post('/certificate/apply', data),
  getMyCertificates: () => api.get('/certificate/my'),
  getCertificateList: (params) => api.get('/certificate/list', { params }),
  review: (id, data) => api.post(`/certificate/review/${id}`, data)
}

// 权限：管理员全权；班长固定权限；学生基础权限
export const permissionApi = {
  getDefs: () => api.get('/permission/defs'),
  getMine: () => api.get('/permission/my')
}

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  setUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  setRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getScores: () => api.get('/admin/scores'),
  saveScore: (data) => api.post('/admin/scores', data),
  getContent: () => api.get('/admin/content'),
  setContentHidden: (type, id, hidden) => api.put(`/admin/content/${type}/${id}/visibility`, { hidden })
}

export const noticeApi = {
  getList: () => api.get('/notifications'),
  readAll: () => api.post('/notifications/read-all')
}
