<template>
  <div class="page">
    <van-nav-bar title="证书申请" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="records" size="20" color="#2c5282" @click="navigateTo('/certificate/my')" />
      </template>
    </van-nav-bar>

    <div class="apply-body">
      <div class="score-info page-card">
        <div class="section-title">证书积分说明</div>
        <div v-if="levelsLoading" class="loading-box">
          <van-loading type="spinner" color="#2c5282">加载中...</van-loading>
        </div>
        <van-empty v-else-if="!levels.length" description="暂无等级配置" />
        <div v-else class="level-list">
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

      <div class="form-section page-card">
        <div class="section-title">填写申请</div>
        <van-form @submit="handleSubmit">
          <van-cell-group inset>
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
              :value="levelDisplay"
              placeholder="请选择证书等级"
              readonly
              is-link
              clickable
              @click="showLevelPicker = true"
            />

            <van-field
              label="证书类型"
              required
              :value="typeName"
              placeholder="请选择证书类型"
              readonly
              is-link
              clickable
              @click="showTypePicker = true"
            />

            <van-field
              v-model="form.issuer"
              label="颁发机构"
              placeholder="请输入颁发机构"
              required
              :rules="[{ required: true, message: '请输入颁发机构' }]"
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
            <div class="preview-hint">提交后进入待审核，审核通过即可获得积分</div>
          </div>

          <div class="form-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="submitting"
              loading-text="提交中..."
            >
              提交申请
            </van-button>
          </div>
        </van-form>
      </div>
    </div>

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
            @click="selectLevel(level)"
          >
            <div class="picker-item-left">
              <span class="picker-item-name">
                <i class="level-dot" :class="'level-' + level.value"></i>
                {{ level.label }}
              </span>
              <span class="picker-item-desc">{{ level.description }}</span>
            </div>
            <div class="picker-item-score">+{{ level.score }}分</div>
          </div>
        </div>
      </div>
    </van-popup>

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
            @click="selectType(type)"
          >
            <span class="picker-item-name">{{ type.label }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { certificateApi } from '../api'

export default {
  name: 'CertificateApply',
  setup() {
    const router = useRouter()
    const submitting = ref(false)
    const levelsLoading = ref(true)
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

    const levelDisplay = computed(() => {
      const found = levels.value.find((l) => l.value === form.value.level)
      if (!found) return ''
      return `${found.label}（+${found.score}分）`
    })

    const typeName = computed(() => {
      const found = types.value.find((t) => t.value === form.value.certificateType)
      return found ? found.label : ''
    })

    const getLevelScore = (level) => {
      const found = levels.value.find((l) => l.value === level)
      return found ? found.score : 0
    }

    const selectLevel = (level) => {
      form.value.level = level.value
      showLevelPicker.value = false
    }

    const selectType = (type) => {
      form.value.certificateType = type.value
      showTypePicker.value = false
    }

    const loadData = async () => {
      levelsLoading.value = true
      try {
        const [levelsRes, typesRes] = await Promise.all([
          certificateApi.getLevels(),
          certificateApi.getTypes()
        ])
        levels.value = levelsRes.data || []
        types.value = typesRes.data || []
      } catch (error) {
        showToast(error.message || '加载等级配置失败')
      } finally {
        levelsLoading.value = false
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
        await certificateApi.apply({
          certificateName: form.value.certificateName,
          level: form.value.level,
          certificateType: form.value.certificateType,
          issuer: form.value.issuer,
          obtainDate: form.value.obtainDate
        })
        showToast({
          message: '申请已提交，进入待审核',
          icon: 'success'
        })
        setTimeout(() => {
          router.replace('/certificate/my')
        }, 800)
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

    onMounted(loadData)

    return {
      form,
      levels,
      types,
      submitting,
      levelsLoading,
      showLevelPicker,
      showTypePicker,
      today,
      levelDisplay,
      typeName,
      getLevelScore,
      selectLevel,
      selectType,
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
  font-size: var(--font-md);
  color: var(--text-primary);
  font-family: inherit;
  min-height: 24px;
}

.apply-body {
  padding: var(--space-3);
  display: grid;
  gap: var(--space-3);
}

.score-info,
.form-section {
  padding: var(--space-4);
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.level-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-muted);
  border-radius: var(--radius-md);
}

.level-badge {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
  min-width: 52px;
  text-align: center;
}

.level-1 {
  background: linear-gradient(135deg, var(--accent), #e0b44a);
  color: #1a202c;
}

.level-2 {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--text-inverse);
}

.level-3 {
  background: var(--info-soft);
  color: var(--info);
}

.level-4 {
  background: var(--success-soft);
  color: var(--success);
}

.level-5 {
  background: var(--primary-soft);
  color: var(--primary);
}

.level-6 {
  background: var(--border-color);
  color: var(--text-secondary);
}

.level-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.level-score {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}

.level-desc {
  font-size: var(--font-xs);
  color: var(--text-muted);
  text-align: right;
}

.score-preview {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
  margin: var(--space-5) 0 0;
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--text-inverse);
}

.preview-label {
  font-size: var(--font-md);
  opacity: 0.9;
  margin-bottom: var(--space-2);
}

.preview-value {
  font-size: 32px;
  font-weight: 700;
}

.preview-hint {
  margin-top: var(--space-2);
  font-size: var(--font-xs);
  opacity: 0.8;
}

.form-actions {
  margin-top: var(--space-5);
  padding-bottom: var(--space-2);
}

.picker-content {
  padding: var(--space-3);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-3);
}

.picker-header span {
  font-size: var(--font-md);
  color: var(--primary);
  cursor: pointer;
  font-weight: 600;
}

.picker-title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary) !important;
}

.picker-list {
  max-height: 400px;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s ease;
}

.picker-item:hover {
  background: var(--bg-muted);
}

.picker-item.active {
  background: var(--primary-soft);
}

.picker-item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.picker-item-name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.level-dot.level-1 { background: var(--accent); }
.level-dot.level-2 { background: var(--primary); }
.level-dot.level-3 { background: var(--info); }
.level-dot.level-4 { background: var(--success); }
.level-dot.level-5 { background: var(--primary-light); }
.level-dot.level-6 { background: var(--text-muted); }

.picker-item-desc {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

.picker-item-score {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--accent);
}

.loading-box {
  padding: var(--space-6);
  display: flex;
  justify-content: center;
}
</style>
