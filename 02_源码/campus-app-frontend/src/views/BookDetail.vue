<template>
  <div class="book-detail-container">
    <van-nav-bar title="图书详情" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="share-o" size="20" @click="showShareTip" />
      </template>
    </van-nav-bar>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-section">
      <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
    </div>

    <template v-else-if="book">
      <!-- 图书封面和基本信息 -->
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
          <div class="cover-shadow"></div>
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
            <span class="tag category-tag">{{ book.category }}</span>
            <span class="tag location-tag">
              <van-icon name="location-o" />
              {{ book.location }}
            </span>
          </div>
        </div>
      </div>

      <!-- 库存信息 -->
      <div class="stock-section">
        <div class="stock-header">
          <span class="stock-title">库存状态</span>
          <span class="stock-status" :class="book.availableCopies > 0 ? 'available' : 'empty'">
            {{ book.availableCopies > 0 ? '可借阅' : '暂无库存' }}
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
          <span>可借：{{ book.availableCopies }} 本</span>
          <span>馆藏：{{ book.totalCopies }} 本</span>
        </div>
      </div>

      <!-- 图书简介 -->
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

      <!-- 借阅须知 -->
      <div class="section">
        <div class="section-header">
          <van-icon name="info-o" />
          <span>借阅须知</span>
        </div>
        <div class="section-content">
          <div class="notice-list">
            <div class="notice-item">
              <van-icon name="clock-o" color="#1989fa" />
              <span>借阅期限：30天</span>
            </div>
            <div class="notice-item">
              <van-icon name="replay" color="#07c160" />
              <span>最多续借2次，每次延长15天</span>
            </div>
            <div class="notice-item">
              <van-icon name="warning-o" color="#ff976a" />
              <span>每人最多同时借阅5本</span>
            </div>
            <div class="notice-item">
              <van-icon name="close" color="#ee0a24" />
              <span>逾期未还将影响借阅权限</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
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
            v-if="book.availableCopies > 0"
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
            v-else
            type="warning"
            round
            block
            class="borrow-btn"
            :loading="borrowing"
            @click="handleReserve"
          >
            预约到馆通知
          </van-button>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <van-empty v-else description="图书不存在" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { bookApi } from '../api'
import { bookCover as getDefaultCover, coverByBook } from '../utils/mediaDefaults'

export default {
  name: 'BookDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const book = ref(null)
    const loading = ref(true)
    const borrowing = ref(false)

    const stockPercent = computed(() => {
      if (!book.value) return 0
      return (book.value.availableCopies / book.value.totalCopies * 100)
    })

    const getDefaultCoverCategory = getDefaultCover

    const loadBookDetail = async () => {
      loading.value = true
      try {
        const bookId = route.params.id
        const res = await bookApi.getBookDetail(bookId)
        book.value = res.data
      } catch (error) {
        showToast('获取图书详情失败')
      } finally {
        loading.value = false
      }
    }

    const handleBorrow = async () => {
      try {
        await showDialog({
          title: '确认借阅',
          message: `确定要借阅《${book.value.bookName}》吗？\n\n借阅期限：30天\n请按时归还，逾期将影响借阅权限。`,
          showCancelButton: true,
          confirmButtonText: '确认借阅',
          confirmButtonColor: '#2c5282'
        })

        borrowing.value = true
        const res = await bookApi.borrowBook(book.value.id)

        if (res.code === 200) {
          showToast({
            message: '借阅成功！',
            icon: 'success',
            duration: 2000
          })
          // 刷新图书信息
          loadBookDetail()
        } else {
          showToast({
            message: res.message || '借阅失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        if (error) {
          showToast(error.message || '借阅失败')
        }
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
      router.back()
    }

    onMounted(() => {
      loadBookDetail()
    })

    const handleReserve = async () => {
      if (!book.value) return
      borrowing.value = true
      try {
        await bookApi.reserveBook(book.value.id)
        showToast({ message: '预约成功，到馆将通知您', icon: 'success' })
      } catch (error) {
        showToast(error.message || '预约失败')
      } finally {
        borrowing.value = false
      }
    }

    return {
      book,
      loading,
      borrowing,
      stockPercent,
      getDefaultCover: getDefaultCoverCategory,
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
.book-detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

/* 加载状态 */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* 图书头部 */
.book-header {
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  padding: 25px 20px;
  display: flex;
  gap: 20px;
}

.book-cover-wrapper {
  position: relative;
  flex-shrink: 0;
}

.book-cover {
  display: block;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.cover-shadow {
  position: absolute;
  bottom: -10px;
  left: 10px;
  right: 10px;
  height: 20px;
  background: rgba(0, 0, 0, 0.2);
  filter: blur(10px);
  border-radius: 50%;
}

.book-basic {
  flex: 1;
  color: #fff;
}

.book-title {
  font-size: 20px;
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
  font-size: 13px;
  margin-bottom: 6px;
  opacity: 0.9;
}

.book-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.location-tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* 库存信息 */
.stock-section {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stock-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.stock-status {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 15px;
}

.stock-status.available {
  background: #e8f8ef;
  color: #07c160;
}

.stock-status.empty {
  background: #fee2e2;
  color: #ef4444;
}

.stock-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #07c160 0%, #38ef7d 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stock-fill.low-stock {
  background: linear-gradient(90deg, #ff976a 0%, #f2c94c 100%);
}

.stock-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 区块通用样式 */
.section {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header .van-icon {
  color: #2c5282;
}

.description-text {
  font-size: 14px;
  color: #666;
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
  font-size: 14px;
  color: #666;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 12px 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
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
  color: #666;
}

.bar-icon span {
  font-size: 11px;
}

.bar-right {
  flex: 1;
}

.borrow-btn {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  border: none;
}
</style>
