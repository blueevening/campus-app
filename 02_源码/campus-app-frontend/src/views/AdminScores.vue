<template>
  <div class="page">
    <van-nav-bar title="成绩录入" left-arrow @click-left="goBack" />
    <div class="body">
      <div class="form-card">
        <h3>录入 / 更新成绩</h3>
        <van-field v-model="form.studentLabel" is-link readonly label="学生" placeholder="请选择" @click="showStudent = true" />
        <van-field v-model="form.courseLabel" is-link readonly label="课程" placeholder="请选择" @click="showCourse = true" />
        <van-field v-model="form.dailyScore" type="digit" label="平时" placeholder="0-100" />
        <van-field v-model="form.midtermScore" type="digit" label="期中" placeholder="0-100" />
        <van-field v-model="form.finalScore" type="digit" label="期末" placeholder="0-100" />
        <van-button block round type="primary" style="margin-top:12px" :loading="saving" @click="save">保存成绩</van-button>
      </div>
      <div class="form-card">
        <h3>当前成绩</h3>
        <van-empty v-if="!records.length" description="暂无成绩" />
        <div v-for="r in records" :key="r.id" class="row">
          <div>
            <strong>{{ r.courseName }}</strong>
            <p>#{{ r.studentId }} · 总分 {{ r.totalScore }} · GPA {{ r.gpa }}</p>
          </div>
          <small>{{ r.semester }}</small>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showStudent" position="bottom" round :get-container="'#app'">
      <div class="picker">
        <div v-for="s in students" :key="s.id" class="opt" @click="pickStudent(s)">{{ s.username }}（{{ s.studentId }}）</div>
      </div>
    </van-popup>
    <van-popup v-model:show="showCourse" position="bottom" round :get-container="'#app'">
      <div class="picker">
        <div v-for="c in courses" :key="c.id" class="opt" @click="pickCourse(c)">{{ c.courseName }}（{{ c.credit }} 学分）</div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { adminApi } from '../api'

export default {
  name: 'AdminScores',
  setup() {
    const router = useRouter()
    const records = ref([])
    const students = ref([])
    const courses = ref([])
    const showStudent = ref(false)
    const showCourse = ref(false)
    const saving = ref(false)
    const form = ref({
      studentId: null, studentLabel: '',
      courseId: null, courseLabel: '',
      dailyScore: '', midtermScore: '', finalScore: ''
    })

    const load = async () => {
      try {
        const res = await adminApi.getScores()
        records.value = (res.data && res.data.records) || []
        students.value = ((res.data && res.data.users) || []).filter(u => u.role === 0)
        courses.value = (res.data && res.data.courses) || []
      } catch (e) {
        showToast(e.message || '加载失败')
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
        showToast('已保存')
        form.value.dailyScore = form.value.midtermScore = form.value.finalScore = ''
        load()
      } catch (e) {
        showToast(e.message || '保存失败')
      } finally {
        saving.value = false
      }
    }

    onMounted(load)
    return {
      records, students, courses, form, saving,
      showStudent, showCourse, pickStudent, pickCourse, save,
      goBack: () => router.back()
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.body { padding: 12px; display: grid; gap: 12px; }
@media (min-width: 900px) {
  .body { grid-template-columns: 1fr 1fr; }
}
.form-card {
  background: #fff; border: 1px solid #e8eef5; border-radius: 12px; padding: 14px;
}
.form-card h3 { font-size: 15px; color: #2c5282; margin-bottom: 10px; }
.row {
  display: flex; justify-content: space-between; padding: 10px 0;
  border-bottom: 1px solid #f0f4f8; font-size: 13px;
}
.row p { color: #718096; font-size: 12px; margin-top: 2px; }
.picker { padding: 12px; max-height: 360px; overflow: auto; }
.opt { padding: 14px; border-radius: 10px; background: #f7fafc; margin-bottom: 8px; }
</style>
