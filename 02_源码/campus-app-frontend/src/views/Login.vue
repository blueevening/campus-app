<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="login-content">
      <!-- Logo区域 -->
      <div class="login-header">
        <div class="logo-wrapper">
          <div class="logo">
            <svg viewBox="0 0 24 24" class="logo-icon">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
        </div>
        <h1 class="title">校园服务平台</h1>
        <p class="subtitle">Campus Service Platform</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form">
        <div class="form-header">
          <h2>用户登录</h2>
          <p>欢迎回来，请登录您的账号</p>
        </div>

        <van-form @submit="handleLogin">
          <div class="input-group">
            <div class="input-wrapper">
              <van-icon name="user-o" class="input-icon" />
              <van-field
                v-model="form.studentId"
                name="studentId"
                placeholder="请输入学号"
                :rules="[{ required: true, message: '请输入学号' }]"
                class="custom-input"
              />
            </div>

            <div class="input-wrapper">
              <van-icon name="lock" class="input-icon" />
              <van-field
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                placeholder="请输入密码"
                :rules="[{ required: true, message: '请输入密码' }]"
                class="custom-input"
              >
                <template #button>
                  <van-icon
                    :name="showPassword ? 'eye-o' : 'closed-eye'"
                    class="eye-icon"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </van-field>
            </div>
          </div>

          <div class="form-options">
            <van-checkbox v-model="rememberMe" shape="square" icon-size="16">
              <span class="remember-text">记住密码</span>
            </van-checkbox>
            <a href="#" class="forgot-link">忘记密码？</a>
          </div>

          <div class="login-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="登录中..."
              class="login-btn"
            >
              登 录
            </van-button>
            <van-button
              round
              block
              class="demo-btn"
              native-type="button"
              @click="fillDemoAccount"
            >
              使用演示账号（2021001 / 123456）
            </van-button>
          </div>
        </van-form>

        <div class="divider">
          <span>其他登录方式</span>
        </div>

        <div class="other-login">
          <div class="other-login-item" @click="showToast('微信登录开发中')">
            <van-icon name="wechat" color="#07c160" size="24" />
            <span>微信</span>
          </div>
          <div class="other-login-item" @click="showToast('QQ登录开发中')">
            <van-icon name="qq" color="#1296db" size="24" />
            <span>QQ</span>
          </div>
          <div class="other-login-item" @click="showToast('手机号登录开发中')">
            <van-icon name="phone-o" color="#ff976a" size="24" />
            <span>手机号</span>
          </div>
        </div>
      </div>

      <!-- 注册入口 -->
      <div class="register-entry">
        <span>还没有账号？</span>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>

      <!-- 底部信息 -->
      <div class="login-footer">
        <p>© 2025 校园服务平台 - 毕业设计作品</p>
        <p class="tech-stack">Vue.js 3 + Vant 4 + Node.js</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { showToast } from 'vant'
import { userApi } from '../api'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const loading = ref(false)
    const showPassword = ref(false)
    const rememberMe = ref(false)

    const form = ref({
      studentId: '',
      password: ''
    })

    const fillDemoAccount = () => {
      form.value.studentId = '2021001'
      form.value.password = '123456'
      showToast('已填入演示账号，点登录即可')
    }

    const handleLogin = async () => {
      loading.value = true
      try {
        const res = await userApi.login(form.value)

        // 保存登录信息
        store.dispatch('login', {
          user: {
            userId: res.data.userId,
            username: res.data.username,
            studentId: res.data.studentId,
            role: res.data.role,
            avatar: res.data.avatar
          },
          token: res.data.token
        })

        // 记住密码
        if (rememberMe.value) {
          localStorage.setItem('rememberedUser', form.value.studentId)
        } else {
          localStorage.removeItem('rememberedUser')
        }

        showToast({
          message: '登录成功',
          icon: 'success',
          duration: 1500
        })

        // 跳转到之前页面或首页
        setTimeout(() => {
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        }, 1500)
      } catch (error) {
        showToast({
          message: error.message || '登录失败',
          icon: 'fail',
          duration: 2000
        })
      } finally {
        loading.value = false
      }
    }

    // 检查是否有记住的用户
    const rememberedUser = localStorage.getItem('rememberedUser')
    if (rememberedUser) {
      form.value.studentId = rememberedUser
      rememberMe.value = true
    }

    return {
      form,
      loading,
      showPassword,
      rememberMe,
      handleLogin,
      fillDemoAccount,
      showToast
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -150px;
  left: -150px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  right: -100px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login-content {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-wrapper {
  display: inline-block;
  margin-bottom: 16px;
}

.logo {
  width: 80px;
  height: 80px;
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.logo-icon {
  width: 50px;
  height: 50px;
  fill: #2c5282;
}

.title {
  font-size: 28px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
}

.login-form {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-header h2 {
  font-size: 22px;
  color: #1a202c;
  font-weight: 600;
  margin-bottom: 6px;
}

.form-header p {
  font-size: 14px;
  color: #718096;
}

.input-group {
  margin-bottom: 16px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border-radius: 10px;
  padding: 4px 12px;
  margin-bottom: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #2c5282;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
}

.input-icon {
  color: #a0aec0;
  font-size: 18px;
  margin-right: 8px;
}

.custom-input {
  flex: 1;
  background: transparent !important;
}

.custom-input :deep(.van-field__control) {
  background: transparent !important;
}

.eye-icon {
  color: #a0aec0;
  cursor: pointer;
}

.eye-icon:hover {
  color: #2c5282;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-text {
  font-size: 13px;
  color: #4a5568;
}

.forgot-link {
  font-size: 13px;
  color: #2c5282;
  text-decoration: none;
}

.login-actions {
  margin-bottom: 20px;
}

.login-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: #2c5282;
  border: none;
  letter-spacing: 4px;
}

.login-btn:active {
  background: #1e3a5f;
}

.demo-btn {
  height: 42px;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  background: #d69e2e !important;
  border: none !important;
  color: #1a202c !important;
  letter-spacing: 0;
}

.demo-btn .van-button__text {
  color: #1a202c;
}

.demo-btn:active {
  background: #b7791f !important;
  transform: scale(0.98);
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #a0aec0;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  padding: 0 12px;
}

.other-login {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.other-login-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.other-login-item:hover {
  transform: translateY(-2px);
}

.other-login-item span {
  font-size: 12px;
  color: #718096;
}

.register-entry {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.register-link {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.tech-stack {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 1px;
}

@media (max-width: 375px) {
  .login-form {
    padding: 24px 16px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
