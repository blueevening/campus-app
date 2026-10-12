<template>
  <div class="page">
    <van-nav-bar title="修改密码" left-arrow @click-left="goBack" />

    <div class="form-wrapper">
      <div class="form-card page-card">
        <div class="section-title">修改登录密码</div>
        <van-form @submit="handleSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.oldPassword"
              type="password"
              name="oldPassword"
              label="原密码"
              placeholder="请输入原密码"
              :rules="[{ required: true, message: '请输入原密码' }]"
              left-icon="lock"
            />
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
      </div>

      <div class="tips page-card">
        <div class="section-title">密码要求</div>
        <ul>
          <li>密码长度为 6-20 位</li>
          <li>建议使用字母、数字和符号的组合</li>
          <li>两次输入的新密码必须一致</li>
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
      if (form.value.newPassword.length < 6 || form.value.newPassword.length > 20) {
        showToast('密码长度为6-20位')
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
          message: '密码修改成功，请重新登录',
          confirmButtonText: '去登录'
        })

        store.dispatch('logout')
        router.replace('/login')
      } catch (error) {
        if (error !== 'cancel' && error !== 'overlay') {
          showToast(error.message || '修改失败')
        }
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
.form-wrapper {
  padding: var(--space-3);
  display: grid;
  gap: var(--space-3);
}

.form-card {
  padding: var(--space-4);
}

.submit-area {
  padding: var(--space-5) 0 var(--space-2);
}

.tips {
  padding: var(--space-4);
}

.tips ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tips li {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.7;
  padding-left: 14px;
  position: relative;
}

.tips li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
}
</style>
