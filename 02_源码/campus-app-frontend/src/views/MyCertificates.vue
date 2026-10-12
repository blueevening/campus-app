<template>
  <div class="page">
    <van-nav-bar title="我的证书" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="plus" size="20" color="#2c5282" @click="navigateTo('/certificate/apply')" />
      </template>
    </van-nav-bar>

    <div class="cert-body">
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
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">待审核</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalScore }}</span>
          <span class="stat-label">获得积分</span>
        </div>
      </div>

      <div v-if="loading" class="loading-box">
        <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
      </div>

      <template v-else>
        <div class="section-block" v-if="certificates.length">
          <div class="section-title">证书列表</div>
          <div class="cert-list">
            <div class="cert-card" v-for="cert in certificates" :key="cert.id">
              <div class="cert-header">
                <div class="cert-level" :class="'level-' + cert.level">
                  {{ getLevelName(cert.level) }}
                </div>
                <div class="cert-status" :class="getStatusClass(cert.status)">
                  {{ getStatusText(cert.status) }}
                </div>
              </div>
              <div class="cert-card-body">
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
                <div class="cert-score" :class="{ earned: cert.status === 1 }">
                  <van-icon name="star-o" />
                  <template v-if="cert.status === 1">获得 +{{ cert.score }} 积分</template>
                  <template v-else-if="cert.status === 0">审核通过可得 +{{ cert.score }} 积分</template>
                  <template v-else>未获得积分</template>
                </div>
              </div>
              <div class="cert-remark" v-if="cert.remark">
                <van-icon name="comment-o" />
                {{ cert.remark }}
              </div>
            </div>
          </div>
        </div>

        <van-empty v-else description="暂无证书">
          <van-button round type="primary" size="small" @click="navigateTo('/certificate/apply')">
            申请证书
          </van-button>
        </van-empty>
      </template>
    </div>
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
    const loading = ref(true)
    const levelMap = ref({})

    const stats = computed(() => {
      const approved = certificates.value.filter((c) => c.status === 1)
      const pending = certificates.value.filter((c) => c.status === 0)
      return {
        total: certificates.value.length,
        approved: approved.length,
        pending: pending.length,
        totalScore: approved.reduce((sum, c) => sum + (Number(c.score) || 0), 0)
      }
    })

    const fallbackLevelNames = {
      1: '国家级',
      2: '省级',
      3: '市级',
      4: '校级',
      5: '院级',
      6: '其他'
    }

    const getLevelName = (level) => {
      if (levelMap.value[level] && levelMap.value[level].label) return levelMap.value[level].label
      return fallbackLevelNames[level] || '未知等级'
    }

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

    const loadLevels = async () => {
      try {
        const res = await certificateApi.getLevels()
        const map = {}
        ;(res.data || []).forEach((l) => {
          map[l.value] = l
        })
        levelMap.value = map
      } catch (e) {
        // 等级名称有本地兜底，不阻断列表
      }
    }

    const loadCertificates = async () => {
      loading.value = true
      try {
        const res = await certificateApi.getMyCertificates()
        certificates.value = res.data || []
      } catch (error) {
        showToast(error.message || '获取证书失败')
      } finally {
        loading.value = false
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      router.back()
    }

    onMounted(async () => {
      await Promise.all([loadLevels(), loadCertificates()])
    })

    return {
      certificates,
      stats,
      loading,
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
.cert-body {
  padding-bottom: var(--space-5);
}

.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
  margin: var(--space-3);
  padding: var(--space-5) var(--space-4);
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
  font-size: var(--font-2xl);
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: var(--font-sm);
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.28);
}

.cert-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.cert-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.cert-level {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.level-1 {
  background: linear-gradient(135deg, var(--accent), #e0b44a);
  color: #1a202c;
}

.level-2 {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--text-inverse);
}

.level-3 {
  background: var(--info-soft);
  color: var(--info);
}

.level-4 {
  background: var(--success-soft);
  color: var(--success);
}

.level-5 {
  background: var(--primary-soft);
  color: var(--primary);
}

.level-6 {
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.cert-status {
  font-size: var(--font-xs);
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.status-pending {
  background: var(--warning-soft);
  color: var(--warning);
}

.status-approved {
  background: var(--success-soft);
  color: var(--success);
}

.status-rejected {
  background: var(--danger-soft);
  color: var(--danger);
}

.cert-card-body h4 {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.cert-info {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}

.cert-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cert-score {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--warning);
  background: var(--warning-soft);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.cert-score.earned {
  color: var(--accent);
  background: var(--accent-soft);
}

.cert-remark {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-color);
  margin-top: var(--space-3);
}

.loading-box {
  padding: var(--space-8);
  display: flex;
  justify-content: center;
}
</style>
