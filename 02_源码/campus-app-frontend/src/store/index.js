import { createStore } from 'vuex'

export default createStore({
  state: {
    // 用户信息
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    // Token
    token: localStorage.getItem('token') || '',
    // 当前学期
    currentSemester: '2024-2025-2'
  },
  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token,
    // 获取用户信息
    getUser: (state) => state.user,
    // 获取用户名
    getUsername: (state) => state.user.username || '',
    // 获取用户角色
    getRole: (state) => Number(state.user && state.user.role) || 0,
    // 获取当前学期
    getCurrentSemester: (state) => state.currentSemester
  },
  mutations: {
    // 设置用户信息
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    // 设置Token
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    // 设置当前学期
    SET_SEMESTER(state, semester) {
      state.currentSemester = semester
    },
    // 清除用户信息
    CLEAR_USER(state) {
      state.user = {}
      state.token = ''
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  },
  actions: {
    // 登录
    login({ commit }, { user, token }) {
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
    },
    // 登出
    logout({ commit }) {
      commit('CLEAR_USER')
    },
    // 更新用户信息
    updateUserInfo({ commit }, user) {
      commit('SET_USER', user)
    }
  }
})
