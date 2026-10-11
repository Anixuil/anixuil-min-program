<template>
  <section>
    <div v-if="!selectedId" class="surface table-surface">
      <form class="toolbar" @submit.prevent="load(1)">
        <ElInput v-model.trim="search" :prefix-icon="Search" placeholder="搜索球局名称、地点" aria-label="搜索球局" clearable />
        <ElSelect v-model="status" aria-label="球局状态"><ElOption value="" label="全部状态" /><ElOption v-for="s in ['draft', 'scheduled', 'active', 'finished', 'cancelled']" :key="s" :value="s" :label="label(s)" /></ElSelect>
        <ElButton native-type="submit" type="primary" :loading="loading" :icon="Search">查询</ElButton><span class="spacer" /><ElButton v-if="canWrite" native-type="button" type="primary" :icon="Plus" @click="openEditor(false)">发起球局</ElButton>
      </form>
      <State :loading="loading" :error="error" :empty="!rows.length" @retry="load(page)" />
      <ElTable v-if="!loading && !error && rows.length" :data="rows" row-key="id" class="data-table">
        <ElTableColumn label="球局 / 地点" min-width="240"><template #default="{ row }"><strong>{{ row.name || row.id }}</strong><small class="cell-id">{{ row.location }}</small></template></ElTableColumn>
        <ElTableColumn label="组织者" min-width="140"><template #default="{ row }">{{ row.ownerName || row.userId }}</template></ElTableColumn>
        <ElTableColumn label="赛制" min-width="120"><template #default="{ row }">{{ label(row.badmintonMode) }}</template></ElTableColumn>
        <ElTableColumn label="状态" min-width="100"><template #default="{ row }"><ElTag :type="statusType(row.badmintonStatus)" effect="light">{{ label(row.badmintonStatus) }}</ElTag></template></ElTableColumn>
        <ElTableColumn label="选手 / 对局" min-width="130"><template #default="{ row }">{{ row._count.player }} 人 / {{ row._count.matchGame }} 局</template></ElTableColumn>
        <ElTableColumn label="开始时间" min-width="180"><template #default="{ row }">{{ date(row.planStartTime) }}</template></ElTableColumn>
        <ElTableColumn label="操作" width="112" fixed="right"><template #default="{ row }"><ElButton link type="primary" @click="openDetail(row.id)">管理球局 →</ElButton></template></ElTableColumn>
      </ElTable>
      <Pager :total="total" :page="page" :busy="loading" @change="load" />
    </div>
    <template v-else>
      <div class="detail-back"><ElButton :disabled="busy || detailLoading" :icon="ArrowLeft" @click="back">返回球局列表</ElButton><ElButton :disabled="busy" :loading="detailLoading" :icon="Refresh" @click="loadDetail">刷新详情</ElButton></div>
      <State :loading="detailLoading" :error="detailError" @retry="loadDetail" />
      <template v-if="detail && !detailLoading && !detailError">
        <div class="match-heading surface">
          <div><ElTag :type="statusType(detail.match.status)" effect="light">{{ label(detail.match.status) }}</ElTag><h2>{{ detail.match.name || detail.match.id }}</h2><p>{{ detail.match.location }} · {{ label(detail.match.mode) }} · {{ detail.match.courtCount }} 块场地</p><p class="muted">{{ date(detail.match.startsAt) }} — {{ date(detail.match.endsAt) }}</p></div>
          <div v-if="canWrite" class="actions wrap">
            <ElButton v-if="detail.match.status === 'draft'" :disabled="busy" @click="openEditor(true)">编辑配置</ElButton>
            <ElButton v-if="detail.match.status === 'draft'" :disabled="busy" @click="previewSchedule">预览排赛</ElButton>
            <ElButton v-if="detail.match.status === 'draft'" type="primary" :disabled="busy" @click="confirm('schedule')">生成排赛</ElButton>
            <template v-if="detail.match.status === 'scheduled'"><ElButton :disabled="busy" @click="confirm('clear')">清除排赛</ElButton><ElButton type="primary" :disabled="busy" @click="confirm('start')">开始球局</ElButton></template>
            <ElButton v-if="detail.match.status === 'active'" type="primary" :disabled="busy" @click="confirm('finish')">结束球局</ElButton>
            <ElButton v-if="['draft', 'scheduled', 'active'].includes(detail.match.status)" type="danger" plain :disabled="busy" @click="confirm('cancel')">取消球局</ElButton>
            <ElButton v-if="['draft', 'scheduled'].includes(detail.match.status)" type="danger" plain :disabled="busy" @click="confirm('delete')">删除球局</ElButton>
            <ElButton :disabled="busy" @click="confirm('revoke-links')">撤销分享与邀请</ElButton>
            <ElButton v-if="!['finished', 'cancelled'].includes(detail.match.status)" :disabled="busy" @click="confirm('invitation')">查看邀请信息</ElButton>
            <ElButton v-if="detail.match.status === 'finished'" :disabled="busy" @click="confirm('result-share')">查看战绩分享</ElButton>
          </div>
        </div>
        <ElAlert v-if="success" :title="success" type="success" show-icon :closable="false" />
        <ElTabs v-model="tab" class="tabs" @tab-change="selectTab(String($event))"><ElTabPane v-for="t in tabs" :key="t.id" :name="t.id" :label="t.name" /></ElTabs>
        <div class="surface table-surface">
          <template v-if="tab === 'players'">
            <div class="toolbar"><p class="muted">{{ detail.players.length }} 位选手 · 账号认领与搭档关系</p><span class="spacer" /><template v-if="canWrite && detail.match.status === 'draft'"><ElButton :icon="Plus" @click="confirm('add-player')">添加选手</ElButton><ElButton v-if="detail.match.mode === 'fixed'" @click="openPairs">设置固定搭档</ElButton></template></div>
            <ElTable :data="detail.players" row-key="id" class="data-table">
              <ElTableColumn label="选手" min-width="160"><template #default="{ row: player }"><strong>{{ player.name || player.id }}</strong></template></ElTableColumn>
              <ElTableColumn label="关联账号" min-width="180"><template #default="{ row: player }">{{ player.userNickname || player.userId || '未认领' }}</template></ElTableColumn>
              <ElTableColumn label="搭档" min-width="140"><template #default="{ row: player }">{{ partnerName(player) }}</template></ElTableColumn>
              <ElTableColumn label="操作" width="180" fixed="right"><template #default="{ row: player }"><div class="actions"><ElButton v-if="canWrite && player.userId && !['finished', 'cancelled'].includes(detail.match.status)" link type="primary" @click="confirm('release', undefined, player.id)">解除认领</ElButton><ElButton v-if="canWrite && detail.match.status === 'draft'" link type="danger" @click="confirm('remove-player', undefined, player.id)">移除</ElButton></div></template></ElTableColumn>
            </ElTable>
          </template>
          <template v-if="tab === 'games'">
            <div class="toolbar"><p class="muted">共 {{ detail.games.length }} 局</p><span class="spacer" /><ElSelect v-model="gameStatus" aria-label="筛选对局"><ElOption value="" label="全部对局" /><ElOption value="pending" label="待完成" /><ElOption value="completed" label="已完成" /><ElOption value="cancelled" label="已取消" /></ElSelect></div>
            <ElTable :data="filteredGames" row-key="id" class="data-table">
              <ElTableColumn label="局次" width="76"><template #default="{ row: game }">#{{ game.sequence }}</template></ElTableColumn>
              <ElTableColumn label="轮次 / 场地" min-width="110"><template #default="{ row: game }">{{ game.round }} / {{ game.court }}</template></ElTableColumn>
              <ElTableColumn label="A 方" min-width="170"><template #default="{ row: game }">{{ team(game.teamA) }}</template></ElTableColumn>
              <ElTableColumn label="比分" min-width="100" align="center"><template #default="{ row: game }"><strong class="score">{{ game.scoreA ?? '—' }} : {{ game.scoreB ?? '—' }}</strong></template></ElTableColumn>
              <ElTableColumn label="B 方" min-width="170"><template #default="{ row: game }">{{ team(game.teamB) }}</template></ElTableColumn>
              <ElTableColumn label="状态" min-width="160"><template #default="{ row: game }"><ElTag :type="statusType(game.status)" effect="light">{{ label(game.status) }}</ElTag><small v-if="game.dataIssue" class="cell-id error">{{ game.dataIssue }}</small></template></ElTableColumn>
              <ElTableColumn label="操作" :width="canScore ? 210 : 90" fixed="right"><template #default="{ row: game }"><div v-if="canScore" class="actions wrap"><ElButton v-if="game.status === 'completed' || game.status === 'pending' && detail.match.status === 'active'" link type="primary" :disabled="game.recordable === false" @click="confirm('score', game)">{{ game.status === 'completed' ? '纠错' : '录分' }}</ElButton><template v-if="game.status === 'pending' && detail.match.status === 'active'"><ElButton v-if="!game.cheeringClosedAt" link type="primary" @click="confirm('close-cheering', game)">结束助威</ElButton><ElButton link type="danger" @click="confirm('cancel-game', game)">取消对局</ElButton></template></div><span v-else class="muted">只读</span></template></ElTableColumn>
            </ElTable>
          </template>
          <template v-if="tab === 'stats'">
            <div class="toolbar"><h3>比赛排名</h3><span class="spacer" /><ElSelect v-if="detail.match.mode === 'fixed'" v-model="rankingMode" aria-label="统计方式"><ElOption value="players" label="个人" /><ElOption value="teams" label="搭档" /></ElSelect></div>
            <ElTable :data="ranking || []" row-key="id" class="data-table">
              <ElTableColumn prop="rank" label="排名" width="80" />
              <ElTableColumn label="选手 / 搭档" min-width="200"><template #default="{ row }"><strong>{{ row.name || row.id }}</strong></template></ElTableColumn>
              <ElTableColumn prop="played" label="出场" min-width="80" />
              <ElTableColumn label="胜 / 负" min-width="100"><template #default="{ row }">{{ row.wins }} / {{ row.losses }}</template></ElTableColumn>
              <ElTableColumn label="得分 / 失分" min-width="120"><template #default="{ row }">{{ row.pointsFor }} / {{ row.pointsAgainst }}</template></ElTableColumn>
              <ElTableColumn prop="difference" label="净胜分" min-width="100" />
              <ElTableColumn label="胜率" min-width="100"><template #default="{ row }">{{ (row.winRate * 100).toFixed(1) }}%</template></ElTableColumn>
            </ElTable>
            <p class="hint inset">排名由后端按有效完赛结果计算。</p>
          </template>
          <template v-if="tab === 'audits'">
            <State :loading="auditLoading" :error="auditError" :empty="!audits.length" @retry="loadAudits" />
            <ElTimeline v-if="!auditLoading && !auditError && audits.length" class="audit-timeline"><ElTimelineItem v-for="audit in audits" :key="audit.id" :timestamp="date(audit.createdAt)" placement="top"><strong>{{ label(audit.action) }}</strong><small class="cell-id">{{ audit.actorName || audit.actorId }}</small><pre>{{ displayValue(audit.detail, 'detail', audit) }}</pre></ElTimelineItem></ElTimeline>
          </template>
        </div>
      </template>
    </template>
    <Modal :open="editorOpen" :title="editing ? '编辑球局' : '发起球局'" :busy="busy" wide @close="editorOpen = false"><MatchEditor v-if="editorOpen" :initial="editing ? detail?.match : undefined" :busy="busy" :error="modalError" @save="saveMatch" /></Modal>
    <Modal :open="!!action" :title="actionTitles[action] || '管理操作'" :busy="busy" @close="action = ''">
      <form @submit.prevent="execute">
        <p class="muted">{{ actionDescription }}</p>
        <div v-if="action === 'score'" class="form-grid"><label class="field"><span>A 方得分</span><ElInput v-model="scoreA" type="number" min="0" max="999" required :disabled="busy" /></label><label class="field"><span>B 方得分</span><ElInput v-model="scoreB" type="number" min="0" max="999" required :disabled="busy" /></label></div>
        <label v-if="action === 'add-player'" class="field"><span>选手名称</span><ElInput v-model.trim="playerName" required maxlength="80" :disabled="busy" /></label>
        <template v-if="action === 'pairs'"><div v-for="(_, index) in pairs" :key="index" class="pair-row"><span>第 {{ index + 1 }} 组</span><ElSelect v-model="pairs[index][0]" :disabled="busy" aria-label="第一位选手" placeholder="选择选手"><ElOption v-for="player in detail?.players" :key="player.id" :value="player.id" :label="player.name || player.id" /></ElSelect><ElSelect v-model="pairs[index][1]" :disabled="busy" aria-label="第二位选手" placeholder="选择选手"><ElOption v-for="player in detail?.players" :key="player.id" :value="player.id" :label="player.name || player.id" /></ElSelect></div><p class="hint">每位选手必须出现且只能出现一次。</p></template>
        <label v-if="needsReason" class="field"><span>操作原因</span><ElInput v-model.trim="reason" type="textarea" required maxlength="500" :rows="3" show-word-limit :disabled="busy" /></label>
        <ElAlert v-if="modalError" :title="modalError" type="error" show-icon :closable="false" />
        <div class="form-actions"><ElButton native-type="button" :disabled="busy" @click="action = ''">返回</ElButton><ElButton native-type="submit" type="primary" :loading="busy">确认操作</ElButton></div>
      </form>
    </Modal>
    <Modal :open="!!preview" title="排赛预览" wide @close="preview = null">
      <template v-if="preview"><p>共 {{ preview.games.length }} 局，确认生成前不会改变正式赛程。</p><ElTable :data="preview.games" row-key="sequence"><ElTableColumn label="轮次 / 场地" min-width="110"><template #default="{ row: game }">{{ game.round }} / {{ game.court }}</template></ElTableColumn><ElTableColumn label="A 方" min-width="180"><template #default="{ row: game }">{{ team(game.teamA) }}</template></ElTableColumn><ElTableColumn label="B 方" min-width="180"><template #default="{ row: game }">{{ team(game.teamB) }}</template></ElTableColumn></ElTable></template>
    </Modal>
    <Modal :open="!!share" title="分享信息" @close="share = null"><template v-if="share"><p>球局：{{ detail?.match.name || share.matchId }}</p><label class="field"><span>分享凭证</span><ElInput :model-value="share.token" readonly @focus="($event.target as HTMLInputElement).select()" /></label><p class="hint">该凭证用于小程序对应的邀请或战绩分享入口。撤销分享与邀请后失效。</p></template></Modal>
  </section>
</template>
<script setup lang="ts">
import { ElAlert, ElButton, ElInput, ElOption, ElSelect, ElTabPane, ElTable, ElTableColumn, ElTabs, ElTag, ElTimeline, ElTimelineItem } from "element-plus";
import { ArrowLeft, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { computed, onMounted, ref } from "vue"; import { can, request, query, message, date, label, type Identity, type Page } from "../api"; import type { Detail, Game } from "../../../src/types/competition";
import { displayValue, type DisplayNames } from "../display";
import Modal from "../components/Modal.vue"; import State from "../components/State.vue"; import Pager from "../components/Pager.vue"; import MatchEditor from "../components/MatchEditor.vue";
type AdminGame = Game & { recordable?: boolean; dataIssue?: string }; type AdminDetail = Omit<Detail, 'games' | 'players'> & { games: AdminGame[]; players: (Detail['players'][number] & { userNickname?: string })[] };
interface Row { id: string; name: string; location: string; ownerName: string; userId: string; badmintonMode: string; badmintonStatus: string; planStartTime: string; _count: { player: number; matchGame: number } }
const props = defineProps<{ identity: Identity }>(); const canWrite = computed(() => can(props.identity, "bm:match:write"));
const canScore = computed(() => can(props.identity, "bm:match:score"));
const rows = ref<Row[]>([]), total = ref(0), page = ref(1), search = ref(""), status = ref(""), loading = ref(false), error = ref(""), busy = ref(false), success = ref("");
const selectedId = ref(""), detail = ref<AdminDetail>(), detailLoading = ref(false), detailError = ref(""), tab = ref("players"), gameStatus = ref(""), rankingMode = ref("players"), editorOpen = ref(false), editing = ref(false), modalError = ref("");
const action = ref(""), selectedGame = ref<AdminGame>(), selectedPlayer = ref(""), scoreA = ref("21"), scoreB = ref("0"), reason = ref(""), playerName = ref(""), pairs = ref<string[][]>([]), preview = ref<{ games: Game[] } | null>(null), share = ref<{ matchId: string; token: string } | null>(null);
const audits = ref<{ id: string; action: string; actorId: string; actorName: string; createdAt: string; detail: unknown; displayNames?: DisplayNames }[]>([]), auditLoading = ref(false), auditError = ref("");
const tabs = [{ id: "players", name: "参赛名单" }, { id: "games", name: "对局与比分" }, { id: "stats", name: "战绩统计" }, { id: "audits", name: "变更记录" }];
const actionTitles: Record<string, string> = { schedule: "生成排赛", clear: "清除排赛", start: "开始球局", finish: "结束球局", cancel: "取消球局", delete: "删除球局", score: "录分 / 比分纠错", "cancel-game": "取消对局", "close-cheering": "结束助威", "add-player": "添加选手", "remove-player": "移除选手", release: "解除认领", pairs: "设置固定搭档", "revoke-links": "撤销分享与邀请", invitation: "查看邀请信息", "result-share": "查看战绩分享" };
const actionDescription = computed(() => action.value === "cancel" || action.value === "cancel-game" ? "取消未完成对局后，对应待结算的助威订单会自动退款。" : action.value === "score" ? "请核对最终比分。已完成对局的纠错会重新计算战绩，并调整助威结算积分。" : action.value === "revoke-links" ? "旧邀请、邀请访问授权与公开战绩凭证将同时失效，已绑定选手仍保留球局访问权。" : action.value === "delete" ? "删除后球局将从列表隐藏。仅未开赛球局可删除。" : "操作将依据最新球局状态执行，并记录操作者。数据有变化时请刷新后重试。");
const needsReason = computed(() => ["cancel", "cancel-game", "score", "revoke-links"].includes(action.value));
const filteredGames = computed(() => detail.value?.games.filter(game => !gameStatus.value || game.status === gameStatus.value) || []), ranking = computed(() => rankingMode.value === "teams" ? detail.value?.teamStats : detail.value?.stats);
const statusType = (status: string) => ["active", "finished", "completed"].includes(status) ? "success" : ["draft", "scheduled", "pending"].includes(status) ? "warning" : "info";
const team = (ids: string[]) => ids.map(id => detail.value?.players.find(player => player.id === id)?.name || id).join(" / ");
const partnerName = (player: AdminDetail["players"][number]) => { const partner = detail.value?.players.find(item => item.id !== player.id && item.pairKey && item.pairKey === player.pairKey); return partner ? partner.name || partner.id : "—"; };
async function load(next = page.value) { if (loading.value) return; loading.value = true; error.value = ""; try { const result = await request<Page<Row>>(`/admin/matches?${query({ page: next, q: search.value, status: status.value })}`); rows.value = result.list; total.value = result.total; page.value = next; } catch (e) { error.value = message(e); } finally { loading.value = false; } }
async function openDetail(id: string) { selectedId.value = id; detail.value = undefined; audits.value = []; auditError.value = ""; auditLoading.value = false; rankingMode.value = "players"; tab.value = "players"; success.value = ""; gameStatus.value = ""; await loadDetail(); }
async function loadDetail() { const id = selectedId.value; detailLoading.value = true; detailError.value = ""; try { const result = await request<AdminDetail>(`/admin/matches/${id}`); if (id === selectedId.value) detail.value = result; } catch (e) { if (id === selectedId.value) detailError.value = message(e); } finally { if (id === selectedId.value) detailLoading.value = false; } }
function back() { selectedId.value = ""; detail.value = undefined; void load(); }
function openEditor(edit: boolean) { editing.value = edit; modalError.value = ""; editorOpen.value = true; }
async function saveMatch(body: Record<string, unknown>) { if (busy.value) return; busy.value = true; modalError.value = ""; try { const result = editing.value ? await request<{ id: string }>(`/admin/matches/${selectedId.value}/commands`, "POST", { action: "update", body }) : await request<{ id: string }>("/admin/matches", "POST", body); editorOpen.value = false; await openDetail(result.id); } catch (e) { modalError.value = message(e); } finally { busy.value = false; } }
function confirm(next: string, game?: AdminGame, playerId = "") { if (busy.value) return; action.value = next; selectedGame.value = game; selectedPlayer.value = playerId; scoreA.value = String(game?.scoreA ?? 21); scoreB.value = String(game?.scoreB ?? 0); reason.value = ""; playerName.value = ""; modalError.value = ""; }
function openPairs() { if (!detail.value) return; pairs.value = []; const used = new Set<string>(); for (const player of detail.value.players) { if (used.has(player.id)) continue; const partner = detail.value.players.find(p => p.id !== player.id && !used.has(p.id) && p.pairKey && p.pairKey === player.pairKey); pairs.value.push([player.id, partner?.id || ""]); used.add(player.id); if (partner) used.add(partner.id); } if (pairs.value.length !== detail.value.players.length / 2) pairs.value = Array.from({ length: Math.ceil(detail.value.players.length / 2) }, () => ["", ""]); confirm("pairs"); }
async function execute() {
  if (busy.value || !detail.value) return;
  if (needsReason.value && (!reason.value.trim() || reason.value.length > 500)) { modalError.value = "请填写 1–500 字的操作原因。"; return; }
  if (action.value === "score" && [scoreA.value, scoreB.value].some(value => !value.trim() || !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 999)) { modalError.value = "双方得分必须为 0–999 的整数。"; return; }
  if (action.value === "add-player" && (!playerName.value.trim() || playerName.value.length > 80)) { modalError.value = "请填写 1–80 字的选手名称。"; return; }
  if (action.value === "pairs") {
    const ids = pairs.value.flat(), playerIds = new Set(detail.value.players.map(player => player.id));
    if (ids.length !== playerIds.size || new Set(ids).size !== ids.length || ids.some(id => !playerIds.has(id))) { modalError.value = "每位选手必须出现且只能出现一次，请检查搭档配置。"; return; }
  }
  busy.value = true; modalError.value = ""; const currentAction = action.value; try { let body: Record<string, unknown> = { version: selectedGame.value?.version ?? detail.value.match.version }; if (needsReason.value) body.reason = reason.value; if (currentAction === "score") { body.scoreA = Number(scoreA.value); body.scoreB = Number(scoreB.value); } if (currentAction === "add-player") body.name = playerName.value; if (currentAction === "pairs") body.pairs = pairs.value; if (["release", "invitation", "result-share"].includes(currentAction)) body = {}; const result = await request<{ matchId: string; token: string }>(`/admin/matches/${selectedId.value}/commands`, "POST", { action: currentAction, body, ...(selectedGame.value ? { gameId: selectedGame.value.id } : {}), ...(selectedPlayer.value ? { playerId: selectedPlayer.value } : {}) }); action.value = ""; success.value = `${actionTitles[currentAction]}已完成。`; if (currentAction === "delete") back(); else { await loadDetail(); if (tab.value === "audits") await loadAudits(); } if (["invitation", "result-share"].includes(currentAction)) share.value = result; } catch (e) { modalError.value = message(e); } finally { busy.value = false; } }
async function previewSchedule() { if (detailLoading.value) return; detailLoading.value = true; try { preview.value = await request<{ games: Game[] }>(`/admin/matches/${selectedId.value}/preview`); } catch (e) { detailError.value = message(e); } finally { detailLoading.value = false; } }
async function selectTab(value: string) { tab.value = value; if (value === "audits") await loadAudits(); }
async function loadAudits() { if (auditLoading.value) return; const id = selectedId.value; auditLoading.value = true; auditError.value = ""; try { const result = await request<typeof audits.value>(`/admin/matches/${id}/audits`); if (id === selectedId.value) audits.value = result; } catch (e) { if (id === selectedId.value) auditError.value = message(e); } finally { if (id === selectedId.value) auditLoading.value = false; } } onMounted(() => load(1));
</script>




<style scoped>
.audit-timeline { padding: 24px 24px 8px 40px; }
.audit-timeline pre { margin: 10px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--muted); font-size: 12px; }
.pair-row { display: grid; grid-template-columns: 64px minmax(0, 1fr) minmax(0, 1fr); gap: 10px; align-items: center; margin: 12px 0; }
@media (max-width: 520px) { .pair-row { grid-template-columns: 1fr 1fr; } .pair-row > span { grid-column: 1 / -1; } }
</style>
