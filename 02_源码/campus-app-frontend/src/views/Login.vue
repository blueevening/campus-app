<template>
  <div class="login-page">
    <div class="login-shell">
      <!-- 品牌区 -->
      <div class="login-brand">
        <div class="logo">
          <svg viewBox="0 0 24 24" class="logo-icon">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
        <h1 class="title">校园服务平台</h1>
        <p class="subtitle">Campus Service Platform</p>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
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
            <button type="button" class="forgot-link" @click="handleForgotPassword">
              忘记密码？
            </button>
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

    const handleForgotPassword = () => {
      showToast('如忘记密码，请联系管理员重置')
    }

    const handleLogin = async () => {
      if (!form.value.studentId || !form.value.password) {
        showToast('请输入学号和密码')
        return
      }
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
        showToast(error?.message || '登录失败，请检查学号和密码')
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
      handleForgotPassword,
      showToast
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
}

.login-page::before,
.login-page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.login-page::before {
  width: 360px;
  height: 360px;
  top: -120px;
  left: -100px;
  background: var(--primary-soft);
  opacity: 0.7;
}

.login-page::after {
  width: 280px;
  height: 280px;
  bottom: -100px;
  right: -80px;
  background: var(--accent-soft);
  opacity: 0.8;
}

.login-shell {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.login-brand {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.logo-icon {
  width: 48px;
  height: 48px;
  fill: var(--text-inverse);
}

.title {
  font-size: var(--font-2xl);
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  font-size: var(--font-md);
  color: var(--text-secondary);
  letter-spacing: 2px;
}

.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  box-shadow: var(--shadow-md);
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-header h2 {
  font-size: var(--font-xl);
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 6px;
}

.form-header p {
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.input-group {
  margin-bottom: 16px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  padding: 4px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--primary-soft);
}

.input-icon {
  color: var(--text-muted);
  font-size: 18px;
  margin-right: 8px;
}

.custom-input {
  flex: 1;
  background: transparent !important;
}

.custom-input :deep(.van-field__control) {
  background: transparent !important;
  color: var(--text-primary);
}

.eye-icon {
  color: var(--text-muted);
  cursor: pointer;
}

.eye-icon:hover {
  color: var(--primary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.forgot-link {
  font-size: 13px;
  color: var(--primary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.forgot-link:hover {
  color: var(--primary-light);
}

.login-actions {
  margin-bottom: 20px;
}

.login-btn {
  height: 48px;
  font-size: var(--font-lg);
  font-weight: 600;
  letter-spacing: 4px;
}

.demo-btn {
  height: 42px;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  background: linear-gradient(135deg, var(--accent), #e0b44a) !important;
  border: none !important;
  color: var(--text-primary) !important;
  box-shadow: 0 8px 18px rgba(214, 158, 46, 0.28);
}

.demo-btn .van-button__text {
  color: var(--text-primary);
}

.demo-btn:active {
  transform: scale(0.98);
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: var(--text-muted);
  font-size: var(--font-sm);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 12px;
}

.other-login {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.other-login-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform .2s ease;
}

.other-login-item:hover {
  transform: translateY(-2px);
}

.other-login-item span {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.register-entry {
  text-align: center;
  margin-top: 20px;
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.register-link {
  color: var(--primary);
  font-weight: 600;
  margin-left: 4px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--text-muted);
  font-size: var(--font-sm);
}

.tech-stack {
  margin-top: 4px;
  font-size: var(--font-xs);
  letter-spacing: 1px;
}

@media (max-width: 375px) {
  .login-card {
    padding: 24px 16px;
  }

  .title {
    font-size: var(--font-xl);
  }
}

@media (min-width: 900px) {
  .login-shell {
    max-width: 480px;
  }

  .login-card {
    padding: 32px 28px;
  }
}
</style>
