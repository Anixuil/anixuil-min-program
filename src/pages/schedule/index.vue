<template>
  <view class="page-wrapper">
    <view class="schedule-container" :class="{ 'is-scaled': showWizard || showDeleteConfirm }">
      <!-- 背景装饰 -->
      <view class="bg-decoration">
        <view class="court-lines" />
        <view class="speed-shape shape-1" />
        <view class="speed-shape shape-2" />
        <view class="floating-shuttlecock" />
      </view>

      <up-navbar
        title="赛程中心"
        :titleStyle="{ fontWeight: '900', fontSize: '36rpx', fontStyle: 'italic', color: '#1a1a1a' }"
        bgColor="transparent"
        :placeholder="true"
        leftIcon=""
        :border="false"
      />

      <view class="content-wrapper">
        <!-- 顶部标签页 -->
        <view class="custom-tabs slide-up-1">
          <view 
            v-for="tab in tabs" 
            :key="tab.key"
            class="tab-item"
            :class="{ active: cur === tab.key }"
            @click="cur = tab.key"
          >
            <text>{{ tab.name }}</text>
            <view class="active-line" v-if="cur === tab.key" />
          </view>
        </view>

        <view class="list-container slide-up-2">
          <All v-if="cur==='all'" @delete-item="onDeleteRequest" />
          <Join v-else-if="cur==='join'" />
          <My v-else @delete-item="onDeleteRequest" />
        </view>
      </view>

      <view class="fab slide-up-3">
        <up-button 
          shape="circle" 
          :customStyle="fabBtnStyle"
          @click="showWizard=true"
        >
          <up-icon name="plus" color="#ffffff" size="20" style="margin-right: 8rpx;"></up-icon>
          创建比赛
        </up-button>
      </view>
    </view>
    <MatchCreateDrawer v-model:show="showWizard" @created="onCreated" />
    
    <!-- Delete Confirmation Popup -->
    <up-popup 
      :show="showDeleteConfirm" 
      mode="center" 
      bgColor="transparent"
      @close="showDeleteConfirm = false" 
      :customStyle="{ width: '80%' }"
    >
      <view class="action-sheet">
        <view class="sheet-header">
          <text class="sheet-title">操作确认</text>
          <text class="sheet-sub">是否删除比赛 "{{ currentDeleteItem?.title?.replace('｜我发起', '') }}" ?</text>
        </view>
        <view class="sheet-actions">
          <button class="action-btn delete-btn" @click="confirmDelete" :loading="deleteLoading">
            删除比赛
          </button>
          <button class="action-btn cancel-btn" @click="showDeleteConfirm = false">
            取消
          </button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMatchStore } from "@/store/modules/match";
import All from "@/components/schedule/All.vue";
import Join from "@/components/schedule/Join.vue";
import My from "@/components/schedule/My.vue";
import MatchCreateDrawer from "@/components/badminton/MatchCreateDrawer.vue";

const matchStore = useMatchStore();

const cur = ref<'all'|'join'|'my'>('all');
const showWizard = ref(false);
const showDeleteConfirm = ref(false);
const currentDeleteItem = ref<any>(null);
const deleteLoading = ref(false);

const onCreated = () => { showWizard.value=false; uni.showToast({ title: '比赛已创建', icon: 'none' }); };

const onDeleteRequest = (item: any) => {
  currentDeleteItem.value = item;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (!currentDeleteItem.value) return;
  
  deleteLoading.value = true;
  try {
    await matchStore.removeMatch(currentDeleteItem.value.id);
    await matchStore.fetchList();
    uni.showToast({ title: '删除成功', icon: 'success' });
    showDeleteConfirm.value = false;
  } catch (err) {
    uni.showToast({ title: '删除失败', icon: 'none' });
  } finally {
    deleteLoading.value = false;
  }
};

const tabs = [
  { key: 'all', name: '全部' },
  { key: 'join', name: '我参与' },
  { key: 'my', name: '我发起' }
];

const fabBtnStyle = {
  background: 'linear-gradient(135deg, #ff6b35, #e85a2a)',
  color: '#ffffff',
  height: '90rpx',
  padding: '0 40rpx',
  boxShadow: '0 8rpx 20rpx rgba(255, 107, 53, 0.4)',
  border: 'none',
  fontSize: '30rpx',
  fontWeight: 'bold'
};
</script>

<style scoped lang="scss">
// 变量定义
$primary-color: #ff6b35;
$primary-dark: #e85a2a;
$text-main: #1a1a1a;
$text-sub: #909399;
$bg-color: #f8f9fc;

.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #000000;
  overflow: hidden;
}

.schedule-container {
  position: relative;
  min-height: 100vh;
  background-color: $bg-color;
  box-sizing: border-box;
  border-radius: 40rpx 40rpx 0 0;
  transform: translateY(20rpx);
  z-index: 10;
  padding-bottom: 40rpx;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.4s ease, filter 0.4s ease;
  transform-origin: center 20%;

  &.is-scaled {
    transform: scale(0.92) translateY(20rpx);
    border-radius: 40rpx;
    filter: blur(2px) brightness(0.9);
    overflow: hidden;
    pointer-events: none;
  }
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .court-lines {
    position: absolute;
    top: -20%; right: -30%; width: 150%; height: 150%;
    background-image:
      linear-gradient(rgba(255, 107, 53, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 107, 53, 0.03) 1px, transparent 1px);
    background-size: 40rpx 40rpx;
    transform: rotate(-15deg);
  }

  .speed-shape {
    position: absolute;
    border-radius: 50rpx;
    transform: skewX(-20deg);
  }

  .shape-1 {
    top: -100rpx; right: -50rpx; width: 400rpx; height: 600rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(40px);
  }
  
  .shape-2 {
    bottom: -100rpx; left: -100rpx; width: 300rpx; height: 500rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(30px);
  }

  .floating-shuttlecock {
    position: absolute;
    top: 15%; left: 10%; width: 40rpx; height: 40rpx;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 50%;
    filter: blur(2px);
  }
}

.content-wrapper {
  padding: 20rpx 32rpx 160rpx; // Bottom padding for FAB
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.custom-tabs {
  display: flex;
  background: #ffffff;
  padding: 8rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: $text-sub;
    position: relative;
    font-weight: 500;
    transition: all 0.3s;
    
    &.active {
      color: $primary-color;
      font-weight: bold;
    }
    
    .active-line {
      position: absolute;
      bottom: 6rpx;
      width: 32rpx;
      height: 4rpx;
      background: $primary-color;
      border-radius: 4rpx;
    }
  }
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 160rpx; // Above tabbar
  z-index: 100;
}

// Animations
.slide-up-1 { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.slide-up-2 { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards; opacity: 0; }
.slide-up-3 { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards; opacity: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.action-sheet {
  padding: 40rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  
  .sheet-header {
    text-align: center;
    margin-bottom: 48rpx;
    
    .sheet-title {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 16rpx;
    }
    
    .sheet-sub {
      font-size: 28rpx;
      color: #606266;
    }
  }
  
  .sheet-actions {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    
    .action-btn {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 44rpx;
      font-size: 30rpx;
      font-weight: bold;
      
      &::after { border: none; }
      
      &.delete-btn {
        background: #ffe5e5;
        color: #ff4d4f;
      }
      
      &.cancel-btn {
        background: #f5f7fa;
        color: #606266;
      }
    }
  }
}
</style>
