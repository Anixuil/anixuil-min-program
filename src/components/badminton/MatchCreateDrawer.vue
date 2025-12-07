<template>
  <view>
    <!-- 抽屉遮罩 -->
    <view class="drawer-mask" :class="{ 'show': show }" @click="close" />
    
    <!-- 抽屉内容 -->
    <view class="drawer-content" :class="{ 'show': show }">
      <view class="drawer-header">
        <text class="drawer-title">创建比赛</text>
        <view class="close-btn" @click="close">
          <up-icon name="close" color="#909399" size="20" />
        </view>
      </view>
      
      <view class="drawer-body">
        <view v-if="step===1" class="form-step">
          <up-form labelPosition="top" :labelStyle="FORM_LABEL_STYLE" :labelWidth="150">
            <up-form-item label="比赛名称" required>
              <up-input v-model="form.name" placeholder="请输入比赛名称" border="none" :customStyle="INPUT_STYLE" clearable />
            </up-form-item>
            <up-form-item label="比赛描述">
              <up-input v-model="form.description" placeholder="请输入比赛描述" border="none" :customStyle="INPUT_STYLE" clearable />
            </up-form-item>
            
            <!-- 时间选择 (独占一行) -->
            <up-form-item label="开始时间" required>
              <up-datetime-picker 
                v-model="startTimeDefault" 
                mode="datetime" 
                :show="showStartTimePicker" 
                @confirm="onConfirmStartTime" 
                @cancel="showStartTimePicker=false" 
                @close="showStartTimePicker=false"
              ></up-datetime-picker>
              <view class="date-trigger full-width" @click="showStartTimePicker=true">
                  {{ form.planStartTime ? formatDate(form.planStartTime) : '请选择开始时间' }}
                  <up-icon name="calendar" color="#909399" size="18" style="margin-left: auto;" />
              </view>
            </up-form-item>
            
            <up-form-item label="结束时间" required>
              <up-datetime-picker 
                v-model="endTimeDefault" 
                mode="datetime" 
                :show="showEndTimePicker" 
                @confirm="onConfirmEndTime" 
                @cancel="showEndTimePicker=false" 
                @close="showEndTimePicker=false"
              ></up-datetime-picker>
              <view class="date-trigger full-width" @click="showEndTimePicker=true">
                  {{ form.planEndTime ? formatDate(form.planEndTime) : '请选择结束时间' }}
                  <up-icon name="calendar" color="#909399" size="18" style="margin-left: auto;" />
              </view>
            </up-form-item>

            <up-form-item label="比赛类型" required>
               <view class="type-selector full-width">
                 <view class="type-item" :class="{ active: form.type === 'single' }" @click="form.type = 'single'">
                   <text>单打</text>
                 </view>
                 <view class="type-item" :class="{ active: form.type === 'double' }" @click="form.type = 'double'">
                   <text>双打</text>
                 </view>
               </view>
            </up-form-item>
          </up-form>
          
          <view class="form-actions">
            <button class="primary-btn" :disabled="!canNext" @click="step=2" hover-class="btn-hover">下一步</button>
          </view>
        </view>

        <view v-else-if="step===2" class="form-step">
          <view class="section-title">添加选手 ({{ players.length }})</view>
          <view class="players-list">
             <view v-for="(p,i) in players" :key="i" class="player-row">
                <up-input v-model="players[i]" placeholder="选手名称" border="none" :customStyle="INPUT_STYLE_SMALL" clearable />
                <view class="del-btn" @click="remove(i)">
                  <up-icon name="trash" color="#ff4d4f" size="18" />
                </view>
             </view>
             <view v-if="players.length === 0" class="empty-players">
               <text>暂无选手，点击下方按钮添加</text>
             </view>
          </view>
          
          <view class="add-player-btn" @click="add">
            <up-icon name="plus" color="#3c9cff" size="16" />
            <text>添加选手</text>
          </view>

          <view class="form-actions two-btns">
            <button class="secondary-btn" @click="step=1" hover-class="btn-hover">上一步</button>
            <button class="primary-btn" :disabled="!canGenerateGames" :loading="loading" @click="submit" hover-class="btn-hover">创建比赛</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useMatchStore } from "@/store/modules/match";
import { usePlayerStore } from "@/store/modules/player";
import { useGameStore } from "@/store/modules/game";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(["update:show", "close", "created"]);

const matchStore = useMatchStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();

const step = ref(1);
const loading = ref(false);
const showStartTimePicker = ref(false);
const showEndTimePicker = ref(false);

const form = reactive({ 
  name: "", 
  description: "", 
  planStartTime: "", 
  planEndTime: "", 
  type: "single", 
  status: "notStart" 
});
const players = ref<string[]>([]);

// Helper: Date Formatter
const formatDateStr = (date: number | string | Date, fmt: string = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) return '';
    const d = new Date(date);
    // Standard Prisma DateTime expects ISO-8601 formatted strings (e.g. 2020-11-21T08:00:00.000Z).
    // The previous format 'YYYY-MM-DD HH:mm:ss' might be rejected if not parsed correctly by the backend DTO validation.
    // Let's try sending standard ISO string if the custom format fails, 
    // OR ensure the backend can parse this. 
    // Typically, 'YYYY-MM-DD HH:mm:ss' is NOT a valid ISO-8601 string.
    // Valid ISO: '2023-10-01T10:00:00.000Z' or '2023-10-01T10:00:00+08:00'
    
    // Let's modify this to return an ISO string which is safer for NestJS/Prisma.
    // However, the UI might want to display it differently.
    // The `formatDate` function used for display calls this with 'MM-DD HH:mm'.
    
    // If fmt is the default, we return ISO string for backend compatibility.
    if (fmt === 'YYYY-MM-DD HH:mm:ss') {
        return d.toISOString();
    }

    const o: any = {
        'M+': d.getMonth() + 1,
        'D+': d.getDate(),
        'H+': d.getHours(),
        'm+': d.getMinutes(),
        's+': d.getSeconds(),
    };
    if (/(Y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

const startTimeDefault = ref(Number(new Date()));
const endTimeDefault = ref(Number(new Date()));

// Reset form when drawer opens
watch(() => props.show, (val) => {
  if (val) {
    step.value = 1;
    form.name = "";
    form.description = "";
    
    // Default time: Today at 10:00 AM
    const now = new Date();
    // If it's already past 10 AM, use current time or just keep 10 AM? 
    // User requested default is today's 10 AM.
    now.setHours(10, 0, 0, 0);
    
    // We set the default picker time to this value
    startTimeDefault.value = now.getTime();
    endTimeDefault.value = now.getTime() + 2 * 60 * 60 * 1000;

    // We do NOT set the form value yet, so the user sees "Please select"
    // BUT user said "default is today 10 AM so user doesn't have to pick year/month"
    // This implies the picker should open at that time.
    // However, the previous code was setting form.planStartTime directly.
    // If the backend complains about missing time, it means form.planStartTime is empty when submitting.
    // But my previous code SET it to a string.
    
    // Wait, the user says "Backend complains missing time".
    // This means either I am not sending it correctly, or the format is wrong.
    // The previous code: form.planStartTime = formatDateStr(now); -> "2025-12-07 10:00:00"
    // This looks correct.
    
    // Maybe the user cleared it? Or maybe the reactive object isn't triggering?
    // Let's ensure we populate the form with defaults AND set the picker default.
    
    form.planStartTime = formatDateStr(now);
    form.planEndTime = formatDateStr(endTimeDefault.value);

    form.type = "single";
    players.value = [];
  }
});

const canNext = computed(() => !!form.name && !!form.planStartTime && !!form.planEndTime);

const minPlayers = computed(() => form.type === 'double' ? 4 : 2);
const canGenerateGames = computed(() => {
  const validCount = players.value.filter(p => p.trim()).length;
  return validCount >= minPlayers.value;
});

const close = () => emit("update:show", false);
const add = () => players.value.push("");
const remove = (i: number) => players.value.splice(i,1);

const onConfirmStartTime = (e: any) => {
  form.planStartTime = formatDateStr(e.value, 'YYYY-MM-DD HH:mm:ss');
  showStartTimePicker.value = false;
};
const onConfirmEndTime = (e: any) => {
  form.planEndTime = formatDateStr(e.value, 'YYYY-MM-DD HH:mm:ss');
  showEndTimePicker.value = false;
};
const formatDate = (dateStr: string) => {
  if(!dateStr) return '';
  return formatDateStr(dateStr, 'MM-DD HH:mm');
}

const submit = async () => {
  loading.value = true;
  try {
    // 1. Create Match
    const ok = await matchStore.createMatch({ 
      name: form.name, 
      description: form.description, 
      planStartTime: form.planStartTime, 
      planEndTime: form.planEndTime, 
      status: form.status,
      type: form.type
    });
    
    if (!ok) { 
      uni.showToast({ title: '创建失败', icon: 'none' });
      loading.value=false; 
      return; 
    }
    
    await matchStore.fetchList();
    const m = matchStore.list.find((x)=>x.name===form.name && x.planStartTime===form.planStartTime);
    
    if (m) {
      // 2. Create Players
      const validPlayers = players.value.filter(n => n.trim());
      if (validPlayers.length > 0) {
        await playerStore.batchCreate(validPlayers.map((n)=>({ matchId: m.id, name: n })));
      }

      // 3. Generate Games by Mode (Backend)
      await gameStore.createByMode(m.id);
      
      await gameStore.fetchList();
    }
    
    uni.showToast({ title: '创建成功', icon: 'success' });
    emit("created");
    emit("update:show", false);
  } catch(e) {
    console.error(e);
    uni.showToast({ title: '系统错误', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// Styles
const INPUT_STYLE = {
  backgroundColor: '#f5f7fa',
  borderRadius: '16rpx',
  padding: '0 20rpx',
  height: '80rpx',
  fontSize: '28rpx'
};
const INPUT_STYLE_SMALL = {
  backgroundColor: '#f5f7fa',
  borderRadius: '12rpx',
  padding: '0 20rpx',
  height: '70rpx',
  fontSize: '26rpx'
};
const FORM_LABEL_STYLE = { 
  fontSize: '28rpx', 
  color: '#1a1a1a', 
  fontWeight: 'bold', 
  marginBottom: '8rpx' 
};

</script>

<style scoped lang="scss">
$primary-color: #ff6b35;

/* 抽屉遮罩 */
.drawer-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  &.show {
    opacity: 1;
    pointer-events: auto;
  }
}

/* 抽屉内容 */
.drawer-content {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #ffffff;
  z-index: 999;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  max-height: 85vh;
  display: flex;
  flex-direction: column;

  &.show {
    transform: translateY(0);
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  
  .drawer-title {
    font-size: 36rpx;
    font-weight: 900;
    color: #1a1a1a;
    font-style: italic;
  }
  
  .close-btn {
    padding: 10rpx;
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
}

.date-trigger {
  background-color: #f5f7fa;
  border-radius: 16rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  
  &.full-width {
    width: 100%;
    box-sizing: border-box;
  }
}

.type-selector {
  display: flex;
  gap: 20rpx;
  
  &.full-width {
    width: 100%;
  }
  
  .type-item {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border-radius: 16rpx;
    color: #606266;
    font-weight: bold;
    transition: all 0.2s;
    
    &.active {
      background-color: rgba(255, 107, 53, 0.1);
      color: $primary-color;
      border: 2rpx solid $primary-color;
    }
  }
}

.form-actions {
  margin-top: 40rpx;
  
  &.two-btns {
    display: flex;
    gap: 20rpx;
    
    button {
      flex: 1;
    }
  }
}

.primary-btn {
  background: linear-gradient(135deg, #ff6b35, #e85a2a);
  color: #ffffff;
  border-radius: 50rpx;
  font-weight: bold;
  font-size: 30rpx;
  border: none;
  height: 88rpx;
  line-height: 88rpx;
  
  &:disabled {
    background: #e4e7ed;
    color: #909399;
  }
}

.secondary-btn {
  background: #f5f7fa;
  color: #606266;
  border-radius: 50rpx;
  font-weight: bold;
  font-size: 30rpx;
  border: none;
  height: 88rpx;
  line-height: 88rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  .del-btn {
    padding: 10rpx;
  }
}

.empty-players {
  text-align: center;
  color: #909399;
  font-size: 26rpx;
  padding: 40rpx 0;
}

.add-player-btn {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 20rpx;
  color: #3c9cff;
  font-size: 28rpx;
  font-weight: bold;
}

</style>
