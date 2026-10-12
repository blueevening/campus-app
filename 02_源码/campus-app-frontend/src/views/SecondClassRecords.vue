<template>
  <div class="records-container">
    <van-nav-bar title="参与记录" left-arrow @click-left="goBack" />

    <!-- 统计卡片 -->
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
        <span class="stat-value">{{ stats.totalScore }}</span>
        <span class="stat-label">获得积分</span>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="records-list" v-if="records.length > 0">
      <div class="record-card" v-for="record in records" :key="record.id">
        <div class="record-header">
          <span class="status-tag" :class="getStatusClass(record.status)">
            {{ getStatusText(record.status) }}
          </span>
          <span class="record-score">+{{ record.score }}分</span>
        </div>
        <div class="record-body">
          <h4>{{ record.activityName || '活动' }}</h4>
          <div class="record-meta">
            <span>
              <van-icon name="clock-o" />
              {{ formatDate(record.createTime) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-else description="暂无参与记录">
      <van-button round type="primary" size="small" @click="goBack">
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

    const stats = computed(() => {
      return {
        total: records.value.length,
        completed: records.value.filter(r => r.status === 2).length,
        totalScore: records.value
          .filter(r => r.status === 2)
          .reduce((sum, r) => sum + (r.score || 0), 0)
      }
    })

    const getStatusClass = (status) => {
      const classes = {
        0: 'status-registered',
        1: 'status-checked',
        2: 'status-completed',
        3: 'status-cancelled'
      }
      return classes[status] || 'status-registered'
    }

    const getStatusText = (status) => {
      const texts = {
        0: '已报名',
        1: '已签到',
        2: '已完成',
        3: '已取消'
      }
      return texts[status] || '未知'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const loadRecords = async () => {
      try {
        const res = await secondClassApi.getUserRecords()
        records.value = res.data || []
      } catch (error) {
        showToast('获取记录失败')
      }
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadRecords()
    })

    return {
      records,
      stats,
      getStatusClass,
      getStatusText,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.records-container {
  min-height: 100vh;
  background: #f5f7fa;
}

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
  margin-bottom: 10px;
}

.status-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 15px;
}

.status-registered {
  background: #e8f4ff;
  color: #1989fa;
}

.status-checked {
  background: #fff8e6;
  color: #ff976a;
}

.status-completed {
  background: #e8f8ef;
  color: #07c160;
}

.status-cancelled {
  background: #fee2e2;
  color: #ef4444;
}

.record-score {
  font-size: 16px;
  font-weight: 600;
  color: #f59e0b;
}

.record-body h4 {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.record-meta {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
