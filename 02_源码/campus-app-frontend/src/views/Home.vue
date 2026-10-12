<template>
  <div class="home-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-bg"></div>
      <div class="welcome-content">
        <div class="welcome-info">
          <p class="welcome-date">{{ currentDate }}</p>
          <h2>Hi，{{ username }} 👋</h2>
          <p class="welcome-text">今天也要加油学习哦~</p>
        </div>
        <div class="avatar" @click="goToProfile">
          <van-image
            round
            width="55"
            height="55"
            :src="avatar || defaultAvatar"
          />
          <div class="vip-badge">学生</div>
        </div>
      </div>

      <!-- 快捷统计 -->
      <div class="quick-stats">
        <div class="stat-item" @click="navigateTo('/course')">
          <span class="stat-value">{{ loadingStats ? '—' : todayCourses }}</span>
          <span class="stat-label">今日课程</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="navigateTo('/borrow-records')">
          <span class="stat-value">{{ loadingStats ? '—' : borrowCount }}</span>
          <span class="stat-label">在借图书</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="navigateTo('/news')">
          <span class="stat-value">{{ loadingStats ? '—' : unreadNews }}</span>
          <span class="stat-label">未读资讯</span>
        </div>
      </div>
    </div>

    <!-- 快捷功能横幅 -->
    <div class="quick-banner">
      <div class="banner-item banner-blue" @click="navigateTo('/library')">
        <div class="banner-info">
          <h4>图书馆</h4>
          <p>搜索借阅图书</p>
        </div>
        <van-icon name="arrow" color="#fff" />
      </div>
      <div class="banner-item banner-accent" @click="navigateTo('/lost-found')">
        <div class="banner-info">
          <h4>失物招领</h4>
          <p>发布寻物启事</p>
        </div>
        <van-icon name="arrow" color="#fff" />
      </div>
    </div>

    <!-- 发布资讯入口 -->
    <div class="publish-news-banner" @click="navigateTo('/news/publish')">
      <div class="publish-banner-content">
        <div class="publish-banner-left">
          <van-icon name="edit" size="24" color="#fff" />
          <div>
            <h4>发布校园资讯</h4>
            <p>分享校园新鲜事</p>
          </div>
        </div>
        <van-icon name="arrow" color="#fff" />
      </div>
    </div>

    <!-- 功能入口 - 全部显示 -->
    <div class="section-container">
      <div class="section-header">
        <h3 class="section-title">全部功能</h3>
      </div>

      <div class="function-grid">
        <!-- 第一行：学习服务 -->
        <div class="function-item" @click="navigateTo('/course')">
          <div class="icon-wrapper icon-blue">
            <van-icon name="calendar-o" size="28" />
          </div>
          <span>课程表</span>
        </div>
        <div class="function-item" @click="navigateTo('/score')">
          <div class="icon-wrapper icon-green">
            <van-icon name="chart-trending-o" size="28" />
          </div>
          <span>成绩查询</span>
        </div>
        <div class="function-item" @click="navigateTo('/library')">
          <div class="icon-wrapper icon-orange">
            <van-icon name="notes-o" size="28" />
          </div>
          <span>图书馆</span>
        </div>
        <div class="function-item" @click="navigateTo('/news')">
          <div class="icon-wrapper icon-purple">
            <van-icon name="newspaper-o" size="28" />
          </div>
          <span>校园资讯</span>
        </div>

        <!-- 第二行：生活服务 -->
        <div class="function-item" @click="navigateTo('/lost-found')">
          <div class="icon-wrapper icon-red">
            <van-icon name="search" size="28" />
          </div>
          <span>失物招领</span>
        </div>
        <div class="function-item" @click="navigateTo('/lost-found/publish')">
          <div class="icon-wrapper icon-teal">
            <van-icon name="edit" size="28" />
          </div>
          <span>发布失物</span>
        </div>
        <div class="function-item" @click="navigateTo('/borrow-records')">
          <div class="icon-wrapper icon-pink">
            <van-icon name="todo-list-o" size="28" />
          </div>
          <span>借阅记录</span>
        </div>
        <div class="function-item" @click="navigateTo('/profile')">
          <div class="icon-wrapper icon-gray">
            <van-icon name="user-o" size="28" />
          </div>
          <span>个人中心</span>
        </div>

        <!-- 第三行：更多功能 -->
        <div class="function-item" @click="navigateTo('/second-class')">
          <div class="icon-wrapper icon-yellow">
            <van-icon name="star-o" size="28" />
          </div>
          <span>第二课堂</span>
        </div>
        <div class="function-item" @click="navigateTo('/profile/edit')">
          <div class="icon-wrapper icon-blue-light">
            <van-icon name="user-circle-o" size="28" />
          </div>
          <span>编辑资料</span>
        </div>
        <div class="function-item" @click="navigateTo('/profile/password')">
          <div class="icon-wrapper icon-orange-light">
            <van-icon name="lock" size="28" />
          </div>
          <span>修改密码</span>
        </div>
        <div class="function-item" @click="showNotice">
          <div class="icon-wrapper icon-green-light">
            <van-icon name="volume-o" size="28" />
          </div>
          <span>系统公告</span>
        </div>
      </div>
    </div>

    <!-- 今日课程 -->
    <div class="section-container">
      <div class="section-header">
        <h3 class="section-title">今日课程</h3>
        <span class="more-link" @click="navigateTo('/course')">
          查看全部
          <van-icon name="arrow" />
        </span>
      </div>

      <div v-if="loadingCourses" class="loading-box">
        <van-loading color="var(--primary)" vertical>加载课程中...</van-loading>
      </div>
      <div v-else-if="todayCourseList.length > 0" class="course-list">
        <div
          v-for="(course, index) in todayCourseList"
          :key="index"
          class="course-card"
          :class="'course-card-' + (index % 4)"
          @click="navigateTo('/course')"
        >
          <div class="course-time">
            <span class="time-start">{{ course.startTime }}</span>
            <span class="time-end">{{ course.endTime }}</span>
          </div>
          <div class="course-info">
            <h4>{{ course.courseName }}</h4>
            <p>
              <van-icon name="location-o" />
              {{ course.location }}
            </p>
            <p>
              <van-icon name="user-o" />
              {{ course.teacherName }}
            </p>
          </div>
          <div class="course-tag">
            {{ course.period }}
          </div>
        </div>
      </div>
      <van-empty v-else description="今天没有课程安排" image="search">
        <van-button round type="primary" size="small" @click="navigateTo('/course')">
          查看课程表
        </van-button>
      </van-empty>
    </div>

    <!-- 最新资讯 -->
    <div class="section-container">
      <div class="section-header">
        <h3 class="section-title">校园资讯</h3>
        <span class="more-link" @click="navigateTo('/news')">
          查看全部
          <van-icon name="arrow" />
        </span>
      </div>

      <div v-if="loadingNews" class="loading-box">
        <van-loading color="var(--primary)" vertical>加载资讯中...</van-loading>
      </div>
      <div v-else-if="newsList.length > 0" class="news-list">
        <div
          v-for="news in newsList"
          :key="news.id"
          class="news-card"
          @click="navigateTo(`/news/${news.id}`)"
        >
          <div class="news-content">
            <div class="news-tag" :class="getNewsTagClass(news.category)">
              {{ getNewsTagText(news.category) }}
            </div>
            <h4 class="news-title">{{ news.title }}</h4>
            <p class="news-summary">{{ news.summary }}</p>
            <div class="news-meta">
              <span>
                <van-icon name="eye-o" />
                {{ news.viewCount }}
              </span>
              <span>{{ formatDate(news.publishTime) }}</span>
            </div>
          </div>
          <van-image
            v-if="news.coverImage"
            width="100"
            height="75"
            fit="cover"
            :src="news.coverImage"
            radius="8"
            class="news-cover"
          />
        </div>
      </div>
      <van-empty v-else description="暂无资讯" image="default">
        <van-button round type="primary" size="small" @click="navigateTo('/news')">
          查看资讯
        </van-button>
      </van-empty>
    </div>

    <!-- 底部留白 -->
    <div class="bottom-space"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showDialog, showToast } from 'vant'
import { courseApi, newsApi, noticeApi, bookApi } from '../api'
import { DEFAULT_AVATAR } from '../utils/mediaDefaults'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const store = useStore()

    const todayCourseList = ref([])
    const newsList = ref([])

    // 统计数据（均来自接口，不写死）
    const todayCourses = ref(0)
    const borrowCount = ref(0)
    const unreadNews = ref(0)

    const loadingCourses = ref(true)
    const loadingNews = ref(true)
    const loadingStats = ref(true)

    const username = computed(() => store.getters.getUser.username || '同学')
    const avatar = computed(() => store.getters.getUser.avatar)

    // 当前日期
    const currentDate = computed(() => {
      const now = new Date()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const month = now.getMonth() + 1
      const date = now.getDate()
      const weekDay = weekDays[now.getDay()]
      return `${month}月${date}日 星期${weekDay}`
    })

    const navigateTo = (path) => {
      router.push(path)
    }

    const goToProfile = () => {
      router.push('/profile')
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    const getNewsTagClass = (category) => {
      const classes = {
        1: 'tag-news',
        2: 'tag-lecture',
        3: 'tag-activity',
        4: 'tag-notice'
      }
      return classes[category] || 'tag-news'
    }

    const getNewsTagText = (category) => {
      const texts = {
        1: '新闻',
        2: '讲座',
        3: '活动',
        4: '通知'
      }
      return texts[category] || '资讯'
    }

    const showNotice = () => {
      showDialog({
        title: '系统公告',
        message: '欢迎使用校园服务平台！\n\n本系统提供课程表查询、成绩查询、图书馆服务、校园资讯、失物招领等功能。\n\n如有问题请联系管理员。',
        confirmButtonText: '我知道了'
      })
    }

    const loadTodayCourses = async () => {
      loadingCourses.value = true
      try {
        const res = await courseApi.getStudentSchedule({ semester: store.getters.getCurrentSemester })
        const all = res.data || []
        const jsDay = new Date().getDay()
        const day = jsDay === 0 ? 7 : jsDay
        const parseTime = (classTime) => {
          try { return JSON.parse(classTime || '[]') } catch { return [] }
        }
        const today = all.filter(c =>
          parseTime(c.classTime).some(t => t.day === day)
        )
        todayCourses.value = today.length
        const periodLabel = (s, e) => `第${s}-${e}节`
        todayCourseList.value = today.slice(0, 3).map((course) => {
          const t = parseTime(course.classTime).find(x => x.day === day) || { start: 1, end: 2 }
          const startMap = { 1: '08:00', 2: '08:50', 3: '10:00', 4: '10:50', 5: '14:00', 6: '14:50', 7: '16:00', 8: '16:50', 9: '19:00', 10: '19:50' }
          const endMap = { 1: '08:50', 2: '09:40', 3: '10:50', 4: '11:40', 5: '14:50', 6: '15:40', 7: '16:50', 8: '17:40', 9: '19:50', 10: '20:40' }
          return {
            ...course,
            startTime: startMap[t.start] || '08:00',
            endTime: endMap[t.end] || '09:40',
            period: periodLabel(t.start, t.end)
          }
        })
      } catch (error) {
        showToast('课程数据加载失败，请稍后重试')
        todayCourseList.value = []
        todayCourses.value = 0
      } finally {
        loadingCourses.value = false
      }
    }

    const loadNews = async () => {
      loadingNews.value = true
      try {
        const res = await newsApi.getNewsList({ pageNum: 1, pageSize: 3 })
        newsList.value = res.data?.records || []
      } catch (error) {
        showToast('资讯加载失败，请稍后重试')
        newsList.value = []
      } finally {
        loadingNews.value = false
      }
    }

    const loadStats = async () => {
      loadingStats.value = true
      try {
        const noticeRes = await noticeApi.getList()
        unreadNews.value = (noticeRes.data && noticeRes.data.unread) || 0
      } catch (error) {
        unreadNews.value = 0
      }
      try {
        // 在借图书数量必须来自接口
        const borrowRes = await bookApi.getBorrowRecords()
        const records = borrowRes.data || []
        borrowCount.value = Array.isArray(records)
          ? records.filter(r => r.status === 1).length
          : 0
      } catch (error) {
        borrowCount.value = 0
      } finally {
        loadingStats.value = false
      }
    }

    onMounted(() => {
      loadTodayCourses()
      loadNews()
      loadStats()
    })

    return {
      username,
      avatar,
      defaultAvatar: DEFAULT_AVATAR,
      currentDate,
      todayCourseList,
      newsList,
      todayCourses,
      borrowCount,
      unreadNews,
      loadingCourses,
      loadingNews,
      loadingStats,
      navigateTo,
      goToProfile,
      formatDate,
      getNewsTagClass,
      getNewsTagText,
      showNotice
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 24px;
}

@media (min-width: 900px) {
  .home-container {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 16px;
    padding: 16px 24px 40px;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
  }
  .home-container > .welcome-section {
    grid-column: 1 / -1;
  }
  .home-container > .quick-banner,
  .home-container > .publish-news-banner {
    grid-column: 1 / -1;
  }
  .home-container > .section-container {
    margin: 0;
  }
}

/* 欢迎区域 */
.welcome-section {
  position: relative;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 55%, var(--primary-light) 100%);
  padding: 40px 20px 20px;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  overflow: hidden;
}

.welcome-bg {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.welcome-info {
  color: var(--text-inverse);
}

.welcome-date {
  font-size: 13px;
  opacity: 0.85;
  margin-bottom: 8px;
}

.welcome-info h2 {
  font-size: var(--font-2xl);
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-text {
  font-size: var(--font-md);
  opacity: 0.9;
}

.avatar {
  position: relative;
  cursor: pointer;
}

.vip-badge {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* 快捷统计 */
.quick-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--radius-md);
  padding: 15px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-inverse);
  cursor: pointer;
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-value {
  font-size: var(--font-2xl);
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-label {
  font-size: var(--font-sm);
  opacity: 0.85;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
}

/* 快捷横幅 */
.quick-banner {
  display: flex;
  gap: 12px;
  padding: 16px 16px 0;
}

.banner-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
  box-shadow: var(--shadow-sm);
}

.banner-item:active {
  transform: scale(0.98);
}

.banner-blue {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
}

.banner-accent {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
}

.banner-info {
  color: var(--text-inverse);
}

.banner-info h4 {
  font-size: var(--font-lg);
  font-weight: 600;
  margin-bottom: 4px;
}

.banner-info p {
  font-size: var(--font-sm);
  opacity: 0.85;
}

/* 发布资讯横幅 */
.publish-news-banner {
  margin: 12px 16px;
  background: linear-gradient(135deg, var(--accent), #e0b44a);
  border-radius: var(--radius-md);
  padding: 16px;
  cursor: pointer;
  transition: transform .2s ease;
  box-shadow: var(--shadow-sm);
}

.publish-news-banner:active {
  transform: scale(0.98);
}

.publish-banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publish-banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-inverse);
}

.publish-banner-left h4 {
  font-size: var(--font-lg);
  font-weight: 600;
  margin-bottom: 2px;
}

.publish-banner-left p {
  font-size: var(--font-sm);
  opacity: 0.95;
}

/* 区块容器 */
.section-container {
  background: var(--bg-card);
  margin: 12px 16px;
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .section-title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header .section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--primary), var(--accent));
}

.more-link {
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
}

.more-link:hover {
  color: var(--primary);
}

.loading-box {
  padding: 32px 0;
  display: flex;
  justify-content: center;
}

/* 功能入口 - 全部显示 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 15px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform .2s ease;
}

.function-item:active {
  transform: scale(0.95);
}

.icon-wrapper {
  width: 55px;
  height: 55px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.icon-blue {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-light));
}

.icon-green {
  background: linear-gradient(135deg, var(--success), #38a169);
}

.icon-orange {
  background: linear-gradient(135deg, var(--accent), #e0b44a);
}

.icon-purple {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
}

.icon-red {
  background: linear-gradient(135deg, var(--danger), #e53e3e);
}

.icon-teal {
  background: linear-gradient(135deg, var(--info), #319795);
}

.icon-pink {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
}

.icon-gray {
  background: linear-gradient(135deg, var(--text-secondary), var(--text-muted));
}

.icon-blue-light {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
}

.icon-orange-light {
  background: linear-gradient(135deg, var(--accent), #e0b44a);
}

.icon-green-light {
  background: linear-gradient(135deg, var(--success), #2f9e6e);
}

.icon-purple-light {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
}

.icon-yellow {
  background: linear-gradient(135deg, var(--accent), #e0b44a);
}

.function-item span {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: 500;
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: var(--radius-md);
  border-left: 4px solid;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}

.course-card:hover {
  box-shadow: var(--shadow-sm);
}

.course-card:active {
  transform: scale(0.98);
}

.course-card-0 {
  background: var(--primary-soft);
  border-left-color: var(--primary);
}

.course-card-1 {
  background: var(--success-soft);
  border-left-color: var(--success);
}

.course-card-2 {
  background: var(--accent-soft);
  border-left-color: var(--accent);
}

.course-card-3 {
  background: var(--info-soft);
  border-left-color: var(--info);
}

.course-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 15px;
  min-width: 50px;
}

.time-start {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.time-end {
  font-size: var(--font-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.course-info {
  flex: 1;
}

.course-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.course-info p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.course-tag {
  background: var(--primary-soft);
  color: var(--primary);
  font-size: var(--font-xs);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

/* 资讯列表 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-card {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background .2s ease, box-shadow .2s ease;
}

.news-card:hover {
  box-shadow: var(--shadow-sm);
}

.news-card:active {
  background: var(--bg-muted);
}

.news-content {
  flex: 1;
}

.news-tag {
  display: inline-block;
  font-size: var(--font-xs);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
}

.tag-news {
  background: var(--primary-soft);
  color: var(--primary);
}

.tag-lecture {
  background: var(--success-soft);
  color: var(--success);
}

.tag-activity {
  background: var(--accent-soft);
  color: var(--accent);
}

.tag-notice {
  background: var(--danger-soft);
  color: var(--danger);
}

.news-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  gap: 12px;
  font-size: var(--font-sm);
  color: var(--text-muted);
}

.news-meta span {
  display: flex;
  align-items: center;
  gap: 2px;
}

.news-cover {
  flex-shrink: 0;
}

/* 底部留白 */
.bottom-space {
  height: 16px;
}
</style>
