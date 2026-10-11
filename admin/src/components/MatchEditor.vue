<template>
  <form @submit.prevent="submit">
    <div class="form-grid">
      <label class="field span-2"><span>球局名称</span><ElInput v-model.trim="form.name" required maxlength="100" show-word-limit :disabled="busy" placeholder="给这次相聚起个名字" /></label>
      <label class="field span-2"><span>地点</span><ElInput v-model.trim="form.location" required maxlength="200" :disabled="busy" placeholder="球馆名称与详细地址" /></label>
      <label class="field"><span>开始时间</span><ElInput v-model="form.startsAt" type="datetime-local" required :disabled="busy" /></label>
      <label class="field"><span>结束时间</span><ElInput v-model="form.endsAt" type="datetime-local" required :min="form.startsAt" :disabled="busy" /></label>
      <label class="field"><span>赛制</span><ElSelect v-model="form.mode" :disabled="busy" aria-label="赛制"><ElOption value="single" label="单打" /><ElOption value="rotation" label="轮转双打" /><ElOption value="fixed" label="固定搭档" /></ElSelect></label>
      <label class="field"><span>场地数</span><ElInput v-model="form.courtCount" type="number" min="1" max="8" required :disabled="busy" /></label>
      <label class="field"><span>计划对局数</span><ElInput v-model="form.gameCount" type="number" min="1" max="200" required :disabled="busy" /></label>
      <label class="field"><span>排赛种子</span><ElInput v-model="form.seed" type="number" min="0" max="2147483647" required :disabled="busy" /></label>
      <label class="field span-2"><span>说明</span><ElInput v-model="form.description" type="textarea" :rows="3" maxlength="1000" show-word-limit :disabled="busy" /></label>
      <label v-if="!initial" class="field span-2"><span>参赛名单（每行一人，2–32 人）</span><ElInput v-model="names" type="textarea" required :rows="5" :disabled="busy" placeholder="小林&#10;阿羽" /></label>
    </div>
    <ElAlert v-if="localError || error" :title="localError || error" type="error" show-icon :closable="false" />
    <div class="form-actions"><ElButton native-type="submit" type="primary" :loading="busy">{{ busy ? '保存中…' : '保存球局' }}</ElButton></div>
  </form>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElAlert, ElButton, ElInput, ElOption, ElSelect } from "element-plus";
interface MatchFields { name: string; location: string; startsAt: string; endsAt: string; mode: string; courtCount: number; gameCount: number; seed: number; description: string; version?: number }
const props = defineProps<{ initial?: MatchFields; busy: boolean; error: string }>(); const emit = defineEmits<{ (e: "save", body: Record<string, unknown>): void }>();
function localDate(value: string) { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
const initial = props.initial, now = new Date(); now.setMinutes(0, 0, 0); now.setHours(now.getHours() + 1);
const form = reactive({ name: initial?.name || "", location: initial?.location || "", startsAt: localDate(initial?.startsAt || now.toISOString()), endsAt: localDate(initial?.endsAt || new Date(now.getTime() + 7200000).toISOString()), mode: initial?.mode || "rotation", courtCount: String(initial?.courtCount || 1), gameCount: String(initial?.gameCount || 12), seed: String(initial?.seed ?? 1), description: initial?.description || "" });
const names = ref(""), localError = ref("");
function submit() {
  if (props.busy) return;
  localError.value = "";
  const start = new Date(form.startsAt), end = new Date(form.endsAt), players = names.value.split(/\r?\n/).map(name => name.trim()).filter(Boolean);
  const courtCount = Number(form.courtCount), gameCount = Number(form.gameCount), seed = Number(form.seed);
  if (!form.name.trim() || form.name.length > 100 || !form.location.trim() || form.location.length > 200 || form.description.length > 1000) { localError.value = "请填写完整的球局名称、地点，并确认文本未超过长度限制。"; return; }
  if (!Number.isFinite(start.getTime()) || !(end > start)) { localError.value = "结束时间必须晚于开始时间。"; return; }
  if (!form.courtCount.trim() || !form.gameCount.trim() || !form.seed.trim() || !Number.isInteger(courtCount) || courtCount < 1 || courtCount > 8 || !Number.isInteger(gameCount) || gameCount < 1 || gameCount > 200 || !Number.isInteger(seed) || seed < 0 || seed > 2147483647) { localError.value = "请填写有效整数：场地 1–8 块、对局 1–200 局、种子 0–2147483647。"; return; }
  if (!["single", "rotation", "fixed"].includes(form.mode)) { localError.value = "请选择赛制。"; return; }
  if (!initial && (players.length < 2 || players.length > 32)) { localError.value = "请填写 2–32 位参赛选手。"; return; }
  emit("save", { ...form, courtCount, gameCount, seed, startsAt: start.toISOString(), endsAt: end.toISOString(), ...(initial ? { version: initial.version } : { players }) });
}
</script>
