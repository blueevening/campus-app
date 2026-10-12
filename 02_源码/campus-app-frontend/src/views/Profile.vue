<template>
  <div class="profile-container">
    <!-- 用户信息头部 -->
    <div class="profile-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="user-info">
          <div class="avatar-wrapper">
            <van-image
              round
              width="70"
              height="70"
              :src="user.avatar || defaultAvatar"
            />
            <div class="edit-avatar" @click="showToast('头像修改功能开发中')">
              <van-icon name="photograph" size="12" />
            </div>
          </div>
          <div class="info">
            <h3>
              {{ user.username || '未登录' }}
              <span class="role-tag" :class="roleClass">{{ roleText }}</span>
            </h3>
            <p class="student-id">学号：{{ user.studentId || '—' }}</p>
            <p class="college">{{ user.college || '未填写学院' }} · {{ user.major || '未填写专业' }}</p>
          </div>
        </div>
        <van-button type="primary" size="small" round @click="goToEdit" class="edit-btn">
          编辑资料
        </van-button>
      </div>

      <!-- 学习统计 -->
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-value">{{ loadingStats ? '—' : userGPA }}</span>
          <span class="stat-label">绩点</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ loadingStats ? '—' : totalCredits }}</span>
          <span class="stat-label">学分</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ loadingStats ? '—' : borrowCount }}</span>
          <span class="stat-label">在借</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ loadingStats ? '—' : courseCount }}</span>
          <span class="stat-label">课程</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-title">学习服务</div>
      <van-cell-group :border="false">
        <van-cell
          title="我的课程表"
          is-link
          @click="navigateTo('/course')"
          :value="'本学期' + courseCount + '门课'"
        >
          <template #icon>
            <div class="cell-icon icon-blue">
              <van-icon name="calendar-o" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="成绩查询"
          is-link
          @click="navigateTo('/score')"
          :value="'GPA ' + userGPA"
        >
          <template #icon>
            <div class="cell-icon icon-green">
              <van-icon name="chart-trending-o" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="借阅记录"
          is-link
          @click="navigateTo('/borrow-records')"
          :value="borrowCount + '本在借'"
        >
          <template #icon>
            <div class="cell-icon icon-orange">
              <van-icon name="records" size="18" />
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <div class="menu-section">
      <div class="menu-title">校园生活</div>
      <van-cell-group :border="false">
        <van-cell
          title="校园资讯"
          is-link
          @click="navigateTo('/news')"
        >
          <template #icon>
            <div class="cell-icon icon-purple">
              <van-icon name="newspaper-o" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="失物招领"
          is-link
          @click="navigateTo('/lost-found')"
        >
          <template #icon>
            <div class="cell-icon icon-red">
              <van-icon name="search" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="发布失物招领"
          is-link
          @click="navigateTo('/lost-found/publish')"
        >
          <template #icon>
            <div class="cell-icon icon-teal">
              <van-icon name="edit" size="18" />
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <div class="menu-section">
      <div class="menu-title">权限说明</div>
      <div class="perm-box">
        <template v-if="isAdmin">
          <p class="perm-tip">管理员拥有全部修改权：用户管理、成绩录入、内容审核、证书审批等。</p>
          <div class="admin-block">
            <h4>待审核证书</h4>
            <div v-if="pendingCerts.length" class="perm-list">
              <div v-for="cert in pendingCerts" :key="cert.id" class="perm-item">
                <div>
                  <strong>{{ cert.certificateName }}</strong>
                  <p>等级分 +{{ cert.score }} · {{ cert.issuer || '未填机构' }}</p>
                  <p class="reason">{{ cert.obtainDate }}</p>
                </div>
                <div class="perm-actions">
                  <van-button size="mini" type="success" @click="reviewCert(cert, 1)">通过</van-button>
                  <van-button size="mini" type="danger" plain @click="reviewCert(cert, 2)">拒绝</van-button>
                </div>
              </div>
            </div>
            <p v-else class="perm-tip">暂无待审核证书。</p>
          </div>
        </template>
        <template v-else-if="isMonitor">
          <p class="perm-tip"><strong>班长权限</strong>（由管理员在「用户管理」任命，长期有效）：</p>
          <div class="active-perms">
            <div class="active-item">发布第二课堂活动</div>
            <div class="active-item">审核证书申请</div>
            <div class="active-item">内容管理（资讯 / 失物）</div>
          </div>
        </template>
        <template v-else>
          <p class="perm-tip">
            <strong>学生基础权限</strong>：课表、成绩、图书馆、资讯、失物、报名签到、证书申请、个人资料。
            如需管理权限，请联系管理员将你设为<strong>班长</strong>。
          </p>
        </template>
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-title">账号设置</div>
      <van-cell-group :border="false">
        <van-cell
          title="消息通知"
          is-link
          @click="navigateTo('/notices')"
        >
          <template #icon>
            <div class="cell-icon icon-blue">
              <van-icon name="bell" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="学分看板"
          is-link
          @click="navigateTo('/second-class/dashboard')"
        >
          <template #icon>
            <div class="cell-icon icon-orange">
              <van-icon name="chart-trending-o" size="18" />
            </div>
          </template>
        </van-cell>
        <!-- 管理员菜单：仅 role=2 显示 -->
        <van-cell
          v-if="isAdmin"
          title="用户管理"
          is-link
          @click="navigateTo('/admin/users')"
        >
          <template #icon>
            <div class="cell-icon icon-gold">
              <van-icon name="friends-o" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          v-if="isAdmin"
          title="成绩录入"
          is-link
          @click="navigateTo('/admin/scores')"
        >
          <template #icon>
            <div class="cell-icon icon-blue">
              <van-icon name="edit" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          v-if="isAdmin"
          title="内容审核"
          is-link
          @click="navigateTo('/admin/content')"
        >
          <template #icon>
            <div class="cell-icon icon-red">
              <van-icon name="warning-o" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="编辑资料"
          is-link
          @click="goToEdit"
        >
          <template #icon>
            <div class="cell-icon icon-green">
              <van-icon name="user-circle-o" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="修改密码"
          is-link
          @click="navigateTo('/profile/password')"
        >
          <template #icon>
            <div class="cell-icon icon-gray">
              <van-icon name="lock" size="18" />
            </div>
          </template>
        </van-cell>
        <van-cell
          title="关于我们"
          is-link
          @click="showAbout"
        >
          <template #icon>
            <div class="cell-icon icon-blue">
              <van-icon name="info-o" size="18" />
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button
        block
        round
        plain
        type="danger"
        :loading="loggingOut"
        @click="handleLogout"
        class="logout-btn"
      >
        退出登录
      </van-button>
    </div>

    <!-- 底部版本信息 -->
    <div class="version-info">
      <p>校园服务平台 v1.0.0</p>
      <p>毕业设计作品 © 2024</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showDialog, showToast } from 'vant'
import { scoreApi, bookApi, courseApi, certificateApi } from '../api'
import { DEFAULT_AVATAR } from '../utils/mediaDefaults'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const store = useStore()

    const userGPA = ref('0.00')
    const totalCredits = ref(0)
    const borrowCount = ref(0)
    const courseCount = ref(0)
    const loadingStats = ref(true)
    const loggingOut = ref(false)

    const user = computed(() => store.getters.getUser)

    const navigateTo = (path) => {
      router.push(path)
    }

    const goToEdit = () => {
      router.push('/profile/edit')
    }

    const loadUserStats = async () => {
      loadingStats.value = true
      try {
        try {
          const gpaRes = await scoreApi.calculateGPA()
          if (gpaRes.data) {
            userGPA.value = gpaRes.data.averageGPA?.toFixed(2) || '0.00'
            totalCredits.value = gpaRes.data.totalCredits || 0
          }
        } catch (error) {
          showToast('成绩统计加载失败')
        }

        try {
          const borrowRes = await bookApi.getBorrowRecords()
          if (Array.isArray(borrowRes.data)) {
            borrowCount.value = borrowRes.data.filter(r => r.status === 1).length
          } else {
            borrowCount.value = 0
          }
        } catch (error) {
          showToast('借阅记录加载失败')
          borrowCount.value = 0
        }

        try {
          const courseRes = await courseApi.getStudentSchedule({})
          if (courseRes.data) {
            courseCount.value = courseRes.data.length
          }
        } catch (error) {
          showToast('课程数据加载失败')
        }
      } finally {
        loadingStats.value = false
      }
    }

    const showAbout = () => {
      showDialog({
        title: '关于系统',
        message: '校园服务平台 v1.0.0\n\n本系统是毕业设计作品，采用Vue.js + Vant技术栈开发。\n\n功能包括：课程表、成绩查询、图书馆服务、校园资讯、失物招领、第二课堂等。\n\n权限说明：管理员全部权限；班长主要管理权限（管理员任命）；学生基础权限。',
        confirmButtonText: '我知道了'
      })
    }

    // 权限
    const isAdmin = computed(() => Number(store.getters.getRole) === 2)
    const isMonitor = computed(() => Number(store.getters.getRole) === 1)
    const roleText = computed(() => {
      const r = store.getters.getRole
      return r === 2 ? '管理员' : (r === 1 ? '班长' : '学生')
    })
    const roleClass = computed(() => {
      const r = store.getters.getRole
      return r === 2 ? 'admin' : (r === 1 ? 'monitor' : 'student')
    })
    const pendingCerts = ref([])

    const loadPermissions = async () => {
      try {
        if (isAdmin.value) {
          const certRes = await certificateApi.getCertificateList()
          const certList = (certRes.data && certRes.data.records) || (Array.isArray(certRes.data) ? certRes.data : [])
          pendingCerts.value = certList.filter(c => c.status === 0)
        }
      } catch (error) {
        showToast('待审核证书加载失败')
      }
    }

    const reviewCert = async (cert, status) => {
      try {
        await certificateApi.review(cert.id, { status, remark: status === 1 ? '审核通过' : '不符合要求' })
        showToast(status === 1 ? '证书审核通过' : '已拒绝')
        loadPermissions()
      } catch (error) {
        showToast(error?.message || '操作失败，请稍后重试')
      }
    }

    const handleLogout = async () => {
      if (loggingOut.value) return
      try {
        await showDialog({
          title: '确认退出',
          message: '确定要退出登录吗？退出后需要重新登录。',
          showCancelButton: true,
          confirmButtonColor: '#e24b4b'
        })
      } catch {
        // 用户取消
        return
      }

      loggingOut.value = true
      try {
        // 清除登录态（token + 用户信息）
        store.dispatch('logout')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        showToast({
          message: '已退出登录',
          icon: 'success'
        })
        router.replace('/login')
      } catch (error) {
        showToast('退出登录失败，请重试')
      } finally {
        loggingOut.value = false
      }
    }

    onMounted(() => {
      loadUserStats()
      loadPermissions()
    })

    return {
      user,
      defaultAvatar: DEFAULT_AVATAR,
      userGPA,
      totalCredits,
      borrowCount,
      courseCount,
      loadingStats,
      loggingOut,
      navigateTo,
      isAdmin,
      isMonitor,
      roleText,
      roleClass,
      pendingCerts,
      reviewCert,
      goToEdit,
      showAbout,
      handleLogout,
      showToast
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 32px;
}

.role-tag {
  display: inline-block;
  font-size: var(--font-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  margin-left: 6px;
  vertical-align: middle;
}

.role-tag.admin {
  background: var(--accent-soft);
  color: var(--accent);
}

.role-tag.monitor {
  background: var(--success-soft);
  color: var(--success);
}

.role-tag.student {
  background: var(--primary-soft);
  color: var(--primary);
}

.perm-box {
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
  margin: 0 12px;
}

.perm-tip {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.6;
}

.admin-block {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.admin-block h4 {
  font-size: 13px;
  color: var(--primary);
  margin-bottom: 8px;
}

.active-perms {
  margin-bottom: 10px;
}

.active-item {
  font-size: var(--font-sm);
  color: var(--success);
  background: var(--success-soft);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  margin-bottom: 6px;
}

.perm-list {
  margin-top: 12px;
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
}

.perm-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-sm);
}

.perm-item p {
  color: var(--text-secondary);
  margin-top: 2px;
}

.perm-item .reason {
  color: var(--text-muted);
}

.perm-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-header {
  position: relative;
  padding-bottom: 20px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px 20px 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-wrapper {
  position: relative;
}

.edit-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  cursor: pointer;
  border: 2px solid var(--bg-card);
}

.info {
  color: var(--text-inverse);
}

.info h3 {
  font-size: var(--font-xl);
  font-weight: 600;
  margin-bottom: 4px;
}

.student-id {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.college {
  font-size: var(--font-sm);
  opacity: 0.85;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  color: var(--text-inverse) !important;
}

/* 统计卡片 */
.stats-card {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--bg-card);
  margin: 0 20px;
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--border-color);
}

/* 菜单区域 */
.menu-section {
  margin: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 15px 0;
  box-shadow: var(--shadow-sm);
}

.menu-title {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-muted);
  padding: 0 20px 10px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 5px;
}

.cell-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  margin-right: 10px;
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

.icon-gray {
  background: linear-gradient(135deg, var(--text-secondary), var(--text-muted));
}

.icon-gold {
  background: linear-gradient(135deg, var(--accent), #e0b44a);
}

/* 退出登录 */
.logout-section {
  margin: 20px 16px;
}

.logout-btn {
  height: 44px;
  font-size: 15px;
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: var(--font-sm);
}

.version-info p {
  margin-bottom: 4px;
}

@media (min-width: 900px) {
  .profile-container {
    max-width: 960px;
    margin: 0 auto;
    padding-bottom: 40px;
  }

  .header-content {
    padding: 32px 28px 20px;
  }

  .stats-card {
    margin: 0 28px;
  }

  .menu-section {
    margin: 16px 24px;
  }
}
</style>
