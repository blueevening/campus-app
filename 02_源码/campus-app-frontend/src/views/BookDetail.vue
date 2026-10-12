<template>
  <div class="page book-detail-page">
    <van-nav-bar title="图书详情" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="share-o" size="20" color="var(--primary)" @click="showShareTip" />
      </template>
    </van-nav-bar>

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载图书详情...</van-loading>
    </div>

    <template v-else-if="book">
      <div class="book-header">
        <div class="book-cover-wrapper">
          <van-image
            width="130"
            height="180"
            fit="cover"
            :src="coverByBook(book)"
            radius="10"
            class="book-cover"
          />
        </div>
        <div class="book-basic">
          <h2 class="book-title">{{ book.bookName }}</h2>
          <div class="book-meta">
            <div class="meta-item">
              <van-icon name="user-o" />
              <span>{{ book.author }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="shop-o" />
              <span>{{ book.publisher }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="calendar-o" />
              <span>{{ book.publishDate || '未知' }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="label-o" />
              <span>ISBN: {{ book.isbn }}</span>
            </div>
          </div>
          <div class="book-tags">
            <span class="tag tag-blue">{{ book.category }}</span>
            <span class="tag tag-gold">
              <van-icon name="location-o" />
              {{ book.location }}
            </span>
          </div>
        </div>
      </div>

      <div class="stock-section">
        <div class="stock-header">
          <span class="stock-title">库存状态</span>
          <span class="tag" :class="isAvailable ? 'tag-green' : 'tag-red'">
            {{ isAvailable ? '可借阅' : '暂无库存' }}
          </span>
        </div>
        <div class="stock-bar">
          <div
            class="stock-fill"
            :style="{ width: stockPercent + '%' }"
            :class="{ 'low-stock': stockPercent < 30 }"
          ></div>
        </div>
        <div class="stock-info">
          <span>可借：{{ book.availableCopies ?? 0 }} 本</span>
          <span>馆藏：{{ book.totalCopies ?? 0 }} 本</span>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <van-icon name="description" />
          <span>图书简介</span>
        </div>
        <div class="section-content">
          <p class="description-text">
            {{ book.description || '暂无简介' }}
          </p>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <van-icon name="info-o" />
          <span>借阅须知</span>
        </div>
        <div class="section-content">
          <div class="notice-list">
            <div class="notice-item">
              <van-icon name="clock-o" color="var(--primary-light)" />
              <span>借阅期限：30天</span>
            </div>
            <div class="notice-item">
              <van-icon name="replay" color="var(--success)" />
              <span>最多续借2次，每次延长15天</span>
            </div>
            <div class="notice-item">
              <van-icon name="warning-o" color="var(--accent)" />
              <span>每人最多同时借阅5本</span>
            </div>
            <div class="notice-item">
              <van-icon name="close" color="var(--danger)" />
              <span>逾期未还将影响借阅权限</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="bar-left">
          <div class="bar-icon" @click="showToast('已收藏')">
            <van-icon name="star-o" size="22" />
            <span>收藏</span>
          </div>
          <div class="bar-icon" @click="navigateTo('/borrow-records')">
            <van-icon name="records" size="22" />
            <span>记录</span>
          </div>
        </div>
        <div class="bar-right">
          <van-button
            v-if="isAvailable"
            type="primary"
            round
            block
            @click="handleBorrow"
            :loading="borrowing"
            loading-text="借阅中..."
            class="borrow-btn"
          >
            <van-icon name="plus" />
            立即借阅
          </van-button>
          <van-button
            v-else-if="!reserved"
            round
            block
            class="borrow-btn reserve-btn"
            :loading="borrowing"
            @click="handleReserve"
          >
            预约到馆通知
          </van-button>
          <van-button
            v-else
            round
            block
            disabled
            class="borrow-btn reserved-btn"
          >
            已预约
          </van-button>
        </div>
      </div>
    </template>

    <van-empty v-else description="图书不存在">
      <van-button round type="primary" size="small" @click="goBack">返回</van-button>
    </van-empty>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { bookApi } from '../api'
import { coverByBook } from '../utils/mediaDefaults'

export default {
  name: 'BookDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const book = ref(null)
    const loading = ref(true)
    const borrowing = ref(false)
    const reserved = ref(false)

    const isAvailable = computed(() => {
      return book.value && Number(book.value.availableCopies) > 0
    })

    const stockPercent = computed(() => {
      if (!book.value) return 0
      const totalCopies = Number(book.value.totalCopies) || 0
      const available = Number(book.value.availableCopies) || 0
      if (totalCopies <= 0) return 0
      return Math.min(100, Math.round((available / totalCopies) * 100))
    })

    const loadBookDetail = async () => {
      loading.value = true
      try {
        const bookId = route.params.id
        const res = await bookApi.getBookDetail(bookId)
        book.value = res.data
        if (book.value && Number(book.value.availableCopies) > 0) {
          reserved.value = false
        }
      } catch (error) {
        showToast(error?.message || '获取图书详情失败')
      } finally {
        loading.value = false
      }
    }

    const handleBorrow = async () => {
      if (!book.value || borrowing.value) return
      try {
        await showDialog({
          title: '确认借阅',
          message: `确定要借阅《${book.value.bookName}》吗？\n\n借阅期限：30天\n请按时归还，逾期将影响借阅权限。`,
          showCancelButton: true,
          confirmButtonText: '确认借阅',
          confirmButtonColor: 'var(--primary)'
        })

        borrowing.value = true
        const res = await bookApi.borrowBook(book.value.id)

        if (res.code === 200) {
          showToast({
            message: '借阅成功！',
            icon: 'success',
            duration: 2000
          })
          await loadBookDetail()
        } else {
          showToast({
            message: res.message || '借阅失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        if (error !== 'cancel') {
          showToast(error?.message || '借阅失败')
        }
      } finally {
        borrowing.value = false
      }
    }

    const handleReserve = async () => {
      if (!book.value || borrowing.value || reserved.value) return
      borrowing.value = true
      try {
        await bookApi.reserveBook(book.value.id)
        reserved.value = true
        showToast({ message: '预约成功，到馆将通知您', icon: 'success' })
      } catch (error) {
        showToast(error?.message || '预约失败')
      } finally {
        borrowing.value = false
      }
    }

    const showShareTip = () => {
      showToast('分享功能开发中')
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      if (window.history.length > 1) router.back()
      else router.push('/library')
    }

    onMounted(() => {
      loadBookDetail()
    })

    return {
      book,
      loading,
      borrowing,
      reserved,
      isAvailable,
      stockPercent,
      coverByBook,
      handleBorrow,
      handleReserve,
      showShareTip,
      navigateTo,
      goBack,
      showToast
    }
  }
}
</script>

<style scoped>
.book-detail-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 90px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.book-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 24px 20px;
  display: flex;
  gap: 20px;
}

.book-cover-wrapper {
  position: relative;
  flex-shrink: 0;
}

.book-cover {
  display: block;
  box-shadow: var(--shadow-lg);
}

.book-basic {
  flex: 1;
  color: var(--text-inverse);
  min-width: 0;
}

.book-title {
  font-size: var(--font-xl);
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.book-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-sm);
  margin-bottom: 6px;
  opacity: 0.92;
}

.book-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.book-tags .tag-blue,
.book-tags .tag-gold {
  background: rgba(255, 255, 255, 0.18);
  color: var(--text-inverse);
}

.stock-section {
  background: var(--bg-card);
  margin: 16px;
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stock-title {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
}

.stock-bar {
  height: 8px;
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 10px;
}

.stock-fill {
  height: 100%;
  background: var(--success);
  border-radius: var(--radius-full);
  transition: width .5s ease;
}

.stock-fill.low-stock {
  background: var(--accent);
}

.stock-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-sm);
  color: var(--text-muted);
}

.section {
  background: var(--bg-card);
  margin: 16px;
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.section-header .van-icon {
  color: var(--primary);
}

.description-text {
  font-size: var(--font-md);
  color: var(--text-secondary);
  line-height: 1.8;
  text-indent: 2em;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: var(--shadow-md);
  border-top: 1px solid var(--border-color);
  z-index: 100;
}

.bar-left {
  display: flex;
  gap: 20px;
  margin-right: 20px;
}

.bar-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  color: var(--text-secondary);
}

.bar-icon span {
  font-size: var(--font-xs);
}

.bar-right {
  flex: 1;
}

.borrow-btn {
  height: 44px;
  font-size: var(--font-md);
  font-weight: 600;
}

.reserve-btn {
  background: linear-gradient(135deg, var(--accent), #e0b44a);
  color: var(--text-primary);
  border: none;
  box-shadow: 0 8px 18px rgba(214, 158, 46, 0.28);
}

.reserved-btn {
  background: var(--bg-muted);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}
</style>
