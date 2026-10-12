<template>
  <div class="certificate-container">
    <van-nav-bar title="证书申请" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="records" size="20" @click="navigateTo('/certificate/my')" />
      </template>
    </van-nav-bar>

    <!-- 积分说明 -->
    <div class="score-info">
      <div class="info-header">
        <van-icon name="info-o" />
        <span>证书积分说明</span>
      </div>
      <div class="level-list">
        <div class="level-item" v-for="level in levels" :key="level.value">
          <div class="level-badge" :class="'level-' + level.value">
            {{ level.label }}
          </div>
          <div class="level-info">
            <span class="level-score">+{{ level.score }}分</span>
            <span class="level-desc">{{ level.description }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 申请表单 -->
    <div class="form-section">
      <van-form @submit="handleSubmit">
        <van-cell-group>
          <van-field
            v-model="form.certificateName"
            label="证书名称"
            placeholder="请输入证书名称"
            required
            :rules="[{ required: true, message: '请输入证书名称' }]"
          />

          <van-field
            label="证书等级"
            required
            :value="getLevelName(form.level)"
            placeholder="请选择证书等级"
            readonly
            is-link
            @click="showLevelPicker = true"
            @click-input="showLevelPicker = true"
            clickable
          />

          <van-field
            label="证书类型"
            required
            :value="getTypeName(form.certificateType)"
            placeholder="请选择证书类型"
            readonly
            is-link
            @click="showTypePicker = true"
            @click-input="showTypePicker = true"
            clickable
          />

          <van-field
            v-model="form.issuer"
            label="颁发机构"
            placeholder="请输入颁发机构"
            required
          />

          <van-field label="获得时间" required :rules="[{ required: true, message: '请选择获得时间' }]">
            <template #input>
              <input
                v-model="form.obtainDate"
                class="native-date-input"
                type="date"
                min="2020-01-01"
                :max="today"
              />
            </template>
          </van-field>
        </van-cell-group>

        <div class="score-preview" v-if="form.level">
          <div class="preview-label">预计获得积分</div>
          <div class="preview-value">+{{ getLevelScore(form.level) }}分</div>
        </div>

        <div class="form-actions">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            提交申请
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 等级选择器 -->
    <van-popup v-model:show="showLevelPicker" position="bottom" round>
      <div class="picker-content">
        <div class="picker-header">
          <span @click="showLevelPicker = false">取消</span>
          <span class="picker-title">选择证书等级</span>
          <span @click="showLevelPicker = false">确定</span>
        </div>
        <div class="picker-list">
          <div
            v-for="level in levels"
            :key="level.value"
            class="picker-item"
            :class="{ active: form.level === level.value }"
            @click="form.level = level.value; showLevelPicker = false"
          >
            <div class="picker-item-left">
              <span class="picker-item-name">{{ level.label }}</span>
              <span class="picker-item-desc">{{ level.description }}</span>
            </div>
            <div class="picker-item-score">+{{ level.score }}分</div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <div class="picker-content">
        <div class="picker-header">
          <span @click="showTypePicker = false">取消</span>
          <span class="picker-title">选择证书类型</span>
          <span @click="showTypePicker = false">确定</span>
        </div>
        <div class="picker-list">
          <div
            v-for="type in types"
            :key="type.value"
            class="picker-item"
            :class="{ active: form.certificateType === type.value }"
            @click="form.certificateType = type.value; showTypePicker = false"
          >
            <span>{{ type.label }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { certificateApi } from '../api'

export default {
  name: 'CertificateApply',
  setup() {
    const router = useRouter()
    const submitting = ref(false)
    const showLevelPicker = ref(false)
    const showTypePicker = ref(false)
    const today = new Date().toISOString().slice(0, 10)
    const levels = ref([])
    const types = ref([])

    const form = ref({
      certificateName: '',
      level: null,
      certificateType: null,
      issuer: '',
      obtainDate: ''
    })

    const getLevelName = (level) => {
      const found = levels.value.find(l => l.value === level)
      return found ? found.label : ''
    }

    const getTypeName = (type) => {
      const found = types.value.find(t => t.value === type)
      return found ? found.label : ''
    }

    const getLevelScore = (level) => {
      const found = levels.value.find(l => l.value === level)
      return found ? found.score : 0
    }

    const loadData = async () => {
      try {
        const [levelsRes, typesRes] = await Promise.all([
          certificateApi.getLevels(),
          certificateApi.getTypes()
        ])
        levels.value = levelsRes.data || []
        types.value = typesRes.data || []
      } catch (error) {
        console.error('加载数据失败', error)
      }
    }

    const handleSubmit = async () => {
      if (!form.value.level) {
        showToast('请选择证书等级')
        return
      }
      if (!form.value.certificateType) {
        showToast('请选择证书类型')
        return
      }
      if (!form.value.issuer) {
        showToast('请输入颁发机构')
        return
      }
      if (!form.value.obtainDate) {
        showToast('请选择获得时间')
        return
      }

      submitting.value = true
      try {
        const res = await certificateApi.apply(form.value)
        if (res.code === 200) {
          showToast({
            message: '申请成功！',
            icon: 'success'
          })
          setTimeout(() => {
            router.back()
          }, 1500)
        } else {
          showToast({
            message: res.message || '申请失败',
            icon: 'fail'
          })
        }
      } catch (error) {
        showToast(error.message || '申请失败')
      } finally {
        submitting.value = false
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadData()
    })

    return {
      form,
      levels,
      types,
      submitting,
      showLevelPicker,
      showTypePicker,
      today,
      getLevelName,
      getTypeName,
      getLevelScore,
      handleSubmit,
      navigateTo,
      goBack
    }
  }
}
</script>

<style scoped>
.native-date-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #323233;
  font-family: inherit;
  min-height: 24px;
}
.certificate-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 30px;
}

.score-info {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 15px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.info-header .van-icon {
  color: #2c5282;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.level-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.level-1 {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  color: #fff;
}

.level-2 {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: #fff;
}

.level-3 {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: #fff;
}

.level-4 {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: #fff;
}

.level-5 {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: #fff;
}

.level-6 {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
  color: #fff;
}

.level-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-score {
  font-size: 16px;
  font-weight: 700;
  color: #f59e0b;
}

.level-desc {
  font-size: 12px;
  color: #999;
}

.form-section {
  margin: 15px;
}

.score-preview {
  background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  margin: 20px 0;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  color: #fff;
}

.preview-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.preview-value {
  font-size: 32px;
  font-weight: 700;
}

.form-actions {
  margin-top: 30px;
}

/* 选择器样式 */
.picker-content {
  padding: 15px;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
}

.picker-header span {
  font-size: 14px;
  color: #2c5282;
  cursor: pointer;
}

.picker-title {
  font-size: 16px;
  font-weight: 600;
  color: #333 !important;
}

.picker-list {
  max-height: 400px;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.picker-item:hover {
  background: #f5f7fa;
}

.picker-item.active {
  background: #e8f4ff;
}

.picker-item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.picker-item-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.picker-item-desc {
  font-size: 12px;
  color: #999;
}

.picker-item-score {
  font-size: 16px;
  font-weight: 600;
  color: #f59e0b;
}
</style>
