<template>
  <div class="change-password-container">
    <van-nav-bar title="修改密码" left-arrow @click-left="goBack" />

    <div class="form-wrapper">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <!-- 原密码 -->
          <van-field
            v-model="form.oldPassword"
            type="password"
            name="oldPassword"
            label="原密码"
            placeholder="请输入原密码"
            :rules="[{ required: true, message: '请输入原密码' }]"
            left-icon="lock"
          />

          <!-- 新密码 -->
          <van-field
            v-model="form.newPassword"
            type="password"
            name="newPassword"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[
              { required: true, message: '请输入新密码' },
              { validator: validatePassword, message: '密码长度为6-20位' }
            ]"
            left-icon="lock"
          />

          <!-- 确认新密码 -->
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入新密码"
            :rules="[
              { required: true, message: '请确认新密码' },
              { validator: validateConfirm, message: '两次输入的密码不一致' }
            ]"
            left-icon="lock"
          />
        </van-cell-group>

        <div class="submit-area">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitLoading"
            loading-text="修改中..."
          >
            确认修改
          </van-button>
        </div>
      </van-form>

      <!-- 提示信息 -->
      <div class="tips">
        <h4>密码要求：</h4>
        <ul>
          <li>密码长度为6-20位</li>
          <li>建议使用字母、数字和符号的组合</li>
          <li>修改密码后需要重新登录</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast, showDialog } from 'vant'
import { userApi } from '../api'

export default {
  name: 'ChangePassword',
  setup() {
    const router = useRouter()
    const store = useStore()
    const submitLoading = ref(false)

    const form = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const validatePassword = (val) => {
      return val.length >= 6 && val.length <= 20
    }

    const validateConfirm = (val) => {
      return val === form.value.newPassword
    }

    const handleSubmit = async () => {
      if (form.value.newPassword !== form.value.confirmPassword) {
        showToast('两次输入的密码不一致')
        return
      }

      submitLoading.value = true
      try {
        await userApi.changePassword({
          oldPassword: form.value.oldPassword,
          newPassword: form.value.newPassword
        })

        await showDialog({
          title: '修改成功',
          message: '密码修改成功，请重新登录'
        })

        // 退出登录
        store.dispatch('logout')
        router.push('/login')
      } catch (error) {
        showToast(error.message || '修改失败')
      } finally {
        submitLoading.value = false
      }
    }

    const goBack = () => {
      router.back()
    }

    return {
      form,
      submitLoading,
      validatePassword,
      validateConfirm,
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.change-password-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.form-wrapper {
  padding-top: 12px;
}

.submit-area {
  padding: 24px 16px;
}

.tips {
  margin: 0 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.tips h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips li {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  padding-left: 12px;
  position: relative;
}

.tips li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1989fa;
}
</style>
