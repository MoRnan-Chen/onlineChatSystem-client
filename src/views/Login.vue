<script setup>
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const isRegister = ref(false); // 控制是否显示注册表单

//注册表单数据
const registerData = ref({
    username: '',
    password: '',
    confirmPassword: ''
});
//登录表单数据
const loginData = ref({
    username: '',
    password: ''
});
//注册时候的校验规则
const registerRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_@-]{1,16}$/, message: '用户名只能包含字母、数字和 _ @ -，且长度为 1 到 16 位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9@]{6,16}$/, message: '密码必须为 6 到 16 位的字母或数字或@组成', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: (rule, value, callback) => {
            if (value !== registerData.value.password) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        }, trigger: 'blur' }
    ]
};

//登录时候的校验规则
const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_@-]{1,16}$/, message: '用户名只能包含字母、数字和 _ @ -，且长度为 1 到 16 位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9@]{6,16}$/, message: '密码必须为 6 到 16 位的字母或数字或@组成', trigger: 'blur' }
    ],
   
};


import { userRegisterService,userLoginService } from '@/api/user';
//发送注册请求
const register=async()=>{
    let result = await userRegisterService(registerData.value);
     //成功
    ElMessage.success("注册成功");
    //注册成功切换成登录
    isRegister.value=!isRegister.value;
}
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
const tokenStore = useTokenStore();
const router=useRouter();

//发送登录请求
const login=async()=>{
    let result = await userLoginService(loginData.value);
    ElMessage.success("登录成功");
    tokenStore.setToken(result.data);
    //利用路由跳转到首页
    router.push('/');

}


</script>

<template>
    <div class="gradient-bg">
        <div class="login-box">
            <div class="login-header">{{ isRegister ? '请你注册' : '请你登录' }}</div>
            
            <!-- 注册表单 -->
            <el-form v-if="isRegister" :model="registerData" :rules="registerRules" >
                <el-form-item prop="username" >
                    <el-input 
                    
                    :prefix-icon="User" 
                        v-model="registerData.username"
                        placeholder="注册账号"
                        class="input-field"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input 
                     
                    show-password
                    :prefix-icon="Lock" 
                        type="password"
                        v-model="registerData.password"
                        placeholder="注册密码"
                        class="input-field"
                    />
                </el-form-item>
                <el-form-item   prop="confirmPassword">
                    <el-input 
                   
                    show-password
                    :prefix-icon="Lock" 
                        type="password"
                        v-model="registerData.confirmPassword"
                        placeholder="确认密码"
                        class="input-field"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="login-button" @click="register">注册</el-button>
                </el-form-item>
            </el-form>

            <!-- 登录表单 -->
            <el-form v-else :model="loginData" :rules="loginRules">
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" 
                        v-model="loginData.username"
                        placeholder="账号"
                        class="input-field"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input 
                    show-password
                    :prefix-icon="Lock" 
                        type="password"
                        v-model="loginData.password"
                        placeholder="密码"
                        class="input-field"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="login-button" @click="login">登录</el-button>
                </el-form-item>
            </el-form>
            
            <div class="message">
                <label @click="isRegister = !isRegister">{{ isRegister ? '<-返回' : '注册->' }}</label>
            </div>
        </div>
    </div>
</template>

<style scoped>
.gradient-bg {
    display: flex; /* 使用 Flexbox */
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    height: 100vh; /* 使用视口高度 */
    background-image: linear-gradient(to right, #fbc2eb, #a6c1ee);
}

.login-box {
    background-color: #fff;
    width: 358px;
    max-width: 90%; /* 限制最大宽度 */
    border-radius: 15px;
    padding: 20px 50px; /* 增加顶部和底部的内边距 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
    display: flex;
    flex-direction: column; /* 垂直布局 */
    justify-content: center; /* 垂直居中内容 */
    align-items: center; /* 水平居中内容 */
}

.login-header {
    font-size: 38px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px; /* 增加下边距 */
}

.input-field {
    width: 100%;
    margin-bottom: 20px;
}

.login-button {
    width: 100%;
    margin-top: 20px;
}

.message {
    text-align: left; /* 左对齐 */
    margin-top: 10px; /* 增加顶部边距 */
    color: #87CEEB; /* 天蓝色 */
    font-size: 14px; /* 调整字体大小 */
    font-weight: 300; /* 更细的文字 */
    cursor: pointer; /* 鼠标悬停时有手指效果 */
    width: 100%; /* 使宽度与按钮一致 */
}

</style>
