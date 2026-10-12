<template>
  <div class="news-detail-container">
    <van-nav-bar title="资讯详情" left-arrow @click-left="goBack" />

    <!-- 加载中 -->
    <van-loading v-if="loading" class="loading" />

    <template v-else-if="news">
      <!-- 资讯封面 -->
      <van-image
        v-if="news.coverImage"
        width="100%"
        height="200"
        fit="cover"
        :src="news.coverImage"
      />

      <!-- 资讯内容 -->
      <div class="news-body">
        <h1 class="news-title">{{ news.title }}</h1>
        <div class="news-meta">
          <span class="source">{{ news.source }}</span>
          <span class="time">{{ formatDate(news.publishTime) }}</span>
          <span class="view-count">浏览 {{ news.viewCount || 0 }}</span>
        </div>
        <div class="news-content" v-html="news.content"></div>
      </div>
    </template>

    <van-empty v-else description="资讯加载失败" />
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
        showToast('获取资讯详情失败')
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
      goBack
    }
  }
}
</script>

<style scoped>
.news-detail-container {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 60px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.news-body {
  padding: 16px;
}

.news-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12px;
}

.news-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.news-content {
  font-size: 15px;
  color: #333;
  line-height: 1.8;
  text-align: justify;
}

.news-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.news-content :deep(p) {
  margin-bottom: 12px;
}
</style>
