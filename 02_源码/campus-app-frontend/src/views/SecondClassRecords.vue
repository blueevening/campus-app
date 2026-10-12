<template>
  <div class="page records-page">
    <van-nav-bar title="参与记录" left-arrow @click-left="goBack" />

    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">参与活动</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.completed }}</span>
        <span class="stat-label">已完成</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value accent">{{ stats.totalScore }}</span>
        <span class="stat-label">获得积分</span>
      </div>
    </div>

    <div class="records-list" v-if="records.length > 0">
      <div class="record-card" v-for="record in records" :key="record.id">
        <div class="record-header">
          <span class="tag" :class="getStatusClass(record)">
            {{ getStatusText(record) }}
          </span>
          <span
            class="record-score"
            :class="{ muted: record.status !== 2 }"
          >
            {{ record.status === 2 ? `+${record.score}分` : `预计+${record.score}分` }}
          </span>
        </div>
        <div class="record-body">
          <h4>{{ record.activityName || ('活动 #' + record.activityId) }}</h4>
          <div class="record-meta">
            <span>
              <van-icon name="clock-o" />
              {{ formatDate(record.createTime) }}
            </span>
            <span v-if="record.reviewStatus === 'pending'" class="review-tip">报名审核中</span>
            <span v-else-if="record.reviewStatus === 'rejected'" class="review-tip rejected">报名未通过</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载中...</van-loading>
    </div>

    <van-empty v-if="!loading && records.length === 0" description="暂无参与记录">
      <van-button round type="primary" size="small" @click="goActivities">
        去看看活动
      </van-button>
    </van-empty>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { secondClassApi } from '../api'

export default {
  name: 'SecondClassRecords',
  setup() {
    const router = useRouter()
    const records = ref([])
    const loading = ref(true)

    const stats = computed(() => ({
      total: records.value.length,
      completed: records.value.filter(r => r.status === 2).length,
      totalScore: records.value
        .filter(r => r.status === 2)
        .reduce((sum, r) => sum + (r.score || 0), 0)
    }))

    const getStatusClass = (record) => {
      if (record.reviewStatus === 'rejected') return 'tag-red'
      if (record.reviewStatus === 'pending') return 'tag-gray'
      const classes = {
        0: 'tag-blue',
        1: 'tag-gold',
        2: 'tag-green',
        3: 'tag-gray'
      }
      return classes[record.status] || 'tag-gray'
    }

    const getStatusText = (record) => {
      if (record.reviewStatus === 'rejected') return '报名未通过'
      if (record.reviewStatus === 'pending') return '审核中'
      const texts = {
        0: '待参加',
        1: '已签到',
        2: '已完成',
        3: '已取消'
      }
      return texts[record.status] || '未知'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const loadRecords = async () => {
      loading.value = true
      try {
        const res = await secondClassApi.getUserRecords()
        records.value = res.data || []
      } catch (error) {
        showToast(error?.message || '获取记录失败')
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.back()
    }

    const goActivities = () => {
      router.push('/second-class')
    }

    onMounted(() => {
      loadRecords()
    })

    return {
      records,
      loading,
      stats,
      getStatusClass,
      getStatusText,
      formatDate,
      goBack,
      goActivities
    }
  }
}
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 24px;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  margin: 16px;
  padding: 22px 16px;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 28px rgba(44, 82, 130, 0.28);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-value.accent {
  color: #f6e05e;
}

.stat-label {
  font-size: var(--font-sm);
  opacity: 0.88;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.28);
}

.records-list {
  padding: 0 16px;
}

.record-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.record-score {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--accent);
}

.record-score.muted {
  color: var(--text-muted);
  font-size: var(--font-sm);
  font-weight: 600;
}

.record-body h4 {
  font-size: var(--font-md);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.record-meta {
  font-size: var(--font-xs);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.review-tip {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--warning-soft);
  color: var(--accent);
  font-weight: 600;
}

.review-tip.rejected {
  background: var(--danger-soft);
  color: var(--danger);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 32px;
}
</style>
