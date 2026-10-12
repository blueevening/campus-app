<template>
  <div class="detail-container">
    <van-nav-bar title="活动详情" left-arrow @click-left="goBack" />

    <!-- 活动封面 -->
    <div class="activity-cover">
      <van-image
        width="100%"
        height="200"
        fit="cover"
        :src="activity.coverImage || defaultCover"
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

    <!-- 活动信息 -->
    <div class="info-section">
      <h2 class="activity-name">{{ activity.activityName }}</h2>
      <div class="info-list">
        <div class="info-item">
          <van-icon name="location-o" color="#2c5282" />
          <span>{{ activity.location || '待定' }}</span>
        </div>
        <div class="info-item">
          <van-icon name="clock-o" color="#2c5282" />
          <span>{{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</span>
        </div>
        <div class="info-item">
          <van-icon name="friends-o" color="#2c5282" />
          <span>{{ activity.currentParticipants || 0 }}/{{ activity.maxParticipants || '不限' }}人参与</span>
        </div>
        <div class="info-item">
          <van-icon name="label-o" color="#2c5282" />
          <span>{{ getTypeName(activity.activityType) }}</span>
        </div>
      </div>
    </div>

    <!-- 活动描述 -->
    <div class="desc-section">
      <h3>活动描述</h3>
      <p>{{ activity.description || '暂无描述' }}</p>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <van-button
        v-if="canJoin"
        type="primary"
        round
        block
        @click="handleJoin"
        :loading="joining"
        loading-text="报名中..."
      >
        立即报名（系统自动审核）
      </van-button>
      <template v-else-if="myRecord && myRecord.reviewStatus !== 'rejected' && myRecord.status !== 2">
        <van-button
          v-if="myRecord.reviewStatus === 'pending'"
          type="default"
          round
          block
          disabled
          class="half-btn"
        >
          报名审核中…
        </van-button>
        <van-button
          v-else
          type="success"
          round
          block
          class="half-btn"
          @click="handleCheckIn"
        >
          {{ myRecord.status >= 1 ? '已签到' : '签到' }}
        </van-button>
        <van-button
          type="danger"
          round
          block
          plain
          class="half-btn"
          :loading="joining"
          @click="handleCancelJoin"
        >
          取消报名
        </van-button>
      </template>
      <van-button
        v-else-if="myRecord && myRecord.reviewStatus === 'rejected'"
        type="default"
        round
        block
        disabled
      >
        报名未通过
      </van-button>
      <van-button
        v-else-if="myRecord && myRecord.status === 2"
        type="default"
        round
        block
        disabled
      >
        已完成
      </van-button>
      <van-button
        v-else
        type="default"
        round
        block
        disabled
      >
        {{ getStatusText(activity.status) }}
      </van-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { secondClassApi } from '../api'
import { DEFAULT_COVER } from '../utils/mediaDefaults'

export default {
  name: 'SecondClassDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const activity = ref({})
    const joining = ref(false)

    const canJoin = computed(() => {
      return activity.value.status === 0 && !myRecord.value
    })
    const myRecord = ref(null)

    const loadMyRecord = async () => {
      try {
        const res = await secondClassApi.getUserRecords()
        const list = res.data || []
        myRecord.value = list.find(r => r.activityId === Number(route.params.id)) || null
      } catch (e) {
        myRecord.value = null
      }
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
      const texts = {
        0: '未开始',
        1: '进行中',
        2: '已结束',
        3: '已取消'
      }
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

    const loadActivity = async () => {
      try {
        const id = route.params.id
        const res = await secondClassApi.getActivityDetail(id)
        activity.value = res.data || {}
      } catch (error) {
        showToast('获取活动详情失败')
      }
    }

    const handleJoin = async () => {
      joining.value = true
      try {
        const res = await secondClassApi.joinActivity(activity.value.id)
        if (res.code === 200) {
          showToast({
            message: '报名已提交，系统自动审核中',
            icon: 'success'
          })
          loadActivity()
          loadMyRecord()
        } else {
          showToast({
            message: res.message || '报名失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        showToast(error.message || '报名失败')
      } finally {
        joining.value = false
      }
    }

    const handleCheckIn = async () => {
      try {
        const res = await secondClassApi.checkIn(activity.value.id)
        if (res.code === 200) {
          showToast({
            message: '签到成功！',
            icon: 'success'
          })
          loadMyRecord()
        } else {
          showToast({
            message: res.message || '签到失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        showToast(error.message || '签到失败')
      }
    }

    const handleCancelJoin = async () => {
      try {
        await showDialog({
          title: '取消报名',
          message: '确定取消该活动报名吗？',
          showCancelButton: true,
          confirmButtonColor: '#e53e3e'
        })
        const res = await secondClassApi.cancelActivity(activity.value.id)
        if (res.code === 200) {
          showToast('已取消报名')
          loadActivity()
          loadMyRecord()
        } else {
          showToast(res.message || '取消失败')
        }
      } catch (error) {
        if (error && error !== 'cancel') {
          showToast(error.message || '取消失败')
        }
      }
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadActivity()
      loadMyRecord()
    })

    return {
      activity,
      defaultCover: DEFAULT_COVER,
      myRecord,
      joining,
      canJoin,
      getStatusClass,
      getStatusText,
      getTypeName,
      formatDate,
      handleJoin,
      handleCheckIn,
      handleCancelJoin,
      goBack
    }
  }
}
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.activity-cover {
  position: relative;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.score-badge {
  background: rgba(255, 215, 0, 0.9);
  color: #333;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.status-upcoming {
  background: #e8f4ff;
  color: #1989fa;
}

.status-ongoing {
  background: #e8f8ef;
  color: #07c160;
}

.status-ended {
  background: #f5f5f5;
  color: #999;
}

.status-cancelled {
  background: #fee2e2;
  color: #ef4444;
}

.info-section {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 18px;
}

.activity-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
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
  font-size: 14px;
  color: #666;
}

.desc-section {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 18px;
}

.desc-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.desc-section p {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 10px;
  align-items: center;
}
.half-btn {
  flex: 1;
}
</style>
