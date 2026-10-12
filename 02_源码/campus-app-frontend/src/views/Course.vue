<template>
  <div class="course-container">
    <van-nav-bar title="我的课程表" left-arrow @click-left="goBack">
      <template #right>
        <span class="nav-action" @click="toggleWeekend">{{ showWeekend ? '隐藏周末' : '显示周末' }}</span>
      </template>
    </van-nav-bar>

    <div class="semester-bar">
      <van-dropdown-menu class="semester-menu">
        <van-dropdown-item v-model="currentSemester" :options="semesterOptions" @change="loadCourses" />
      </van-dropdown-menu>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <strong>{{ courseCount }}</strong>
        <span>本周课程</span>
      </div>
      <div class="stat-card">
        <strong>{{ totalCredits }}</strong>
        <span>总学分</span>
      </div>
      <div class="stat-card">
        <strong>{{ todayCount }}</strong>
        <span>今日节数</span>
      </div>
    </div>

    <div class="schedule-wrap">
      <div class="schedule-grid" :class="{ 'with-weekend': showWeekend }">
        <!-- 表头 -->
        <div class="grid-corner" :style="{ gridColumn: 1, gridRow: 1 }">节次</div>
        <div
          v-for="(day, di) in visibleDays"
          :key="day.label"
          class="day-head"
          :class="{ today: day.isToday }"
          :style="{ gridColumn: di + 2, gridRow: 1 }"
        >
          <span class="day-name">{{ day.short }}</span>
          <span class="day-num">{{ day.dateNum }}</span>
        </div>

        <!-- 时间列 + 空槽 -->
        <template v-for="(period, pi) in timePeriods" :key="'p' + period.id">
          <div class="time-label" :style="{ gridColumn: 1, gridRow: pi + 2 }">
            <span class="p-no">{{ period.id }}</span>
            <span class="p-time">{{ period.time }}</span>
          </div>
          <div
            v-for="(day, di) in visibleDays"
            :key="period.id + '-' + day.num"
            class="slot"
            :class="{ 'is-today-col': day.isToday }"
            :style="{ gridColumn: di + 2, gridRow: pi + 2 }"
          ></div>
        </template>

        <!-- 课程块（跨节合并） -->
        <div
          v-for="block in courseBlocks"
          :key="block.key"
          class="course-block"
          :style="block.style"
          @click="openDetail(block.course, block)"
        >
          <p class="c-name">{{ block.course.courseName }}</p>
          <p class="c-loc">{{ shortLoc(block.course.location) }}</p>
          <p class="c-range">{{ block.start }}-{{ block.end }}节</p>
        </div>
      </div>
    </div>

    <div class="legend">
      <span class="legend-item"><i class="dot d1"></i>专业核心</span>
      <span class="legend-item"><i class="dot d2"></i>编程实践</span>
      <span class="legend-item"><i class="dot d3"></i>通识拓展</span>
      <span class="legend-hint">点击课程查看详情</span>
    </div>

    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :get-container="'#app'"
      class="course-popup"
    >
      <div class="course-detail" v-if="selectedCourse">
        <div class="detail-head">
          <div>
            <h3>{{ selectedCourse.courseName }}</h3>
            <p class="code">{{ selectedCourse.courseCode }}</p>
          </div>
          <span class="credit-badge">{{ selectedCourse.credit }} 学分</span>
        </div>
        <div class="detail-item">
          <van-icon name="user-o" />
          <span>{{ selectedCourse.teacherName }}</span>
        </div>
        <div class="detail-item">
          <van-icon name="location-o" />
          <span>{{ selectedCourse.location }}</span>
        </div>
        <div class="detail-item">
          <van-icon name="clock-o" />
          <span>{{ formatClassTime(selectedCourse.classTime) }}</span>
        </div>
        <div class="detail-actions">
          <van-button
            type="danger"
            size="small"
            round
            @click="dropCourse"
          >
            退选课程
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showToast, showDialog } from 'vant'
import { courseApi } from '../api'

const PALETTE = [
  { bg: '#e8f0fb', border: '#2c5282', text: '#1a365d' },
  { bg: '#e6f6ef', border: '#276749', text: '#22543d' },
  { bg: '#fef6e4', border: '#d69e2e', text: '#744210' },
  { bg: '#f3e8ff', border: '#6b46c1', text: '#44337a' },
  { bg: '#e6fffa', border: '#285e61', text: '#234e52' },
  { bg: '#fff5f5', border: '#c53030', text: '#742a2a' }
]

export default {
  name: 'Course',
  setup() {
    const router = useRouter()
    const store = useStore()
    const courses = ref([])
    const currentSemester = ref(store.getters.getCurrentSemester || '2025-2026-1')
    const showDetail = ref(false)
    const selectedCourse = ref(null)
    const showWeekend = ref(false)

    const now = new Date()
    // JS: 0=周日, 课表 day: 1=周一 ... 7=周日
    const jsDay = now.getDay()
    const todayNum = jsDay === 0 ? 7 : jsDay

    const allDays = [
      { num: 1, label: '周一', short: '一' },
      { num: 2, label: '周二', short: '二' },
      { num: 3, label: '周三', short: '三' },
      { num: 4, label: '周四', short: '四' },
      { num: 5, label: '周五', short: '五' },
      { num: 6, label: '周六', short: '六' },
      { num: 7, label: '周日', short: '日' }
    ].map(d => ({
      ...d,
      isToday: d.num === todayNum,
      num: d.num
    }))

    // 显示日期序号（本周示意）
    const weekOffset = 0
    const monday = new Date(now)
    monday.setDate(now.getDate() - (todayNum - 1) + weekOffset * 7)

    allDays.forEach((d, i) => {
      const dt = new Date(monday)
      dt.setDate(monday.getDate() + i)
      d.dateNum = dt.getDate()
    })

    const visibleDays = computed(() =>
      showWeekend.value ? allDays : allDays.filter(d => d.num <= 5)
    )
    const visibleDayNums = computed(() => visibleDays.value.map(d => d.num))

    const timePeriods = [
      { id: 1, time: '08:00' },
      { id: 2, time: '08:50' },
      { id: 3, time: '10:00' },
      { id: 4, time: '10:50' },
      { id: 5, time: '14:00' },
      { id: 6, time: '14:50' },
      { id: 7, time: '16:00' },
      { id: 8, time: '16:50' },
      { id: 9, time: '19:00', lunch: false },
      { id: 10, time: '19:50' }
    ]

    const semesterOptions = [
      { text: '2025-2026 第一学期', value: '2025-2026-1' },
      { text: '2025-2026 第二学期', value: '2025-2026-2' },
      { text: '2024-2025 第二学期', value: '2024-2025-2' },
      { text: '2024-2025 第一学期', value: '2024-2025-1' }
    ]

    const parseClassTime = (classTime) => {
      if (Array.isArray(classTime)) return classTime
      try {
        return JSON.parse(classTime || '[]')
      } catch {
        return []
      }
    }

    const courseCount = computed(() => courses.value.length)
    const totalCredits = computed(() =>
      courses.value.reduce((s, c) => s + (Number(c.credit) || 0), 0)
    )
    const todayCount = computed(() => {
      let n = 0
      courses.value.forEach(c => {
        parseClassTime(c.classTime).forEach(t => {
          if (t.day === todayNum) n += (t.end - t.start + 1)
        })
      })
      return n
    })

    const courseBlocks = computed(() => {
      const blocks = []
      const cols = visibleDayNums.value
      courses.value.forEach(course => {
        const times = parseClassTime(course.classTime)
        times.forEach((t, idx) => {
          if (!cols.includes(t.day)) return
          const colIndex = cols.indexOf(t.day) // 0-based among visible days
          const palette = PALETTE[course.id % PALETTE.length]
          const span = Math.max(1, t.end - t.start + 1)
          blocks.push({
            key: `${course.id}-${t.day}-${t.start}-${idx}`,
            course,
            day: t.day,
            start: t.start,
            end: t.end,
            style: {
              gridColumn: String(colIndex + 2),
              gridRow: `${t.start + 1} / span ${span}`,
              background: palette.bg,
              borderLeftColor: palette.border,
              color: palette.text
            }
          })
        })
      })
      return blocks
    })

    const isTodayDay = (day) => day === todayNum

    const shortLoc = (loc) => {
      if (!loc) return ''
      return loc.replace('教学楼', '').replace('实验楼', '实验')
    }

    const formatClassTime = (classTime) => {
      const times = parseClassTime(classTime)
      if (!times.length) return '待安排'
      const dayMap = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' }
      return times.map(t => `${dayMap[t.day] || t.day} 第${t.start}-${t.end}节`).join('、')
    }

    const loadCourses = async () => {
      try {
        const res = await courseApi.getStudentSchedule({
          semester: currentSemester.value
        })
        courses.value = res.data || []
      } catch (error) {
        showToast('获取课程失败')
      }
    }

    const openDetail = (course) => {
      selectedCourse.value = course
      showDetail.value = true
    }

    const dropCourse = async () => {
      try {
        await showDialog({
          title: '确认退选',
          message: `确定要退选 ${selectedCourse.value.courseName} 吗？`,
          showCancelButton: true,
          confirmButtonColor: '#e53e3e'
        })
        await courseApi.dropCourse(selectedCourse.value.id)
        showToast('退选成功')
        showDetail.value = false
        loadCourses()
      } catch (error) {
        if (error && error !== 'cancel') {
          showToast(error.message || '退选失败')
        }
      }
    }

    const toggleWeekend = () => {
      showWeekend.value = !showWeekend.value
    }

    const goBack = () => {
      if (window.history.length > 1) router.back()
      else router.push('/')
    }

    onMounted(() => {
      loadCourses()
    })

    return {
      courses,
      currentSemester,
      showDetail,
      selectedCourse,
      showWeekend,
      visibleDays,
      visibleDayNums,
      timePeriods,
      semesterOptions,
      courseBlocks,
      courseCount,
      totalCredits,
      todayCount,
      isTodayDay,
      shortLoc,
      formatClassTime,
      loadCourses,
      openDetail,
      dropCourse,
      toggleWeekend,
      goBack
    }
  }
}
</script>

<style scoped>
.course-container {
  min-height: 100vh;
  background: #f0f4f8;
  padding-bottom: 70px;
}

.nav-action {
  font-size: 12px;
  color: #2c5282;
  font-weight: 500;
}

.semester-bar {
  background: #fff;
}

.semester-menu {
  --van-dropdown-menu-background: #fff;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px 12px 4px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #e8eef5;
}

.stat-card strong {
  display: block;
  font-size: 20px;
  color: #2c5282;
  line-height: 1.2;
}

.stat-card span {
  font-size: 11px;
  color: #718096;
}

.schedule-wrap {
  margin: 10px 12px 0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e8eef5;
  box-shadow: 0 4px 16px rgba(44, 82, 130, 0.06);
}

@media (min-width: 900px) {
  .schedule-wrap {
    margin: 16px 20px 0;
  }
  .schedule-grid {
    grid-template-columns: 56px repeat(5, minmax(0, 1fr));
    grid-template-rows: 44px repeat(10, 58px);
  }
  .schedule-grid.with-weekend {
    grid-template-columns: 52px repeat(7, minmax(0, 1fr));
  }
}

.schedule-grid {
  display: grid;
  grid-template-columns: 44px repeat(5, minmax(0, 1fr));
  grid-template-rows: 40px repeat(10, 54px);
  position: relative;
  min-height: 580px;
}

.schedule-grid.with-weekend {
  grid-template-columns: 40px repeat(7, minmax(0, 1fr));
}

.grid-corner {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #a0aec0;
  background: #f7fafc;
  border-right: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
}

.day-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-bottom: 1px solid #edf2f7;
  border-right: 1px solid #edf2f7;
  gap: 1px;
}

.day-head.today {
  background: #ebf2fa;
}

.day-head .day-name {
  font-size: 12px;
  font-weight: 600;
  color: #2c5282;
}

.day-head.today .day-name {
  color: #d69e2e;
}

.day-head .day-num {
  font-size: 10px;
  color: #a0aec0;
}

.time-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  border-right: 1px solid #edf2f7;
  border-bottom: 1px solid #f1f5f9;
  gap: 2px;
}

.time-label .p-no {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
}

.time-label .p-time {
  font-size: 9px;
  color: #a0aec0;
}

.slot {
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
}

.slot.is-today-col {
  background: #f8fbff;
}

.course-block {
  margin: 2px;
  border-radius: 8px;
  padding: 6px 6px 4px;
  border-left: 3px solid #2c5282;
  overflow: hidden;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.course-block:active {
  transform: scale(0.98);
}

.c-name {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.c-loc {
  font-size: 10px;
  opacity: 0.8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-range {
  font-size: 9px;
  opacity: 0.65;
  margin-top: auto;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 12px 14px 20px;
  font-size: 11px;
  color: #718096;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.d1 { background: #2c5282; }
.dot.d2 { background: #276749; }
.dot.d3 { background: #d69e2e; }

.legend-hint {
  margin-left: auto;
  color: #a0aec0;
}

.course-popup {
  max-width: 430px;
}

.course-detail {
  padding: 20px 20px 28px;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.detail-head h3 {
  font-size: 18px;
  color: #1a202c;
  margin: 0;
}

.detail-head .code {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
}

.credit-badge {
  background: #fef6e4;
  color: #b7791f;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f4f8;
  font-size: 14px;
  color: #4a5568;
}

.detail-item .van-icon {
  margin-right: 12px;
  font-size: 18px;
  color: #2c5282;
}

.detail-actions {
  margin-top: 20px;
  text-align: center;
}

/* 需要给 day-head / time-label / slot 定位到网格 */
.day-head:nth-child(n + 2):nth-child(-n + 8) {
  /* columns set via order in template */
}
</style>
