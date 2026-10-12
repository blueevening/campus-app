<template>
  <div class="page score-page">
    <van-nav-bar title="成绩查询" left-arrow @click-left="goBack" />

    <div class="gpa-card">
      <div class="gpa-main">
        <div class="gpa-value">{{ displayGpa }}</div>
        <div class="gpa-label">平均绩点</div>
      </div>
      <div class="gpa-details">
        <div class="gpa-item">
          <span class="value">{{ gpaInfo.totalCredits ?? 0 }}</span>
          <span class="label">总学分</span>
        </div>
        <div class="gpa-item">
          <span class="value">{{ gpaInfo.passedCourses ?? 0 }}</span>
          <span class="label">已通过</span>
        </div>
        <div class="gpa-item">
          <span class="value">{{ displayAvgScore }}</span>
          <span class="label">平均分</span>
        </div>
      </div>
    </div>

    <div class="semester-filter section-block">
      <van-dropdown-menu>
        <van-dropdown-item
          v-model="currentSemester"
          :options="semesterOptions"
          @change="loadScores"
        />
      </van-dropdown-menu>
    </div>

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="var(--primary)">加载成绩中...</van-loading>
    </div>

    <div v-else class="score-list">
      <div class="score-item" v-for="score in scores" :key="score.id">
        <div class="score-header">
          <h4>{{ score.courseName }}</h4>
          <span class="score-value" :class="getScoreClass(score.totalScore)">
            {{ score.totalScore ?? '未录入' }}
          </span>
        </div>
        <div class="score-details">
          <span class="tag tag-blue">{{ score.courseCode }}</span>
          <span class="tag tag-gold">{{ score.credit }} 学分</span>
          <span class="tag" :class="score.gpa >= 3 ? 'tag-green' : score.gpa >= 1 ? 'tag-blue' : 'tag-red'">
            绩点 {{ score.gpa ?? '--' }}
          </span>
        </div>
        <div class="score-breakdown" v-if="hasBreakdown(score)">
          <span v-if="score.dailyScore != null">平时：{{ score.dailyScore }}</span>
          <span v-if="score.midtermScore != null">期中：{{ score.midtermScore }}</span>
          <span v-if="score.finalScore != null">期末：{{ score.finalScore }}</span>
        </div>
      </div>

      <van-empty v-if="scores.length === 0" description="暂无成绩数据">
        <template #description>
          <p>{{ currentSemester ? `「${currentSemester}」暂无成绩` : '暂无成绩数据' }}</p>
        </template>
      </van-empty>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { scoreApi } from '../api'

export default {
  name: 'Score',
  setup() {
    const router = useRouter()
    const scores = ref([])
    const loading = ref(false)
    const currentSemester = ref('')
    const semesterOptions = ref([])
    const gpaInfo = ref({
      averageGPA: null,
      totalCredits: 0,
      passedCourses: 0,
      averageScore: null
    })

    const displayGpa = computed(() => {
      const gpa = gpaInfo.value.averageGPA
      if (gpa == null || gpa === undefined) return '--'
      return Number(gpa).toFixed(2)
    })

    const displayAvgScore = computed(() => {
      const score = gpaInfo.value.averageScore
      if (score == null || score === undefined) return '--'
      return Number(score).toFixed(1)
    })

    const getScoreClass = (score) => {
      if (score == null || score === undefined || score === '') return 'unrecorded'
      const n = Number(score)
      if (n >= 90) return 'excellent'
      if (n >= 80) return 'good'
      if (n >= 60) return 'pass'
      return 'fail'
    }

    const hasBreakdown = (score) => {
      return score.dailyScore != null || score.midtermScore != null || score.finalScore != null
    }

    const loadSemesters = async () => {
      try {
        const res = await scoreApi.getAvailableSemesters()
        const semesters = (res.data || []).filter(Boolean)
        semesterOptions.value = semesters.map(s => ({
          text: String(s).replace(/-(\d)$/, (m, p) => {
            const term = { '1': '一', '2': '二' }[p] || p
            return ` 第${term}学期`
          }),
          value: s
        }))
        if (semesters.length > 0) {
          currentSemester.value = semesters[0]
        }
      } catch (error) {
        showToast(error?.message || '获取学期列表失败')
      }
    }

    const loadScores = async () => {
      loading.value = true
      try {
        const params = {}
        if (currentSemester.value) {
          params.semester = currentSemester.value
        }
        const res = await scoreApi.getStudentScores(params)
        scores.value = res.data || []
      } catch (error) {
        showToast(error?.message || '获取成绩失败')
      } finally {
        loading.value = false
      }
    }

    const loadGPA = async () => {
      try {
        const res = await scoreApi.calculateGPA()
        gpaInfo.value = {
          averageGPA: res.data?.averageGPA ?? null,
          totalCredits: res.data?.totalCredits ?? 0,
          passedCourses: res.data?.passedCourses ?? 0,
          averageScore: res.data?.averageScore ?? null
        }
      } catch (error) {
        showToast(error?.message || '获取GPA失败')
      }
    }

    const goBack = () => {
      if (window.history.length > 1) router.back()
      else router.push('/')
    }

    onMounted(async () => {
      await loadSemesters()
      loadScores()
      loadGPA()
    })

    return {
      scores,
      loading,
      currentSemester,
      semesterOptions,
      gpaInfo,
      displayGpa,
      displayAvgScore,
      getScoreClass,
      hasBreakdown,
      loadScores,
      goBack
    }
  }
}
</script>

<style scoped>
.score-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 60px;
}

.gpa-card {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 28px 20px;
  color: var(--text-inverse);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.gpa-main {
  text-align: center;
  margin-bottom: 20px;
}

.gpa-value {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -1px;
}

.gpa-label {
  font-size: var(--font-md);
  opacity: 0.85;
  margin-top: 4px;
}

.gpa-details {
  display: flex;
  justify-content: space-around;
}

.gpa-item {
  text-align: center;
}

.gpa-item .value {
  display: block;
  font-size: var(--font-xl);
  font-weight: 600;
}

.gpa-item .label {
  font-size: var(--font-sm);
  opacity: 0.85;
  margin-top: 4px;
}

.semester-filter {
  margin: 12px 16px;
  padding: 0;
  overflow: hidden;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
}

.score-list {
  padding: 4px 16px 16px;
}

.score-item {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.score-header h4 {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-value {
  font-size: var(--font-2xl);
  font-weight: 700;
  line-height: 1;
}

.score-value.excellent { color: var(--success); }
.score-value.good { color: var(--primary-light); }
.score-value.pass { color: var(--accent); }
.score-value.fail { color: var(--danger); }
.score-value.unrecorded { color: var(--text-muted); font-size: var(--font-lg); }

.score-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.score-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}
</style>
