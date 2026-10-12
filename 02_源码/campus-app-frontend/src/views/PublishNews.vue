<template>
  <div class="publish-container">
    <van-nav-bar title="发布资讯" left-arrow @click-left="goBack">
      <template #right>
        <span class="publish-btn" @click="handlePublish">发布</span>
      </template>
    </van-nav-bar>

    <div class="form-section">
      <!-- 标题 -->
      <van-field
        v-model="form.title"
        placeholder="请输入资讯标题"
        class="title-input"
        maxlength="50"
        show-word-limit
      />

      <!-- 分类选择 -->
      <div class="category-section">
        <span class="label">选择分类</span>
        <div class="category-tags">
          <div
            v-for="cat in categories"
            :key="cat.value"
            class="category-tag"
            :class="{ active: form.category === cat.value }"
            @click="form.category = cat.value"
          >
            <van-icon :name="cat.icon" />
            {{ cat.label }}
          </div>
        </div>
      </div>

      <!-- 摘要 -->
      <van-field
        v-model="form.summary"
        type="textarea"
        placeholder="请输入资讯摘要（选填，不超过100字）"
        rows="2"
        maxlength="100"
        show-word-limit
      />

      <!-- 内容 -->
      <van-field
        v-model="form.content"
        type="textarea"
        placeholder="请输入资讯内容"
        rows="10"
        class="content-input"
      />

      <!-- 封面图片（选填） -->
      <div class="cover-section">
        <span class="label">封面图片（选填）</span>
        <van-uploader v-model="fileList" :max-count="1" :after-read="afterRead">
          <template #default>
            <div class="upload-trigger">
              <van-icon name="plus" size="24" />
              <span>添加封面</span>
            </div>
          </template>
        </van-uploader>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-bar">
      <van-button
        block
        round
        type="primary"
        @click="handlePublish"
        :loading="publishing"
        loading-text="发布中..."
      >
        发布资讯
      </van-button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { newsApi } from '../api'

export default {
  name: 'PublishNews',
  setup() {
    const router = useRouter()
    const publishing = ref(false)
    const fileList = ref([])

    const form = ref({
      title: '',
      content: '',
      summary: '',
      category: 1,
      coverImage: ''
    })

    const categories = [
      { value: 1, label: '校园新闻', icon: 'newspaper-o' },
      { value: 2, label: '学术讲座', icon: 'description' },
      { value: 3, label: '社团活动', icon: 'friends-o' },
      { value: 4, label: '通知公告', icon: 'volume-o' }
    ]

    const afterRead = (file) => {
      // 模拟上传成功
      form.value.coverImage = file.content
    }

    const handlePublish = async () => {
      if (!form.value.title.trim()) {
        showToast('请输入标题')
        return
      }
      if (!form.value.content.trim()) {
        showToast('请输入内容')
        return
      }

      publishing.value = true
      try {
        const res = await newsApi.publishNews(form.value)
        if (res.code === 200) {
          showToast({
            message: '发布成功！',
            icon: 'success'
          })
          setTimeout(() => {
            router.back()
          }, 1500)
        } else {
          showToast({
            message: res.message || '发布失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        showToast(error.message || '发布失败')
      } finally {
        publishing.value = false
      }
    }

    const goBack = () => {
      router.back()
    }

    return {
      form,
      categories,
      fileList,
      publishing,
      afterRead,
      handlePublish,
      goBack
    }
  }
}
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.publish-btn {
  color: #2c5282;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.form-section {
  margin: 15px;
}

.title-input {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  border-radius: 12px;
}

.category-section {
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
}

.category-section .label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.category-tag.active {
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  color: #fff;
}

.content-input {
  border-radius: 12px;
  margin-bottom: 15px;
}

.cover-section {
  background: #fff;
  padding: 15px;
  border-radius: 12px;
}

.cover-section .label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.upload-trigger {
  width: 100px;
  height: 100px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999;
  cursor: pointer;
}

.upload-trigger span {
  font-size: 12px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
