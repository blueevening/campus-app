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
            <p class="student-id">学号：{{ user.studentId }}</p>
            <p class="college">{{ user.college }} · {{ user.major }}</p>
          </div>
        </div>
        <van-button type="primary" size="small" round @click="goToEdit" class="edit-btn">
          编辑资料
        </van-button>
      </div>

      <!-- 学习统计 -->
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-value">{{ userGPA }}</span>
          <span class="stat-label">绩点</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ totalCredits }}</span>
          <span class="stat-label">学分</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ borrowCount }}</span>
          <span class="stat-label">在借</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ courseCount }}</span>
          <span class="stat-label">课程</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="section-title">学习服务</div>
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
      <div class="section-title">校园生活</div>
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
      <div class="section-title">权限说明</div>
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
      <div class="section-title">账号设置</div>
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

    const user = computed(() => store.getters.getUser)

    const navigateTo = (path) => {
      router.push(path)
    }

    const goToEdit = () => {
      router.push('/profile/edit')
    }

    const loadUserStats = async () => {
      try {
        // 获取GPA
        const gpaRes = await scoreApi.calculateGPA()
        if (gpaRes.data) {
          userGPA.value = gpaRes.data.averageGPA?.toFixed(2) || '0.00'
          totalCredits.value = gpaRes.data.totalCredits || 0
        }

        // 获取借阅数量
        const borrowRes = await bookApi.getBorrowRecords()
        if (borrowRes.data) {
          borrowCount.value = borrowRes.data.filter(r => r.status === 1).length
        }

        // 获取课程数量
        const courseRes = await courseApi.getStudentSchedule({})
        if (courseRes.data) {
          courseCount.value = courseRes.data.length
        }
      } catch (error) {
        console.error('获取统计数据失败', error)
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
      } catch (e) {
        // ignore
      }
    }

    const reviewCert = async (cert, status) => {
      try {
        await certificateApi.review(cert.id, { status, remark: status === 1 ? '审核通过' : '不符合要求' })
        showToast(status === 1 ? '证书审核通过' : '已拒绝')
        loadPermissions()
      } catch (error) {
        showToast(error.message || '操作失败')
      }
    }

    const handleLogout = async () => {
      try {
        await showDialog({
          title: '确认退出',
          message: '确定要退出登录吗？退出后需要重新登录。',
          showCancelButton: true,
          confirmButtonColor: '#ee0a24'
        })

        store.dispatch('logout')
        showToast({
          message: '已退出登录',
          icon: 'success'
        })
        router.push('/login')
      } catch {
        // 取消操作
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
.role-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 6px;
  vertical-align: middle;
}
.role-tag.admin {
  background: #fef6e4;
  color: #b7791f;
}
.role-tag.monitor {
  background: #e6fffa;
  color: #276749;
}
.role-tag.student {
  background: #e8f0fb;
  color: #2c5282;
}
.perm-box {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin: 0 12px;
}
.perm-tip {
  font-size: 12px;
  color: #718096;
  margin-bottom: 10px;
  line-height: 1.6;
}
.admin-block {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f4f8;
}
.admin-block h4 {
  font-size: 13px;
  color: #2c5282;
  margin-bottom: 8px;
}
.active-perms {
  margin-bottom: 10px;
}
.active-item {
  font-size: 12px;
  color: #2f855a;
  background: #e6fffa;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
}
.perm-list {
  margin-top: 12px;
  border-top: 1px solid #f0f4f8;
  padding-top: 8px;
}
.perm-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f7fa;
  font-size: 12px;
}
.perm-item p { color: #718096; margin-top: 2px; }
.perm-item .reason { color: #a0aec0; }
.perm-actions { display: flex; flex-direction: column; gap: 6px; }
.perm-picker { padding: 16px; }
.picker-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
  color: #2c5282;
}
.picker-option {
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  background: #f7fafc;
  margin-bottom: 8px;
  font-size: 14px;
}
.picker-option:active { background: #e8f0fb; }
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 60px;
}

/* 头部区域 */
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
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  border-radius: 0 0 30px 30px;
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
  background: #2c5282;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  border: 2px solid #fff;
}

.info {
  color: #fff;
}

.info h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.student-id {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.college {
  font-size: 12px;
  opacity: 0.8;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  color: #fff !important;
}

/* 统计卡片 */
.stats-card {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  margin: 0 20px;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #eee;
}

/* 菜单区域 */
.menu-section {
  margin: 15px;
  background: #fff;
  border-radius: 15px;
  padding: 15px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 13px;
  color: #999;
  padding: 0 20px 10px;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 5px;
}

.cell-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 10px;
}

.icon-blue {
  background: linear-gradient(135deg, #2c5282 0%, #4299e1 100%);
}

.icon-green {
  background: linear-gradient(135deg, #276749 0%, #38a169 100%);
}

.icon-orange {
  background: linear-gradient(135deg, #975a16 0%, #d69e2e 100%);
}

.icon-purple {
  background: linear-gradient(135deg, #553c9a 0%, #805ad5 100%);
}

.icon-red {
  background: linear-gradient(135deg, #9b2c2c 0%, #e53e3e 100%);
}

.icon-teal {
  background: linear-gradient(135deg, #234e52 0%, #319795 100%);
}

.icon-gray {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

/* 退出登录 */
.logout-section {
  margin: 20px 15px;
}

.logout-btn {
  height: 44px;
  font-size: 15px;
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 20px;
  color: #ccc;
  font-size: 12px;
}

.version-info p {
  margin-bottom: 4px;
}
</style>
