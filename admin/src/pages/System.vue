<template>
  <section>
    <State :loading="loading" :error="error" @retry="load" />
    <ElAlert v-if="success" :title="success" type="success" show-icon :closable="false" />
    <div v-if="!loading && !error" class="settings-layout">
      <form class="surface settings-form" @submit.prevent="saveSettings">
        <h3>服务信息</h3><p class="muted">这些信息将显示在小程序消息中心的服务说明中。</p>
        <label class="field"><span>联系渠道</span><ElInput v-model.trim="settings.value.supportContact" maxlength="200" :disabled="busy || !can(identity, 'bm:settings:write')" placeholder="例如：客服微信、联系邮箱" /></label>
        <label class="field"><span>服务时间</span><ElInput v-model.trim="settings.value.serviceHours" maxlength="100" :disabled="busy || !can(identity, 'bm:settings:write')" placeholder="例如：周一至周五 09:00–18:00" /></label>
        <label class="field"><span>产品说明</span><ElInput v-model.trim="settings.value.about" type="textarea" :rows="6" maxlength="2000" show-word-limit :disabled="busy || !can(identity, 'bm:settings:write')" /></label>
        <ElAlert v-if="modalError" :title="modalError" type="error" show-icon :closable="false" />
        <div class="form-actions"><ElButton v-if="can(identity, 'bm:settings:write')" native-type="submit" type="primary" :loading="busy" :icon="Check">{{ busy ? '保存中…' : '保存设置' }}</ElButton></div>
      </form>
      <aside class="surface settings-rules">
        <span class="eyebrow">CURRENT RULES</span><h3>积分规则</h3>
        <dl class="record-details"><dt>每日签到奖励</dt><dd>{{ settings.rules.checkInReward }} 积分</dd><dt>每局助威上限</dt><dd>{{ settings.rules.perGameLimit }} 积分</dd><dt>规则版本</dt><dd><ElTag effect="plain">{{ label(settings.rules.ruleVersion) }}</ElTag></dd></dl>
        <div v-for="prop in settings.rules.props" :key="prop.id" class="rule-prop"><span>{{ prop.name }}</span><strong>{{ prop.points }} 积分</strong></div>
        <p class="hint">规则由后端统一维护，历史订单保留购买时的规则快照。</p>
      </aside>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElAlert, ElButton, ElInput, ElTag } from "element-plus";
import { Check } from "@element-plus/icons-vue";
import { can, request, message, label, type Identity } from "../api";
import State from "../components/State.vue";
interface Settings { version: number; value: { supportContact: string; serviceHours: string; about: string }; rules: { checkInReward: number; perGameLimit: number; ruleVersion: string; props: { id: string; name: string; points: number }[] } }
const props = defineProps<{ identity: Identity }>();
const loading = ref(false), busy = ref(false), error = ref(""), modalError = ref(""), success = ref("");
const settings = ref<Settings>({ version: 0, value: { supportContact: "", serviceHours: "", about: "" }, rules: { checkInReward: 0, perGameLimit: 0, ruleVersion: "", props: [] } });
async function load() { loading.value = true; error.value = ""; try { settings.value = await request<Settings>("/admin/settings"); } catch (e) { error.value = message(e); } finally { loading.value = false; } }
async function saveSettings() { if (busy.value || !can(props.identity, "bm:settings:write")) return; if (settings.value.value.supportContact.length > 200 || settings.value.value.serviceHours.length > 100 || settings.value.value.about.length > 2000) { modalError.value = "服务信息超过长度限制，请精简后保存。"; return; } busy.value = true; modalError.value = ""; try { await request("/admin/settings", "PUT", { version: settings.value.version, value: settings.value.value }); success.value = "服务信息已保存。"; await load(); } catch (e) { modalError.value = message(e); } finally { busy.value = false; } }
onMounted(load);
</script>


