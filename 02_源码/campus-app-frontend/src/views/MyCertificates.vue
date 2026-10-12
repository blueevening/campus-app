<template>
  <div class="my-certs-container">
    <van-nav-bar title="我的证书" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="plus" size="20" @click="navigateTo('/certificate/apply')" />
      </template>
    </van-nav-bar>

    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">申请总数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.approved }}</span>
        <span class="stat-label">已通过</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalScore }}</span>
        <span class="stat-label">获得积分</span>
      </div>
    </div>

    <!-- 证书列表 -->
    <div class="cert-list" v-if="certificates.length > 0">
      <div class="cert-card" v-for="cert in certificates" :key="cert.id">
        <div class="cert-header">
          <div class="cert-level" :class="'level-' + cert.level">
            {{ getLevelName(cert.level) }}
          </div>
          <div class="cert-status" :class="getStatusClass(cert.status)">
            {{ getStatusText(cert.status) }}
          </div>
        </div>
        <div class="cert-body">
          <h4>{{ cert.certificateName }}</h4>
          <div class="cert-info">
            <span>
              <van-icon name="manager-o" />
              {{ cert.issuer }}
            </span>
            <span>
              <van-icon name="calendar-o" />
              {{ formatDate(cert.obtainDate) }}
            </span>
          </div>
          <div class="cert-score" v-if="cert.status === 1">
            <van-icon name="star-o" />
            获得 +{{ cert.score }} 积分
          </div>
        </div>
        <div class="cert-remark" v-if="cert.remark">
          <van-icon name="comment-o" />
          {{ cert.remark }}
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-else description="暂无证书">
      <van-button round type="primary" size="small" @click="navigateTo('/certificate/apply')">
        申请证书
      </van-button>
    </van-empty>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { certificateApi } from '../api'

export default {
  name: 'MyCertificates',
  setup() {
    const router = useRouter()
    const certificates = ref([])

    const stats = computed(() => {
      const approved = certificates.value.filter(c => c.status === 1)
      return {
        total: certificates.value.length,
        approved: approved.length,
        totalScore: approved.reduce((sum, c) => sum + (c.score || 0), 0)
      }
    })

    const levelNames = {
      1: '国家级',
      2: '省级',
      3: '市级',
      4: '校级',
      5: '院级',
      6: '其他'
    }

    const getLevelName = (level) => levelNames[level] || '未知'

    const getStatusClass = (status) => {
      const classes = {
        0: 'status-pending',
        1: 'status-approved',
        2: 'status-rejected'
      }
      return classes[status] || 'status-pending'
    }

    const getStatusText = (status) => {
      const texts = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return texts[status] || '未知'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const loadCertificates = async () => {
      try {
        const res = await certificateApi.getMyCertificates()
        certificates.value = res.data || []
      } catch (error) {
        showToast('获取证书失败')
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadCertificates()
    })

    return {
      certificates,
      stats,
      getLevelName,
      getStatusClass,
      getStatusText,
      formatDate,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.my-certs-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
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

.cert-list {
  padding: 0 15px;
}

.cert-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cert-level {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.level-1 {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
}

.level-2 {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.level-3 {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.level-4 {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.level-5 {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.level-6 {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
}

.cert-status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 15px;
}

.status-pending {
  background: #fff8e6;
  color: #f59e0b;
}

.status-approved {
  background: #e8f8ef;
  color: #10b981;
}

.status-rejected {
  background: #fee2e2;
  color: #ef4444;
}

.cert-body h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.cert-info {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.cert-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cert-score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
}

.cert-remark {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
}
</style>
