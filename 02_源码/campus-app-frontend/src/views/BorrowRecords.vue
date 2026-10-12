<template>
  <div class="page borrow-records-page">
    <van-nav-bar title="借阅记录" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="search" size="20" color="var(--primary)" @click="showSearch = !showSearch" />
      </template>
    </van-nav-bar>

    <div class="search-section" v-if="showSearch">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索图书名称"
        @search="noop"
        show-action
        shape="round"
      >
        <template #action>
          <span class="search-action" @click="searchKeyword = ''">清除</span>
        </template>
      </van-search>
    </div>

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

    <div class="filter-section">
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'ALL' }"
        @click="setStatus('ALL')"
      >
        全部
      </div>
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'BORROWED' }"
        @click="setStatus('BORROWED')"
      >
        借阅中
      </div>
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'RETURNED' }"
        @click="setStatus('RETURNED')"
      >
        已归还
      </div>
      <div
        class="filter-tag"
        :class="{ active: activeStatus === 'OVERDUE' }"
        @click="setStatus('OVERDUE')"
      >
        已逾期
      </div>
    </div>

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载借阅记录...</van-loading>
    </div>

    <template v-else>
      <div class="records-list" v-if="filteredRecords.length > 0">
        <div
          class="record-card"
          v-for="record in filteredRecords"
          :key="record.id"
        >
          <div class="record-header">
            <span class="tag" :class="getTagClass(record)">
              {{ getDisplayStatusText(record) }}
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
                radius="8"
              />
            </div>
            <div class="book-info">
              <h4 class="book-name">{{ record.bookName }}</h4>
              <p class="book-author">{{ record.author }}</p>
              <div class="date-info">
                <div class="date-item">
                  <span class="date-label">借阅</span>
                  <span class="date-value">{{ formatDateShort(record.borrowDate) }}</span>
                </div>
                <div class="date-item">
                  <span class="date-label">应还</span>
                  <span class="date-value" :class="{ 'overdue-text': isOverdue(record) }">
                    {{ formatDateShort(record.dueDate) }}
                    <em v-if="dueHint(record)" class="due-hint" :class="{ 'overdue-text': isOverdue(record) }">
                      {{ dueHint(record) }}
                    </em>
                  </span>
                </div>
                <div class="date-item" v-if="record.returnDate">
                  <span class="date-label">归还</span>
                  <span class="date-value success-text">{{ formatDateShort(record.returnDate) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="record-footer" v-if="canOperate(record)">
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

      <van-empty v-else description="暂无借阅记录">
        <template #description>
          <p v-if="activeStatus !== 'ALL'">暂无{{ getStatusTextByCode(activeStatus) }}记录</p>
          <p v-else-if="searchKeyword">未找到「{{ searchKeyword }}」相关记录</p>
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
    </template>
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
    const loading = ref(false)
    const activeStatus = ref('ALL')
    const searchKeyword = ref('')
    const showSearch = ref(false)

    const isOverdue = (record) => {
      if (record.status !== 1) return false
      if (!record.dueDate) return false
      return new Date(record.dueDate) < new Date()
    }

    const canOperate = (record) => {
      return record.status === 1
    }

    const stats = computed(() => {
      const list = records.value
      return {
        borrowing: list.filter(r => r.status === 1 && !isOverdue(r)).length,
        returned: list.filter(r => r.status === 2).length,
        overdue: list.filter(r => isOverdue(r)).length
      }
    })

    const filteredRecords = computed(() => {
      let result = [...records.value]

      if (activeStatus.value === 'BORROWED') {
        result = result.filter(r => r.status === 1 && !isOverdue(r))
      } else if (activeStatus.value === 'RETURNED') {
        result = result.filter(r => r.status === 2)
      } else if (activeStatus.value === 'OVERDUE') {
        result = result.filter(r => isOverdue(r))
      }

      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        result = result.filter(r =>
          r.bookName?.toLowerCase().includes(keyword) ||
          r.author?.toLowerCase().includes(keyword)
        )
      }

      return result
    })

    const getTagClass = (record) => {
      if (isOverdue(record)) return 'tag-red'
      const classes = {
        0: 'tag-blue',
        1: 'tag-gold',
        2: 'tag-green',
        3: 'tag-red'
      }
      return classes[record.status] || 'tag-blue'
    }

    const getDisplayStatusText = (record) => {
      if (isOverdue(record)) return '已逾期'
      const texts = {
        0: '已预约',
        1: '借阅中',
        2: '已归还',
        3: '已逾期'
      }
      return texts[record.status] || '未知'
    }

    const getStatusTextByCode = (code) => {
      const texts = {
        'BORROWED': '借阅中',
        'RETURNED': '已归还',
        'OVERDUE': '已逾期'
      }
      return texts[code] || ''
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '--'
      const date = new Date(dateStr)
      if (Number.isNaN(date.getTime())) return '--'
      const pad = (n) => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    const formatDateShort = (dateStr) => {
      if (!dateStr) return '--'
      const date = new Date(dateStr)
      if (Number.isNaN(date.getTime())) return '--'
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }

    const dueHint = (record) => {
      if (!record.dueDate || record.status === 2) return ''
      const due = new Date(record.dueDate)
      if (Number.isNaN(due.getTime())) return ''
      const now = new Date()
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`
      if (diffDays === 0) return '今天到期'
      if (diffDays <= 7) return `还剩 ${diffDays} 天`
      return ''
    }

    const setStatus = (status) => {
      activeStatus.value = status
    }

    const noop = () => {}

    const loadRecords = async () => {
      loading.value = true
      try {
        const res = await bookApi.getBorrowRecords()
        records.value = res.data || []
      } catch (error) {
        showToast(error?.message || '获取借阅记录失败')
      } finally {
        loading.value = false
      }
    }

    const handleRenew = async (record) => {
      if (!canOperate(record)) {
        showToast('已归还，无法续借')
        return
      }
      if ((record.renewCount || 0) >= 2) {
        showToast('续借次数已达上限')
        return
      }
      try {
        await showDialog({
          title: '确认续借',
          message: `确定要续借《${record.bookName}》吗？\n\n续借后将延长15天还书期限。`,
          showCancelButton: true,
          confirmButtonText: '确认续借',
          confirmButtonColor: 'var(--primary)'
        })

        const res = await bookApi.renewBook(record.id)
        if (res.code === 200) {
          showToast({
            message: '续借成功！',
            icon: 'success'
          })
          await loadRecords()
        } else {
          showToast({
            message: res.message || '续借失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        if (error !== 'cancel') {
          showToast(error?.message || '续借失败')
        }
      }
    }

    const handleReturn = async (record) => {
      if (!canOperate(record)) {
        showToast('已归还，无需再次操作')
        return
      }
      try {
        await showDialog({
          title: '确认归还',
          message: `确定要归还《${record.bookName}》吗？`,
          showCancelButton: true,
          confirmButtonText: '确认归还',
          confirmButtonColor: 'var(--success)'
        })

        const res = await bookApi.returnBook(record.id)
        if (res.code === 200) {
          showToast({
            message: '归还成功！',
            icon: 'success'
          })
          await loadRecords()
        } else {
          showToast({
            message: res.message || '归还失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        if (error !== 'cancel') {
          showToast(error?.message || '归还失败')
        }
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      if (window.history.length > 1) router.back()
      else router.push('/')
    }

    onMounted(() => {
      loadRecords()
    })

    return {
      records,
      loading,
      defaultCover: DEFAULT_COVER,
      activeStatus,
      searchKeyword,
      showSearch,
      stats,
      filteredRecords,
      getTagClass,
      getDisplayStatusText,
      getStatusTextByCode,
      isOverdue,
      canOperate,
      dueHint,
      formatDate,
      formatDateShort,
      setStatus,
      noop,
      handleRenew,
      handleReturn,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.borrow-records-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 24px;
}

.search-section {
  background: var(--bg-card);
  padding: 10px 8px;
  border-bottom: 1px solid var(--border-color);
}

.search-action {
  color: var(--primary);
  font-size: var(--font-md);
  font-weight: 600;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  margin: 16px;
  padding: 20px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-inverse);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: var(--font-sm);
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 35px;
  background: rgba(255, 255, 255, 0.3);
}

.filter-section {
  display: flex;
  padding: 12px 16px;
  gap: 10px;
  background: var(--bg-card);
  margin: 0 16px 12px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.filter-tag {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  color: var(--text-secondary);
  background: var(--bg-muted);
  cursor: pointer;
  transition: all .2s ease;
  border: 1px solid var(--border-color);
}

.filter-tag.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: var(--text-inverse);
  border-color: transparent;
}

.filter-tag:active {
  transform: scale(0.95);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.records-list {
  padding: 0 16px;
}

.record-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.record-time {
  font-size: var(--font-xs);
  color: var(--text-muted);
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
  min-width: 0;
}

.book-name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.book-author {
  font-size: var(--font-sm);
  color: var(--text-muted);
  margin-bottom: 10px;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-item {
  display: flex;
  font-size: var(--font-sm);
  align-items: baseline;
}

.date-label {
  color: var(--text-muted);
  width: 40px;
  flex-shrink: 0;
}

.date-value {
  color: var(--text-secondary);
}

.due-hint {
  font-style: normal;
  margin-left: 6px;
  font-size: var(--font-xs);
  color: var(--accent);
  font-weight: 600;
}

.overdue-text {
  color: var(--danger);
  font-weight: 600;
}

.success-text {
  color: var(--success);
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  gap: 8px;
  flex-wrap: wrap;
}

.renew-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  min-width: 70px;
}

.empty-btn {
  margin-top: 10px;
}
</style>
