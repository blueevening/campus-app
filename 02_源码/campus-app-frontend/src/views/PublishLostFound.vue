<template>
  <div class="publish-container">
    <van-nav-bar title="发布失物招领" left-arrow @click-left="goBack" />

    <div class="form-wrapper">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field name="type" label="类型">
            <template #input>
              <van-radio-group v-model="form.type" direction="horizontal">
                <van-radio name="LOST">寻物启事</van-radio>
                <van-radio name="FOUND">招领启事</van-radio>
              </van-radio-group>
            </template>
          </van-field>

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

          <!-- 原生日期：电脑/手机都稳定，无弹层黑屏 -->
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
            :rules="[{ required: true, message: '请输入联系电话' }]"
          />
        </van-cell-group>

        <div class="submit-area">
          <van-button
            round
            block
            type="primary"
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
        showToast('发布成功')
        router.back()
      } catch (error) {
        showToast(error.message || '发布失败')
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
.publish-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 24px;
}

.form-wrapper {
  padding-top: 12px;
}

.submit-area {
  padding: 24px 16px;
}

.native-date-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #323233;
  font-family: inherit;
  min-height: 24px;
}
</style>
