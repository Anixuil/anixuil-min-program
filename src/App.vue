<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/modules/user";
onLaunch(() => { useUserStore().restore().catch(() => { /* Pages expose retry states. */ }); });
</script>
<style lang="scss">
@import "./styles/badminton.scss";
</style>
