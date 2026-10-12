<template>
  <div class="register-container">
    <div class="register-header">
      <van-icon name="arrow-left" size="24" @click="goBack" />
      <h2>用户注册</h2>
    </div>

    <div class="register-form">
      <van-form @submit="handleRegister">
        <van-cell-group inset>
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
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { validator: v => v.length >= 6, message: '密码至少6位' }
            ]"
          />
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: v => v === form.password, message: '两次密码不一致' }
            ]"
          />
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[
              { pattern: /^[\w.-]+@[\w.-]+\.\w+$/, message: '邮箱格式不正确' }
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
            注册
          </van-button>

          <div class="login-link">
            <span>已有账号？</span>
            <router-link to="/login">立即登录</router-link>
          </div>
        </div>
      </van-form>
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

    const handleRegister = async () => {
      loading.value = true
      try {
        const data = { ...form.value }
        delete data.confirmPassword
        data.gender = parseInt(data.gender)

        await userApi.register(data)
        showToast('注册成功')
        router.push('/login')
      } catch (error) {
        showToast(error.message || '注册失败')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      goBack,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.register-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.register-header h2 {
  flex: 1;
  text-align: center;
  font-size: 18px;
  margin-right: 24px;
}

.register-form {
  padding: 16px;
}

.register-actions {
  margin-top: 30px;
  padding: 0 16px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #1989fa;
  margin-left: 4px;
}
</style>
