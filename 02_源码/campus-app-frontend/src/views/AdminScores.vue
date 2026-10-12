<template>
  <div class="page">
    <van-nav-bar title="成绩录入" left-arrow @click-left="goBack" />
    <div class="admin-body">
      <div class="form-card page-card">
        <div class="section-title">录入 / 更新成绩</div>
        <van-field v-model="form.studentLabel" is-link readonly label="学生" placeholder="请选择学生" @click="showStudent = true" />
        <van-field v-model="form.courseLabel" is-link readonly label="课程" placeholder="请选择课程" @click="showCourse = true" />
        <van-field v-model="form.dailyScore" type="digit" label="平时" placeholder="0-100" />
        <van-field v-model="form.midtermScore" type="digit" label="期中" placeholder="0-100" />
        <van-field v-model="form.finalScore" type="digit" label="期末" placeholder="0-100" />
        <p class="tip muted">保存后系统自动计算总分与 GPA</p>
        <van-button block round type="primary" class="save-btn" :loading="saving" loading-text="保存中..." @click="save">
          保存成绩
        </van-button>
      </div>

      <div class="list-card-wrap page-card">
        <div class="section-title">当前成绩</div>
        <div class="filters">
          <div class="filter-item" @click="showFilterStudent = true">
            <span class="filter-label">学生</span>
            <span class="filter-value">{{ filterStudentLabel || '全部' }}</span>
            <van-icon name="arrow-down" />
          </div>
          <div class="filter-item" @click="showFilterCourse = true">
            <span class="filter-label">课程</span>
            <span class="filter-value">{{ filterCourseLabel || '全部' }}</span>
            <van-icon name="arrow-down" />
          </div>
          <van-button v-if="filterStudentId || filterCourseId" size="mini" plain type="primary" @click="clearFilters">
            重置
          </van-button>
        </div>

        <div v-if="loading" class="loading-box">
          <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
        </div>
        <van-empty v-else-if="!filteredRecords.length" description="暂无成绩记录" />
        <div v-else class="score-list">
          <div v-for="r in filteredRecords" :key="r.id" class="score-row">
            <div class="score-main">
              <strong>{{ r.courseName }}</strong>
              <p class="muted">{{ studentName(r.studentId) }} · 学号 {{ r.studentId }}</p>
              <p class="muted">{{ r.semester }}</p>
            </div>
            <div class="score-metrics">
              <div class="metric">
                <span class="metric-value">{{ r.totalScore }}</span>
                <span class="metric-label">总分</span>
              </div>
              <div class="metric gpa">
                <span class="metric-value">{{ formatGpa(r.gpa) }}</span>
                <span class="metric-label">GPA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showStudent" position="bottom" round :get-container="'#app'">
      <div class="picker">
        <div class="picker-title">选择学生</div>
        <div v-if="!students.length" class="empty-state">暂无学生</div>
        <div v-for="s in students" :key="s.id" class="opt" @click="pickStudent(s)">
          {{ s.username }}（{{ s.studentId }}）
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showCourse" position="bottom" round :get-container="'#app'">
      <div class="picker">
        <div class="picker-title">选择课程</div>
        <div v-if="!courses.length" class="empty-state">暂无课程</div>
        <div v-for="c in courses" :key="c.id" class="opt" @click="pickCourse(c)">
          {{ c.courseName }}（{{ c.credit }} 学分）
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showFilterStudent" position="bottom" round :get-container="'#app'">
      <div class="picker">
        <div class="picker-title">按学生筛选</div>
        <div class="opt" :class="{ active: !filterStudentId }" @click="pickFilterStudent(null)">全部学生</div>
        <div
          v-for="s in students"
          :key="s.id"
          class="opt"
          :class="{ active: filterStudentId === s.id }"
          @click="pickFilterStudent(s)"
        >
          {{ s.username }}（{{ s.studentId }}）
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showFilterCourse" position="bottom" round :get-container="'#app'">
      <div class="picker">
        <div class="picker-title">按课程筛选</div>
        <div class="opt" :class="{ active: !filterCourseId }" @click="pickFilterCourse(null)">全部课程</div>
        <div
          v-for="c in courses"
          :key="c.id"
          class="opt"
          :class="{ active: filterCourseId === c.id }"
          @click="pickFilterCourse(c)"
        >
          {{ c.courseName }}
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast } from 'vant'
import { adminApi } from '../api'

export default {
  name: 'AdminScores',
  setup() {
    const router = useRouter()
    const store = useStore()
    const records = ref([])
    const students = ref([])
    const courses = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const showStudent = ref(false)
    const showCourse = ref(false)
    const showFilterStudent = ref(false)
    const showFilterCourse = ref(false)
    const filterStudentId = ref(null)
    const filterCourseId = ref(null)
    const filterStudentLabel = ref('')
    const filterCourseLabel = ref('')
    const isAdmin = computed(() => Number(store.getters.getRole) === 2)

    const form = ref({
      studentId: null,
      studentLabel: '',
      courseId: null,
      courseLabel: '',
      dailyScore: '',
      midtermScore: '',
      finalScore: ''
    })

    const filteredRecords = computed(() => {
      return records.value.filter((r) => {
        if (filterStudentId.value && r.studentId !== filterStudentId.value) return false
        if (filterCourseId.value && r.courseId !== filterCourseId.value) return false
        return true
      })
    })

    const studentName = (id) => {
      const s = students.value.find((x) => x.id === id)
      return s ? s.username : `学生#${id}`
    }

    const formatGpa = (gpa) => {
      if (gpa === null || gpa === undefined || gpa === '') return '--'
      return Number(gpa).toFixed(1)
    }

    const load = async () => {
      loading.value = true
      try {
        const res = await adminApi.getScores()
        records.value = (res.data && res.data.records) || []
        students.value = ((res.data && res.data.users) || []).filter((u) => u.role === 0)
        courses.value = (res.data && res.data.courses) || []
      } catch (e) {
        showToast(e.message || '加载成绩失败')
      } finally {
        loading.value = false
      }
    }

    const pickStudent = (s) => {
      form.value.studentId = s.id
      form.value.studentLabel = `${s.username}（${s.studentId}）`
      showStudent.value = false
    }

    const pickCourse = (c) => {
      form.value.courseId = c.id
      form.value.courseLabel = c.courseName
      showCourse.value = false
    }

    const pickFilterStudent = (s) => {
      filterStudentId.value = s ? s.id : null
      filterStudentLabel.value = s ? `${s.username}` : ''
      showFilterStudent.value = false
    }

    const pickFilterCourse = (c) => {
      filterCourseId.value = c ? c.id : null
      filterCourseLabel.value = c ? c.courseName : ''
      showFilterCourse.value = false
    }

    const clearFilters = () => {
      filterStudentId.value = null
      filterCourseId.value = null
      filterStudentLabel.value = ''
      filterCourseLabel.value = ''
    }

    const save = async () => {
      if (!form.value.studentId || !form.value.courseId) {
        showToast('请选择学生和课程')
        return
      }
      saving.value = true
      try {
        await adminApi.saveScore({
          studentId: form.value.studentId,
          courseId: form.value.courseId,
          dailyScore: form.value.dailyScore,
          midtermScore: form.value.midtermScore,
          finalScore: form.value.finalScore,
          semester: '2025-2026-1'
        })
        showToast('已保存，GPA 已自动计算')
        form.value.dailyScore = form.value.midtermScore = form.value.finalScore = ''
        await load()
      } catch (e) {
        showToast(e.message || '保存失败')
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      if (!isAdmin.value) {
        showToast('仅管理员可访问成绩录入')
        router.replace('/profile')
        return
      }
      load()
    })

    return {
      records,
      filteredRecords,
      students,
      courses,
      form,
      loading,
      saving,
      showStudent,
      showCourse,
      showFilterStudent,
      showFilterCourse,
      filterStudentId,
      filterCourseId,
      filterStudentLabel,
      filterCourseLabel,
      studentName,
      formatGpa,
      pickStudent,
      pickCourse,
      pickFilterStudent,
      pickFilterCourse,
      clearFilters,
      save,
      goBack: () => router.back()
    }
  }
}
</script>

<style scoped>
.admin-body {
  padding: var(--space-3);
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 900px) {
  .admin-body {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.form-card,
.list-card-wrap {
  padding: var(--space-4);
}

.save-btn {
  margin-top: var(--space-3);
}

.tip {
  margin-top: var(--space-2);
  text-align: center;
}

.filters {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  font-size: var(--font-sm);
  cursor: pointer;
}

.filter-label {
  color: var(--text-muted);
}

.filter-value {
  color: var(--text-primary);
  font-weight: 600;
}

.score-list {
  display: flex;
  flex-direction: column;
}

.score-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border-color);
}

.score-row:last-child {
  border-bottom: none;
}

.score-main strong {
  font-size: var(--font-md);
  color: var(--text-primary);
}

.score-main p {
  margin-top: 2px;
}

.score-metrics {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  background: var(--primary-soft);
}

.metric.gpa {
  background: var(--accent-soft);
}

.metric-value {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--primary);
}

.metric.gpa .metric-value {
  color: var(--accent);
}

.metric-label {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.picker {
  padding: var(--space-3);
  max-height: 360px;
  overflow: auto;
}

.picker-title {
  text-align: center;
  font-weight: 700;
  color: var(--text-primary);
  padding: var(--space-2) 0 var(--space-3);
}

.opt {
  padding: 14px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  margin-bottom: var(--space-2);
  cursor: pointer;
  color: var(--text-primary);
}

.opt.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}

.loading-box {
  padding: var(--space-8);
  display: flex;
  justify-content: center;
}
</style>
