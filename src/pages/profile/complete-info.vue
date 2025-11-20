<!--
 * @Author: Anixuil
 * @Date: 2025-10-03 10:53:41
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-19 21:47:45
 * @Description: 补充信息页面
-->
<template>
    <loadingStatus ref="loadingStatusRef"></loadingStatus>
    <div class="complete-info-wrapper">
        <up-form :model="form" :rules="rules" ref="formRef" label-position="top" label-width="160rpx"
            :labelStyle="{ color: '#FF6B35' }">
            <up-form-item label="邮箱" prop="userEmail">
                <up-input color="#000" placeholder="请输入邮箱" v-model="form.userEmail" />
            </up-form-item>
            <up-form-item label="密码" prop="userPassword">
                <up-input type="password" color="#000" placeholder="请输入密码" v-model="form.userPassword" />
            </up-form-item>
            <up-form-item label="邮箱验证码" prop="userEmailCode">
                <up-input color="#000" placeholder="请输入邮箱验证码" v-model="form.userEmailCode" />
            </up-form-item>
            <up-form-item>
                <up-button color="#FF6B35" @click="sendEmailCode" :loading="sendEmailCodeLoading"
                    :disabled="isSendingEmailCode">
                    {{ countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码' }}
                </up-button>
            </up-form-item>
            <up-form-item>
                <up-button style="margin-top: 50rpx; width: 100%;" @click="handleSubmit">提交</up-button>
            </up-form-item>
        </up-form>
    </div>
</template>

<script setup lang="ts">
import UserAPI from '@/api/user'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const loadingStatusRef = ref() // 获取 toast 实例
// 获取参数
const needType = ref<string>('')
onLoad((query: AnyObject | undefined) => {
    needType.value = query?.needType || ''
    console.log('needType', needType.value)
})

const form = ref({
    userEmail: '',
    userEmailCode: '',
    userPassword: '',
})

const rules = ref({
    userEmail: [{ required: true, message: '请补充邮箱信息', trigger: 'blur' }],
    userEmailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
    userPassword: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const formRef = ref()

// 提交补充信息表单
const handleSubmit = () => {
    formRef.value.validate().then(() => {
        loadingStatusRef.value.showToast({
            type: 'loading',
            message: '小羽验证中...',
            duration: -1,
        })
        // 验证邮箱验证码
        UserAPI.verifyEmailCode({
            userEmail: form.value.userEmail,
            code: form.value.userEmailCode,
        }).then(res => {
            if (!res || res !== true) {
                throw new Error(res?.message || '验证失败');
            }
            loadingStatusRef.value.hideToast();
            loadingStatusRef.value.showToast({
                type: 'loading',
                message: '小羽更新中...',
                duration: -1,
            })
            const userInfo: { userId: number, userEmail?: string, userName?: string, userAge?: string, userAlias?: string, userPassword?: string } = Object.assign({}, userStore.userInfo, {
                userEmail: form.value.userEmail,
                userPassword: form.value.userPassword,
            })
            console.log('userInfo', userInfo);
            
            UserAPI.updateUserInfo(userInfo).then(res => {
                uni.showToast({
                    title: '更新成功',
                    icon: 'success',
                    duration: 2000,
                })
                userStore.getUserInfo()
                setTimeout(() => {
                    uni.reLaunch({
                        url: '/pages/profile/index'
                    })
                }, 1500)
            }).catch((err: any) => {
                console.log('err', err)
                uni.showToast({
                    title: '更新失败',
                    icon: 'none',
                    duration: 2000,
                })
            }).finally(() => {
                loadingStatusRef.value.hideToast();
            })
            
        }).catch((err: any) => {
            uni.showToast({
                title: err.message || '验证失败',
                icon: 'none',
                duration: 2000,
            })
        }).finally(() => {
            loadingStatusRef.value.hideToast();
        })
    })
}


const isSendingEmailCode = ref(true); // 是否发送邮箱验证码
const sendEmailCodeLoading = ref(false); // 发送邮箱验证码加载状态
const countdown = ref(0); // 倒计时秒数
const countdownTimer = ref<number | null>(null); // 倒计时定时器

// 发送邮箱验证码
const sendEmailCode = () => {
    // 校验邮箱格式
    if (form.value.userEmail.trim() !== '' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.value.userEmail)) {
        sendEmailCodeLoading.value = true;
        loadingStatusRef.value.showToast({
            type: 'loading',
            message: '小羽打包中...',
            duration: -1,
        })
        UserAPI.sendEmailCode({
            userEmail: form.value.userEmail,
            emailTitle: '羽球对决验证码',
        }).then(res => {
            // 发送成功后启动60秒倒计时
            startCountdown();
            uni.showToast({
                title: '验证码已发送',
                icon: 'success',
                duration: 2000,
            })
        }).catch(err => {
            console.log('err', err);
            uni.showToast({
                title: err.message || '验证码发送失败',
                icon: 'none',
                duration: 2000,
            })
        }).finally(() => {
            sendEmailCodeLoading.value = false;
            loadingStatusRef.value.hideToast();
        })
    } else {
        uni.showToast({
            title: '请输入正确的邮箱格式',
            icon: 'none',
            duration: 2000,
        })
    }
}

// 启动倒计时
const startCountdown = () => {
    countdown.value = 60;
    isSendingEmailCode.value = true; // 禁用按钮

    countdownTimer.value = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            if (countdownTimer.value) {
                clearInterval(countdownTimer.value);
            }
            countdownTimer.value = null;
            isSendingEmailCode.value = false; // 重新启用按钮
        }
    }, 1000);
}

// 组件卸载时清理定时器
onUnmounted(() => {
    if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
    }
})
// 监听邮箱输入框是否输入了邮箱
watch(() => form.value.userEmail, (newVal) => {
    // 如果正在倒计时，不改变按钮状态
    if (countdown.value > 0) {
        return;
    }

    if (newVal && newVal.trim() !== '') {
        isSendingEmailCode.value = false;
    } else {
        isSendingEmailCode.value = true;
    }
})
</script>

<style scoped lang="scss">
.complete-info-wrapper {
    width: 100vw;
    height: 100vh;
    background-color: #ffffff;
    box-sizing: border-box;
    padding: 32rpx;
}
</style>