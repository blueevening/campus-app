<template>
  <div class="edit-profile-container">
    <van-nav-bar title="编辑资料" left-arrow @click-left="goBack" />

    <div class="form-wrapper">
      <!-- 头像 -->
      <div class="avatar-section">
        <van-image
          round
          width="80"
          height="80"
          :src="form.avatar || defaultAvatar"
        />
        <span class="change-avatar" @click="handleChangeAvatar">更换头像</span>
      </div>

      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <!-- 用户名 -->
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />

          <!-- 学号（只读） -->
          <van-field
            v-model="form.studentId"
            name="studentId"
            label="学号"
            readonly
          />

          <!-- 学院 -->
          <van-field
            v-model="form.college"
            name="college"
            label="学院"
            placeholder="请输入学院"
          />

          <!-- 专业 -->
          <van-field
            v-model="form.major"
            name="major"
            label="专业"
            placeholder="请输入专业"
          />

          <!-- 年级 -->
          <van-field
            v-model="form.grade"
            name="grade"
            label="年级"
            placeholder="请输入年级"
          />

          <!-- 班级 -->
          <van-field
            v-model="form.className"
            name="className"
            label="班级"
            placeholder="请输入班级"
          />

          <!-- 手机号 -->
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            type="tel"
            placeholder="请输入手机号"
          />

          <!-- 邮箱 -->
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            type="email"
            placeholder="请输入邮箱"
          />
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

    const loadUserInfo = async () => {
      try {
        const res = await userApi.getUserInfo()
        const user = res.data
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
      } catch (error) {
        showToast('获取用户信息失败')
      }
    }

    const handleChangeAvatar = () => {
      showToast('头像上传功能开发中')
    }

    const handleSubmit = async () => {
      submitLoading.value = true
      try {
        await userApi.updateUserInfo({
          username: form.value.username,
          college: form.value.college,
          major: form.value.major,
          grade: form.value.grade,
          className: form.value.className,
          phone: form.value.phone,
          email: form.value.email
        })

        // 更新vuex中的用户信息
        store.dispatch('updateUserInfo', {
          ...store.getters.getUser,
          username: form.value.username,
          avatar: form.value.avatar
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
      submitLoading,
      handleChangeAvatar,
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.edit-profile-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.form-wrapper {
  padding-top: 12px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  background: #fff;
  margin-bottom: 12px;
}

.change-avatar {
  margin-top: 12px;
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
}

.submit-area {
  padding: 24px 16px;
}
</style>
