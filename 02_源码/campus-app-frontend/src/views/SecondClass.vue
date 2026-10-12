<template>
  <div class="second-class-container">
    <van-nav-bar title="第二课堂" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="records" size="20" @click="navigateTo('/second-class/records')" />
      </template>
    </van-nav-bar>

    <!-- 积分统计卡片 -->
    <div class="credit-card">
      <div class="credit-bg"></div>
      <div class="credit-content">
        <div class="credit-main">
          <div class="credit-item">
            <span class="credit-value">{{ creditInfo.secondClassScore || 0 }}</span>
            <span class="credit-label">第二课堂积分</span>
          </div>
          <div class="credit-divider"></div>
          <div class="credit-item">
            <span class="credit-value">{{ creditInfo.integrityScore || 100 }}</span>
            <span class="credit-label">诚信值</span>
          </div>
        </div>
        <div class="credit-progress">
          <div class="progress-header">
            <span>距离目标：{{ creditInfo.targetScore || 120 }} 分</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        <div class="credit-status">
          <van-tag v-if="creditInfo.reachedTarget" type="success" size="medium">
            ✓ 已达标
          </van-tag>
          <van-tag v-else type="warning" size="medium">
            未达标
          </van-tag>
          <van-tag v-if="creditInfo.integrityScore < 80" type="danger" size="medium" class="integrity-tag">
            诚信值不足，需恢复
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 诚信值恢复提示 -->
    <div v-if="creditInfo.integrityScore < 80" class="restore-section">
      <div class="restore-header">
        <van-icon name="warning-o" color="#ee0a24" />
        <span>诚信值不足80，请参加指定活动恢复诚信值</span>
      </div>
      <van-button type="danger" size="small" round @click="handleRestoreIntegrity">
        恢复诚信值 (+1)
      </van-button>
    </div>

    <!-- 学分看板 -->
    <div class="cert-banner" @click="navigateTo('/second-class/dashboard')">
      <div class="cert-banner-left">
        <van-icon name="chart-trending-o" size="28" color="#2c5282" />
        <div>
          <h4>学分看板</h4>
          <p>活动 / 证书积分与诚信值总览</p>
        </div>
      </div>
      <div class="cert-banner-right">
        <van-icon name="arrow" />
      </div>
    </div>

    <!-- 证书申请入口 -->
    <div class="cert-banner" @click="navigateTo('/certificate/apply')">
      <div class="cert-banner-left">
        <van-icon name="certificate" size="28" color="#f59e0b" />
        <div>
          <h4>证书申请</h4>
          <p>上传证书获取积分，最高+20分</p>
        </div>
      </div>
      <div class="cert-banner-right">
        <span class="cert-score-badge">2-20分</span>
        <van-icon name="arrow" />
      </div>
    </div>

    <!-- 状态筛选 -->
    <div class="phase-tabs">
      <button
        v-for="tab in phaseTabs"
        :key="tab.value"
        class="phase-tab"
        :class="{ active: activePhase === tab.value }"
        @click="switchPhase(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.value === 'enrolled' && joinedCount" class="badge">{{ joinedCount }}</span>
      </button>
    </div>

    <!-- 活动类型筛选 -->
    <div class="category-section">
      <div class="category-scroll">
        <div
          class="category-tag"
          :class="{ active: activeType === '' }"
          @click="switchType('')"
        >
          全部
        </div>
        <div
          v-for="type in activityTypes"
          :key="type.value"
          class="category-tag"
          :class="{ active: activeType === type.value }"
          @click="switchType(type.value)"
        >
          <van-icon :name="type.icon" />
          {{ type.label }}
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <div class="activity-list" v-if="activities.length > 0">
      <div
        class="activity-card"
        v-for="activity in activities"
        :key="activity.id"
        @click="goToDetail(activity.id)"
      >
        <div class="activity-cover">
          <van-image
            width="100%"
            height="150"
            fit="cover"
            :src="activityCover(activity)"
            radius="12"
          />
          <div class="activity-score">
            <van-icon name="star-o" />
            +{{ activity.score }}分
          </div>
          <div class="activity-status" :class="getStatusClass(activity.status)">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
        <div class="activity-info">
          <h4 class="activity-name">{{ activity.activityName }}</h4>
          <div class="activity-meta">
            <div class="meta-item">
              <van-icon name="location-o" />
              <span>{{ activity.location || '待定' }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="clock-o" />
              <span>{{ formatDate(activity.startTime) }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="friends-o" />
              <span>{{ activity.currentParticipants || 0 }}/{{ activity.maxParticipants || '不限' }}人</span>
            </div>
          </div>
          <div class="activity-tags">
            <span class="type-tag">{{ getTypeName(activity.activityType) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-else description="暂无活动" />

    <!-- 管理员发布按钮 -->
    <div v-if="canPublish" class="publish-btn" @click="showPublishDialog = true">
      <van-icon name="plus" size="24" color="#fff" />
    </div>

    <!-- 发布活动弹窗 -->
    <van-popup v-model:show="showPublishDialog" position="bottom" round style="height: 80%">
      <div class="publish-form">
        <div class="form-header">
          <h3>发布活动</h3>
          <van-icon name="cross" @click="showPublishDialog = false" />
        </div>
        <van-form @submit="handlePublish">
          <van-cell-group>
            <van-field
              v-model="publishForm.activityName"
              label="活动名称"
              placeholder="请输入活动名称"
              required
            />
            <van-field
              v-model="publishForm.description"
              label="活动描述"
              type="textarea"
              placeholder="请输入活动描述"
              rows="3"
            />
            <van-field
              v-model="publishForm.location"
              label="活动地点"
              placeholder="请输入活动地点"
            />
            <van-field
              v-model="publishForm.score"
              label="积分"
              type="digit"
              placeholder="请输入积分"
              required
            />
            <van-field
              v-model="publishForm.maxParticipants"
              label="最大人数"
              type="digit"
              placeholder="不限制可不填"
            />
            <van-field label="开始时间">
              <template #input>
                <input
                  v-model="publishForm.startTime"
                  class="native-date-input"
                  type="datetime-local"
                />
              </template>
            </van-field>
            <van-field label="结束时间">
              <template #input>
                <input
                  v-model="publishForm.endTime"
                  class="native-date-input"
                  type="datetime-local"
                />
              </template>
            </van-field>
          </van-cell-group>
          <div class="form-actions">
            <van-button round block type="primary" native-type="submit">
              发布活动
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 时间选择器 -->
    <van-datetime-picker
      v-if="showStartTimePicker"
      v-model="startTimeValue"
      type="datetime"
      title="选择开始时间"
      @confirm="onStartTimeConfirm"
      @cancel="showStartTimePicker = false"
    />
    <van-datetime-picker
      v-if="showEndTimePicker"
      v-model="endTimeValue"
      type="datetime"
      title="选择结束时间"
      @confirm="onEndTimeConfirm"
      @cancel="showEndTimePicker = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast, showDialog } from 'vant'
import { secondClassApi } from '../api'
import { DEFAULT_COVER, activityCover } from '../utils/mediaDefaults'

export default {
  name: 'SecondClass',
  setup() {
    const router = useRouter()
    const store = useStore()

    const activities = ref([])
    const creditInfo = ref({})
    const activeType = ref('')
    const activePhase = ref('active')
    const joinedCount = ref(0)
    const phaseTabs = [
      { value: 'active', label: '未结束' },
      { value: 'enrolled', label: '已报名' },
      { value: 'ended', label: '已结束' },
      { value: '', label: '全部' }
    ]
    const showPublishDialog = ref(false)
    const showStartTimePicker = ref(false)
    const showEndTimePicker = ref(false)
    const startTimeValue = ref(new Date())
    const endTimeValue = ref(new Date())

    const publishForm = ref({
      activityName: '',
      description: '',
      location: '',
      score: '',
      maxParticipants: '',
      startTime: '',
      endTime: '',
      activityType: 1
    })

    const isAdmin = computed(() => store.getters.getRole === 2)
    const canPublish = computed(() => {
      const r = Number(store.getters.getRole) || 0
      return r === 2 || r === 1
    })

    const progressPercent = computed(() => {
      const score = creditInfo.value.secondClassScore || 0
      const target = creditInfo.value.targetScore || 120
      return Math.min(Math.round(score / target * 100), 100)
    })

    const activityTypes = [
      { value: 1, label: '志愿服务', icon: 'like-o' },
      { value: 2, label: '社会实践', icon: 'flag-o' },
      { value: 3, label: '文体活动', icon: 'music-o' },
      { value: 4, label: '创新创业', icon: 'bulb-o' },
      { value: 5, label: '技能培训', icon: 'certificate' },
      { value: 6, label: '讲座报告', icon: 'description' }
    ]

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

    const loadActivities = async () => {
      try {
        const res = await secondClassApi.getActivityList({
          pageNum: 1,
          pageSize: 20,
          activityType: activeType.value || undefined,
          phase: activePhase.value || undefined
        })
        activities.value = res.data?.records || []
      } catch (error) {
        console.error('获取活动失败', error)
      }
      try {
        const recRes = await secondClassApi.getUserRecords()
        joinedCount.value = (recRes.data || []).length
      } catch (e) {
        joinedCount.value = 0
      }
    }

    const switchPhase = (phase) => {
      activePhase.value = phase
      loadActivities()
    }

    const loadCredit = async () => {
      try {
        const res = await secondClassApi.getUserCredit()
        creditInfo.value = res.data || {}
      } catch (error) {
        console.error('获取积分失败', error)
      }
    }

    const switchType = (type) => {
      activeType.value = type
      loadActivities()
    }

    const handleRestoreIntegrity = async () => {
      try {
        await showDialog({
          title: '恢复诚信值',
          message: '阅读指定项目/活动说明后，点击确认恢复1点诚信值。',
          showCancelButton: true,
          confirmButtonText: '确认恢复'
        })

        const res = await secondClassApi.restoreIntegrity()
        if (res.code === 200) {
          showToast({
            message: '恢复成功！',
            icon: 'success'
          })
          loadCredit()
        } else {
          showToast({
            message: res.message || '恢复失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        if (error) {
          showToast(error.message || '恢复失败')
        }
      }
    }

    const onStartTimeConfirm = (value) => {
      publishForm.value.startTime = formatDateTime(value)
      showStartTimePicker.value = false
    }

    const onEndTimeConfirm = (value) => {
      publishForm.value.endTime = formatDateTime(value)
      showEndTimePicker.value = false
    }

    const formatDateTime = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`
    }

    const handlePublish = async () => {
      try {
        const res = await secondClassApi.publishActivity(publishForm.value)
        if (res.code === 200) {
          showToast({
            message: '发布成功！',
            icon: 'success'
          })
          showPublishDialog.value = false
          loadActivities()
        } else {
          showToast({
            message: res.message || '发布失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        showToast(error.message || '发布失败')
      }
    }

    const goToDetail = (id) => {
      router.push(`/second-class/${id}`)
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadActivities()
      loadCredit()
    })

    return {
      activities,
      defaultCover: DEFAULT_COVER,
      activityCover,
      activePhase,
      phaseTabs,
      joinedCount,
      switchPhase,
      creditInfo,
      activeType,
      showPublishDialog,
      showStartTimePicker,
      showEndTimePicker,
      startTimeValue,
      endTimeValue,
      publishForm,
      isAdmin,
      canPublish,
      progressPercent,
      activityTypes,
      getStatusClass,
      getStatusText,
      getTypeName,
      formatDate,
      switchType,
      handleRestoreIntegrity,
      onStartTimeConfirm,
      onEndTimeConfirm,
      handlePublish,
      goToDetail,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.second-class-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

/* 积分卡片 */
.credit-card {
  position: relative;
  margin: 15px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.credit-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
}

.credit-content {
  position: relative;
  padding: 20px;
  color: #fff;
}

.credit-main {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
}

.credit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.credit-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.credit-label {
  font-size: 13px;
  opacity: 0.9;
}

.credit-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

.credit-progress {
  margin-bottom: 15px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.credit-status {
  display: flex;
  gap: 8px;
}

.integrity-tag {
  margin-left: auto;
}

/* 诚信值恢复提示 */
.restore-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff3e0;
  margin: 0 15px 15px;
  padding: 12px 15px;
  border-radius: 12px;
  border-left: 4px solid #ff9800;
}

.restore-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #e65100;
}

/* 证书申请横幅 */
.cert-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  margin: 0 15px 15px;
  padding: 15px;
  border-radius: 12px;
  border-left: 4px solid #f59e0b;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cert-banner:active {
  transform: scale(0.98);
}

.cert-banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cert-banner-left h4 {
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 2px;
}

.cert-banner-left p {
  font-size: 12px;
  color: #b45309;
}

.cert-banner-right {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #92400e;
}

.cert-score-badge {
  background: #f59e0b;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 15px;
  font-weight: 600;
}

/* 分类标签 */
.phase-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 12px 0;
  overflow-x: auto;
}
.phase-tab {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  font-size: 13px;
  font-weight: 600;
}
.phase-tab.active {
  background: #2c5282;
  border-color: #2c5282;
  color: #fff;
}
.phase-tab .badge {
  margin-left: 4px;
  background: #d69e2e;
  color: #1a202c;
  font-size: 10px;
  border-radius: 999px;
  padding: 1px 6px;
}
.category-section {
  background: #fff;
  padding: 12px 0;
  margin-bottom: 8px;
}

.category-scroll {
  display: flex;
  padding: 0 15px;
  overflow-x: auto;
  gap: 10px;
  -webkit-overflow-scrolling: touch;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-tag {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-tag.active {
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  color: #fff;
}

/* 活动列表 */
.activity-list {
  padding: 0 15px;
}

.activity-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.activity-card:active {
  transform: scale(0.98);
}

.activity-cover {
  position: relative;
}

.activity-score {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffd700;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.activity-status {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
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

.activity-info {
  padding: 15px;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.activity-tags {
  display: flex;
  gap: 8px;
}

.type-tag {
  font-size: 11px;
  padding: 3px 10px;
  background: #f0f7ff;
  color: #1989fa;
  border-radius: 15px;
}

/* 发布按钮 */
.publish-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  z-index: 100;
}

/* 发布表单 */
.publish-form {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.form-actions {
  margin-top: 20px;
}
</style>
