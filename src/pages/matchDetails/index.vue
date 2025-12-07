<template>
  <view class="page-wrapper">
    <view class="match-container" :class="{ 'is-scaled': editShow }">
      <!-- 背景装饰 -->
      <view class="bg-decoration">
        <view class="court-lines" />
        <view class="speed-shape shape-1" />
        <view class="speed-shape shape-2" />
        <view class="floating-shuttlecock" />
      </view>

      <up-navbar :title="null" bgColor="transparent" leftIcon="arrow-left" :placeholder="true" :border="false"
        :autoBack="true" leftIconColor="#1a1a1a" />

      <view class="content-wrapper">
        <!-- 比赛标题区域 -->
        <view class="match-header slide-up-1">
          <view class="title-row">
            <text class="match-title">{{ title }}</text>
            <up-tag text="进行中" type="primary" shape="circle" size="mini" plain v-if="matchId" />
            <view v-if="canManagePlayers" class="edit-btn" @click="openEdit" style="margin-left: 10px;">
              <up-icon name="edit-pen" size="24" color="#666"></up-icon>
            </view>
          </view>
          <text class="match-subtitle" v-if="matchId">ID: {{ matchId }}</text>
        </view>

        <!-- 顶部标签页 -->
        <view class="custom-tabs slide-up-1">
          <view v-for="tab in ['info', 'score', 'result']" :key="tab" class="tab-item"
            :class="{ active: active === tab }" @click="active = tab as any">
            <text>{{ tab === 'info' ? '报名信息' : tab === 'score' ? '对局计分' : '比赛成绩' }}</text>
            <view class="active-line" v-if="active === tab" />
          </view>
        </view>

        <view v-if="!matchId" class="slide-up-2">
          <up-empty text="缺少比赛ID，无法加载数据" mode="data" />
        </view>

        <!-- 报名信息 -->
        <view v-if="active === 'info'" class="card slide-up-2">
          <view class="card-header">
            <text class="card-title">报名选手</text>
            <text class="card-subtitle">PLAYERS LIST</text>
          </view>
          <view v-if="players.length === 0">
            <up-empty text="暂无报名选手" mode="data" />
          </view>
          <view v-else class="signup-list">
            <view v-for="p in players" :key="p.id" class="player-chip" @click="handlePlayerClick(p)">
              <view class="avatar-wrapper">
                <up-avatar 
                  v-if="p.userId && (p.user?.userAvatar || p.user?.wxAvatarUrl)" 
                  :src="p.user?.userAvatar || p.user?.wxAvatarUrl" 
                  size="24"
                />
                <view v-else class="avatar-placeholder" :class="{ 'is-claimed': !!p.userId }">
                  {{ p.name.slice(0, 1) }}
                </view>
                
                <view v-if="p.userId" class="claimed-badge">
                  <up-icon name="checkmark" size="10" color="#fff" />
                </view>
              </view>
              
              <view class="player-info">
                <text class="player-name">{{ p.userId ? (p.user?.userAlias || p.name) : p.name }}</text>
              </view>
              <text v-if="p.userId" class="claimed-text">已认领</text>
            </view>
          </view>
        </view>

        <!-- 对局计分 -->
        <view v-if="active === 'score'" class="score-section slide-up-2">
          <view v-if="gamesOfMatch.length === 0" class="card empty-card">
            <up-empty text="暂无对局，请先生成赛程" mode="data" />
            <view class="empty-action">
              <up-button text="生成对阵" :customStyle="primaryBtnStyle" @click="openConfirm" />
            </view>
          </view>
          <view v-else class="games-list">
            <view v-for="(g, idx) in gamesOfMatch" :key="g.id" class="game-card">
              <view class="game-info">
                <view class="game-index">GAME {{ idx + 1 }}</view>
                <view class="vs-container">
                  <view class="team">
                    <view class="player-list">
                      <view v-for="p in getTeamPlayers(g, 0)" :key="p.id" class="player-row">
                        <up-avatar v-if="p.avatar" :src="p.avatar" size="20"></up-avatar>
                        <view v-else class="mini-avatar">{{ p.name.slice(0, 1) }}</view>
                        <text class="player-name">{{ p.name }}</text>
                      </view>
                      <text v-if="!getTeamPlayers(g, 0).length" class="waiting-text">等待中</text>
                    </view>
                    <text class="team-score" :class="{ 'winner': isWinner(g, 0) }">{{ getScore(g, 0) }}</text>
                  </view>
                  <view class="vs-divider">VS</view>
                  <view class="team">
                    <view class="player-list">
                      <view v-for="p in getTeamPlayers(g, 1)" :key="p.id" class="player-row">
                        <up-avatar v-if="p.avatar" :src="p.avatar" size="20"></up-avatar>
                        <view v-else class="mini-avatar">{{ p.name.slice(0, 1) }}</view>
                        <text class="player-name">{{ p.name }}</text>
                      </view>
                      <text v-if="!getTeamPlayers(g, 1).length" class="waiting-text">等待中</text>
                    </view>
                    <text class="team-score" :class="{ 'winner': isWinner(g, 1) }">{{ getScore(g, 1) }}</text>
                  </view>
                </view>
              </view>
              <view class="game-footer">
                <view class="btn-wrapper">
                  <up-button text="开始" :customStyle="outlineBtnStyle" @click="startGame(g.id)" />
                </view>
                <view class="btn-wrapper">
                  <up-button text="记分" :customStyle="primaryBtnStyle" @click="recordScore(g.id)" />
                </view>
              </view>
            </view>
          </view>
          <view class="score-footer">
            <text class="footer-text">共 {{ gamesOfMatch.length }} 场对局</text>
          </view>
        </view>

        <!-- 比赛成绩 -->
        <view v-if="active === 'result'" class="slide-up-2">
          <StatsBoard :matchId="matchId" />
          <view class="result-actions">
            <up-button text="重新计算排名" :customStyle="outlineBtnStyle" @click="recalc" />
            <view style="height: 24rpx;" />
            <up-button text="生成成绩海报" :customStyle="primaryBtnStyle" />
          </view>
        </view>
      </view>
    </view>
  </view>
  <ScorePanel :show="showScore" :game="currentGame" @close="showScore = false" @submitted="onScoreSubmitted" />

  <!-- 认领选手确认弹窗 -->
  <up-popup :show="claimModalShow" mode="center" bgColor="transparent" @close="claimModalShow = false" :customStyle="{ width: '80%' }">
    <view class="action-sheet">
      <view class="sheet-header">
        <text class="sheet-title">认领确认</text>
        <text class="sheet-sub">是否确认认领选手 "{{ selectedPlayer?.name }}" ?</text>
        <text class="sheet-desc">认领后，该选手的战绩将关联到您的账号</text>
      </view>
      <view class="sheet-actions">
        <button class="action-btn confirm-btn" @click="confirmClaim" :loading="claimLoading">
          确认认领
        </button>
        <button class="action-btn cancel-btn" @click="claimModalShow = false">
          取消
        </button>
      </view>
    </view>
  </up-popup>

  <!-- 生成对阵确认弹窗 -->
  <up-modal :show="confirmShow" title="确认设置" @close="confirmShow = false" @confirm="confirmGenerate" confirmText="生成对阵"
    cancelText="取消" :showCancelButton="true">
    <view class="confirm-content">
      <view class="confirm-row">
        <text class="confirm-title">参与比赛人数：{{ players.length }} 人</text>
      </view>
      <view class="confirm-row">
        <text class="confirm-subtitle">女生设置</text>
        <view class="confirm-options">
          <up-tag :type="femaleOpt === 'standard' ? 'primary' : 'info'" :plain="femaleOpt !== 'standard'"
            @click="femaleOpt = 'standard'" shape="circle">
            标准
          </up-tag>
          <up-tag :type="femaleOpt === 'avoid' ? 'primary' : 'info'" :plain="femaleOpt !== 'avoid'"
            @click="femaleOpt = 'avoid'" shape="circle">
            避免女双碰到男双
          </up-tag>
        </view>
      </view>
      <view class="confirm-row">
        <text class="confirm-subtitle">比赛局数</text>
        <view class="confirm-options">
          <up-tag :type="gameCount === 3 ? 'warning' : 'info'" :plain="gameCount !== 3" @click="gameCount = 3"
            shape="circle">
            3局
          </up-tag>
          <up-tag :type="gameCount === 6 ? 'warning' : 'info'" :plain="gameCount !== 6" @click="gameCount = 6"
            shape="circle">
            6局
          </up-tag>
          <up-tag :type="gameCount === 9 ? 'warning' : 'info'" :plain="gameCount !== 9" @click="gameCount = 9"
            shape="circle">
            9局
          </up-tag>
        </view>
      </view>
    </view>
  </up-modal>

  <!-- Edit Match Drawer -->
  <view class="drawer-mask" :class="{ 'show': editShow }" @click="editShow = false" />
  <view class="drawer-content" :class="{ 'show': editShow }">
    <view class="drawer-header">
      <text class="drawer-title">修改比赛信息</text>
      <view class="close-btn" @click="editShow = false">
        <up-icon name="close" color="#909399" size="20" />
      </view>
    </view>
    
    <view class="drawer-body">
      <view class="form-item">
        <text class="form-label">比赛名称</text>
        <up-input 
          v-model="editForm.name" 
          placeholder="请输入比赛名称" 
          border="none" 
          :customStyle="INPUT_STYLE"
          fontSize="28rpx"
          color="#1a1a1a"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">比赛日期</text>
        <view class="picker-trigger" @click="dateShow = true" :style="INPUT_STYLE">
          <text :style="{ color: editForm.date ? '#1a1a1a' : '#c0c4cc' }">{{ editForm.date || '选择日期' }}</text>
          <up-icon name="calendar" color="#999" size="18" />
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">比赛时间</text>
        <view class="picker-trigger" @click="timeShow = true" :style="INPUT_STYLE">
          <text :style="{ color: editForm.time ? '#1a1a1a' : '#c0c4cc' }">{{ editForm.time || '选择时间' }}</text>
          <up-icon name="clock" color="#999" size="18" />
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">比赛地点</text>
        <up-input 
          v-model="editForm.description" 
          placeholder="请输入比赛地点" 
          border="none" 
          :customStyle="INPUT_STYLE"
          fontSize="28rpx"
          color="#1a1a1a"
        />
      </view>

      <view class="form-actions">
        <button class="save-btn" @click="saveEdit" hover-class="btn-hover">保存修改</button>
      </view>
    </view>
  </view>

  <up-datetime-picker :show="dateShow" v-model="tempDate" mode="date" @confirm="confirmDate"
    @cancel="dateShow = false"></up-datetime-picker>
  <up-datetime-picker :show="timeShow" v-model="tempTime" mode="time" @confirm="confirmTime"
    @cancel="timeShow = false"></up-datetime-picker>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { useMatchStore } from "@/store/modules/match";
import { useGameStore } from "@/store/modules/game";
import { usePlayerStore } from "@/store/modules/player";
import { useUserStore } from "@/store/modules/user";
import ScorePanel from "@/components/badminton/ScorePanel.vue";
import StatsBoard from "@/components/badminton/StatsBoard.vue";
import { ref, computed, reactive } from "vue";

// Button Styles
const INPUT_STYLE = {
  backgroundColor: '#f5f7fa',
  borderRadius: '16rpx',
  padding: '24rpx',
  height: '90rpx',
  boxSizing: 'border-box'
};

const commonBtnStyle = {
  height: '80rpx',
  borderRadius: '40rpx',
  fontSize: '28rpx',
  fontWeight: 'bold',
  border: 'none'
};

const primaryBtnStyle = {
  ...commonBtnStyle,
  background: 'linear-gradient(135deg, #ff6b35, #e85a2a)',
  color: '#ffffff',
  boxShadow: '0 8rpx 20rpx rgba(255, 107, 53, 0.2)'
};

const outlineBtnStyle = {
  ...commonBtnStyle,
  background: '#ffffff',
  color: '#1a1a1a',
  border: '2rpx solid #e0e0e0'
};

const matchStore = useMatchStore();
const gameStore = useGameStore();
const playerStore = usePlayerStore();
const userStore = useUserStore();

const matchId = ref<string>("");
const active = ref<"info" | "score" | "result">("info");
const title = ref<string>("比赛详情");

// Permissions
const isOwner = computed(() => {
  if (!matchStore.current || !userStore.userInfo) return false;
  return matchStore.current.createBy === userStore.userInfo.userId;
});

const canManagePlayers = computed(() => {
  return isOwner.value && matchStore.current?.status !== 'end';
});

const isPlayerInGames = (playerId: string) => {
  return gamesOfMatch.value.some(g =>
    g.matchGamePlayers?.some((p: any) => p.playerId === playerId || p.partnerId === playerId)
  );
};

const canDelete = (player: any) => {
  // Can delete if owner, match not ended, and player is not in any game
  return canManagePlayers.value && !isPlayerInGames(player.id);
};

// Add/Delete Player Logic
const addPlayerShow = ref(false);
const newPlayerName = ref("");

const openAddPlayer = () => {
  newPlayerName.value = "";
  addPlayerShow.value = true;
};

const confirmAddPlayer = async () => {
  if (!newPlayerName.value.trim()) {
    uni.showToast({ title: "请输入选手姓名", icon: "none" });
    return;
  }

  uni.showLoading({ title: "添加中" });
  try {
    await playerStore.batchCreate([{
      matchId: matchId.value,
      name: newPlayerName.value.trim()
    }]);
    await playerStore.fetchList();
    addPlayerShow.value = false;
    uni.showToast({ title: "添加成功", icon: "success" });
  } catch (e) {
    uni.showToast({ title: "添加失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

const handleDelete = (player: any) => {
  uni.showModal({
    title: "确认删除",
    content: `确定要删除选手 "${player.name}" 吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: "删除中" });
        try {
          await playerStore.remove(player.id);
          await playerStore.fetchList();
          uni.showToast({ title: "删除成功", icon: "success" });
        } catch (e) {
          uni.showToast({ title: "删除失败", icon: "none" });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

// Edit Match Logic
const editShow = ref(false);
const dateShow = ref(false);
const timeShow = ref(false);
const tempDate = ref(Number(new Date()));
const tempTime = ref('12:00');

const editForm = reactive({
  name: '',
  date: '',
  time: '',
  description: ''
});

const openEdit = () => {
  if (!matchStore.current) return;
  const m = matchStore.current;
  editForm.name = m.name;
  editForm.description = m.description || '';
  
  const d = m.planStartTime ? new Date(m.planStartTime) : new Date();
  editForm.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  editForm.time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  tempDate.value = d.getTime();
  tempTime.value = editForm.time;

  editShow.value = true;
};

const confirmDate = (e: any) => {
  const d = new Date(e.value);
  editForm.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  dateShow.value = false;
};

const confirmTime = (e: any) => {
  editForm.time = e.value;
  timeShow.value = false;
};

const saveEdit = async () => {
  if (!editForm.name) {
    uni.showToast({ title: '请输入比赛名称', icon: 'none' });
    return;
  }

  const dateTimeStr = `${editForm.date} ${editForm.time}:00`;
  const fullDate = new Date(dateTimeStr.replace(/-/g, '/'));
  const isoStr = fullDate.toISOString();

  uni.showLoading({ title: '保存中' });
  try {
    await matchStore.update({
      id: matchId.value,
      name: editForm.name,
      description: editForm.description,
      planStartTime: isoStr
    });

    await matchStore.fetchDetail(matchId.value);
    title.value = editForm.name;
    editShow.value = false;
    uni.showToast({ title: '修改成功', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '修改失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

onLoad(async (query) => {
  const id = (query as any)?.id || (query as any)?.matchId || "";
  matchId.value = String(id);
  const tab = String((query as any)?.active || "info");
  active.value = ["info", "score", "result"].includes(tab) ? (tab as any) : "info";
  if (matchId.value) {
    const detail = await matchStore.fetchDetail(matchId.value);
    title.value = detail?.name || "比赛详情";
  }
  await playerStore.fetchList();
  await gameStore.fetchList();
});

const players = computed(() => playerStore.list.filter((p) => p.matchId === matchId.value));
const gamesOfMatch = computed(() => gameStore.list.filter((g) => g.matchId === matchId.value));

const startGame = (id: string) => {
  uni.showToast({ title: `开始比赛`, icon: "none" });
};
const showScore = ref(false);
const currentGame = ref<any>(null);
const recordScore = (id: string) => {
  currentGame.value = gamesOfMatch.value.find((g) => g.id === id) || null;
  showScore.value = !!currentGame.value;
};

const recalc = () => {
  uni.showToast({ title: "已重算", icon: "none" });
};

const onScoreSubmitted = async () => {
  await gameStore.fetchList();
  showScore.value = false;
  uni.showToast({ title: "比分已更新", icon: "none" });
};

// Helpers for template
const getTeamNames = (g: any, index: number) => {
  const p = g.matchGamePlayers?.[index];
  if (!p) return "等待中";
  return [p.player?.name, p.partner?.name].filter(Boolean).join("/");
};

const getTeamPlayers = (g: any, index: number) => {
  const side = g.matchGamePlayers?.[index];
  if (!side) return [];

  const resolvePlayer = (id: string, fallbackName: string) => {
    const found = players.value.find((p) => p.id === id);
    if (found) {
      return {
        id: found.id,
        name: found.userId ? found.user?.userAlias || found.name : found.name,
        avatar: found.userId ? found.user?.userAvatar || found.user?.wxAvatarUrl : "",
      };
    }
    return { id, name: fallbackName, avatar: "" };
  };

  const result = [];
  if (side.playerId) {
    result.push(resolvePlayer(side.playerId, side.player?.name || ""));
  }
  if (side.partnerId) {
    result.push(resolvePlayer(side.partnerId, side.partner?.name || ""));
  }
  return result;
};

const getScore = (g: any, index: number) => {
  return g.matchGamePlayers?.[index]?.score ?? "-";
};

const isWinner = (g: any, index: number) => {
  const s1 = g.matchGamePlayers?.[0]?.score || 0;
  const s2 = g.matchGamePlayers?.[1]?.score || 0;
  if (s1 === s2) return false;
  return index === 0 ? s1 > s2 : s2 > s1;
};

// Claim Player Logic
const claimModalShow = ref(false);
const selectedPlayer = ref<any>(null);
const claimLoading = ref(false);

const handlePlayerClick = (player: any) => {
  if (!userStore.userInfo) {
    uni.showToast({ title: "请先登录", icon: "none" });
    return;
  }
  if (player.userId) {
    if (player.userId === userStore.userInfo?.userId) {
       uni.showToast({ title: "您已认领该选手", icon: "none" });
    } else {
       uni.showToast({ title: "该选手已被认领", icon: "none" });
    }
    return;
  }
  selectedPlayer.value = player;
  claimModalShow.value = true;
};

const confirmClaim = async () => {
  if (!selectedPlayer.value || !matchId.value) return;
  
  claimLoading.value = true;
  uni.showLoading({ title: "认领中..." });
  
  try {
    await playerStore.claim({
      matchId: matchId.value,
      playerId: selectedPlayer.value.id,
      userId: userStore.userInfo?.userId || ""
    });
    
    uni.showToast({ title: "认领成功", icon: "success" });
    await playerStore.fetchList();
    claimModalShow.value = false;
  } catch (e) {
    uni.showToast({ title: "认领失败", icon: "none" });
  } finally {
    uni.hideLoading();
    claimLoading.value = false;
  }
};

// Generate Match Logic
const confirmShow = ref(false);
const femaleOpt = ref<"standard" | "avoid">("standard");
const gameCount = ref<number>(3);

const openConfirm = () => {
  confirmShow.value = true;
};

const confirmGenerate = async () => {
  confirmShow.value = false;
  if (!matchId.value) return;

  uni.showLoading({ title: '生成中...' });
  try {
    await gameStore.batchCreate(matchId.value, gameCount.value);
    uni.showToast({ title: '赛程已生成', icon: 'success' });
    // Refresh games list
    await gameStore.fetchList();
  } catch (error) {
    uni.showToast({ title: '生成失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};
</script>

<style scoped lang="scss">
// 变量定义
$primary-color: #ff6b35;
$primary-dark: #e85a2a;
$text-main: #1a1a1a;
$text-sub: #909399;
$bg-color: #f8f9fc;
$card-bg: #ffffff;

.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #000000;
  overflow: hidden;
}

.match-container {
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
  background: $card-bg;
  z-index: 999;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  
  &.show {
    transform: translateY(0);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;

    .drawer-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-main;
    }
    
    .close-btn {
        width: 48rpx;
        height: 48rpx;
        background: #f0f2f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
  }

  .drawer-body {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
    
    .form-item {
        display: flex;
        flex-direction: column;
        gap: 16rpx;
        
        .form-label {
            font-size: 28rpx;
            color: #1a1a1a;
            font-weight: bold;
            margin-bottom: 8rpx;
        }
        
        .picker-trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 28rpx;
            color: $text-main;
            box-sizing: border-box;
        }
    }

    .form-actions {
      margin-top: 40rpx;

      .save-btn {
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        color: #fff;
        height: 90rpx;
        border-radius: 45rpx;
        font-size: 32rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10rpx 20rpx rgba(255, 107, 53, 0.3);
        
        &::after { border: none; }
      }
    }
  }
}

/* 背景装饰 - 复用 Profile 页面的样式 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .court-lines {
    position: absolute;
    top: -20%;
    right: -30%;
    width: 150%;
    height: 150%;
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
    top: -100rpx;
    right: -50rpx;
    width: 400rpx;
    height: 600rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(40px);
  }

  .shape-2 {
    bottom: -100rpx;
    left: -100rpx;
    width: 300rpx;
    height: 500rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(30px);
  }

  .floating-shuttlecock {
    position: absolute;
    top: 10%;
    right: 10%;
    width: 30rpx;
    height: 30rpx;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 50%;
    filter: blur(2px);
  }
}

.content-wrapper {
  padding: 0 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.match-header {
  margin-top: 20rpx;

  .title-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 8rpx;
  }

  .match-title {
    font-size: 40rpx;
    font-weight: 900;
    color: $text-main;
  }

  .match-subtitle {
    font-size: 24rpx;
    color: $text-sub;
    font-family: 'DIN', sans-serif;
  }
}

.custom-tabs {
  display: flex;
  background: #ffffff;
  padding: 8rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16rpx 0;
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

.card {
  background: $card-bg;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.04);

  .card-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #f5f7fa;

    .card-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text-main;
    }

    .card-subtitle {
      font-size: 18rpx;
      color: $text-sub;
      letter-spacing: 2rpx;
      margin-top: 4rpx;
    }
  }
}

.signup-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .player-chip {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background: #f8f9fc;
    padding: 8rpx 20rpx 8rpx 8rpx;
    border-radius: 40rpx;

    .avatar-wrapper {
      position: relative;
      width: 48rpx;
      height: 48rpx;
      
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #e0e4eb;
        color: #606266;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: bold;

        &.is-claimed {
          background: #e8f5e9;
          color: #67c23a;
        }
      }

      .claimed-badge {
        position: absolute;
        bottom: -4rpx;
        right: -4rpx;
        width: 24rpx;
        height: 24rpx;
        background: #67c23a;
        border-radius: 50%;
        border: 2rpx solid #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
      }
    }

    .player-info {
      display: flex;
      flex-direction: column;
      
      .player-name {
        font-size: 26rpx;
        color: $text-main;
        font-weight: 500;
        line-height: 1.2;
      }
    }

    .claimed-text {
      font-size: 20rpx;
      color: #67c23a;
      background: rgba(103, 194, 58, 0.1);
      padding: 2rpx 8rpx;
      border-radius: 8rpx;
      margin-left: 4rpx;
    }
  }
}

/* Popup Styles */
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
      display: block;
      font-size: 28rpx;
      color: #606266;
      margin-bottom: 12rpx;
    }

    .sheet-desc {
      display: block;
      font-size: 24rpx;
      color: #909399;
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
      
      &.confirm-btn {
        background: rgba(255, 107, 53, 0.1);
        color: $primary-color;
      }
      
      &.cancel-btn {
        background: #f5f7fa;
        color: #606266;
      }
    }
  }
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.game-card {
  background: $card-bg;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  .game-info {
    .game-index {
      font-size: 20rpx;
      color: $text-sub;
      font-weight: bold;
      margin-bottom: 16rpx;
      letter-spacing: 1rpx;
    }

    .vs-container {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .team {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12rpx;

        .player-list {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8rpx;
          min-height: 88rpx;
          justify-content: center;
        }

        .player-row {
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          .player-name {
            font-size: 26rpx;
            color: $text-main;
            font-weight: 500;
            max-width: 160rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .mini-avatar {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          background: #e0e4eb;
          color: #606266;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20rpx;
          font-weight: bold;
        }

        .waiting-text {
          font-size: 26rpx;
          color: $text-sub;
        }

        .team-score {
          font-size: 48rpx;
          font-family: 'DIN', sans-serif;
          font-weight: bold;
          color: #c0c4cc;

          &.winner {
            color: $primary-color;
          }
        }
      }

      .vs-divider {
        font-size: 24rpx;
        font-weight: 900;
        color: #e0e0e0;
        margin: 0 32rpx;
        transform: translateY(16rpx);
      }
    }
  }

  .game-footer {
    display: flex;
    gap: 16rpx;
    padding-top: 20rpx;
    border-top: 2rpx dashed #f0f2f5;

    .btn-wrapper {
      flex: 1;
    }
  }
}

.score-footer {
  text-align: center;
  margin-top: 16rpx;

  .footer-text {
    font-size: 24rpx;
    color: $text-sub;
  }
}

.result-actions {
  display: flex;
  flex-direction: column;
  margin-top: 32rpx;
}

// Animations
.slide-up-1 {
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.slide-up-2 {
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards;
  opacity: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;

  .empty-action {
    margin-top: 32rpx;
    width: 240rpx;
  }
}

.confirm-content {
  padding: 24rpx;

  .confirm-row {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .confirm-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text-main;
    }

    .confirm-subtitle {
      font-size: 26rpx;
      color: $text-sub;
      display: block;
      margin-bottom: 16rpx;
    }

    .confirm-options {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
    }
  }
}
</style>
