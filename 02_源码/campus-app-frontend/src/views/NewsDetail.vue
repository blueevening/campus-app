<template>
  <div class="page detail-page">
    <van-nav-bar title="资讯详情" left-arrow @click-left="goBack" />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载中...</van-loading>
    </div>

    <template v-else-if="news">
      <div class="cover-wrap" v-if="news.coverImage">
        <van-image
          width="100%"
          height="200"
          fit="cover"
          :src="news.coverImage"
        />
      </div>

      <div class="news-body">
        <h1 class="news-title">{{ news.title }}</h1>
        <div class="news-meta">
          <span class="source">{{ news.source || '校园编辑' }}</span>
          <span class="time">{{ formatDate(news.publishTime) }}</span>
          <span class="view-count">浏览 {{ news.viewCount || 0 }}</span>
        </div>
        <div class="news-content" v-html="news.content"></div>
      </div>
    </template>

    <van-empty v-else description="资讯加载失败">
      <van-button round type="primary" size="small" @click="loadNewsDetail">
        重新加载
      </van-button>
    </van-empty>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { newsApi } from '../api'

export default {
  name: 'NewsDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const news = ref(null)
    const loading = ref(true)

    const loadNewsDetail = async () => {
      const id = route.params.id
      loading.value = true
      try {
        const res = await newsApi.getNewsDetail(id)
        news.value = res.data
      } catch (error) {
        news.value = null
        showToast(error?.message || '获取资讯详情失败')
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${year}年${month}月${day}日`
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadNewsDetail()
    })

    return {
      news,
      loading,
      formatDate,
      loadNewsDetail,
      goBack
    }
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 40px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.cover-wrap {
  overflow: hidden;
  border-bottom: 1px solid var(--border-color);
}

.news-body {
  margin: 16px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.news-title {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.news-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: var(--font-sm);
  color: var(--text-muted);
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.news-content {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.8;
  text-align: justify;
  word-break: break-word;
}

.news-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  margin: 8px 0;
}

.news-content :deep(p) {
  margin-bottom: 12px;
}
</style>
