<template>
  <div class="borrow-records-container">
    <van-nav-bar title="借阅记录" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="search" size="20" @click="showSearch = !showSearch" />
      </template>
    </van-nav-bar>

    <!-- 搜索栏 -->
    <div class="search-section" v-if="showSearch">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索图书名称"
        @search="filterRecords"
        show-action
      >
        <template #action>
          <span @click="searchKeyword = ''; filterRecords()">清除</span>
        </template>
      </van-search>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">{{ stats.borrowing }}</span>
        <span class="stat-label">借阅中</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.returned }}</span>
        <span class="stat-label">已归还</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.overdue }}</span>
        <span class="stat-label">已逾期</span>
      </div>
    </div>

    <!-- 状态筛选 -->
    <div class="filter-section">
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'ALL' }"
        @click="activeStatus = 'ALL'; filterRecords()"
      >
        全部
      </div>
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'BORROWED' }"
        @click="activeStatus = 'BORROWED'; filterRecords()"
      >
        借阅中
      </div>
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'RETURNED' }"
        @click="activeStatus = 'RETURNED'; filterRecords()"
      >
        已归还
      </div>
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'OVERDUE' }"
        @click="activeStatus = 'OVERDUE'; filterRecords()"
      >
        已逾期
      </div>
    </div>

    <!-- 借阅记录列表 -->
    <div class="records-list" v-if="filteredRecords.length > 0">
      <div
        class="record-card"
        v-for="record in filteredRecords"
        :key="record.id"
      >
        <div class="record-header">
          <span class="status-tag" :class="getStatusClass(record.status)">
            {{ getStatusText(record.status) }}
          </span>
          <span class="record-time">{{ formatDate(record.borrowDate) }}</span>
        </div>

        <div class="record-body">
          <div class="book-cover">
            <van-image
              width="60"
              height="80"
              fit="cover"
              :src="record.cover || defaultCover"
              radius="6"
            />
          </div>
          <div class="book-info">
            <h4 class="book-name">{{ record.bookName }}</h4>
            <p class="book-author">{{ record.author }}</p>
            <div class="date-info">
              <div class="date-item">
                <span class="date-label">借阅：</span>
                <span class="date-value">{{ formatDateShort(record.borrowDate) }}</span>
              </div>
              <div class="date-item">
                <span class="date-label">应还：</span>
                <span class="date-value" :class="{ 'overdue-text': isOverdue(record) }">
                  {{ formatDateShort(record.dueDate) }}
                </span>
              </div>
              <div class="date-item" v-if="record.returnDate">
                <span class="date-label">归还：</span>
                <span class="date-value success-text">{{ formatDateShort(record.returnDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="record-footer" v-if="record.status === 1">
          <div class="renew-info">
            <van-icon name="replay" />
            <span>已续借 {{ record.renewCount || 0 }}/2 次</span>
          </div>
          <div class="action-buttons">
            <van-button
              size="small"
              round
              type="primary"
              @click="handleRenew(record)"
              :disabled="record.renewCount >= 2"
              class="action-btn"
            >
              续借
            </van-button>
            <van-button
              size="small"
              round
              type="success"
              @click="handleReturn(record)"
              class="action-btn"
            >
              归还
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-else description="暂无借阅记录">
      <template #description>
        <p v-if="activeStatus !== 'ALL'">暂无{{ getStatusTextByCode(activeStatus) }}记录</p>
        <p v-else>暂无借阅记录</p>
      </template>
      <van-button
        round
        type="primary"
        size="small"
        @click="navigateTo('/library')"
        class="empty-btn"
      >
        去图书馆看看
      </van-button>
    </van-empty>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { bookApi } from '../api'
import { DEFAULT_COVER } from '../utils/mediaDefaults'

export default {
  name: 'BorrowRecords',
  setup() {
    const router = useRouter()
    const records = ref([])
    const activeStatus = ref('ALL')
    const searchKeyword = ref('')
    const showSearch = ref(false)

    const stats = computed(() => {
      return {
        borrowing: records.value.filter(r => r.status === 1).length,
        returned: records.value.filter(r => r.status === 2).length,
        overdue: records.value.filter(r => r.status === 3).length
      }
    })

    const filteredRecords = computed(() => {
      let result = [...records.value]

      // 按状态筛选
      if (activeStatus.value !== 'ALL') {
        const statusMap = {
          'BORROWED': 1,
          'RETURNED': 2,
          'OVERDUE': 3
        }
        result = result.filter(r => r.status === statusMap[activeStatus.value])
      }

      // 按关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        result = result.filter(r =>
          r.bookName?.toLowerCase().includes(keyword) ||
          r.author?.toLowerCase().includes(keyword)
        )
      }

      return result
    })

    const getStatusClass = (status) => {
      const classes = {
        0: 'status-reserved',
        1: 'status-borrowed',
        2: 'status-returned',
        3: 'status-overdue'
      }
      return classes[status] || 'status-borrowed'
    }

    const getStatusText = (status) => {
      const texts = {
        0: '已预约',
        1: '借阅中',
        2: '已归还',
        3: '已逾期'
      }
      return texts[status] || '未知'
    }

    const getStatusTextByCode = (code) => {
      const texts = {
        'BORROWED': '借阅中',
        'RETURNED': '已归还',
        'OVERDUE': '已逾期'
      }
      return texts[code] || ''
    }

    const isOverdue = (record) => {
      if (record.status !== 1) return false
      return new Date(record.dueDate) < new Date()
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const formatDateShort = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    const loadRecords = async () => {
      try {
        const res = await bookApi.getBorrowRecords()
        records.value = res.data || []
      } catch (error) {
        showToast('获取借阅记录失败')
      }
    }

    const handleRenew = async (record) => {
      try {
        await showDialog({
          title: '确认续借',
          message: `确定要续借《${record.bookName}》吗？\n\n续借后将延长15天还书期限。`,
          showCancelButton: true,
          confirmButtonText: '确认续借'
        })

        const res = await bookApi.renewBook(record.id)
        if (res.code === 200) {
          showToast({
            message: '续借成功！',
            icon: 'success'
          })
          loadRecords()
        } else {
          showToast({
            message: res.message || '续借失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        if (error) {
          showToast(error.message || '续借失败')
        }
      }
    }

    const handleReturn = async (record) => {
      try {
        await showDialog({
          title: '确认归还',
          message: `确定要归还《${record.bookName}》吗？`,
          showCancelButton: true,
          confirmButtonText: '确认归还',
          confirmButtonColor: '#07c160'
        })

        const res = await bookApi.returnBook(record.id)
        if (res.code === 200) {
          showToast({
            message: '归还成功！',
            icon: 'success'
          })
          loadRecords()
        } else {
          showToast({
            message: res.message || '归还失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        if (error) {
          showToast(error.message || '归还失败')
        }
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadRecords()
    })

    return {
      records,
      defaultCover: DEFAULT_COVER,
      activeStatus,
      searchKeyword,
      showSearch,
      stats,
      filteredRecords,
      getStatusClass,
      getStatusText,
      getStatusTextByCode,
      isOverdue,
      formatDate,
      formatDateShort,
      handleRenew,
      handleReturn,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.borrow-records-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

/* 搜索区域 */
.search-section {
  background: #fff;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  margin: 15px;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 35px;
  background: rgba(255, 255, 255, 0.3);
}

/* 筛选标签 */
.filter-section {
  display: flex;
  padding: 12px 15px;
  gap: 10px;
  background: #fff;
  margin-bottom: 8px;
}

.filter-tag {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag.active {
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  color: #fff;
}

.filter-tag:active {
  transform: scale(0.95);
}

/* 记录列表 */
.records-list {
  padding: 0 15px;
}

.record-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 15px;
}

.status-reserved {
  background: #e8f4ff;
  color: #1989fa;
}

.status-borrowed {
  background: #fff8e6;
  color: #ff976a;
}

.status-returned {
  background: #e8f8ef;
  color: #07c160;
}

.status-overdue {
  background: #fee2e2;
  color: #ef4444;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-body {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.book-cover {
  flex-shrink: 0;
}

.book-info {
  flex: 1;
}

.book-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.book-author {
  font-size: 13px;
  color: #999;
  margin-bottom: 10px;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-item {
  display: flex;
  font-size: 12px;
}

.date-label {
  color: #999;
  width: 45px;
}

.date-value {
  color: #333;
}

.overdue-text {
  color: #ef4444;
  font-weight: 600;
}

.success-text {
  color: #07c160;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.renew-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  min-width: 70px;
}

/* 空状态 */
.empty-btn {
  margin-top: 10px;
}
</style>
