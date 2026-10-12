<template>
  <div class="page credit-page">
    <van-nav-bar title="学分看板" left-arrow @click-left="goBack" />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载中...</van-loading>
    </div>

    <div v-else class="body">
      <div class="hero-card">
        <div class="hero-top">
          <div class="hero-score">
            <div class="big">{{ credit.secondClassScore || 0 }}</div>
            <div class="label">第二课堂学分</div>
          </div>
          <div class="hero-target">
            <div class="target-num">目标 {{ credit.targetScore || 120 }}</div>
            <span class="tag" :class="reached ? 'tag-green' : 'tag-gold'">
              {{ reached ? '已达标' : '未达标' }}
            </span>
          </div>
        </div>

        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" :class="{ done: reached }" :style="{ width: percent + '%' }"></div>
          </div>
          <div class="progress-meta">
            <span>完成度 {{ percent }}%</span>
            <span v-if="!reached">还差 {{ remaining }} 分</span>
            <span v-else>恭喜达成目标</span>
          </div>
        </div>

        <div class="hero-footer">
          <div class="integrity-block">
            <van-icon name="shield-o" />
            <span>诚信值</span>
            <strong :class="integrityClass">{{ credit.integrityScore ?? 100 }}</strong>
            <span v-if="(credit.integrityScore ?? 100) < 80" class="integrity-warn">需恢复</span>
          </div>
          <div class="semester">2025-2026-1</div>
        </div>
      </div>

      <div class="grid">
        <div class="stat-card">
          <strong class="primary">{{ activityScore }}</strong>
          <span>活动积分</span>
        </div>
        <div class="stat-card">
          <strong class="accent">{{ certScore }}</strong>
          <span>证书加分</span>
        </div>
        <div class="stat-card">
          <strong class="primary">{{ records.length }}</strong>
          <span>参与次数</span>
        </div>
        <div class="stat-card">
          <strong :class="integrityClass">{{ credit.integrityScore ?? 100 }}</strong>
          <span>诚信值</span>
        </div>
      </div>

      <div class="section-block list-card">
        <h3 class="section-title">参与记录</h3>
        <van-empty v-if="!records.length" description="暂无记录" :image-size="80" />
        <div v-for="r in records" :key="r.id" class="row">
          <div class="row-main">
            <strong>{{ r.activityName || ('活动 #' + r.activityId) }}</strong>
            <p>{{ statusText(r) }}</p>
          </div>
          <b :class="{ muted: r.status !== 2 }">
            {{ r.status === 2 ? `+${r.score}` : `预计+${r.score}` }}
          </b>
        </div>
      </div>

      <div class="section-block list-card">
        <h3 class="section-title">证书记录</h3>
        <van-empty v-if="!certs.length" description="暂无证书" :image-size="80" />
        <div v-for="c in certs" :key="c.id" class="row">
          <div class="row-main">
            <strong>{{ c.certificateName }}</strong>
            <p>
              <span class="tag" :class="certStatusClass(c.status)">{{ certStatusText(c.status) }}</span>
            </p>
          </div>
          <b v-if="c.status === 1">+{{ c.score }}</b>
          <b v-else class="muted">+{{ c.score }}</b>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { secondClassApi, certificateApi } from '../api'

export default {
  name: 'CreditDashboard',
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const credit = ref({ secondClassScore: 0, integrityScore: 100, targetScore: 120 })
    const records = ref([])
    const certs = ref([])

    const percent = computed(() => {
      const score = credit.value.secondClassScore || 0
      const target = credit.value.targetScore || 120
      return Math.min(100, Math.round((score / target) * 100))
    })

    const reached = computed(() => {
      const score = credit.value.secondClassScore || 0
      const target = credit.value.targetScore || 120
      return score >= target
    })

    const remaining = computed(() => {
      const score = credit.value.secondClassScore || 0
      const target = credit.value.targetScore || 120
      return Math.max(0, target - score)
    })

    const integrityClass = computed(() => {
      const v = credit.value.integrityScore ?? 100
      if (v < 80) return 'danger'
      if (v < 100) return 'accent'
      return 'success'
    })

    const activityScore = computed(() =>
      records.value.reduce((s, r) => s + (r.status === 2 ? r.score : 0), 0)
    )

    const certScore = computed(() =>
      certs.value.reduce((s, c) => s + (c.status === 1 ? c.score : 0), 0)
    )

    const statusText = (r) => {
      if (r.reviewStatus === 'pending') return '报名审核中'
      if (r.reviewStatus === 'rejected') return '报名未通过'
      return ({ 0: '待参加', 1: '已签到', 2: '已完成', 3: '已取消' }[r.status] || '—')
    }

    const certStatusText = (status) => {
      return status === 1 ? '已通过' : (status === 0 ? '待审核' : '未通过')
    }

    const certStatusClass = (status) => {
      return status === 1 ? 'tag-green' : (status === 0 ? 'tag-gold' : 'tag-red')
    }

    const load = async () => {
      loading.value = true
      try {
        const [creditRes, recRes, certRes] = await Promise.all([
          secondClassApi.getUserCredit(),
          secondClassApi.getUserRecords(),
          certificateApi.getMyCertificates()
        ])
        credit.value = creditRes.data || credit.value
        records.value = recRes.data || []
        certs.value = certRes.data || []
      } catch (e) {
        showToast(e?.message || '加载失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(load)

    return {
      loading,
      credit,
      records,
      certs,
      percent,
      reached,
      remaining,
      integrityClass,
      activityScore,
      certScore,
      statusText,
      certStatusText,
      certStatusClass,
      goBack: () => router.back()
    }
  }
}
</script>

<style scoped>
.credit-page {
  min-height: 100vh;
  background: var(--bg-page);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.body {
  padding: 16px;
  display: grid;
  gap: 14px;
}

.hero-card {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  box-shadow: 0 12px 32px rgba(44, 82, 130, 0.3);
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.hero-score .big {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
}

.hero-score .label {
  font-size: var(--font-sm);
  opacity: 0.85;
  margin-top: 4px;
}

.hero-target {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.target-num {
  font-size: var(--font-sm);
  opacity: 0.85;
  font-weight: 600;
}

.progress-wrap {
  margin-bottom: 16px;
}

.progress-track {
  height: 10px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--accent), #e0b44a);
  box-shadow: 0 0 12px rgba(214, 158, 46, 0.55);
  transition: width 0.6s ease;
  min-width: 4px;
}

.progress-fill.done {
  background: linear-gradient(90deg, var(--success), #4cc98a);
  box-shadow: 0 0 12px rgba(47, 158, 110, 0.55);
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: var(--font-xs);
  opacity: 0.88;
}

.hero-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}

.integrity-block {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-sm);
}

.integrity-block strong {
  font-size: var(--font-lg);
  font-weight: 800;
}

.integrity-block strong.success { color: #9ae6b4; }
.integrity-block strong.accent { color: #f6e05e; }
.integrity-block strong.danger { color: #feb2b2; }

.integrity-warn {
  font-size: var(--font-xs);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  background: var(--danger);
  color: #fff;
  font-weight: 600;
}

.semester {
  font-size: var(--font-xs);
  opacity: 0.72;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 10px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.stat-card strong {
  display: block;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat-card strong.primary { color: var(--primary); }
.stat-card strong.accent { color: var(--accent); }
.stat-card strong.success { color: var(--success); }
.stat-card strong.danger { color: var(--danger); }

.stat-card span {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.list-card {
  text-align: left;
}

.list-card .section-title {
  margin-bottom: 8px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-sm);
}

.row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row-main strong {
  display: block;
  font-size: var(--font-md);
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 4px;
}

.row-main p {
  font-size: var(--font-xs);
  color: var(--text-muted);
  margin: 0;
}

.row b {
  color: var(--accent);
  font-size: var(--font-md);
  font-weight: 800;
  flex-shrink: 0;
}

.row b.muted {
  color: var(--text-muted);
}
</style>
