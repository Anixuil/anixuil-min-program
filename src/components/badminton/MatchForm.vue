<template>
  <view :class="{ 'is-reduced': reducedMotion }">
    <view :style="sectionStyle(1)">
      <BmSegments :model-value="String(step)" :items="steps" :disabled="busy" @update:model-value="go(Number($event))" />
      <view class="bm-progress"><view class="bm-progress-bar" :style="progressStyle" /></view>
    </view>
    <view class="bm-form-stage" :style="stepContainerStyle">
    <view id="match-step-content" class="bm-form-content" :style="stepStyle" :aria-hidden="!stepInteractive">
      <view v-if="displayedStep === 0">
        <view class="bm-form-heading" :style="sectionStyle(2)"><text class="bm-heading">先约好时间和地点</text><view class="bm-muted">让球友一眼知道去哪里、几点见。</view></view>
        <view :style="sectionStyle(3)">
        <view id="field-name"><text class="bm-label">球局名称</text><BmField :adjust-position="!initial" v-model="form.name" :invalid="field === 'name'" label="球局名称" maxlength="100" placeholder="例如：周六晚，一起挥拍" :disabled="busy || !stepInteractive" /><text v-if="errors.name.rendered" class="bm-field-error" :style="errors.name.style">{{ errors.name.displayed }}</text></view>
        <view id="field-location"><text class="bm-label">地点</text><BmField :adjust-position="!initial" v-model="form.location" :invalid="field === 'location'" label="地点" maxlength="200" placeholder="球馆名称 / 地址" :disabled="busy || !stepInteractive" /><text v-if="errors.location.rendered" class="bm-field-error" :style="errors.location.style">{{ errors.location.displayed }}</text></view>
        </view>
        <view id="field-time" :style="sectionStyle(4)"><text class="bm-label">开始时间</text><view class="bm-date-row"><view class="bm-date-picker"><BmPicker v-model="startDate" mode="date" label="开始日期" :disabled="busy || !stepInteractive" :invalid="field === 'time'" /></view><view class="bm-time-picker"><BmPicker v-model="startTime" mode="time" label="开始时间" :disabled="busy || !stepInteractive" :invalid="field === 'time'" /></view></view>
        <text class="bm-label">结束时间</text><view class="bm-date-row"><view class="bm-date-picker"><BmPicker v-model="endDate" mode="date" label="结束日期" :disabled="busy || !stepInteractive" :invalid="field === 'time'" /></view><view class="bm-time-picker"><BmPicker v-model="endTime" mode="time" label="结束时间" :disabled="busy || !stepInteractive" :invalid="field === 'time'" /></view></view><text v-if="errors.time.rendered" class="bm-field-error" :style="errors.time.style">{{ errors.time.displayed }}</text></view>
        <view :style="sectionStyle(4, 'fade')"><text class="bm-label">备注 · 可选</text><BmField multiline :adjust-position="!initial" v-model="form.description" label="备注" maxlength="1000" :disabled="busy || !stepInteractive" placeholder="集合说明、费用、需要带什么…" /></view>
      </view>
      <view v-if="displayedStep === 1">
        <view class="bm-form-heading" :style="sectionStyle(2)"><text class="bm-heading">今天怎么打？</text><view class="bm-muted">选择适合大家的方式，稍后可以预览对阵。</view></view>
        <view :style="sectionStyle(3)">
        <button v-for="mode in modes" :key="mode.value" class="bm-option" :class="{ selected: form.mode === mode.value }" :disabled="busy || !stepInteractive" :hover-class="busy || !stepInteractive ? 'none' : 'bm-touch'" @click="form.mode = mode.value"><view class="bm-row bm-between"><text class="bm-heading">{{ mode.label }}</text><text>{{ form.mode === mode.value ? '●' : '○' }}</text></view><view class="bm-muted">{{ mode.description }}</view></button>
        </view>
        <view :style="sectionStyle(4)">
        <view id="field-courts"><text class="bm-label">场地数量 · 1–8 片</text><BmField :adjust-position="!initial" v-model="courts" :invalid="field === 'courts'" label="场地数量" type="number" :disabled="busy || !stepInteractive" /><text v-if="errors.courts.rendered" class="bm-field-error" :style="errors.courts.style">{{ errors.courts.displayed }}</text></view>
        <view v-if="gamesRendered" class="bm-reveal bm-form-reveal" :class="{ 'is-visible': gamesVisible }" :style="gamesStyle" :aria-hidden="form.mode !== 'rotation'"><view id="match-games-content" style="overflow:hidden"><view id="field-games"><text class="bm-label">计划总局数 · 1–200 局</text><BmField :adjust-position="!initial" v-model="gameCount" :invalid="field === 'games'" label="计划总局数" type="number" :disabled="busy || !stepInteractive || !gamesVisible || form.mode !== 'rotation'" /><text v-if="errors.games.rendered" class="bm-field-error" :style="errors.games.style">{{ errors.games.displayed }}</text></view></view></view>
        </view>
      </view>
      <view v-if="displayedStep === 2">
        <view class="bm-form-heading" :style="sectionStyle(2)"><text class="bm-heading">{{ initial ? '确认球局配置' : '把球友们加进来' }}</text><view class="bm-muted">{{ initial ? '保存后再预览排赛。' : '先记名字，创建后分享给球友认领。同名也没关系。' }}</view></view>
        <template v-if="!initial">
          <view :style="sectionStyle(3)">
          <view id="field-players" class="bm-row bm-nowrap" style="margin-top:24rpx"><view class="bm-grow"><BmField :adjust-position="!initial" v-model="newName" :invalid="field === 'players'" label="球友姓名" maxlength="80" placeholder="球友姓名" :disabled="busy || !stepInteractive" confirm-type="done" @confirm="addName" /></view><BmButton small :disabled="busy || !stepInteractive || !newName.trim()" @click="addName">添加</BmButton></view>
          <text v-if="errors.players.rendered" class="bm-field-error" :style="errors.players.style">{{ errors.players.displayed }}</text>
          <button class="bm-text-button" :disabled="busy || !stepInteractive" :hover-class="busy || !stepInteractive ? 'none' : 'bm-touch'" @click="bulkOpen = !bulkOpen">{{ bulkOpen ? '收起批量输入 ↑' : '从已有名单批量粘贴 ↓' }}</button>
          <view v-if="bulkRendered" class="bm-reveal bm-form-reveal" :class="{ 'is-visible': bulkVisible }" :style="bulkStyle" :aria-hidden="!bulkOpen"><view id="match-bulk-content" style="overflow:hidden"><BmField multiline :adjust-position="!initial" v-model="bulk" label="批量球友名单，用空格或换行分隔" maxlength="2600" :placeholder="namesPlaceholder" :disabled="busy || !stepInteractive || !bulkVisible || !bulkOpen" /><view class="bm-muted bm-bulk-hint">多人用空格或换行分隔；姓名含空格请用上方单人添加。</view><view class="bm-field-action"><BmButton small variant="secondary" :disabled="busy || !stepInteractive || !bulkVisible || !bulkOpen || !bulk.trim()" @click="addBulk">加入名单</BmButton></view></view></view>
          </view>
          <view :style="sectionStyle(4, 'fade')">
          <view v-for="row in nameRows" :id="`draft-${row.key}`" :key="row.key" class="bm-person bm-draft-person" :style="row.style" :aria-hidden="row.leaving"><view class="bm-avatar">{{ row.item.position }}</view><text class="bm-grow bm-person-name">{{ row.item.name }}</text><button class="bm-icon-button" :disabled="busy || !stepInteractive || row.leaving" aria-label="移除选手" :hover-class="busy || !stepInteractive || row.leaving ? 'none' : 'bm-touch'" @click="!row.leaving && removeName(row.item.id)">×</button></view>
          </view>
        </template>
        <view class="bm-card" :style="sectionStyle(4)"><text class="bm-eyebrow">确认这场约定</text><text class="bm-heading" style="margin-top:16rpx">{{ form.name }}</text><view class="bm-muted">{{ form.location }}</view><view class="bm-muted">{{ startDate }} {{ startTime }} — {{ endDate }} {{ endTime }}</view><view class="bm-divider bm-row"><text class="bm-tag">{{ modeLabel }}</text><text class="bm-tag">{{ courts }} 片场地</text><text v-if="!initial" class="bm-tag">{{ names.length }} 人</text><text v-if="form.mode === 'rotation'" class="bm-tag">{{ gameCount }} 局</text></view></view>
      </view>
    </view>
    </view>
    <view :class="initial ? 'bm-actions' : 'bm-dock'" :style="!initial ? `bottom:${keyboardHeight}px` : ''"><view class="bm-dock-inner bm-grow" :style="sectionStyle(4, 'fade')"><view v-if="backRendered" class="bm-dock-back" :style="backStyle" :aria-hidden="step === 0"><BmButton variant="secondary" :disabled="busy || step === 0" @click="go(step - 1)">上一步</BmButton></view><view class="bm-dock-main"><BmButton :loading="busy" :disabled="!stepInteractive" @click="next">{{ step < 2 ? '下一步 →' : initial ? '保存配置' : '确认，发起球局' }}</BmButton></view></view></view>
  </view>
</template>
<script setup lang="ts">
import { useReveal } from "@/composables/useReveal";
import { useMotionList, usePageMotion, usePresence, useSwitchMotion } from "@/composables/useMotionState";
import BmPicker from "./BmPicker.vue";
import BmField from "@/components/badminton/BmField.vue";
import { computed, nextTick, reactive, ref, watch } from "vue";
import type { Competition, MatchInput, MatchMode } from "@/types/competition";
import { reducedMotion, useLayoutMotion, useKeyboard } from "@/composables/useMotion";
import BmButton from "./BmButton.vue"; import BmSegments from "./BmSegments.vue";
const props = defineProps<{ initial?: Competition; busy: boolean }>();
const emit = defineEmits<{ (e: "submit", input: MatchInput & { players?: string[] }): void; (e: "dirty", value: boolean): void }>();
const { scrollIntoView } = useLayoutMotion();
const { sectionStyle } = usePageMotion();
const keyboardHeight = useKeyboard();
const steps = [{ value: "0", label: "01 基本信息" }, { value: "1", label: "02 比赛方式" }, { value: "2", label: "03 确认" }];
const modes: { label: string; value: MatchMode; description: string }[] = [{ label: "双打轮转", value: "rotation", description: "4–16 人 · 换搭档，尽量均衡出场" }, { label: "固搭循环", value: "fixed", description: "至少 2 队 · 固定搭档，每两队交手一次" }, { label: "单打循环", value: "single", description: "2–32 人 · 每两位球友交手一次" }];
const form = reactive({ name: props.initial?.name || "", location: props.initial?.location || "", description: props.initial?.description || "", mode: (props.initial?.mode || "rotation") as MatchMode });
const parts = (d: Date) => ({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` });
const start = parts(props.initial ? new Date(props.initial.startsAt) : new Date(Date.now() + 3600000)), end = parts(props.initial ? new Date(props.initial.endsAt) : new Date(Date.now() + 10800000));
const startDate = ref(start.date), startTime = ref(start.time), endDate = ref(end.date), endTime = ref(end.time), courts = ref(String(props.initial?.courtCount || 1)), gameCount = ref(String(props.initial?.gameCount || 12));
const step = ref(0), error = ref(""), field = ref(""), names = ref<{ id: number; name: string }[]>([]), newName = ref(""), bulk = ref(""), bulkOpen = ref(false); let sequence = 0;
const { displayed: displayedStep, style: stepStyle, containerStyle: stepContainerStyle, interactive: stepInteractive } = useSwitchMotion(() => step.value, { order: () => [0, 1, 2], selector: "#match-step-content" });
const { rendered: gamesRendered, visible: gamesVisible, style: gamesStyle } = useReveal(() => displayedStep.value === 1 && form.mode === "rotation", { selector: "#match-games-content" });
const { rendered: bulkRendered, visible: bulkVisible, style: bulkStyle } = useReveal(() => displayedStep.value === 2 && !props.initial && bulkOpen.value, { selector: "#match-bulk-content" });
const { rendered: backRendered, style: backStyle } = usePresence(() => step.value > 0);
const { rows: nameRows } = useMotionList(() => names.value.map((person, index) => ({ ...person, position: index + 1 })), person => person.id, { enabled: () => displayedStep.value === 2 && !props.initial, resetKey: () => displayedStep.value, selector: ".bm-draft-person", idPrefix: "draft-" });
const fieldError = (key: string) => usePresence(() => field.value === key ? error.value : "");
const errors = reactive({ name: fieldError("name"), location: fieldError("location"), time: fieldError("time"), courts: fieldError("courts"), games: fieldError("games"), players: fieldError("players") });
watch(step, () => uni.hideKeyboard(), { flush: "sync" });
watch(() => form.mode === "rotation", open => { if (!open) uni.hideKeyboard(); }, { flush: "sync" });
watch(bulkOpen, open => { if (!open) uni.hideKeyboard(); }, { flush: "sync" });
watch(stepInteractive, active => { if (active && field.value && !props.initial) void scrollIntoView(`#field-${field.value}`); });
const namesPlaceholder = "例如：小林 小陈 小王 小李";
const progressStyle = computed(() => `transform:scaleX(${(step.value + 1) / 3});`), modeLabel = computed(() => modes.find(mode => mode.value === form.mode)?.label);
const snapshot = () => JSON.stringify([form, startDate.value, startTime.value, endDate.value, endTime.value, courts.value, gameCount.value, names.value, newName.value, bulk.value]); const initialSnapshot = snapshot();
watch(snapshot, value => emit("dirty", value !== initialSnapshot));
watch(() => [form.name, form.location, startDate.value, startTime.value, endDate.value, endTime.value, courts.value, gameCount.value, newName.value, bulk.value, names.value.length], (next, previous) => {
  const indices: Record<string, number[]> = { name: [0], location: [1], time: [2, 3, 4, 5], courts: [6], games: [7], players: [8, 9, 10] };
  if (indices[field.value]?.some(index => next[index] !== previous[index])) { field.value = ""; error.value = ""; }
});
function date(date: string, time: string) { const [y, m, d] = date.split("-").map(Number), [h, min] = time.split(":").map(Number); return new Date(y, m - 1, d, h, min); }
async function fail(key: string, message: string) { field.value = key; error.value = message; await nextTick(); if (!props.initial && stepInteractive.value && field.value === key) await scrollIntoView(`#field-${key}`); }
function valid(current: number) {
  error.value = ""; field.value = "";
  if (current === 0) {
    if (!form.name.trim()) { fail("name", "给球局起个名字吧"); return false; }
    if (!form.location.trim()) { fail("location", "请填写球馆名称或地址"); return false; }
    const a = date(startDate.value, startTime.value), b = date(endDate.value, endTime.value);
    if (!Number.isFinite(a.getTime()) || !Number.isFinite(b.getTime()) || b <= a) { fail("time", "结束时间需要晚于开始时间"); return false; }
  }
  if (current === 1) {
    if (!Number.isInteger(Number(courts.value)) || Number(courts.value) < 1 || Number(courts.value) > 8) { fail("courts", "场地数量应为 1–8 的整数"); return false; }
    if (form.mode === "rotation" && (!Number.isInteger(Number(gameCount.value)) || Number(gameCount.value) < 1 || Number(gameCount.value) > 200)) { fail("games", "总局数应为 1–200 的整数"); return false; }
  }
  if (current === 2 && !props.initial) {
    if (newName.value.trim() || bulk.value.trim()) { fail("players", "还有未加入名单的名字，请先添加或清空"); return false; }
    const count = names.value.length, min = form.mode === "single" ? 2 : 4, max = form.mode === "rotation" ? 16 : 32;
    if (count < min || count > max || (form.mode === "fixed" && count % 2 !== 0)) { fail("players", form.mode === "fixed" ? "固搭需 4–32 人，人数须为偶数" : `此模式需要 ${min}–${max} 位球友`); return false; }
  }
  return true;
}
function go(target: number) { if (props.busy || target === step.value || target < 0 || target > 2) return; if (target > step.value) { for (let i = step.value; i < target; i++) if (!valid(i)) { step.value = i; return; } } step.value = target; error.value = ""; field.value = ""; if (!props.initial) uni.pageScrollTo({ scrollTop: 0, duration: reducedMotion.value ? 0 : 180 }); }
function addValues(values: string[]) { if (props.busy || !stepInteractive.value || step.value !== 2) return false; if (names.value.length + values.length > 32 || values.some(name => name.length > 80)) { fail("players", "最多 32 位球友，每个名字不超过 80 字"); return false; } names.value.push(...values.map(name => ({ id: ++sequence, name }))); return true; }
function addName() { if (newName.value.trim() && addValues([newName.value.trim()])) newName.value = ""; }
function addBulk() { if (!bulkOpen.value) return; const values = bulk.value.split(/\s+/).map(name => name.trim()).filter(Boolean); if (values.length && addValues(values)) { bulk.value = ""; bulkOpen.value = false; } }
function removeName(id: number) { if (props.busy || !stepInteractive.value || step.value !== 2) return; names.value = names.value.filter(person => person.id !== id); }
function next() {
  if (props.busy || !stepInteractive.value) return;
  if (step.value < 2) { go(step.value + 1); return; }
  for (let i = 0; i < 3; i++) if (!valid(i)) { step.value = i; return; }
  emit("submit", { ...form, name: form.name.trim(), location: form.location.trim(), startsAt: date(startDate.value, startTime.value).toISOString(), endsAt: date(endDate.value, endTime.value).toISOString(), courtCount: Number(courts.value), gameCount: form.mode === "rotation" ? Number(gameCount.value) : 12, seed: props.initial?.seed ?? 1, ...(!props.initial ? { players: names.value.map(person => person.name) } : {}) });
}
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.bm-form-stage { min-width: 0; }
.bm-bulk-hint { margin-top: 12rpx; }
.bm-form-reveal { opacity: 0; pointer-events: none; transition: height 220ms $bm-ease, opacity 220ms $bm-ease; }
.bm-form-reveal.is-visible { opacity: 1; pointer-events: auto; }
.bm-field-error { animation: none; }
.is-reduced .bm-form-reveal { transition: none; }
</style>
