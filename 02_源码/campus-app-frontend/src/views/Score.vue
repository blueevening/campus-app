<template>
  <div class="score-container">
    <van-nav-bar title="成绩查询" left-arrow @click-left="goBack" />

    <!-- GPA 概览 -->
    <div class="gpa-card">
      <div class="gpa-main">
        <div class="gpa-value">{{ gpaInfo.averageGPA || '--' }}</div>
        <div class="gpa-label">平均绩点</div>
      </div>
      <div class="gpa-details">
        <div class="gpa-item">
          <span class="value">{{ gpaInfo.totalCredits || 0 }}</span>
          <span class="label">总学分</span>
        </div>
        <div class="gpa-item">
          <span class="value">{{ gpaInfo.passedCourses || 0 }}</span>
          <span class="label">已通过</span>
        </div>
        <div class="gpa-item">
          <span class="value">{{ gpaInfo.averageScore || '--' }}</span>
          <span class="label">平均分</span>
        </div>
      </div>
    </div>

    <!-- 学期选择 -->
    <div class="semester-filter">
      <van-dropdown-menu>
        <van-dropdown-item v-model="currentSemester" :options="semesterOptions" @change="loadScores" />
      </van-dropdown-menu>
    </div>

    <!-- 成绩列表 -->
    <div class="score-list">
      <div class="score-item" v-for="score in scores" :key="score.id">
        <div class="score-header">
          <h4>{{ score.courseName }}</h4>
          <span class="score-value" :class="getScoreClass(score.totalScore)">
            {{ score.totalScore || '未录入' }}
          </span>
        </div>
        <div class="score-details">
          <span>课程代码：{{ score.courseCode }}</span>
          <span>学分：{{ score.credit }}</span>
          <span>绩点：{{ score.gpa || '--' }}</span>
        </div>
        <div class="score-breakdown" v-if="score.dailyScore || score.midtermScore || score.finalScore">
          <span v-if="score.dailyScore">平时：{{ score.dailyScore }}</span>
          <span v-if="score.midtermScore">期中：{{ score.midtermScore }}</span>
          <span v-if="score.finalScore">期末：{{ score.finalScore }}</span>
        </div>
      </div>

      <van-empty v-if="scores.length === 0" description="暂无成绩数据" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { scoreApi } from '../api'

export default {
  name: 'Score',
  setup() {
    const router = useRouter()
    const scores = ref([])
    const currentSemester = ref('')
    const semesterOptions = ref([])
    const gpaInfo = ref({
      averageGPA: 0,
      totalCredits: 0,
      passedCourses: 0,
      averageScore: 0
    })

    const getScoreClass = (score) => {
      if (!score) return ''
      if (score >= 90) return 'excellent'
      if (score >= 80) return 'good'
      if (score >= 60) return 'pass'
      return 'fail'
    }

    const loadSemesters = async () => {
      try {
        const res = await scoreApi.getAvailableSemesters()
        const semesters = res.data || []
        semesterOptions.value = semesters.map(s => ({
          text: s,
          value: s
        }))
        if (semesters.length > 0) {
          currentSemester.value = semesters[0]
        }
      } catch (error) {
        console.error('获取学期列表失败', error)
      }
    }

    const loadScores = async () => {
      try {
        const params = {}
        if (currentSemester.value) {
          params.semester = currentSemester.value
        }
        const res = await scoreApi.getStudentScores(params)
        scores.value = res.data || []
      } catch (error) {
        showToast('获取成绩失败')
      }
    }

    const loadGPA = async () => {
      try {
        const res = await scoreApi.calculateGPA()
        gpaInfo.value = res.data || {}
      } catch (error) {
        console.error('获取GPA失败', error)
      }
    }

    const goBack = () => {
      router.back()
    }

    onMounted(async () => {
      await loadSemesters()
      loadScores()
      loadGPA()
    })

    return {
      scores,
      currentSemester,
      semesterOptions,
      gpaInfo,
      getScoreClass,
      loadScores,
      goBack
    }
  }
}
</script>

<style scoped>
.score-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.gpa-card {
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  padding: 30px 20px;
  color: #fff;
}

.gpa-main {
  text-align: center;
  margin-bottom: 20px;
}

.gpa-value {
  font-size: 48px;
  font-weight: 700;
}

.gpa-label {
  font-size: 14px;
  opacity: 0.8;
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
  font-size: 20px;
  font-weight: 600;
}

.gpa-item .label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.semester-filter {
  background: #fff;
  padding: 8px 16px;
}

.score-list {
  padding: 12px;
}

.score-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.score-header h4 {
  font-size: 16px;
  color: #333;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
}

.score-value.excellent {
  color: #07c160;
}

.score-value.good {
  color: #1989fa;
}

.score-value.pass {
  color: #ff976a;
}

.score-value.fail {
  color: #ee0a24;
}

.score-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.score-breakdown {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
</style>
