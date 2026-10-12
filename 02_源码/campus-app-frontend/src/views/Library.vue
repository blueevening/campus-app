<template>
  <div class="page library-page">
    <van-nav-bar title="图书馆" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="records" size="20" color="var(--primary)" @click="navigateTo('/borrow-records')" />
      </template>
    </van-nav-bar>

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
      <span class="stats-text">共 <em>{{ total }}</em> 本图书</span>
      <div class="view-toggle">
        <van-icon
          :name="viewMode === 'list' ? 'apps-o' : 'list-switch'"
          size="18"
          color="var(--primary)"
          @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
        />
      </div>
    </div>

    <div v-if="loading && books.length === 0" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载图书中...</van-loading>
    </div>

    <template v-else>
      <div class="book-list" v-if="viewMode === 'list' && books.length > 0">
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
              radius="8"
            />
            <span class="tag book-status" :class="book.availableCopies > 0 ? 'tag-green' : 'tag-red'">
              {{ book.availableCopies > 0 ? '可借' : '已借完' }}
            </span>
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
              <span class="tag tag-blue">{{ book.category }}</span>
              <span class="book-location">
                <van-icon name="location-o" />
                {{ book.location }}
              </span>
            </div>
            <div class="book-stock">
              <div class="stock-bar">
                <div
                  class="stock-fill"
                  :class="{ low: stockPercent(book) < 30 }"
                  :style="{ width: stockPercent(book) + '%' }"
                ></div>
              </div>
              <span class="stock-text">库存：{{ book.availableCopies }}/{{ book.totalCopies }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="book-grid" v-else-if="viewMode === 'grid' && books.length > 0">
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
            <span class="tag grid-status" :class="book.availableCopies > 0 ? 'tag-green' : 'tag-red'">
              {{ book.availableCopies > 0 ? '可借' : '已借完' }}
            </span>
          </div>
          <div class="grid-info">
            <h4 class="grid-name">{{ book.bookName }}</h4>
            <p class="grid-author">{{ book.author }}</p>
            <p class="grid-stock">库存：{{ book.availableCopies }}/{{ book.totalCopies }}</p>
          </div>
        </div>
      </div>

      <van-empty v-if="books.length === 0 && !loading" description="暂无图书">
        <template #description>
          <p>未找到{{ keyword ? `"${keyword}"相关的` : activeCategory ? `「${activeCategory}」分类的` : '' }}图书</p>
        </template>
      </van-empty>

      <div v-if="loading && books.length > 0" class="loading-section">
        <van-loading type="spinner" color="var(--primary)">加载更多...</van-loading>
      </div>

      <div v-if="finished && books.length > 0 && !loading" class="finished-text">
        — 已经到底了 —
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { bookApi } from '../api'
import { coverByBook } from '../utils/mediaDefaults'

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

    const stockPercent = (book) => {
      const totalCopies = Number(book.totalCopies) || 0
      const available = Number(book.availableCopies) || 0
      if (totalCopies <= 0) return 0
      return Math.min(100, Math.round((available / totalCopies) * 100))
    }

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
        total.value = res.data?.total ?? newBooks.length

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
        showToast(error?.message || '获取图书失败')
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
      if (window.history.length > 1) router.back()
      else router.push('/')
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
      coverByBook,
      stockPercent,
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
.library-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 24px;
}

.search-section {
  padding: 10px 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.search-action {
  color: var(--text-inverse);
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
  color: var(--text-secondary);
  background: var(--bg-muted);
  cursor: pointer;
  transition: all .2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border-color);
}

.category-tag.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: var(--text-inverse);
  border-color: transparent;
}

.category-tag:active {
  transform: scale(0.95);
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-card);
  margin: 10px 16px 0;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.stats-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.stats-text em {
  font-style: normal;
  font-weight: 700;
  color: var(--primary);
}

.view-toggle {
  cursor: pointer;
  padding: 4px;
}

.book-list {
  padding: 12px 16px;
}

.book-card {
  display: flex;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: box-shadow .2s ease, transform .2s ease;
}

.book-card:hover {
  box-shadow: var(--shadow-md);
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
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.book-name {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author,
.book-publisher {
  font-size: var(--font-sm);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.book-location {
  font-size: var(--font-xs);
  color: var(--text-muted);
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
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 4px;
}

.stock-fill {
  height: 100%;
  background: var(--success);
  border-radius: var(--radius-full);
  transition: width .3s ease;
}

.stock-fill.low {
  background: var(--accent);
}

.stock-text {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px 16px;
}

.book-grid-item {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: box-shadow .2s ease, transform .2s ease;
}

.book-grid-item:hover {
  box-shadow: var(--shadow-md);
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
}

.grid-info {
  padding: 10px 12px 12px;
}

.grid-name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.grid-author {
  font-size: var(--font-sm);
  color: var(--text-muted);
  margin-bottom: 4px;
}

.grid-stock {
  font-size: var(--font-xs);
  color: var(--success);
  font-weight: 600;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.loading-section {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.finished-text {
  text-align: center;
  padding: 20px;
  font-size: var(--font-sm);
  color: var(--text-muted);
}
</style>
