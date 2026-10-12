<template>
  <div class="register-page">
    <van-nav-bar
      title="用户注册"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <div class="register-shell">
      <div class="register-intro">
        <h2>创建校园账号</h2>
        <p>完善信息后即可使用全部校园服务</p>
      </div>

      <div class="register-card">
        <van-form @submit="handleRegister">
          <van-cell-group :border="false">
            <van-field
              v-model="form.studentId"
              name="studentId"
              label="学号"
              placeholder="请输入学号"
              :rules="[
                { required: true, message: '请输入学号' },
                { pattern: /^[0-9]{6,12}$/, message: '学号为6-12位数字' }
              ]"
            />
            <van-field
              v-model="form.username"
              name="username"
              label="姓名"
              placeholder="请输入真实姓名"
              :rules="[
                { required: true, message: '请输入姓名' },
                { validator: v => (v || '').trim().length >= 2, message: '姓名至少2个字符' }
              ]"
            />
            <van-field
              v-model="form.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[
                { required: true, message: '请输入密码' },
                { validator: v => (v || '').length >= 6, message: '密码至少6位' }
              ]"
            />
            <van-field
              v-model="form.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="[
                { required: true, message: '请再次输入密码确认' },
                { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
              ]"
            />
            <van-field
              v-model="form.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              :rules="[
                { validator: v => !v || /^1[3-9]\d{9}$/.test(v), message: '手机号格式不正确' }
              ]"
            />
            <van-field
              v-model="form.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              :rules="[
                { validator: v => !v || /^[\w.-]+@[\w.-]+\.\w+$/.test(v), message: '邮箱格式不正确' }
              ]"
            />
            <van-field
              v-model="form.college"
              name="college"
              label="学院"
              placeholder="请输入学院"
            />
            <van-field
              v-model="form.major"
              name="major"
              label="专业"
              placeholder="请输入专业"
            />
            <van-field
              v-model="form.className"
              name="className"
              label="班级"
              placeholder="请输入班级"
            />
            <van-field name="gender" label="性别">
              <template #input>
                <van-radio-group v-model="form.gender" direction="horizontal">
                  <van-radio name="1">男</van-radio>
                  <van-radio name="2">女</van-radio>
                  <van-radio name="0">保密</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>

          <div class="register-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="注册中..."
            >
              立即注册
            </van-button>

            <div class="login-link">
              <span>已有账号？</span>
              <router-link to="/login">立即登录</router-link>
            </div>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '../api'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const loading = ref(false)

    const form = ref({
      studentId: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      email: '',
      college: '',
      major: '',
      className: '',
      gender: '0'
    })

    const goBack = () => {
      router.back()
    }

    const validateConfirmPassword = (val) => {
      return val === form.value.password
    }

    const handleRegister = async () => {
      // 二次校验确认密码
      if (form.value.password !== form.value.confirmPassword) {
        showToast('两次输入的密码不一致，请重新确认')
        return
      }
      if ((form.value.password || '').length < 6) {
        showToast('密码至少6位')
        return
      }

      loading.value = true
      try {
        const data = { ...form.value }
        delete data.confirmPassword
        data.gender = parseInt(data.gender)
        if (data.username) data.username = data.username.trim()

        await userApi.register(data)
        showToast({
          message: '注册成功，请登录',
          icon: 'success',
          duration: 1500
        })
        // 明确跳转登录页
        setTimeout(() => {
          router.replace({
            path: '/login',
            query: { registered: '1' }
          })
        }, 1200)
      } catch (error) {
        showToast(error?.message || '注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      goBack,
      validateConfirmPassword,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 32px;
}

.register-shell {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
}

.register-intro {
  margin: 8px 4px 16px;
}

.register-intro h2 {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.register-intro p {
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.register-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 8px 0 16px;
  overflow: hidden;
}

.register-card :deep(.van-cell) {
  background: transparent;
}

.register-card :deep(.van-cell::after) {
  border-color: var(--border-color);
}

.register-card :deep(.van-field__label) {
  color: var(--text-secondary);
  width: 72px;
}

.register-card :deep(.van-field__control) {
  color: var(--text-primary);
}

.register-actions {
  margin-top: 24px;
  padding: 0 16px;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.login-link a {
  color: var(--primary);
  font-weight: 600;
  margin-left: 4px;
}

@media (min-width: 900px) {
  .register-shell {
    max-width: 640px;
    padding: 24px;
  }

  .register-intro {
    margin-bottom: 20px;
  }
}
</style>
