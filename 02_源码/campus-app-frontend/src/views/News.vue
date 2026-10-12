<template>
  <div class="page news-page">
    <van-nav-bar title="校园资讯" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="add-o" size="20" @click="handlePublishClick" />
      </template>
    </van-nav-bar>

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
          <span class="search-action" @click="onSearch">搜索</span>
        </template>
      </van-search>
    </div>

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

    <div class="stats-bar">
      <span class="stats-text">共 {{ total }} 条资讯</span>
      <div class="sort-btn" @click="toggleSort">
        <van-icon :name="sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'" size="12" />
        {{ sortOrder === 'desc' ? '最新发布' : '最早发布' }}
      </div>
    </div>

    <div class="news-list" v-if="newsList.length > 0">
      <div
        class="news-card"
        v-for="news in newsList"
        :key="news.id"
        @click="goToDetail(news.id)"
      >
        <div class="news-content">
          <div class="news-header">
            <span class="tag" :class="getTagClass(news.category)">
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

    <van-empty
      v-if="newsList.length === 0 && !loading"
      :description="emptyText"
    />

    <div class="loading-section" v-if="loading">
      <van-loading type="spinner" color="var(--primary)">加载中...</van-loading>
    </div>

    <div v-if="finished && newsList.length > 0" class="finished-text">
      — 已经到底了 —
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast, showDialog } from 'vant'
import { newsApi } from '../api'

export default {
  name: 'News',
  setup() {
    const router = useRouter()
    const store = useStore()
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

    const canPublish = computed(() => {
      const r = Number(store.getters.getRole) || 0
      return r === 1 || r === 2
    })

    const emptyText = computed(() => {
      if (keyword.value) return `未找到「${keyword.value}」相关资讯`
      if (activeCategory.value) return `暂无${getCategoryName(activeCategory.value)}资讯`
      return '暂无资讯'
    })

    const getTagClass = (category) => {
      const classes = { 1: 'tag-blue', 2: 'tag-green', 3: 'tag-gold', 4: 'tag-red' }
      return classes[category] || 'tag-blue'
    }

    const getTagText = (category) => {
      const texts = { 1: '新闻', 2: '讲座', 3: '活动', 4: '通知' }
      return texts[category] || '资讯'
    }

    const getCategoryName = (category) => {
      const names = { 1: '校园新闻', 2: '学术讲座', 3: '社团活动', 4: '通知公告' }
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
      if (loading.value) return
      loading.value = true
      try {
        const res = await newsApi.getNewsList({
          pageNum: pageNum.value,
          pageSize,
          keyword: keyword.value || undefined,
          category: activeCategory.value || undefined,
          sortOrder: sortOrder.value
        })
        let newNews = res.data?.records || []
        // 本地兜底排序（后端未实现 sort 时仍可切换）
        newNews = [...newNews].sort((a, b) => {
          const ta = new Date(a.publishTime || 0).getTime()
          const tb = new Date(b.publishTime || 0).getTime()
          return sortOrder.value === 'desc' ? tb - ta : ta - tb
        })
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
        showToast(error?.message || '获取资讯失败')
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

    const handlePublishClick = () => {
      if (canPublish.value) {
        router.push('/news/publish')
      } else {
        showDialog({
          title: '发布资讯',
          message: '发布功能仅限管理员/班长使用。如需发布资讯，请联系学校管理员。',
          confirmButtonText: '我知道了'
        })
      }
    }

    const goBack = () => {
      router.back()
    }

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const clientHeight = document.documentElement.clientHeight
      if (scrollTop + clientHeight >= scrollHeight - 80 && !loading.value && !finished.value) {
        loadNews(false)
      }
    }

    onMounted(() => {
      loadNews(true)
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
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
      emptyText,
      getTagClass,
      getTagText,
      getCategoryName,
      formatDate,
      switchCategory,
      toggleSort,
      onSearch,
      goToDetail,
      handlePublishClick,
      goBack
    }
  }
}
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 24px;
}

.search-section {
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.search-action {
  color: #fff;
  font-size: var(--font-md);
  font-weight: 600;
}

.category-section {
  background: var(--bg-card);
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.category-scroll {
  display: flex;
  padding: 0 16px;
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
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-tag.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 14px rgba(44, 82, 130, 0.22);
}

.category-tag:active {
  transform: scale(0.95);
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.stats-text {
  font-size: var(--font-sm);
  color: var(--text-muted);
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--primary-soft);
}

.news-list {
  padding: 0 16px;
}

.news-card {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.news-card:hover {
  box-shadow: var(--shadow-md);
}

.news-card:active {
  transform: scale(0.98);
}

.news-content {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.news-views {
  font-size: var(--font-xs);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 2px;
}

.news-title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.news-summary {
  font-size: var(--font-sm);
  color: var(--text-secondary);
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
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.news-time {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.news-cover {
  flex-shrink: 0;
}

.news-cover :deep(.van-image) {
  display: block;
  overflow: hidden;
  border-radius: var(--radius-sm);
}

.loading-section {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.finished-text {
  text-align: center;
  padding: 20px;
  font-size: var(--font-sm);
  color: var(--text-muted);
}
</style>
