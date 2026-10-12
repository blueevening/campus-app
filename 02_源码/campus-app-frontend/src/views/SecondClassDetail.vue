<template>
  <div class="page detail-page">
    <van-nav-bar title="活动详情" left-arrow @click-left="goBack" />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载中...</van-loading>
    </div>

    <template v-else>
      <div class="activity-cover">
        <van-image
          width="100%"
          height="200"
          fit="cover"
          :src="activityCover(activity)"
        />
        <div class="cover-overlay">
          <div class="score-badge">
            <van-icon name="star-o" />
            +{{ activity.score || 0 }}积分
          </div>
          <div class="status-badge" :class="getStatusClass(activity.status)">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2 class="activity-name">{{ activity.activityName }}</h2>
        <div class="info-list">
          <div class="info-item">
            <van-icon name="location-o" color="var(--primary)" />
            <span>{{ activity.location || '待定' }}</span>
          </div>
          <div class="info-item">
            <van-icon name="clock-o" color="var(--primary)" />
            <span>{{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</span>
          </div>
          <div class="info-item">
            <van-icon name="friends-o" color="var(--primary)" />
            <span>{{ activity.currentParticipants || 0 }}/{{ activity.maxParticipants || '不限' }}人参与</span>
          </div>
          <div class="info-item">
            <van-icon name="label-o" color="var(--primary)" />
            <span class="tag tag-blue">{{ getTypeName(activity.activityType) }}</span>
          </div>
        </div>
      </div>

      <div class="desc-section">
        <h3>活动描述</h3>
        <p>{{ activity.description || '暂无描述' }}</p>
      </div>

      <div class="my-status-card" v-if="myRecord">
        <div class="my-status-row">
          <span class="my-label">我的状态</span>
          <span class="tag" :class="myStatusClass">{{ myStatusText }}</span>
        </div>
        <div class="my-status-row">
          <span class="my-label">获得积分</span>
          <strong class="score" :class="{ earned: myRecord.status === 2 }">
            {{ myRecord.status === 2 ? `+${myRecord.score} 分` : `完成可得 +${myRecord.score} 分` }}
          </strong>
        </div>
      </div>
    </template>

    <div class="bottom-bar">
      <template v-if="loading">
        <van-button type="default" round block disabled>加载中...</van-button>
      </template>

      <!-- 未报名 -->
      <van-button
        v-else-if="canJoin"
        type="primary"
        round
        block
        class="main-btn"
        @click="handleJoin"
        :loading="joining"
        loading-text="报名中..."
      >
        立即报名（系统自动审核）
      </van-button>

      <!-- 报名审核中 -->
      <van-button
        v-else-if="isPending"
        type="default"
        round
        block
        disabled
      >
        报名审核中…
      </van-button>

      <!-- 报名未通过 -->
      <van-button
        v-else-if="isRejected"
        type="default"
        round
        block
        disabled
      >
        报名未通过
      </van-button>

      <!-- 已完成 -->
      <van-button
        v-else-if="isCompleted"
        type="success"
        round
        block
        disabled
        class="main-btn"
      >
        已完成 · 获得 {{ myRecord && myRecord.score }} 积分
      </van-button>

      <!-- 已签到：可完成 -->
      <template v-else-if="isCheckedIn">
        <van-button
          type="success"
          round
          block
          class="half-btn"
          disabled
        >
          已签到
        </van-button>
        <van-button
          type="primary"
          round
          block
          class="half-btn"
          :loading="completing"
          loading-text="完成中..."
          @click="handleComplete"
        >
          完成活动
        </van-button>
        <van-button
          type="danger"
          round
          plain
          block
          class="half-btn"
          :loading="cancelling"
          @click="handleCancelJoin"
        >
          取消报名
        </van-button>
      </template>

      <!-- 待参加（已通过审核，未签到） -->
      <template v-else-if="isRegistered">
        <van-button
          type="success"
          round
          block
          class="half-btn"
          :loading="checkingIn"
          loading-text="签到中..."
          @click="handleCheckIn"
        >
          签到
        </van-button>
        <van-button
          type="danger"
          round
          plain
          block
          class="half-btn"
          :loading="cancelling"
          @click="handleCancelJoin"
        >
          取消报名
        </van-button>
      </template>

      <!-- 活动不可报名 -->
      <van-button
        v-else
        type="default"
        round
        block
        disabled
      >
        {{ fallbackBtnText }}
      </van-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { secondClassApi } from '../api'
import { activityCover } from '../utils/mediaDefaults'

export default {
  name: 'SecondClassDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const activity = ref({})
    const myRecord = ref(null)
    const loading = ref(true)
    const joining = ref(false)
    const checkingIn = ref(false)
    const cancelling = ref(false)
    const completing = ref(false)

    const isPending = computed(() => !!myRecord.value && myRecord.value.reviewStatus === 'pending')
    const isRejected = computed(() => !!myRecord.value && myRecord.value.reviewStatus === 'rejected')
    const isCompleted = computed(() => !!myRecord.value && myRecord.value.status === 2 && myRecord.value.reviewStatus !== 'rejected')
    const isCheckedIn = computed(() =>
      !!myRecord.value &&
      myRecord.value.reviewStatus !== 'rejected' &&
      myRecord.value.reviewStatus !== 'pending' &&
      myRecord.value.status === 1
    )
    const isRegistered = computed(() =>
      !!myRecord.value &&
      myRecord.value.reviewStatus !== 'rejected' &&
      myRecord.value.reviewStatus !== 'pending' &&
      myRecord.value.status === 0
    )

    const canJoin = computed(() => {
      if (myRecord.value) return false
      const st = Number(activity.value.status)
      if (st === 2 || st === 3) return false
      const cur = Number(activity.value.currentParticipants) || 0
      const max = Number(activity.value.maxParticipants) || 0
      if (max > 0 && cur >= max) return false
      return true
    })

    const myStatusText = computed(() => {
      if (!myRecord.value) return ''
      if (isPending.value) return '审核中'
      if (isRejected.value) return '报名未通过'
      return ({ 0: '待参加', 1: '已签到', 2: '已完成', 3: '已取消' }[myRecord.value.status] || '—')
    })

    const myStatusClass = computed(() => {
      if (isPending.value) return 'tag-gray'
      if (isRejected.value) return 'tag-red'
      const classes = { 0: 'tag-blue', 1: 'tag-gold', 2: 'tag-green', 3: 'tag-gray' }
      return classes[myRecord.value?.status] || 'tag-gray'
    })

    const fallbackBtnText = computed(() => {
      const st = Number(activity.value.status)
      const cur = Number(activity.value.currentParticipants) || 0
      const max = Number(activity.value.maxParticipants) || 0
      if (max > 0 && cur >= max) return '名额已满'
      return getStatusText(st)
    })

    const loadMyRecord = async () => {
      try {
        const res = await secondClassApi.getUserRecords()
        const list = res.data || []
        const id = Number(route.params.id)
        myRecord.value = list.find(r => Number(r.activityId) === id) || null
      } catch (e) {
        myRecord.value = null
      }
    }

    const loadActivity = async () => {
      try {
        const id = route.params.id
        const res = await secondClassApi.getActivityDetail(id)
        activity.value = res.data || {}
      } catch (error) {
        showToast(error?.message || '获取活动详情失败')
      }
    }

    const refresh = async () => {
      await Promise.all([loadActivity(), loadMyRecord()])
    }

    const getStatusClass = (status) => {
      const classes = {
        0: 'status-upcoming',
        1: 'status-ongoing',
        2: 'status-ended',
        3: 'status-cancelled'
      }
      return classes[status] || 'status-upcoming'
    }

    const getStatusText = (status) => {
      const texts = { 0: '未开始', 1: '进行中', 2: '已结束', 3: '已取消' }
      return texts[status] || '未知'
    }

    const getTypeName = (type) => {
      const names = {
        1: '志愿服务',
        2: '社会实践',
        3: '文体活动',
        4: '创新创业',
        5: '技能培训',
        6: '讲座报告'
      }
      return names[type] || '其他'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '待定'
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const handleJoin = async () => {
      if (joining.value) return
      joining.value = true
      try {
        await secondClassApi.joinActivity(activity.value.id)
        showToast({ message: '报名已提交，系统自动审核中', icon: 'success' })
        await refresh()
      } catch (error) {
        showToast(error?.message || '报名失败')
      } finally {
        joining.value = false
      }
    }

    const handleCheckIn = async () => {
      if (checkingIn.value) return
      checkingIn.value = true
      try {
        await secondClassApi.checkIn(activity.value.id)
        showToast({ message: '签到成功！', icon: 'success' })
        await refresh()
      } catch (error) {
        showToast(error?.message || '签到失败')
      } finally {
        checkingIn.value = false
      }
    }

    const handleComplete = async () => {
      if (completing.value) return
      completing.value = true
      try {
        const res = await secondClassApi.completeActivity(activity.value.id)
        const gained = res?.data?.secondClassScore
        showToast({
          message: gained != null ? `完成并计分！当前学分 ${gained}` : '已完成并计分',
          icon: 'success'
        })
        await refresh()
      } catch (error) {
        showToast(error?.message || '完成失败')
      } finally {
        completing.value = false
      }
    }

    const handleCancelJoin = async () => {
      if (cancelling.value) return
      try {
        await showDialog({
          title: '取消报名',
          message: '确定取消该活动报名吗？',
          showCancelButton: true,
          confirmButtonColor: '#e24b4b'
        })
      } catch (e) {
        return
      }
      cancelling.value = true
      try {
        await secondClassApi.cancelActivity(activity.value.id)
        showToast('已取消报名')
        await refresh()
      } catch (error) {
        showToast(error?.message || '取消失败')
      } finally {
        cancelling.value = false
      }
    }

    const goBack = () => {
      router.back()
    }

    onMounted(async () => {
      loading.value = true
      try {
        await refresh()
      } finally {
        loading.value = false
      }
    })

    return {
      activity,
      myRecord,
      loading,
      joining,
      checkingIn,
      cancelling,
      completing,
      canJoin,
      isPending,
      isRejected,
      isCompleted,
      isCheckedIn,
      isRegistered,
      myStatusText,
      myStatusClass,
      fallbackBtnText,
      activityCover,
      getStatusClass,
      getStatusText,
      getTypeName,
      formatDate,
      handleJoin,
      handleCheckIn,
      handleComplete,
      handleCancelJoin,
      goBack
    }
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 96px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.activity-cover {
  position: relative;
  overflow: hidden;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(20, 36, 58, 0.72));
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.score-badge {
  background: rgba(214, 158, 46, 0.95);
  color: #1a202c;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
}

.status-upcoming {
  background: var(--info-soft);
  color: var(--info);
}

.status-ongoing {
  background: var(--success-soft);
  color: var(--success);
}

.status-ended {
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.status-cancelled {
  background: var(--danger-soft);
  color: var(--danger);
}

.info-section {
  background: var(--bg-card);
  margin: 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-sm);
}

.activity-name {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 15px;
  line-height: 1.4;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.desc-section {
  background: var(--bg-card);
  margin: 0 16px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-sm);
}

.desc-section h3 {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.desc-section h3::before {
  content: '';
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--primary), var(--accent));
}

.desc-section p {
  font-size: var(--font-md);
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}

.my-status-card {
  background: var(--bg-card);
  margin: 0 16px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.my-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.my-label {
  font-size: var(--font-sm);
  color: var(--text-muted);
}

.score {
  font-size: var(--font-lg);
  font-weight: 800;
  color: var(--text-muted);
}

.score.earned {
  color: var(--accent);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 16px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 50;
}

.main-btn {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.half-btn {
  flex: 1;
}
</style>
