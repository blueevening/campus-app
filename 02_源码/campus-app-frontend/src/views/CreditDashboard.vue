<template>
  <div class="page">
    <van-nav-bar title="学分看板" left-arrow @click-left="goBack" />
    <div class="body">
      <div class="hero-card">
        <div class="big">{{ credit.secondClassScore || 0 }}</div>
        <div class="label">第二课堂学分 / 目标 {{ credit.targetScore || 120 }}</div>
        <div class="bar"><i :style="{ width: percent + '%' }"></i></div>
        <div class="meta">诚信值 {{ credit.integrityScore ?? 100 }} · 2025-2026-1</div>
      </div>
      <div class="grid">
        <div class="card"><strong>{{ activityScore }}</strong><span>活动积分</span></div>
        <div class="card"><strong>{{ certScore }}</strong><span>证书加分</span></div>
        <div class="card"><strong>{{ records.length }}</strong><span>参与次数</span></div>
        <div class="card"><strong>{{ credit.integrityScore ?? 100 }}</strong><span>诚信值</span></div>
      </div>
      <div class="card list-card">
        <h3>参与记录</h3>
        <van-empty v-if="!records.length" description="暂无记录" />
        <div v-for="r in records" :key="r.id" class="row">
          <div>
            <strong>{{ r.activityName || ('活动 #' + r.activityId) }}</strong>
            <p>{{ statusText(r) }}</p>
          </div>
          <b>+{{ r.score }}</b>
        </div>
      </div>
      <div class="card list-card">
        <h3>证书记录</h3>
        <van-empty v-if="!certs.length" description="暂无证书" />
        <div v-for="c in certs" :key="c.id" class="row">
          <div>
            <strong>{{ c.certificateName }}</strong>
            <p>{{ c.status === 1 ? '已通过' : (c.status === 0 ? '待审核' : '未通过') }}</p>
          </div>
          <b v-if="c.status === 1">+{{ c.score }}</b>
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
    const credit = ref({ secondClassScore: 0, integrityScore: 100, targetScore: 120 })
    const records = ref([])
    const certs = ref([])
    const percent = computed(() => Math.min(100, Math.round(((credit.value.secondClassScore || 0) / (credit.value.targetScore || 120)) * 100)))
    const activityScore = computed(() => records.value.reduce((s, r) => s + (r.status === 2 ? r.score : 0), 0))
    const certScore = computed(() => certs.value.reduce((s, c) => s + (c.status === 1 ? c.score : 0), 0))
    const statusText = (r) => {
      if (r.reviewStatus === 'pending') return '报名审核中'
      if (r.reviewStatus === 'rejected') return '报名未通过'
      return ({ 0: '待签到', 1: '已签到', 2: '已完成' }[r.status] || '—')
    }
    const load = async () => {
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
        showToast('加载失败')
      }
    }
    onMounted(load)
    return { credit, records, certs, percent, activityScore, certScore, statusText, goBack: () => router.back() }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.body { padding: 12px; display: grid; gap: 12px; }
.hero-card {
  background: linear-gradient(135deg, #2c5282, #1a365d);
  color: #fff;
  border-radius: 16px;
  padding: 24px 18px;
}
.hero-card .big { font-size: 40px; font-weight: 800; }
.hero-card .label { font-size: 13px; opacity: .85; margin: 4px 0 12px; }
.bar { height: 8px; background: rgba(255,255,255,.2); border-radius: 999px; overflow: hidden; }
.bar i { display: block; height: 100%; background: #d69e2e; }
.hero-card .meta { margin-top: 10px; font-size: 12px; opacity: .75; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
@media (max-width: 600px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
.card {
  background: #fff; border: 1px solid #e8eef5; border-radius: 12px; padding: 14px;
  text-align: center;
}
.card strong { display: block; font-size: 20px; color: #2c5282; }
.card span { font-size: 12px; color: #718096; }
.list-card { text-align: left; }
.list-card h3 { font-size: 14px; color: #2c5282; margin-bottom: 8px; }
.row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid #f0f4f8; font-size: 13px;
}
.row p { font-size: 12px; color: #718096; }
.row b { color: #b7791f; }
</style>
