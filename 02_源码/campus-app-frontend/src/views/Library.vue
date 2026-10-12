<template>
  <div class="library-container">
    <van-nav-bar title="图书馆" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="records" size="20" @click="navigateTo('/borrow-records')" />
      </template>
    </van-nav-bar>

    <!-- 搜索栏 -->
    <div class="search-section">
      <van-search
        v-model="keyword"
        placeholder="搜索图书名称、作者、ISBN"
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

    <!-- 分类筛选 -->
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

    <!-- 图书统计 -->
    <div class="stats-bar">
      <span class="stats-text">共 {{ total }} 本图书</span>
      <div class="view-toggle">
        <van-icon
          :name="viewMode === 'list' ? 'apps-o' : 'list-switch'"
          size="18"
          @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
        />
      </div>
    </div>

    <!-- 图书列表视图 -->
    <div class="book-list" v-if="viewMode === 'list'">
      <div
        class="book-card"
        v-for="book in books"
        :key="book.id"
        @click="goToDetail(book.id)"
      >
        <div class="book-cover">
          <van-image
            width="80"
            height="110"
            fit="cover"
            :src="coverByBook(book)"
            radius="6"
          />
          <div class="book-status" :class="book.availableCopies > 0 ? 'status-available' : 'status-empty'">
            {{ book.availableCopies > 0 ? '可借' : '已借完' }}
          </div>
        </div>
        <div class="book-info">
          <h4 class="book-name">{{ book.bookName }}</h4>
          <p class="book-author">
            <van-icon name="user-o" />
            {{ book.author }}
          </p>
          <p class="book-publisher">
            <van-icon name="shop-o" />
            {{ book.publisher }}
          </p>
          <div class="book-meta">
            <span class="book-category">{{ book.category }}</span>
            <span class="book-location">
              <van-icon name="location-o" />
              {{ book.location }}
            </span>
          </div>
          <div class="book-stock">
            <div class="stock-bar">
              <div
                class="stock-fill"
                :style="{ width: (book.availableCopies / book.totalCopies * 100) + '%' }"
              ></div>
            </div>
            <span class="stock-text">库存：{{ book.availableCopies }}/{{ book.totalCopies }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图书网格视图 -->
    <div class="book-grid" v-else>
      <div
        class="book-grid-item"
        v-for="book in books"
        :key="book.id"
        @click="goToDetail(book.id)"
      >
        <div class="grid-cover">
          <van-image
            width="100%"
            height="140"
            fit="cover"
            :src="coverByBook(book)"
            radius="8"
          />
          <div class="grid-status" :class="book.availableCopies > 0 ? 'status-available' : 'status-empty'">
            {{ book.availableCopies > 0 ? '可借' : '已借完' }}
          </div>
        </div>
        <div class="grid-info">
          <h4 class="grid-name">{{ book.bookName }}</h4>
          <p class="grid-author">{{ book.author }}</p>
          <p class="grid-stock">库存：{{ book.availableCopies }}/{{ book.totalCopies }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="books.length === 0 && !loading" description="暂无图书">
      <template #description>
        <p>未找到{{ keyword ? `"${keyword}"相关的` : '' }}图书</p>
      </template>
    </van-empty>

    <!-- 加载状态 -->
    <div class="loading-section" v-if="loading">
      <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
    </div>

    <div v-if="finished && books.length > 0" class="finished-text">
      — 已经到底了 —
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { bookApi } from '../api'
import { bookCover as getDefaultCover, coverByBook } from '../utils/mediaDefaults'

export default {
  name: 'Library',
  setup() {
    const router = useRouter()
    const books = ref([])
    const keyword = ref('')
    const activeCategory = ref('')
    const viewMode = ref('list')
    const loading = ref(false)
    const finished = ref(false)
    const pageNum = ref(1)
    const total = ref(0)
    const pageSize = 10

    const categories = [
      { value: '计算机', label: '计算机', icon: 'desktop-o' },
      { value: '文学', label: '文学', icon: 'edit' },
      { value: '经济', label: '经济', icon: 'gold-coin-o' },
      { value: '历史', label: '历史', icon: 'clock-o' },
      { value: '科学', label: '科学', icon: 'fire-o' },
      { value: '其他', label: '其他', icon: 'ellipsis' }
    ]

    const getDefaultCoverCategory = getDefaultCover

    const loadBooks = async (reset = false) => {
      if (reset) {
        pageNum.value = 1
        books.value = []
        finished.value = false
      }

      loading.value = true
      try {
        const res = await bookApi.getBookList({
          pageNum: pageNum.value,
          pageSize,
          keyword: keyword.value,
          category: activeCategory.value
        })

        const newBooks = res.data?.records || []
        total.value = res.data?.total || 0

        if (reset) {
          books.value = newBooks
        } else {
          books.value = [...books.value, ...newBooks]
        }

        if (newBooks.length < pageSize) {
          finished.value = true
        } else {
          pageNum.value++
        }
      } catch (error) {
        showToast('获取图书失败')
      } finally {
        loading.value = false
      }
    }

    const switchCategory = (category) => {
      activeCategory.value = category
      loadBooks(true)
    }

    const onSearch = () => {
      loadBooks(true)
    }

    const goToDetail = (id) => {
      router.push(`/library/${id}`)
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadBooks(true)
    })

    return {
      books,
      keyword,
      activeCategory,
      viewMode,
      loading,
      finished,
      total,
      categories,
      getDefaultCover: getDefaultCoverCategory,
      coverByBook,
      loadBooks,
      switchCategory,
      onSearch,
      goToDetail,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.library-container {
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

.view-toggle {
  cursor: pointer;
  color: #2c5282;
}

/* 图书列表视图 */
.book-list {
  padding: 8px 15px;
}

.book-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.book-card:active {
  transform: scale(0.98);
}

.book-cover {
  position: relative;
  flex-shrink: 0;
  margin-right: 12px;
}

.book-status {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-available {
  background: #e8f8ef;
  color: #07c160;
}

.status-empty {
  background: #fee2e2;
  color: #ef4444;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author,
.book-publisher {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.book-meta {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.book-category {
  font-size: 11px;
  padding: 2px 8px;
  background: #f0f7ff;
  color: #1989fa;
  border-radius: 4px;
}

.book-location {
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
}

.book-stock {
  margin-top: auto;
  padding-top: 8px;
}

.stock-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #07c160 0%, #38ef7d 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.stock-text {
  font-size: 11px;
  color: #999;
}

/* 图书网格视图 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 8px 15px;
}

.book-grid-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.book-grid-item:active {
  transform: scale(0.98);
}

.grid-cover {
  position: relative;
}

.grid-status {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
}

.grid-info {
  padding: 10px;
}

.grid-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.grid-author {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.grid-stock {
  font-size: 11px;
  color: #07c160;
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
