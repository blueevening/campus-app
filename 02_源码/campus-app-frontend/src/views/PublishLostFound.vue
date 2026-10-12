<template>
  <div class="page publish-page">
    <van-nav-bar title="发布失物招领" left-arrow @click-left="goBack" />

    <div class="form-wrapper">
      <van-form @submit="handleSubmit">
        <div class="form-card">
          <div class="field-label">信息类型 <em>*</em></div>
          <div class="type-toggle">
            <div
              class="type-option"
              :class="{ active: form.type === 'LOST' }"
              @click="form.type = 'LOST'"
            >
              <van-icon name="search" />
              <span>寻物启事</span>
            </div>
            <div
              class="type-option"
              :class="{ active: form.type === 'FOUND' }"
              @click="form.type = 'FOUND'"
            >
              <van-icon name="passed" />
              <span>招领启事</span>
            </div>
          </div>
        </div>

        <div class="form-card">
          <van-cell-group>
            <van-field
              v-model="form.title"
              name="title"
              label="标题"
              placeholder="请输入标题"
              :rules="[{ required: true, message: '请输入标题' }]"
            />
            <van-field
              v-model="form.itemName"
              name="itemName"
              label="物品名称"
              placeholder="请输入物品名称"
              :rules="[{ required: true, message: '请输入物品名称' }]"
            />
            <van-field
              v-model="form.location"
              name="location"
              label="地点"
              placeholder="请输入丢失/拾获地点"
              :rules="[{ required: true, message: '请输入地点' }]"
            />
            <van-field label="时间" required :rules="[{ required: true, message: '请选择时间' }]">
              <template #input>
                <input
                  v-model="form.eventTime"
                  class="native-date-input"
                  type="date"
                  min="2020-01-01"
                  max="2030-12-31"
                />
              </template>
            </van-field>
            <van-field
              v-model="form.description"
              name="description"
              label="详细描述"
              type="textarea"
              placeholder="请输入物品的详细描述"
              rows="4"
              :rules="[{ required: true, message: '请输入详细描述' }]"
            />
            <van-field
              v-model="form.contactName"
              name="contactName"
              label="联系人"
              placeholder="请输入联系人姓名"
              :rules="[{ required: true, message: '请输入联系人' }]"
            />
            <van-field
              v-model="form.contactPhone"
              name="contactPhone"
              label="联系电话"
              type="tel"
              placeholder="请输入联系电话"
              :rules="[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }
              ]"
            />
          </van-cell-group>
        </div>

        <div class="submit-area">
          <van-button
            round
            block
            type="primary"
            class="submit-btn"
            native-type="submit"
            :loading="submitLoading"
            loading-text="提交中..."
          >
            发布
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { lostFoundApi } from '../api'

export default {
  name: 'PublishLostFound',
  setup() {
    const router = useRouter()
    const submitLoading = ref(false)

    const form = ref({
      type: 'LOST',
      title: '',
      itemName: '',
      location: '',
      timeText: '',
      eventTime: '',
      description: '',
      contactName: '',
      contactPhone: ''
    })

    const handleSubmit = async () => {
      if (submitLoading.value) return
      if (!form.value.eventTime) {
        showToast('请选择时间')
        return
      }
      form.value.timeText = form.value.eventTime
      submitLoading.value = true
      try {
        await lostFoundApi.publish({
          type: form.value.type,
          title: form.value.title,
          itemName: form.value.itemName,
          location: form.value.location,
          eventTime: form.value.eventTime,
          description: form.value.description,
          contactName: form.value.contactName,
          contactPhone: form.value.contactPhone
        })
        showToast({ message: '发布成功', icon: 'success' })
        // 返回列表并由列表 onMounted 重新拉取
        setTimeout(() => {
          router.back()
        }, 600)
      } catch (error) {
        showToast(error?.message || '发布失败')
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
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 32px;
}

.form-wrapper {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.field-label {
  font-size: var(--font-sm);
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.field-label em {
  color: var(--danger);
  font-style: normal;
  margin-left: 2px;
}

.type-toggle {
  display: flex;
  gap: 10px;
}

.type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-option.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 14px rgba(44, 82, 130, 0.22);
}

.form-card :deep(.van-cell) {
  padding-left: 0;
  padding-right: 0;
}

.form-card :deep(.van-cell-group) {
  background: transparent;
}

.form-card :deep(.van-cell::after) {
  left: 0;
  right: 0;
  border-color: var(--border-color);
}

.form-card :deep(.van-field__label) {
  color: var(--text-secondary);
  font-weight: 600;
}

.submit-area {
  padding: 12px 0 24px;
}

.submit-btn {
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 8px 18px rgba(44, 82, 130, 0.25);
}

.native-date-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-md);
  color: var(--text-primary);
  font-family: inherit;
  min-height: 24px;
}
</style>
