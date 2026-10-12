<template>
  <div class="page publish-page">
    <van-nav-bar title="发布资讯" left-arrow @click-left="goBack">
      <template #right>
        <span class="nav-action" :class="{ disabled: publishing }" @click="handlePublish">发布</span>
      </template>
    </van-nav-bar>

    <div class="form-section">
      <div class="form-card">
        <div class="field-label">资讯标题 <em>*</em></div>
        <van-field
          v-model="form.title"
          placeholder="请输入资讯标题"
          class="title-input"
          maxlength="50"
          show-word-limit
          :disabled="publishing"
        />
      </div>

      <div class="form-card">
        <div class="field-label">选择分类 <em>*</em></div>
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

      <div class="form-card">
        <div class="field-label">资讯摘要</div>
        <van-field
          v-model="form.summary"
          type="textarea"
          placeholder="请输入资讯摘要（选填，不超过100字）"
          rows="2"
          maxlength="100"
          show-word-limit
          :disabled="publishing"
        />
      </div>

      <div class="form-card">
        <div class="field-label">资讯内容 <em>*</em></div>
        <van-field
          v-model="form.content"
          type="textarea"
          placeholder="请输入资讯内容"
          rows="8"
          class="content-input"
          :disabled="publishing"
        />
      </div>

      <div class="form-card">
        <div class="field-label">封面图片（选填）</div>
        <van-uploader v-model="fileList" :max-count="1" :after-read="afterRead" :disabled="publishing">
          <template #default>
            <div class="upload-trigger">
              <van-icon name="plus" size="24" />
              <span>添加封面</span>
            </div>
          </template>
        </van-uploader>
      </div>
    </div>

    <div class="bottom-bar">
      <van-button
        block
        round
        type="primary"
        class="submit-btn"
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
      form.value.coverImage = file.content
    }

    const validate = () => {
      if (!form.value.title.trim()) {
        showToast('请输入标题')
        return false
      }
      if (!form.value.category) {
        showToast('请选择分类')
        return false
      }
      if (!form.value.content.trim()) {
        showToast('请输入内容')
        return false
      }
      return true
    }

    const handlePublish = async () => {
      if (publishing.value) return
      if (!validate()) return

      publishing.value = true
      try {
        await newsApi.publishNews({
          title: form.value.title.trim(),
          content: form.value.content.trim(),
          summary: form.value.summary.trim(),
          category: form.value.category,
          coverImage: form.value.coverImage
        })
        showToast({ message: '发布成功！', icon: 'success' })
        // 返回列表并由列表 onMounted 重新拉取
        setTimeout(() => {
          router.back()
        }, 600)
      } catch (error) {
        showToast(error?.message || '发布失败')
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
.publish-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 96px;
}

.nav-action {
  color: var(--primary);
  font-size: var(--font-md);
  font-weight: 700;
  cursor: pointer;
}

.nav-action.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.form-section {
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

.form-card :deep(.van-field) {
  padding: 0;
  background: transparent;
}

.title-input :deep(.van-field__control) {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.category-tag.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 14px rgba(44, 82, 130, 0.22);
}

.content-input :deep(.van-field__control) {
  min-height: 160px;
}

.upload-trigger {
  width: 100px;
  height: 100px;
  background: var(--bg-muted);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.upload-trigger:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.upload-trigger span {
  font-size: var(--font-xs);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 16px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  z-index: 50;
}

.submit-btn {
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
