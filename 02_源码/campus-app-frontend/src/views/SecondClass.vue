<template>
  <div class="page second-class-page">
    <van-nav-bar title="第二课堂" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="records" size="20" @click="navigateTo('/second-class/records')" />
      </template>
    </van-nav-bar>

    <div class="credit-card">
      <div class="credit-content">
        <div class="credit-main">
          <div class="credit-item">
            <span class="credit-value">{{ creditInfo.secondClassScore || 0 }}</span>
            <span class="credit-label">第二课堂积分</span>
          </div>
          <div class="credit-divider"></div>
          <div class="credit-item">
            <span class="credit-value">{{ creditInfo.integrityScore ?? 100 }}</span>
            <span class="credit-label">诚信值</span>
          </div>
        </div>
        <div class="credit-progress">
          <div class="progress-header">
            <span>距离目标：{{ creditInfo.targetScore || 120 }} 分</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="{ done: progressPercent >= 100 }"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>
        <div class="credit-status">
          <span class="tag" :class="creditInfo.reachedTarget || progressPercent >= 100 ? 'tag-green' : 'tag-gold'">
            {{ creditInfo.reachedTarget || progressPercent >= 100 ? '已达标' : '未达标' }}
          </span>
          <span v-if="(creditInfo.integrityScore ?? 100) < 80" class="tag tag-red">
            诚信值不足，需恢复
          </span>
        </div>
      </div>
    </div>

    <div v-if="(creditInfo.integrityScore ?? 100) < 80" class="restore-section">
      <div class="restore-header">
        <van-icon name="warning-o" color="var(--danger)" />
        <span>诚信值不足80，请参加指定活动恢复诚信值</span>
      </div>
      <van-button type="danger" size="small" round @click="handleRestoreIntegrity">
        恢复诚信值 (+1)
      </van-button>
    </div>

    <div class="banner-card gold" @click="navigateTo('/second-class/dashboard')">
      <div class="banner-left">
        <div class="banner-icon gold-bg">
          <van-icon name="chart-trending-o" size="22" color="var(--accent)" />
        </div>
        <div>
          <h4>学分看板</h4>
          <p>活动 / 证书积分与诚信值总览</p>
        </div>
      </div>
      <van-icon name="arrow" color="var(--text-muted)" />
    </div>

    <div class="banner-card" @click="navigateTo('/certificate/apply')">
      <div class="banner-left">
        <div class="banner-icon blue-bg">
          <van-icon name="certificate" size="22" color="var(--primary)" />
        </div>
        <div>
          <h4>证书申请</h4>
          <p>上传证书获取积分，最高+20分</p>
        </div>
      </div>
      <div class="banner-right">
        <span class="banner-badge">2-20分</span>
        <van-icon name="arrow" color="var(--text-muted)" />
      </div>
    </div>

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
            <span class="tag tag-blue">{{ getTypeName(activity.activityType) }}</span>
            <span v-if="activity.joined" class="tag tag-green">已报名</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载中...</van-loading>
    </div>

    <van-empty v-else :description="emptyText" />

    <div v-if="canPublish" class="fab" @click="openPublish">
      <van-icon name="plus" size="24" color="#fff" />
    </div>

    <van-popup v-model:show="showPublishDialog" position="bottom" round :style="{ height: '82%' }">
      <div class="publish-form">
        <div class="form-header">
          <h3>发布活动</h3>
          <van-icon name="cross" size="20" @click="showPublishDialog = false" />
        </div>
        <van-form @submit="handlePublish">
          <van-cell-group>
            <van-field
              v-model="publishForm.activityName"
              label="活动名称"
              placeholder="请输入活动名称"
              :rules="[{ required: true, message: '请输入活动名称' }]"
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
            <van-field name="activityType" label="活动类型">
              <template #input>
                <div class="type-chips">
                  <span
                    v-for="t in activityTypes"
                    :key="t.value"
                    class="type-chip"
                    :class="{ active: Number(publishForm.activityType) === t.value }"
                    @click="publishForm.activityType = t.value"
                  >
                    {{ t.label }}
                  </span>
                </div>
              </template>
            </van-field>
            <van-field
              v-model="publishForm.score"
              label="积分"
              type="digit"
              placeholder="请输入积分"
              :rules="[{ required: true, message: '请输入积分' }]"
            />
            <van-field
              v-model="publishForm.maxParticipants"
              label="最大人数"
              type="digit"
              placeholder="不限制可不填"
            />
            <van-field label="开始时间" required :rules="[{ required: true, message: '请选择开始时间' }]">
              <template #input>
                <input
                  v-model="publishForm.startTime"
                  class="native-date-input"
                  type="datetime-local"
                />
              </template>
            </van-field>
            <van-field label="结束时间" required :rules="[{ required: true, message: '请选择结束时间' }]">
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
            <van-button round block type="primary" native-type="submit" :loading="publishing">
              发布活动
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast, showDialog } from 'vant'
import { secondClassApi } from '../api'
import { activityCover } from '../utils/mediaDefaults'

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
    const loading = ref(true)
    const publishing = ref(false)
    const showPublishDialog = ref(false)

    const phaseTabs = [
      { value: 'active', label: '未结束' },
      { value: 'enrolled', label: '已报名' },
      { value: 'ended', label: '已结束' },
      { value: '', label: '全部' }
    ]

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

    const canPublish = computed(() => {
      const r = Number(store.getters.getRole) || 0
      return r === 2 || r === 1
    })

    const progressPercent = computed(() => {
      const score = creditInfo.value.secondClassScore || 0
      const target = creditInfo.value.targetScore || 120
      return Math.min(Math.round((score / target) * 100), 100)
    })

    const emptyText = computed(() => {
      if (activePhase.value === 'enrolled') return '还没有报名任何活动'
      if (activePhase.value === 'ended') return '暂无已结束的活动'
      if (activeType.value) return `暂无${getTypeName(activeType.value)}活动`
      return '暂无活动'
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

    const loadActivities = async () => {
      loading.value = true
      try {
        const res = await secondClassApi.getActivityList({
          pageNum: 1,
          pageSize: 20,
          activityType: activeType.value || undefined,
          phase: activePhase.value || undefined
        })
        activities.value = res.data?.records || []
      } catch (error) {
        activities.value = []
        showToast(error?.message || '获取活动失败')
      } finally {
        loading.value = false
      }
    }

    const loadJoinedCount = async () => {
      try {
        const recRes = await secondClassApi.getUserRecords()
        joinedCount.value = (recRes.data || []).length
      } catch (e) {
        joinedCount.value = 0
      }
    }

    const loadCredit = async () => {
      try {
        const res = await secondClassApi.getUserCredit()
        creditInfo.value = res.data || {}
      } catch (error) {
        showToast(error?.message || '获取积分失败')
      }
    }

    const switchPhase = (phase) => {
      if (activePhase.value === phase) return
      activePhase.value = phase
      loadActivities()
    }

    const switchType = (type) => {
      if (activeType.value === type) return
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
      } catch (e) {
        return
      }
      try {
        await secondClassApi.restoreIntegrity()
        showToast({ message: '恢复成功！诚信值 +1', icon: 'success' })
        loadCredit()
      } catch (error) {
        showToast(error?.message || '恢复失败')
      }
    }

    const openPublish = () => {
      publishForm.value = {
        activityName: '',
        description: '',
        location: '',
        score: '',
        maxParticipants: '',
        startTime: '',
        endTime: '',
        activityType: 1
      }
      showPublishDialog.value = true
    }

    const handlePublish = async () => {
      if (publishing.value) return
      if (!publishForm.value.startTime || !publishForm.value.endTime) {
        showToast('请选择开始和结束时间')
        return
      }
      publishing.value = true
      try {
        await secondClassApi.publishActivity({
          activityName: publishForm.value.activityName,
          description: publishForm.value.description,
          location: publishForm.value.location,
          score: publishForm.value.score,
          maxParticipants: publishForm.value.maxParticipants,
          startTime: publishForm.value.startTime,
          endTime: publishForm.value.endTime,
          activityType: publishForm.value.activityType
        })
        showToast({ message: '发布成功！', icon: 'success' })
        showPublishDialog.value = false
        loadActivities()
      } catch (error) {
        showToast(error?.message || '发布失败')
      } finally {
        publishing.value = false
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
      loadJoinedCount()
    })

    return {
      activities,
      creditInfo,
      activeType,
      activePhase,
      joinedCount,
      loading,
      publishing,
      showPublishDialog,
      phaseTabs,
      publishForm,
      canPublish,
      progressPercent,
      emptyText,
      activityTypes,
      activityCover,
      getStatusClass,
      getStatusText,
      getTypeName,
      formatDate,
      switchPhase,
      switchType,
      handleRestoreIntegrity,
      openPublish,
      handlePublish,
      goToDetail,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.second-class-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 90px;
}

.credit-card {
  margin: 16px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(44, 82, 130, 0.28);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.credit-content {
  padding: 22px 20px;
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
  font-weight: 800;
  margin-bottom: 4px;
  line-height: 1.2;
}

.credit-label {
  font-size: var(--font-sm);
  opacity: 0.88;
}

.credit-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.28);
}

.credit-progress {
  margin-bottom: 15px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-xs);
  margin-bottom: 8px;
  opacity: 0.9;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--accent), #e0b44a);
  box-shadow: 0 0 10px rgba(214, 158, 46, 0.5);
  transition: width 0.5s ease;
}

.progress-fill.done {
  background: linear-gradient(90deg, var(--success), #4cc98a);
  box-shadow: 0 0 10px rgba(47, 158, 110, 0.5);
}

.credit-status {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.restore-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--danger-soft);
  margin: 0 16px 14px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--danger);
}

.restore-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-sm);
  color: var(--danger);
  font-weight: 600;
}

.banner-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  margin: 0 16px 12px;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.banner-card:hover {
  box-shadow: var(--shadow-md);
}

.banner-card:active {
  transform: scale(0.98);
}

.banner-card.gold {
  background: linear-gradient(135deg, var(--accent-soft), #fdf6e3);
  border-color: #f0e2b8;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-icon.gold-bg {
  background: rgba(214, 158, 46, 0.18);
}

.banner-icon.blue-bg {
  background: var(--primary-soft);
}

.banner-left h4 {
  font-size: var(--font-md);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.banner-left p {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.banner-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-badge {
  background: var(--accent);
  color: #fff;
  font-size: var(--font-xs);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: 700;
}

.phase-tabs {
  display: flex;
  gap: 8px;
  padding: 8px 16px 0;
  overflow-x: auto;
}

.phase-tabs::-webkit-scrollbar {
  display: none;
}

.phase-tab {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.phase-tab.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 14px rgba(44, 82, 130, 0.22);
}

.phase-tab .badge {
  margin-left: 4px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  border-radius: var(--radius-full);
  padding: 1px 6px;
  font-weight: 700;
}

.phase-tab.active .badge {
  background: rgba(255, 255, 255, 0.28);
}

.category-section {
  background: var(--bg-card);
  padding: 12px 0;
  margin: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.category-scroll {
  display: flex;
  padding: 0 14px;
  overflow-x: auto;
  gap: 8px;
  -webkit-overflow-scrolling: touch;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-tag {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-tag.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  border-color: transparent;
}

.activity-list {
  padding: 0 16px;
}

.activity-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.activity-card:hover {
  box-shadow: var(--shadow-md);
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
  background: rgba(20, 36, 58, 0.72);
  color: #f6e05e;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.activity-status {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 4px 10px;
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

.activity-info {
  padding: 14px 16px;
}

.activity-name {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  line-height: 1.4;
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
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.activity-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 36px;
}

.fab {
  position: fixed;
  bottom: 88px;
  right: 20px;
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(44, 82, 130, 0.32);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.15s ease;
}

.fab:active {
  transform: scale(0.94);
}

.publish-form {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-page);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.form-header h3 {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.publish-form :deep(.van-cell-group) {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.type-chip {
  padding: 5px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 600;
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
}

.type-chip.active {
  background: var(--primary-soft);
  border-color: var(--primary);
  color: var(--primary);
}

.form-actions {
  margin-top: 20px;
  padding-bottom: 24px;
}

.native-date-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-md);
  color: var(--text-primary);
  font-family: inherit;
  min-height: 24px;
}
</style>
