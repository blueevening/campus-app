<template>
  <div class="page">
    <van-nav-bar title="编辑资料" left-arrow @click-left="goBack" />

    <div class="form-wrapper">
      <div class="avatar-section page-card">
        <van-image round width="80" height="80" :src="form.avatar || defaultAvatar" />
        <span class="change-avatar" @click="handleChangeAvatar">更换头像</span>
      </div>

      <div class="form-card page-card">
        <div class="section-title">基本信息</div>
        <div v-if="pageLoading" class="loading-box">
          <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
        </div>
        <van-form v-else @submit="handleSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
            />
            <van-field v-model="form.studentId" name="studentId" label="学号" readonly />
            <van-field v-model="form.college" name="college" label="学院" placeholder="请输入学院" />
            <van-field v-model="form.major" name="major" label="专业" placeholder="请输入专业" />
            <van-field v-model="form.grade" name="grade" label="年级" placeholder="请输入年级" />
            <van-field v-model="form.className" name="className" label="班级" placeholder="请输入班级" />
            <van-field v-model="form.phone" name="phone" label="手机号" type="tel" placeholder="请输入手机号" />
            <van-field v-model="form.email" name="email" label="邮箱" type="email" placeholder="请输入邮箱" />
          </van-cell-group>

          <div class="submit-area">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="submitLoading"
              loading-text="保存中..."
            >
              保存
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast } from 'vant'
import { userApi } from '../api'
import { DEFAULT_AVATAR } from '../utils/mediaDefaults'

export default {
  name: 'EditProfile',
  setup() {
    const router = useRouter()
    const store = useStore()
    const submitLoading = ref(false)
    const pageLoading = ref(true)

    const form = ref({
      username: '',
      studentId: '',
      college: '',
      major: '',
      grade: '',
      className: '',
      phone: '',
      email: '',
      avatar: ''
    })

    const applyUserToForm = (user) => {
      form.value = {
        username: user.username || '',
        studentId: user.studentId || '',
        college: user.college || '',
        major: user.major || '',
        grade: user.grade || '',
        className: user.className || '',
        phone: user.phone || '',
        email: user.email || '',
        avatar: user.avatar || ''
      }
    }

    const loadUserInfo = async () => {
      pageLoading.value = true
      try {
        const res = await userApi.getUserInfo()
        applyUserToForm(res.data || {})
      } catch (error) {
        showToast(error.message || '获取用户信息失败')
      } finally {
        pageLoading.value = false
      }
    }

    const handleChangeAvatar = () => {
      showToast('头像上传功能开发中')
    }

    const handleSubmit = async () => {
      submitLoading.value = true
      try {
        const payload = {
          username: form.value.username,
          college: form.value.college,
          major: form.value.major,
          grade: form.value.grade,
          className: form.value.className,
          phone: form.value.phone,
          email: form.value.email
        }
        const res = await userApi.updateUserInfo(payload)
        const updated = res.data || {}

        // 同步全局用户信息（含角色/token 字段不覆盖）
        store.dispatch('updateUserInfo', {
          ...store.getters.getUser,
          ...payload,
          studentId: updated.studentId || form.value.studentId,
          avatar: updated.avatar || form.value.avatar,
          id: updated.id || store.getters.getUser.id,
          role: updated.role !== undefined ? updated.role : store.getters.getUser.role,
          status: updated.status !== undefined ? updated.status : store.getters.getUser.status
        })

        showToast('保存成功')
        router.back()
      } catch (error) {
        showToast(error.message || '保存失败')
      } finally {
        submitLoading.value = false
      }
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadUserInfo()
    })

    return {
      form,
      defaultAvatar: DEFAULT_AVATAR,
      pageLoading,
      submitLoading,
      handleChangeAvatar,
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

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6) var(--space-4);
}

.change-avatar {
  margin-top: var(--space-3);
  font-size: var(--font-md);
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
}

.form-card {
  padding: var(--space-4);
}

.submit-area {
  padding: var(--space-5) 0 var(--space-2);
}

.loading-box {
  padding: var(--space-8);
  display: flex;
  justify-content: center;
}
</style>
