<template>
  <view :class="[props.embedded ? 'bm-detail-embedded' : 'bm-page has-dock', { 'is-reduced': reducedMotion }]">
    <view v-if="noticeRendered" class="bm-working" :style="noticeStyle" role="status">{{ displayedNotice }}</view>
    <scroll-view :class="{ 'bm-detail-scroll': props.embedded }" :scroll-y="props.embedded" :scroll-top="scrollTop" :scroll-with-animation="false" :refresher-enabled="!!props.embedded && !!props.active" :refresher-triggered="refreshing" @scroll="detailScrolled" @refresherrefresh="refreshDetail">
    <view id="match-detail-background" :class="{ 'bm-page bm-detail-scroll-content': props.embedded }" :style="backgroundStyle" :aria-hidden="backgroundBlocked" :inert="backgroundBlocked ? true : undefined">
    <view v-if="openingErrorRendered" :style="openingErrorStyle"><BmState kind="error" title="球局暂时无法打开" :message="displayedOpeningError" action="重新加载" :busy="loading" :disabled="!error || !!detail" @action="error && !detail && reload()" /></view>
    <view :style="pageStyle">
    <view v-if="summary" :style="props.embedded ? '' : sectionStyle(0, 'fade')">
      <view id="bm-share-surface" class="bm-hero dark bm-match-header bm-share-node" :style="props.heroHidden ? 'opacity:0;' : headerTransition">
        <view class="bm-court" /><view class="bm-hero-content">
          <view class="bm-row bm-between"><text id="bm-share-mode" class="bm-eyebrow bm-share-node">{{ modeLabels[summary.mode] }}</text><text id="bm-share-status" class="bm-tag bm-share-node" :class="summary.status">{{ statusLabels[summary.status] }}</text></view>
          <text id="bm-share-name" class="bm-title bm-share-node" style="margin:16rpx 0">{{ summary.name }}</text>
          <view id="bm-share-location" class="bm-share-node">{{ summary.location }}</view>
          <view id="bm-share-date" class="bm-muted bm-share-node" style="margin-top:12rpx">{{ dateLabel(summary.startsAt) }}</view>
          <view id="bm-share-meta" class="bm-muted bm-share-node">{{ detail?.players.length ?? summary._count?.players ?? 0 }} 位球友 · {{ summary.courtCount }} 片场地</view>
        </view>
      </view>
    </view>
    <view class="bm-detail-loading" :style="loadingContainerStyle">
      <view v-if="loadingRendered" :style="loadingStyle"><BmState kind="loading" /></view>
      <view v-if="detail" id="detail-content" :style="contentStyle">
      <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}<BmButton small variant="secondary" :disabled="busy || loading || !error" @click="recover">{{ needsRefresh ? '刷新数据，重新操作' : '重新加载' }}</BmButton></view>
      <view class="bm-sticky" :style="sectionStyle(1, 'fade')"><BmSegments :model-value="tab" :items="tabs" :disabled="releaseOperation !== 0" @update:model-value="changeTab" /></view>
      <view :style="tabContainerStyle"><view id="detail-tab-content" :style="tabStyle" :aria-hidden="!tabInteractive">
        <template v-if="displayedTab === 'info'">
          <view class="bm-card" :style="sectionStyle(2, 'fade')"><view class="bm-row bm-between"><text class="bm-heading">球友名单</text><text class="bm-tag">{{ detail.players.length }} 人</text></view><view class="bm-muted">认领自己，同名请核对编号。</view>
            <view v-for="entry in playerRows" :id="`player-${entry.item.id}`" :key="entry.key" class="bm-person bm-detail-player" :style="entry.style" :aria-hidden="entry.leaving"><view class="bm-avatar">{{ entry.item.position + 1 }}</view><view class="bm-grow"><text class="bm-person-name">{{ entry.item.name }}</text><text class="bm-muted">{{ entry.item.userId === user.userInfo?.id ? '这是我' : entry.item.userId ? '已认领' : '待认领' }}</text><view v-if="entry.item.pairKey" class="bm-muted">搭档：{{ partnerName(entry.item.id) }}</view></view><BmButton v-if="!entry.item.userId && detail.permissions.claim && !myPlayer" small variant="secondary" :loading="claimingPlayerId === entry.item.id" :disabled="locked || entry.leaving || !tabInteractive" @click="claim(entry.item.id)">{{ claimingPlayerId === entry.item.id ? '认领中' : '认领' }}</BmButton><button v-if="owner && detail.permissions.claim" class="bm-icon-button bm-more-button" :disabled="locked || entry.leaving || !tabInteractive" aria-label="选手管理" @click="managePlayer(entry.item.id)" :hover-class="locked || entry.leaving || !tabInteractive ? 'none' : 'bm-touch'" :hover-stay-time="80"><view class="bm-more-icon" aria-hidden="true"><view class="bm-more-dot" /><view class="bm-more-dot" /><view class="bm-more-dot" /></view></button></view>
            <view v-if="addPlayerRendered" class="bm-divider" :style="addPlayerStyle" :aria-hidden="!canAddPlayer"><view class="bm-row bm-nowrap"><view class="bm-grow"><BmField v-model="playerName" label="新增球友姓名" maxlength="80" placeholder="新增球友姓名" :disabled="locked || !canAddPlayer || !tabInteractive" /></view><BmButton small :disabled="locked || !canAddPlayer || !tabInteractive || !playerName.trim()" @click="addPlayer">添加</BmButton></view><view v-if="detail.match.mode === 'fixed'" style="margin-top:20rpx"><BmButton variant="secondary" :disabled="locked || !canAddPlayer || !tabInteractive" @click="openPanel('pairs')">选择固定搭档</BmButton></view></view>
          </view>
          <view class="bm-card" :style="sectionStyle(3)"><text class="bm-heading">这场怎么安排</text><view class="bm-muted">{{ dateLabel(detail.match.startsAt) }} — {{ dateLabel(detail.match.endsAt) }}</view><view class="bm-muted">{{ detail.match.description || '带上球拍，准时到场。' }}</view><view class="bm-divider bm-muted">{{ detail.match.status === 'draft' ? '完善名单后预览排赛，确认后再开场。' : '开赛后名单和对阵锁定；仍可通过邀请认领空缺账号。' }}</view></view>
        </template>
        <template v-if="displayedTab === 'games'">
          <view class="bm-section" :style="sectionStyle(2)"><BmSegments :model-value="gameFilter" :items="gameFilters" :disabled="releaseOperation !== 0" @update:model-value="setGameFilter" /></view>
          <view v-if="cheerError" class="bm-error">{{ cheerError }}<BmButton small variant="secondary" :disabled="cheerLoading || releaseOperation !== 0" @click="refreshCheers">重新读取助威</BmButton></view>
          <view class="bm-row bm-between" :style="sectionStyle(3)"><text class="bm-muted">{{ completedCount }}/{{ detail.games.length }} 局已完成</text><text class="bm-muted">{{ pendingCount }} 局待录分</text></view>
          <view :style="filterContainerStyle"><view id="detail-game-results" :style="filterStyle" :aria-hidden="!filterInteractive || !tabInteractive">
          <view v-if="!rounds.length" :style="sectionStyle(4)"><BmState title="暂时没有这些对局" :message="detail.games.length ? '试试其他筛选条件。' : '请组织者完成名单后预览排赛。'" /></view>
          <view v-for="(round, roundIndex) in rounds" :key="round.number" class="bm-card" :style="sectionStyle(roundIndex + 3, 'fade')"><view class="bm-row bm-between bm-round-heading"><text class="bm-heading">第 {{ round.number }} 轮</text><text class="bm-eyebrow">ROUND {{ round.number }}</text></view><view class="bm-muted">轮休：{{ teamName(round.resting) || '无' }}</view>
            <view v-for="game in round.games" :key="game.id" class="bm-divider"><view class="bm-row bm-between"><text class="bm-muted">{{ game.court }} 号场 · 第 {{ game.sequence }} 局</text><text class="bm-tag" :class="game.status">{{ game.status === 'completed' ? '已完成' : game.status === 'cancelled' ? '已取消' : game.cheeringClosedAt || cheerMarkets[game.id]?.closedAt ? '已结束，待录分' : '待录分' }}</text></view>
              <view :id="`score-${game.id}`" :class="{ 'bm-highlight': highlighted === game.id }" :style="flying && scoreGame?.id === game.id ? 'opacity:0' : ''"><ScoreBoard :team-a="teamName(game.teamA)" :team-b="teamName(game.teamB)" :score-a="game.scoreA" :score-b="game.scoreB" /></view>
              <view class="bm-row bm-game-actions"><view class="bm-grow"><BmButton v-if="canScore(game)" small :disabled="locked || !tabInteractive || !filterInteractive" @click="openScore(game)">{{ game.status === 'completed' ? '纠正比分' : game.cheeringClosedAt || cheerMarkets[game.id]?.closedAt ? '录入比分' : '结束助威并录分' }}</BmButton></view><button v-if="owner && detail.match.status === 'active' && game.status === 'pending'" class="bm-text-button" :disabled="locked || !tabInteractive || !filterInteractive" @click="openReason(game.id)" :hover-class="locked || !tabInteractive || !filterInteractive ? 'none' : 'bm-touch'" :hover-stay-time="80">取消本局</button></view>
              <CheerCard :market="cheerMarkets[game.id]" :failed="!!cheerError" :disabled="locked || !tabInteractive || !filterInteractive" @open="openCheer(game)" />
            </view>
          </view>
          </view></view>
        </template>
        <template v-if="displayedTab === 'results'">
          <view class="bm-muted bm-section" :style="sectionStyle(2)">只统计已完成对局。按胜场、净胜分、得分排序；同指标并列。</view>
          <view v-for="(section, sectionIndex) in statSections" :key="section.key" class="bm-card" :style="sectionStyle(sectionIndex + 3, 'fade')"><text class="bm-heading">{{ section.title }}</text><view v-for="entry in section.rows" :id="`${section.key}-${entry.item.id}`" :key="entry.key" class="bm-person" :class="`bm-detail-${section.key}`" :style="entry.style" :aria-hidden="entry.leaving"><text class="bm-rank" :class="{ top: entry.item.rank <= 3 }">{{ entry.item.rank }}</text><view class="bm-grow"><text class="bm-person-name">{{ entry.item.name }}</text><view class="bm-muted">{{ entry.item.played }} 局 · 胜率 {{ (entry.item.winRate * 100).toFixed(1) }}%</view><view class="bm-muted">得失分 {{ entry.item.pointsFor }}/{{ entry.item.pointsAgainst }} · 净胜 {{ entry.item.difference }}</view></view><text class="bm-tag">{{ entry.item.wins }} 胜 {{ entry.item.losses }} 负</text></view><view v-if="!section.rows.length" class="bm-muted">暂无选手数据</view></view>
          <view v-if="owner" :style="sectionStyle(4)"><BmButton variant="secondary" :loading="busy && !claimingPlayerId && !releaseOperation" :disabled="locked || !tabInteractive" @click="loadAudits">查看操作记录</BmButton></view>
        </template>
      </view></view>
      </view>
    </view>
    </view>
    </view>
    </scroll-view>
    <view v-if="detail" class="bm-dock" :style="dockStyle" :aria-hidden="backgroundBlocked" :inert="backgroundBlocked ? true : undefined"><view class="bm-dock-inner" :style="sectionStyle(4, 'fade')"><button v-if="owner" class="bm-icon-button bm-more-button" :disabled="locked || backgroundBlocked" aria-label="更多操作" @click="openPanel('more')" :hover-class="locked || backgroundBlocked ? 'none' : 'bm-touch'" :hover-stay-time="80"><view class="bm-more-icon" aria-hidden="true"><view class="bm-more-dot" /><view class="bm-more-dot" /><view class="bm-more-dot" /></view></button><view class="bm-dock-main"><BmButton :loading="busy && !claimingPlayerId && !releaseOperation" :disabled="locked || backgroundBlocked" @click="primaryAction">{{ primaryLabel }}</BmButton></view></view></view>
    <BmSheet :model-value="panelOpen" :title="panelTitle" :content-key="displayedPanel" :busy="busy" :covered="!!confirmation" @close="closePanel" @closed="panelClosed">
      <view :style="panelContainerStyle"><view id="detail-panel-content" :style="panelStyle" :aria-hidden="!panelInteractive || !panelOpen">
      <template v-if="displayedPanel === 'more'"><button v-if="detail?.match.status === 'draft'" class="bm-option" :disabled="panelLocked" @click="openPanel('edit')" :hover-class="panelLocked ? 'none' : 'bm-touch'" :hover-stay-time="80">修改球局配置 →</button><button v-if="canInvite" class="bm-option" :disabled="panelLocked" @click="openPanel('invite')" :hover-class="panelLocked ? 'none' : 'bm-touch'" :hover-stay-time="80">邀请球友 →</button><button v-if="detail?.match.status === 'scheduled'" class="bm-option" :disabled="panelLocked" @click="transition('clear')" :hover-class="panelLocked ? 'none' : 'bm-touch'" :hover-stay-time="80">清除排赛，重新安排</button><button v-if="canInvite" class="bm-option" :disabled="panelLocked" @click="openReason('match')" :hover-class="panelLocked ? 'none' : 'bm-touch'" :hover-stay-time="80">取消球局</button><button v-if="detail && ['draft', 'scheduled'].includes(detail.match.status)" class="bm-option" :disabled="panelLocked" @click="transition('delete')" :hover-class="panelLocked ? 'none' : 'bm-touch'" :hover-stay-time="80">删除球局</button></template>
      <template v-if="displayedPanel === 'player'"><view class="bm-heading">{{ selectedPlayer?.name }}</view><view class="bm-muted">编号 {{ (selectedPlayer?.position ?? 0) + 1 }}</view><button v-if="selectedPlayer?.userId" class="bm-option" :disabled="panelLocked" @click="claim(selectedPlayer.id, true)" :hover-class="panelLocked ? 'none' : 'bm-touch'" :hover-stay-time="80">解除账号认领</button><button v-if="detail?.match.status === 'draft' && selectedPlayer" class="bm-option" :disabled="panelLocked" @click="removePlayer(selectedPlayer.id)" :hover-class="panelLocked ? 'none' : 'bm-touch'" :hover-stay-time="80">移出名单</button></template>
      <template v-if="displayedPanel === 'invite'"><view class="bm-muted">分享给球友，登录后认领名单。重置会使旧邀请失效。</view><BmButton :loading="busy" :disabled="panelLocked" @click="invite">{{ inviteToken ? '重置邀请' : '生成邀请' }}</BmButton><view v-if="inviteRendered" class="bm-divider" :style="inviteStyle" :aria-hidden="!inviteToken">
        <!-- #ifdef MP-WEIXIN -->
        <button class="bm-button dark" open-type="share" :disabled="panelLocked || !inviteToken" :hover-class="panelLocked || !inviteToken ? 'none' : 'bm-pressed'" :hover-stay-time="80">分享给微信好友</button>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <BmButton variant="dark" :disabled="panelLocked || !inviteToken" @click="copyInvite">复制邀请链接</BmButton>
        <!-- #endif -->
      </view></template>
      <MatchForm v-if="displayedPanel === 'edit' && detail" :key="editKey" :initial="detail.match" :busy="panelLocked" @dirty="panelDirty = $event" @submit="saveConfig" />
      <PairEditor v-if="displayedPanel === 'pairs' && detail" :key="editKey" :players="detail.players" :busy="panelLocked" @dirty="panelDirty = $event" @save="savePairs" />
      <template v-if="displayedPanel === 'preview' && preview"><text class="bm-heading">{{ preview.games.length }} 局 · {{ preview.rounds.length }} 轮</text><view class="bm-muted">确认保存后可以开始球局。</view><view class="bm-row bm-section"><text v-for="person in preview.appearances" :key="person.playerId" class="bm-tag">{{ person.name }} · {{ person.count }} 局</text></view><view v-for="round in previewRounds" :key="round.number" class="bm-divider"><text class="bm-heading">第 {{ round.number }} 轮</text><view v-for="game in round.games" :key="game.sequence" class="bm-muted">{{ game.court }} 号场：{{ teamName(game.teamA) }} vs {{ teamName(game.teamB) }}</view><view class="bm-muted">轮休：{{ teamName(round.resting) || '无' }}</view></view><view class="bm-section"><BmButton :loading="busy" :disabled="panelLocked" @click="generate">确认，保存排赛</BmButton></view></template>
      <template v-if="displayedPanel === 'reason'"><view class="bm-muted">已完成的比分与积分结算保留，未完成对局的助威投入将退回，取消对局不计战绩。</view><text class="bm-label">取消原因</text><BmField multiline v-model="cancelReason" label="取消原因" maxlength="500" :disabled="panelLocked" placeholder="向球友说明原因" /><view class="bm-section"><BmButton variant="danger" :loading="busy" :disabled="panelLocked || !cancelReason.trim()" @click="cancelTarget">确认取消</BmButton></view></template>
      <template v-if="displayedPanel === 'audits'"><view v-if="!audits.length" class="bm-muted">暂无操作记录</view><view v-for="audit in audits" :key="audit.id" class="bm-divider"><text class="bm-heading">{{ auditLabel(audit.action) }}</text><view class="bm-muted">{{ dateLabel(audit.createdAt) }}</view><view v-if="audit.detail?.before" class="bm-muted">{{ audit.detail.before.scoreA ?? '—' }} : {{ audit.detail.before.scoreB ?? '—' }} → {{ audit.detail.after.scoreA ?? '—' }} : {{ audit.detail.after.scoreB ?? '—' }}</view><view v-if="audit.detail?.reason" class="bm-muted">{{ audit.detail.reason }}</view><view class="bm-muted">操作人：{{ audit.actorId }}</view></view></template>
      <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}<BmButton v-if="needsRefresh" small variant="secondary" :disabled="busy || loading || !error" @click="recover">刷新数据，重新操作</BmButton></view>
      </view></view>
    </BmSheet>
    <BmSheet ref="scoreSheet" :model-value="scoreOpen" :title="scoreGame?.status === 'completed' ? '纠正最终比分' : '这局比分是多少？'" :busy="busy" :shared="!!sourceRect" :covered="!!confirmation" @ready="scoreReady" @close="requestCloseScore" @layout-change="invalidateShared" @closed="scoreClosed">
      <view v-if="scoreGame?.status === 'completed'" class="bm-muted">改变获胜方会同步调整助威积分；原奖励不足扣回时记为待抵扣积分。</view>
      <template v-if="scoreGame"><view id="score-destination" :style="flying ? 'opacity:0' : ''"><ScoreBoard :team-a="teamName(scoreGame.teamA)" :team-b="teamName(scoreGame.teamB)" :score-a="scoreGame.scoreA" :score-b="scoreGame.scoreB" /></view><view v-if="scoreGame.status === 'completed'" class="bm-muted">原比分如上，请填写新的最终结果。</view><view class="bm-row" style="flex-wrap:nowrap"><view class="bm-score-side"><text class="bm-label">A 方最终分</text><BmField v-model="scoreA" :invalid="scoreAttempted && invalidScore(scoreA, scoreB)" label="A 方最终分" variant="score" type="number" maxlength="3" :disabled="scoreLocked" :adjust-position="false" /></view><text class="bm-versus">:</text><view class="bm-score-side"><text class="bm-label">B 方最终分</text><BmField v-model="scoreB" :invalid="scoreAttempted && invalidScore(scoreB, scoreA)" label="B 方最终分" variant="score" type="number" maxlength="3" :disabled="scoreLocked" :adjust-position="false" /></view></view><view class="bm-muted" style="margin-top:16rpx">支持 0 分，不允许平局；请与对方确认后提交。</view><template v-if="scoreGame.status === 'completed'"><text class="bm-label">纠错原因</text><BmField multiline v-model="scoreReason" :invalid="scoreAttempted && !scoreReason.trim()" label="纠错原因" maxlength="500" :disabled="scoreLocked" :adjust-position="false" /></template><view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}</view><view class="bm-section"><BmButton :loading="busy" :disabled="scoreLocked" @click="submitScore">确认双方比分</BmButton><BmButton v-if="needsRefresh" variant="secondary" :disabled="scoreLocked" @click="recover">刷新数据，重新录入</BmButton></view></template>
    </BmSheet>
    <view v-if="flying && scoreGame" class="bm-score-proxy" :style="proxyStyle" aria-hidden="true"><ScoreBoard :team-a="teamName(scoreGame.teamA)" :team-b="teamName(scoreGame.teamB)" :score-a="scoreGame.scoreA" :score-b="scoreGame.scoreB" /></view>
    <CheerSheet :model-value="cheerOpen" :match-id="matchId" :game="cheerGame" :market="cheerGame ? cheerMarkets[cheerGame.id] : undefined" :team-a="teamName(cheerGame?.teamA || [])" :team-b="teamName(cheerGame?.teamB || [])" @close="cheerOpen = false" @busy="cheerBusy = $event" @refresh="refreshCheers" />
    <BmConfirm :message="confirmation" @answer="answer" />
  </view>
</template>
<script setup lang="ts">
import BmField from "@/components/badminton/BmField.vue";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { matchSnapshot } from "@/composables/useMatchPresentation";
import { api } from "@/api/competition";
import { pointsApi } from "@/api/points";
import type { CheerMarket } from "@/types/points";
import CheerCard from "@/components/badminton/CheerCard.vue";
import CheerSheet from "@/components/badminton/CheerSheet.vue";
import { useUserStore } from "@/store/modules/user";
import { dateLabel, modeLabels, statusLabels, toLogin } from "@/utils/navigation";
import { reducedMotion, sharedMatch, useLayoutMotion, type MotionRect } from "@/composables/useMotion";
import { useSharedElement } from "@/composables/useSharedElement";
import { useSheetBackground } from "@/composables/useSheetBackground";
import { useLoadingMotion, useMotionList, usePageMotion, usePresence, useSwitchMotion } from "@/composables/useMotionState";
import { useConfirm } from "@/composables/useConfirm";
import type { CompetitionSummary, Detail, Game, MatchInput, Preview } from "@/types/competition";
import BmButton from "@/components/badminton/BmButton.vue"; import BmSheet from "@/components/badminton/BmSheet.vue"; import BmSegments from "@/components/badminton/BmSegments.vue"; import BmState from "@/components/badminton/BmState.vue"; import BmConfirm from "@/components/badminton/BmConfirm.vue"; import MatchForm from "@/components/badminton/MatchForm.vue"; import PairEditor from "@/components/badminton/PairEditor.vue"; import ScoreBoard from "@/components/badminton/ScoreBoard.vue";
const props = withDefaults(defineProps<{ id: string; invite?: string; initial?: CompetitionSummary; embedded?: boolean; heroHidden?: boolean; freezeHeader?: boolean; active?: boolean }>(), { active: true });
const emit = defineEmits<{ ready: []; deleted: [] }>();
const initialSummary = ref(props.initial);
const scrollTop = ref(0), refreshing = ref(false);
let scrollPosition = 0;
const user = useUserStore(), { measure, cancel: cancelFlip } = useLayoutMotion(), { proxyStyle, flying, fly, cancel: cancelShared } = useSharedElement(), { confirmation, ask, answer } = useConfirm();
const { pageStyle, sectionStyle } = usePageMotion();
const matchId = ref(props.id), token = ref(props.invite || ""), inviteToken = ref(""), detail = ref<Detail | null>(null), preview = ref<Preview | null>(null), tab = ref("info"), gameFilter = ref("all"), busy = ref(false), loading = ref(false), error = ref(""), needsRefresh = ref(false), playerName = ref(""), notice = ref(""), highlighted = ref("");
const claimingPlayerId = ref("");
const releaseOperation = ref(0);
let releaseSequence = 0, releaseLoadingVisible = false, mutationSequence = 0, pageAlive = true;
const panel = ref(""), panelOpen = ref(false), panelDirty = ref(false), editKey = ref(0), selectedPlayerId = ref(""), reasonTarget = ref(""), cancelReason = ref(""), audits = ref<Awaited<ReturnType<typeof api.audits>>>([]);
const scoreSheet = ref<InstanceType<typeof BmSheet> | null>(null);
const cheerMarkets = ref<Record<string, CheerMarket>>({}), cheerError = ref(""), cheerLoading = ref(false), cheerOpen = ref(false), cheerBusy = ref(false), cheerGameId = ref(""), pageVisible = ref(false);
const cheerGame = computed(() => detail.value?.games.find(game => game.id === cheerGameId.value) || null);
function hideReleaseLoading() {
  if (!releaseLoadingVisible) return;
  releaseLoadingVisible = false;
  uni.hideLoading();
}
watch([releaseOperation, pageVisible], ([operation, visible]) => {
  if (operation && visible && pageAlive) {
    if (releaseLoadingVisible) return;
    releaseLoadingVisible = true;
    uni.hideKeyboard();
    uni.showLoading({ title: "正在解除认领", mask: true });
  } else hideReleaseLoading();
}, { flush: "sync" });
let cheerTimer: ReturnType<typeof setTimeout> | undefined, cheerRevision = 0;
const scoreGame = ref<Game | null>(null), scoreOpen = ref(false), scoreA = ref(""), scoreB = ref(""), scoreReason = ref(""), sourceRect = ref<MotionRect>(), destinationRect = ref<MotionRect>(); let scoreSnapshot = "", openingScore = false, closingScore = false, scoreTicket = 0, revision = 0, presentationRevision = 0, lastSession = "";
const { backgroundStyle, dockStyle, backgroundBlocked, geometryStable } = useSheetBackground(
  () => panelOpen.value || scoreOpen.value || cheerOpen.value || !!confirmation.value,
  { selector: "#match-detail-background", preserveGeometry: () => scoreOpen.value || flying.value },
);
watch(confirmation, value => { if (value && scoreOpen.value) invalidateShared(); });
let noticeTimer: ReturnType<typeof setTimeout> | undefined, highlightTimer: ReturnType<typeof setTimeout> | undefined;
const owner = computed(() => !!detail.value?.permissions.manage), locked = computed(() => busy.value || releaseOperation.value !== 0 || loading.value || needsRefresh.value || cheerOpen.value || cheerBusy.value), canInvite = computed(() => !!detail.value && !["finished", "cancelled"].includes(detail.value.match.status));
const { loadingRendered, loadingStyle, contentStyle, containerStyle: loadingContainerStyle } = useLoadingMotion(() => loading.value && !detail.value, () => !!detail.value, { get selector() { return geometryStable.value ? ".bm-detail-loading" : undefined; } });
const tabMotion = useSwitchMotion(() => tab.value, { order: () => ["info", "games", "results"], selector: "#detail-tab-content" });
const { displayed: displayedTab, style: tabStyle, containerStyle: tabContainerStyle, interactive: tabInteractive } = tabMotion;
const filterMotion = useSwitchMotion(() => gameFilter.value, { selector: "#detail-game-results" });
const { displayed: displayedFilter, style: filterStyle, containerStyle: filterContainerStyle, interactive: filterInteractive } = filterMotion;
const panelMotion = useSwitchMotion(() => panel.value, { selector: "#detail-panel-content" });
const { displayed: displayedPanel, style: panelStyle, containerStyle: panelContainerStyle, interactive: panelInteractive } = panelMotion;
const panelLocked = computed(() => locked.value || !panelInteractive.value || !panelOpen.value);
const scoreLocked = computed(() => locked.value || !scoreOpen.value);
const { rendered: noticeRendered, displayed: displayedNotice, style: noticeStyle } = usePresence(() => notice.value);
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => error.value, { immediate: () => !detail.value });
const { rendered: openingErrorRendered, displayed: displayedOpeningError, style: openingErrorStyle } = usePresence(() => !detail.value ? error.value : "", { immediate: () => !user.token });
const { rendered: inviteRendered, style: inviteStyle } = usePresence(() => !!inviteToken.value, { immediate: () => !detail.value });
const canAddPlayer = computed(() => owner.value && detail.value?.match.status === "draft");
const { rendered: addPlayerRendered, style: addPlayerStyle } = usePresence(() => canAddPlayer.value, { immediate: () => !owner.value });
const resetMotionKey = () => `${user.token}:${matchId.value}`;
const playerMotion = useMotionList(() => detail.value?.players || [], player => player.id, { enabled: () => !backgroundBlocked.value && !!detail.value && displayedTab.value === "info" && tabInteractive.value, resetKey: resetMotionKey, selector: ".bm-detail-player", idPrefix: "player-" });
const personalMotion = useMotionList(() => detail.value?.stats || [], row => row.id, { enabled: () => !backgroundBlocked.value && !!detail.value && displayedTab.value === "results" && tabInteractive.value, resetKey: resetMotionKey, selector: ".bm-detail-personal", idPrefix: "personal-" });
const teamMotion = useMotionList(() => detail.value?.teamStats || [], row => row.id, { enabled: () => !backgroundBlocked.value && !!detail.value && displayedTab.value === "results" && tabInteractive.value, resetKey: resetMotionKey, selector: ".bm-detail-team", idPrefix: "team-" });
const { rows: playerRows } = playerMotion;
const summary = computed(() => {
  // Freeze the text while its measured proxy is in flight.
  if (props.freezeHeader && !error.value && initialSummary.value) return initialSummary.value;
  return detail.value?.match || (!error.value && (initialSummary.value || sharedMatch.value)?.id === matchId.value ? (initialSummary.value || sharedMatch.value) : null);
});
const headerTransition = computed(() => {
  // #ifdef H5
  return "view-transition-name:bm-match;";
  // #endif
  return "";
});
const myPlayer = computed(() => detail.value?.players.find(p => p.userId === user.userInfo?.id)), selectedPlayer = computed(() => detail.value?.players.find(p => p.id === selectedPlayerId.value));
const tabs = [{ value: "info", label: "名单" }, { value: "games", label: "对局" }, { value: "results", label: "战绩" }], gameFilters = [{ value: "all", label: "全部" }, { value: "pending", label: "待录分" }, { value: "completed", label: "已完成" }, { value: "mine", label: "我的" }];
const panelTitle = computed(() => (({ more: "组织球局", player: "球友管理", invite: "邀请球友", edit: "修改配置", pairs: "选择固定搭档", preview: "看看怎么打", reason: "取消说明", audits: "操作记录" } as Record<string, string>)[displayedPanel.value] || "球局"));
const completedCount = computed(() => detail.value?.games.filter(g => g.status === "completed").length || 0), pendingCount = computed(() => detail.value?.games.filter(g => g.status === "pending").length || 0);
const statSections = computed(() => detail.value ? [{ key: "personal", title: "个人排名", rows: personalMotion.rows.value }, ...(detail.value.match.mode === "fixed" ? [{ key: "team", title: "固定搭档排名", rows: teamMotion.rows.value }] : [])] : []);
const previewRounds = computed(() => preview.value?.rounds.map(round => ({ ...round, games: preview.value!.games.filter(g => g.round === round.number) })) || []);
const rounds = computed(() => { const d = detail.value; if (!d) return []; return [...new Set(d.games.map(g => g.round))].map(number => { const all = d.games.filter(g => g.round === number), ids = all.flatMap(g => [...g.teamA, ...g.teamB]); const games = all.filter(g => displayedFilter.value === "all" || (displayedFilter.value === "mine" ? !!myPlayer.value && [...g.teamA, ...g.teamB].includes(myPlayer.value.id) : g.status === displayedFilter.value)); return { number, games, resting: d.players.filter(p => !ids.includes(p.id)).map(p => p.id) }; }).filter(round => round.games.length); });
const primaryLabel = computed(() => { const status = detail.value?.match.status; if (owner.value && status === "draft") return "预览排赛 →"; if (owner.value && status === "scheduled") return "准备好了，开始球局"; if (owner.value && status === "active" && !pendingCount.value) return "结束球局，查看战绩"; if (status === "active" && detail.value?.permissions.recordGameIds.length) return "录入一场比分"; if (status === "finished" || status === "cancelled") return "查看本场战绩"; return "查看对局安排"; });
function teamName(ids: string[]) { return ids.map(id => detail.value?.players.find(p => p.id === id)?.name || "未知选手").join(" / "); }
function partnerName(id: string) { const player = detail.value?.players.find(p => p.id === id); return detail.value?.players.find(p => p.id !== id && p.pairKey === player?.pairKey)?.name || "待配对"; }
function canScore(game: Game) { return !!detail.value?.permissions.recordGameIds.includes(game.id) || (owner.value && game.status === "completed"); }
const cheersVisible = computed(() => pageVisible.value && !!detail.value && !!user.token && (tab.value === "games" || cheerOpen.value) && !scoreOpen.value && !panelOpen.value);
function openCheer(game: Game) { if (locked.value) return; cheerGameId.value = game.id; cheerOpen.value = true; }
async function refreshCheers() {
  clearTimeout(cheerTimer);
  if (!cheersVisible.value) return;
  const current = ++cheerRevision, session = user.token, id = matchId.value;
  cheerLoading.value = true;
  try {
    const result = await pointsApi.markets(id);
    if (current !== cheerRevision || session !== user.token || id !== matchId.value) return;
    cheerMarkets.value = Object.fromEntries(result.map(market => [market.gameId, market])); cheerError.value = "";
  } catch (cause: any) {
    if (current !== cheerRevision || session !== user.token) return;
    cheerError.value = cause.message || "助威信息暂时无法读取";
    if (cause.code === 403) { error.value = cause.message; detail.value = null; sharedMatch.value = null; clearPrivatePresentation(); }
  } finally {
    if (current === cheerRevision) {
      cheerLoading.value = false;
      if (cheersVisible.value && detail.value?.match.status === "active") cheerTimer = setTimeout(refreshCheers, 10000);
    }
  }
}
watch(cheersVisible, visible => {
  clearTimeout(cheerTimer);
  if (visible) void refreshCheers();
  else { cheerRevision++; cheerLoading.value = false; }
});
function feedback(message: string) { clearTimeout(noticeTimer); notice.value = message; noticeTimer = setTimeout(() => { notice.value = ""; }, 1800); }
function changeTab(value: string) { if (releaseOperation.value || backgroundBlocked.value) return; invalidateShared(); uni.hideKeyboard(); tab.value = value; }
function setGameFilter(value: string) { if (releaseOperation.value || backgroundBlocked.value) return; invalidateShared(); gameFilter.value = value; }
function openPanel(value: string) { if (locked.value) return; uni.hideKeyboard(); panel.value = value; if (!panelOpen.value) panelMotion.cancel(); panelOpen.value = true; panelDirty.value = false; error.value = ""; }
async function closePanel() { if (busy.value) return; if ((panelDirty.value || (panel.value === "reason" && cancelReason.value.trim())) && !await ask("放弃本次尚未保存的修改？")) return; panelOpen.value = false; panelDirty.value = false; }
function panelClosed() { if (!panelOpen.value) { panel.value = ""; panelMotion.cancel(); } }
watch(displayedPanel, () => { editKey.value++; });
watch(panelOpen, open => { if (!open) { uni.hideKeyboard(); panelMotion.cancel(); } });
function clearPrivatePresentation() {
  presentationRevision++;
  cheerRevision++; clearTimeout(cheerTimer); cheerLoading.value = false; cheerMarkets.value = {}; cheerError.value = ""; cheerOpen.value = false; cheerBusy.value = false; cheerGameId.value = "";
  panelOpen.value = false; panelDirty.value = false; panel.value = ""; preview.value = null; audits.value = []; inviteToken.value = "";
  scoreOpen.value = false; scoreGame.value = null; selectedPlayerId.value = ""; playerName.value = ""; cancelReason.value = "";
  scoreA.value = ""; scoreB.value = ""; scoreReason.value = ""; notice.value = ""; highlighted.value = "";
  clearTimeout(noticeTimer); clearTimeout(highlightTimer); uni.hideKeyboard(); invalidateShared();
  panelMotion.cancel(); tabMotion.cancel(); filterMotion.cancel(); playerMotion.cancel(); personalMotion.cancel(); teamMotion.cancel();
}
watch(() => user.token, (session, previous) => { if (session !== previous) { initialSummary.value = undefined; revision++; mutationSequence++; loading.value = false; busy.value = false; claimingPlayerId.value = ""; releaseOperation.value = 0; openingScore = false; detail.value = null; sharedMatch.value = null; clearPrivatePresentation(); } }, { flush: "sync" });
function managePlayer(id: string) { if (locked.value) return; selectedPlayerId.value = id; openPanel("player"); }
async function load() {
  const current = ++revision, session = user.token;
  if (session !== lastSession) { detail.value = null; clearPrivatePresentation(); lastSession = session; }
  loading.value = true;
  try {
    await user.restore();
    if (token.value) { const result = await api.redeem(token.value); matchId.value = result.id; token.value = ""; }
    if (!matchId.value) throw new Error("球局链接不完整，请重新打开邀请");
    const result = await api.detail(matchId.value);
    if (current !== revision || session !== user.token) return;
    const previousDetail = detail.value, previousPermissions = previousDetail?.permissions;
    detail.value = result;
    const scoringRevoked = previousPermissions?.recordGameIds.some(id => !result.permissions.recordGameIds.includes(id) && previousDetail?.games.find(game => game.id === id)?.status === result.games.find(game => game.id === id)?.status);
    if (previousPermissions && ((previousPermissions.manage && !result.permissions.manage) || (previousPermissions.claim && !result.permissions.claim) || scoringRevoked)) clearPrivatePresentation();
    needsRefresh.value = false;
    if (pageVisible.value && (tab.value === "games" || cheerOpen.value)) void refreshCheers();
  } finally { if (current === revision) loading.value = false; }
}
async function reload() { if (busy.value || loading.value || panelOpen.value || scoreOpen.value || cheerOpen.value) return; if (!user.token) { toLogin(); return; } error.value = ""; try { await load(); } catch (e: any) { error.value = e.message; needsRefresh.value = true; if (e.code === 401 || e.code === 403) { detail.value = null; sharedMatch.value = null; clearPrivatePresentation(); } } }
async function recover() { if (busy.value || loading.value) return; if ((panelDirty.value || scoreOpen.value) && !await ask("刷新会关闭当前面板，请依据最新数据重新操作。继续？")) return; panelOpen.value = false; scoreOpen.value = false; panelDirty.value = false; invalidateShared(); await reload(); }
async function run(action: () => Promise<unknown>, done?: () => void | Promise<void>) {
  if (!pageAlive || locked.value) return;
  busy.value = true; error.value = "";
  const ticket = ++mutationSequence, session = user.token, currentMatchId = matchId.value, presentation = presentationRevision;
  const current = () => pageAlive && ticket === mutationSequence && session === user.token && currentMatchId === matchId.value;
  let saved = false;
  try {
    await action();
    if (!current()) return;
    saved = true;
    await load();
    if (!current() || !detail.value) return;
    preview.value = null; panelDirty.value = false;
    if (presentation === presentationRevision) await done?.();
    if (current() && pageVisible.value) feedback("已保存");
  } catch (e: any) {
    if (!current()) return;
    error.value = saved ? "操作已保存，但刷新失败，请刷新数据后继续" : e.message;
    if (saved || e.code === 409) needsRefresh.value = true;
    if (e.code === 401 || e.code === 403) { detail.value = null; sharedMatch.value = null; clearPrivatePresentation(); }
  } finally {
    if (current()) busy.value = false;
  }
}
function saveConfig(input: MatchInput) { if (detail.value) run(() => api.update(matchId.value, { ...input, version: detail.value!.match.version }), () => { panelOpen.value = false; }); }
function addPlayer() { if (!playerName.value.trim() || !detail.value) return; run(() => api.addPlayer(matchId.value, playerName.value.trim(), detail.value!.match.version), () => { playerName.value = ""; }); }
async function removePlayer(id: string) { if (locked.value || !await ask("移除此选手？已有认领也会解除。")) return; run(() => api.removePlayer(matchId.value, id, detail.value!.match.version), () => { panelOpen.value = false; }); }
async function claim(id: string, release = false) {
  if (locked.value) return;
  const session = user.token, currentMatchId = matchId.value;
  if (!await ask(release ? "解除此选手的账号绑定？" : "确认这是你本人？每场只能认领一位。") || !pageAlive || !pageVisible.value || locked.value || session !== user.token || currentMatchId !== matchId.value || !detail.value) return;
  const releaseTicket = release ? ++releaseSequence : 0;
  if (!release) claimingPlayerId.value = id;
  try {
    await run(() => {
      if (release) releaseOperation.value = releaseTicket;
      return api.claim(currentMatchId, id, release);
    }, () => { panelOpen.value = false; });
  } finally {
    if (releaseTicket && releaseOperation.value === releaseTicket) releaseOperation.value = 0;
    if (session === user.token && currentMatchId === matchId.value && claimingPlayerId.value === id) claimingPlayerId.value = "";
  }
}
function savePairs(pairs: string[][]) { run(() => api.pairs(matchId.value, pairs, detail.value!.match.version), () => { panelOpen.value = false; }); }
async function previewSchedule() { if (locked.value) return; busy.value = true; error.value = ""; const session = user.token; try { const result = await api.preview(matchId.value); if (session !== user.token || !owner.value) return; preview.value = result; panel.value = "preview"; if (!panelOpen.value) panelMotion.cancel(); panelOpen.value = true; } catch (e: any) { error.value = e.message; } finally { busy.value = false; } }
function generate() { const version = preview.value?.version; if (version === undefined) return; run(() => api.generate(matchId.value, version), () => { panelOpen.value = false; tab.value = "games"; }); }
async function transition(action: string) { const messages: Record<string, string> = { start: "开始后名单和对阵将锁定，确定开赛？", finish: "所有对局已处理，确定结束球局？", clear: "清除未开赛对局，返回名单编辑？", delete: "确定删除尚未开赛的球局？" }; if (locked.value || !await ask(messages[action])) return; if (action === "delete") { busy.value = true; try { await api.action(matchId.value, action, detail.value!.match.version); if (props.embedded) emit("deleted"); else uni.switchTab({ url: "/pages/schedule/index" }); } catch (e: any) { error.value = e.message; } finally { busy.value = false; } } else run(() => api.action(matchId.value, action, detail.value!.match.version), () => { panelOpen.value = false; if (action === "finish") tab.value = "results"; }); }
async function invite() { if (locked.value || !await ask("生成新邀请会使旧邀请失效，已认领球友不受影响。继续？")) return; const session = user.token; run(async () => { const result = await api.invite(matchId.value); if (session === user.token && owner.value) inviteToken.value = result.token; }); }
function copyInvite() {
  // #ifdef H5
  const root = window.location.href.split("#")[0]; uni.setClipboardData({ data: `${root}#/pages/matchDetails/index?invite=${inviteToken.value}`, fail: () => { error.value = "复制失败，请重试"; } });
  // #endif
}
async function primaryAction() { if (locked.value || !detail.value) return; const status = detail.value.match.status; if (owner.value && status === "draft") return previewSchedule(); if (owner.value && status === "scheduled") return transition("start"); if (owner.value && status === "active" && !pendingCount.value) return transition("finish"); if (["finished", "cancelled"].includes(status)) { changeTab("results"); return; } changeTab("games"); gameFilter.value = "all"; const game = detail.value.games.find(g => detail.value!.permissions.recordGameIds.includes(g.id)); if (game) { tabMotion.cancel(); filterMotion.cancel(); await nextTick(); openScore(game); } }
const scoreAttempted = ref(false);
function invalidScore(value: string, other: string) { return !/^\d+$/.test(value) || Number(value) > 999 || (other.trim() !== "" && Number(value) === Number(other)); }
function scoreValues() { return JSON.stringify([scoreA.value, scoreB.value, scoreReason.value]); }
async function openScore(game: Game) {
  if (locked.value || openingScore || scoreOpen.value) return;
  const session = user.token, presentation = presentationRevision;
  if (game.status === "pending" && !game.cheeringClosedAt) {
    openingScore = true;
    const confirmed = !!cheerMarkets.value[game.id]?.closedAt || await ask("结束本局助威并开始录分？确认后立即停止购买，关闭录分面板也不会重新开放。");
    openingScore = false;
    if (!confirmed || locked.value || session !== user.token || !pageVisible.value) return;
    busy.value = true; error.value = ""; let closed = false;
    try {
      await pointsApi.close(matchId.value, game.id, game.version); closed = true;
      if (session !== user.token || presentation !== presentationRevision) return;
      await load();
      if (session !== user.token || presentation !== presentationRevision || !pageVisible.value) return;
      const fresh = detail.value?.games.find(item => item.id === game.id);
      if (!fresh || !canScore(fresh)) throw new Error("本局状态或录分权限已更新，请查看最新对局");
      game = fresh;
    } catch (cause: any) {
      if (session === user.token && presentation === presentationRevision) {
        error.value = closed ? "助威已结束，但数据刷新失败，请刷新后继续录分" : cause.message;
        needsRefresh.value = closed || cause.code === 409;
      }
      return;
    } finally { if (session === user.token) busy.value = false; }
  }
  if (locked.value || session !== user.token || !pageVisible.value) return;
  openingScore = true; const current = ++scoreTicket;
  const [rect] = geometryStable.value ? await measure(`#score-${game.id}`) : [];
  openingScore = false;
  if (current !== scoreTicket || locked.value || session !== user.token) return;
  sourceRect.value = geometryStable.value ? rect : undefined; scoreGame.value = { ...game }; scoreA.value = game.scoreA === null ? "" : String(game.scoreA); scoreB.value = game.scoreB === null ? "" : String(game.scoreB); scoreReason.value = ""; scoreAttempted.value = false; scoreSnapshot = scoreValues(); error.value = ""; scoreOpen.value = true;
}
async function scoreReady() { const current = scoreTicket; await nextTick(); const destination = (await scoreSheet.value?.measure("#score-destination"))?.[0] || (await measure("#score-destination"))[0]; if (current === scoreTicket && scoreOpen.value) { destinationRect.value = destination; void fly(sourceRect.value, destination); } }
function invalidateShared() { scoreTicket++; sourceRect.value = undefined; destinationRect.value = undefined; closingScore = false; cancelShared(); cancelFlip(); }
function closeScore() {
  if (closingScore) return; closingScore = true;
  const closingId = scoreGame.value?.id, current = ++scoreTicket;
  const stillVisible = rounds.value.some(round => round.games.some(game => game.id === closingId));
  const flight = fly(stillVisible ? destinationRect.value : undefined, stillVisible ? sourceRect.value : undefined);
  scoreOpen.value = false; uni.hideKeyboard();
  // Saving and closing do not wait for the presentation animation.
  void flight.finally(() => { if (current === scoreTicket) closingScore = false; });
}
async function requestCloseScore() { if (busy.value || closingScore) return; if (scoreValues() !== scoreSnapshot && !await ask("比分尚未提交，放弃本次输入？")) return; await closeScore(); }
function scoreClosed() { if (!scoreOpen.value) { scoreGame.value = null; cancelShared(); } }
function submitScore() { const game = scoreGame.value; if (!game || locked.value) return; scoreAttempted.value = true; const a = Number(scoreA.value), b = Number(scoreB.value); if (!/^\d+$/.test(scoreA.value) || !/^\d+$/.test(scoreB.value) || a > 999 || b > 999 || a === b) { error.value = "双方比分须为 0–999 的整数，且不能平局"; return; } if (game.status === "completed" && !scoreReason.value.trim()) { error.value = "请填写纠错原因"; return; } run(() => api.score(matchId.value, game.id, { version: game.version, scoreA: a, scoreB: b, reason: scoreReason.value.trim() }), async () => { scoreGame.value = { ...game, scoreA: a, scoreB: b }; await closeScore(); highlighted.value = game.id; clearTimeout(highlightTimer); highlightTimer = setTimeout(() => { highlighted.value = ""; }, 700); }); }
function openReason(target: string) { if (locked.value) return; reasonTarget.value = target; cancelReason.value = ""; openPanel("reason"); }
function cancelTarget() { const d = detail.value; if (!d || !cancelReason.value.trim()) return; if (reasonTarget.value === "match") run(() => api.action(matchId.value, "cancel", d.match.version, cancelReason.value.trim()), () => { panelOpen.value = false; }); else { const game = d.games.find(g => g.id === reasonTarget.value); if (game) run(() => api.cancelGame(matchId.value, game.id, game.version, cancelReason.value.trim()), () => { panelOpen.value = false; }); } }
async function loadAudits() { if (locked.value) return; busy.value = true; error.value = ""; const session = user.token; try { const result = await api.audits(matchId.value); if (session !== user.token || !owner.value) return; audits.value = result; panel.value = "audits"; if (!panelOpen.value) panelMotion.cancel(); panelOpen.value = true; } catch (e: any) { error.value = e.message; } finally { busy.value = false; } }
function auditLabel(action: string) { return ({ create: "创建球局", update: "修改配置", add: "新增选手", remove: "移除选手", pairs: "设置搭档", claim: "认领选手", unclaim: "解除认领", reset_invitation: "重置邀请", schedule: "确认排赛", clear: "清除排赛", start: "开始球局", finish: "结束球局", cancel: "取消球局", cancel_game: "取消对局", close_cheering: "结束本局助威", submit_score: "提交比分", correct_score: "纠正比分" } as Record<string, string>)[action] || action; }
let firstResume = true;
function resume() {
  if (props.active === false) return;
  pageVisible.value = true;
  const alreadyLoaded = firstResume && (detail.value || loading.value || error.value);
  firstResume = false;
  if (!alreadyLoaded) void reload();
}
function suspend() { pageVisible.value = false; clearTimeout(cheerTimer); cheerRevision++; cheerLoading.value = false; invalidateShared(); clearTimeout(noticeTimer); clearTimeout(highlightTimer); notice.value = ""; highlighted.value = ""; uni.hideKeyboard(); }
function share() { return { title: detail.value?.match.name ? `${detail.value.match.name} · 羽你同场` : "羽你同场", path: inviteToken.value ? `/pages/matchDetails/index?invite=${inviteToken.value}` : "/pages/index/index" }; }
async function requestBack() {
  if (busy.value) return false;
  if (confirmation.value) { answer(false); return false; }
  if (scoreOpen.value) { await requestCloseScore(); return false; }
  if (panelOpen.value) { await closePanel(); return false; }
  if (cheerOpen.value) { cheerOpen.value = false; return false; }
  return true;
}
watch(() => props.active, active => { if (active) resume(); else suspend(); });
onMounted(async () => { await nextTick(); emit("ready"); if (props.active) resume(); else void reload(); });
function detailScrolled(event: { detail: { scrollTop: number } }) { scrollPosition = event.detail.scrollTop; invalidateShared(); }
async function refreshDetail() { refreshing.value = true; try { await reload(); } finally { refreshing.value = false; } }
async function measureHero() { return matchSnapshot(await measure(".bm-share-node"), true); }
async function restoreHeader() {
  scrollTop.value = scrollPosition;
  await nextTick();
  scrollTop.value = 0;
  await nextTick();
  // Let the native scroll-view apply its offset before querying viewport rects.
  await new Promise<void>(resolve => setTimeout(resolve, 64));
  return pageAlive ? measureHero() : null;
}
function getSummary() { return detail.value ? { ...detail.value.match, _count: { players: detail.value.players.length, games: detail.value.games.length } } : summary.value; }
defineExpose({ resume, suspend, reload, share, requestBack, invalidateShared, measureHero, restoreHeader, getSummary });
onUnmounted(() => { pageAlive = false; mutationSequence++; revision++; cheerRevision++; releaseOperation.value = 0; hideReleaseLoading(); claimingPlayerId.value = ""; clearTimeout(cheerTimer); invalidateShared(); clearTimeout(noticeTimer); clearTimeout(highlightTimer); });
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.bm-detail-loading { position: relative; }
.bm-detail-embedded { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.bm-detail-scroll { flex: 1; height: 0; min-height: 0; }
.bm-detail-scroll-content { padding-bottom: 40rpx; }
.bm-detail-embedded > .bm-dock { position: relative; flex: 0 0 auto; bottom: auto; left: auto; right: auto; }
#bm-share-location, #bm-share-mode { line-height: 1.5; }
.bm-icon-button.bm-more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex: 0 0 88rpx;
  padding: 0;
  line-height: normal;
}
.bm-more-icon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 36rpx;
  height: 8rpx;
  pointer-events: none;
}
.bm-more-dot {
  flex: 0 0 8rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: currentColor;
}
.bm-detail-player .bm-more-button {
  background: transparent;
}
.bm-detail-player .bm-more-icon {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  padding: 0 17rpx;
  border-radius: $bm-radius;
  background: $bm-soft;
  transition: background-color $bm-motion-press $bm-ease, transform $bm-motion-press $bm-ease;
}
.bm-detail-player .bm-more-dot {
  flex-basis: 6rpx;
  width: 6rpx;
  height: 6rpx;
}
.bm-detail-player .bm-more-button.bm-touch .bm-more-icon {
  background: $bm-line;
  transform: scale(.94);
}
.is-reduced .bm-detail-player .bm-more-button .bm-more-icon {
  transition: none;
  transform: none;
}
</style>



