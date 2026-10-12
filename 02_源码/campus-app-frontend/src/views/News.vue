<template>
  <div class="news-container">
    <van-nav-bar title="校园资讯" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="add-o" size="20" @click="showPublishTip" />
      </template>
    </van-nav-bar>

    <!-- 搜索栏 -->
    <div class="search-section">
      <van-search
        v-model="keyword"
        placeholder="搜索资讯标题、内容"
        @search="onSearch"
        show-action
        shape="round"
        background="transparent"
      >
        <template #action>
          <span @click="onSearch">搜索</span>
        </template>
      </van-search>
    </div>

    <!-- 分类标签 -->
    <div class="category-section">
      <div class="category-scroll">
        <div
          class="category-tag"
          :class="{ active: activeCategory === '' }"
          @click="switchCategory('')"
        >
          全部
        </div>
        <div
          v-for="cat in categories"
          :key="cat.value"
          class="category-tag"
          :class="{ active: activeCategory === cat.value }"
          @click="switchCategory(cat.value)"
        >
          <van-icon :name="cat.icon" />
          {{ cat.label }}
        </div>
      </div>
    </div>

    <!-- 资讯统计 -->
    <div class="stats-bar">
      <span class="stats-text">共 {{ total }} 条资讯</span>
      <div class="sort-btn" @click="toggleSort">
        <van-icon :name="sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'" size="12" />
        {{ sortOrder === 'desc' ? '最新发布' : '最早发布' }}
      </div>
    </div>

    <!-- 资讯列表 -->
    <div class="news-list" v-if="newsList.length > 0">
      <div
        class="news-card"
        v-for="news in newsList"
        :key="news.id"
        @click="goToDetail(news.id)"
      >
        <div class="news-content">
          <div class="news-header">
            <span class="news-tag" :class="getTagClass(news.category)">
              {{ getTagText(news.category) }}
            </span>
            <span class="news-views">
              <van-icon name="eye-o" /> {{ news.viewCount || 0 }}
            </span>
          </div>
          <h4 class="news-title">{{ news.title }}</h4>
          <p class="news-summary">{{ news.summary }}</p>
          <div class="news-footer">
            <div class="news-source">
              <van-icon name="user-o" />
              <span>{{ news.source || '校园编辑' }}</span>
            </div>
            <span class="news-time">{{ formatDate(news.publishTime) }}</span>
          </div>
        </div>
        <div class="news-cover" v-if="news.coverImage">
          <van-image
            width="110"
            height="80"
            fit="cover"
            :src="news.coverImage"
            radius="8"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="newsList.length === 0 && !loading" description="暂无资讯">
      <template #description>
        <p>暂无{{ activeCategory ? getCategoryName(activeCategory) : '' }}资讯</p>
      </template>
    </van-empty>

    <!-- 加载状态 -->
    <div class="loading-section" v-if="loading">
      <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
    </div>

    <div v-if="finished && newsList.length > 0" class="finished-text">
      — 已经到底了 —
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { newsApi } from '../api'

export default {
  name: 'News',
  setup() {
    const router = useRouter()
    const newsList = ref([])
    const keyword = ref('')
    const activeCategory = ref('')
    const sortOrder = ref('desc')
    const loading = ref(false)
    const finished = ref(false)
    const pageNum = ref(1)
    const total = ref(0)
    const pageSize = 10

    const categories = [
      { value: 1, label: '校园新闻', icon: 'newspaper-o' },
      { value: 2, label: '学术讲座', icon: 'description' },
      { value: 3, label: '社团活动', icon: 'friends-o' },
      { value: 4, label: '通知公告', icon: 'volume-o' }
    ]

    const getTagClass = (category) => {
      const classes = {
        1: 'tag-news',
        2: 'tag-lecture',
        3: 'tag-activity',
        4: 'tag-notice'
      }
      return classes[category] || 'tag-news'
    }

    const getTagText = (category) => {
      const texts = {
        1: '新闻',
        2: '讲座',
        3: '活动',
        4: '通知'
      }
      return texts[category] || '资讯'
    }

    const getCategoryName = (category) => {
      const names = {
        1: '校园新闻',
        2: '学术讲座',
        3: '社团活动',
        4: '通知公告'
      }
      return names[category] || ''
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    const loadNews = async (reset = false) => {
      if (reset) {
        pageNum.value = 1
        newsList.value = []
        finished.value = false
      }

      loading.value = true
      try {
        const res = await newsApi.getNewsList({
          pageNum: pageNum.value,
          pageSize,
          category: activeCategory.value || undefined
        })

        const newNews = res.data?.records || []
        total.value = res.data?.total || 0

        if (reset) {
          newsList.value = newNews
        } else {
          newsList.value = [...newsList.value, ...newNews]
        }

        if (newNews.length < pageSize) {
          finished.value = true
        } else {
          pageNum.value++
        }
      } catch (error) {
        showToast('获取资讯失败')
      } finally {
        loading.value = false
      }
    }

    const switchCategory = (category) => {
      activeCategory.value = category
      loadNews(true)
    }

    const toggleSort = () => {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
      loadNews(true)
    }

    const onSearch = () => {
      loadNews(true)
    }

    const goToDetail = (id) => {
      router.push(`/news/${id}`)
    }

    const showPublishTip = () => {
      showDialog({
        title: '发布资讯',
        message: '发布功能仅限管理员使用。如需发布资讯，请联系学校管理员。',
        confirmButtonText: '我知道了'
      })
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadNews(true)
    })

    return {
      newsList,
      keyword,
      activeCategory,
      sortOrder,
      loading,
      finished,
      total,
      categories,
      getTagClass,
      getTagText,
      getCategoryName,
      formatDate,
      switchCategory,
      toggleSort,
      onSearch,
      goToDetail,
      showPublishTip,
      goBack
    }
  }
}
</script>

<style scoped>
.news-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

/* 搜索区域 */
.search-section {
  padding: 10px 15px;
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
}

/* 分类标签 */
.category-section {
  background: #fff;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.category-scroll {
  display: flex;
  padding: 0 15px;
  overflow-x: auto;
  gap: 10px;
  -webkit-overflow-scrolling: touch;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-tag {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-tag.active {
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  color: #fff;
}

.category-tag:active {
  transform: scale(0.95);
}

/* 统计栏 */
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #fff;
  margin-top: 8px;
}

.stats-text {
  font-size: 13px;
  color: #999;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #2c5282;
  cursor: pointer;
}

/* 资讯列表 */
.news-list {
  padding: 8px 15px;
}

.news-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.news-card:active {
  transform: scale(0.98);
}

.news-content {
  flex: 1;
  margin-right: 12px;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.news-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-news {
  background: #e8f4ff;
  color: #1989fa;
}

.tag-lecture {
  background: #e8f8ef;
  color: #07c160;
}

.tag-activity {
  background: #fff8e6;
  color: #ff976a;
}

.tag-notice {
  background: #fee2e2;
  color: #ef4444;
}

.news-views {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
}

.news-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.news-summary {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-source {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.news-time {
  font-size: 12px;
  color: #999;
}

.news-cover {
  flex-shrink: 0;
}

.news-cover :deep(.van-image) {
  display: block;
}

/* 加载状态 */
.loading-section {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.finished-text {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: #ccc;
}
</style>
