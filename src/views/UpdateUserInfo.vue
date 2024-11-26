<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus';
import useUserInfoStore from '@/stores/userInfo';
import { Plus, Upload } from '@element-plus/icons-vue'
import { useTokenStore } from '@/stores/token';

const tokenStore = useTokenStore();
const userInfoStore =  useUserInfoStore();

const uploadRef = ref();
 
//用户头像地址
const imgUrl= ref(userInfoStore.info.userPic);

const defaultAvatar = ref('https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png');


//把pinia中存储的用户信息赋值到userInfo中
const baseUserInfoData = ref({...userInfoStore.info});

//定义修改密码响应式数据
const pwdData = ref({
  oldPassword:'',
  newPassword:'',
  confirmPassword:''
})


// 修改用户基本资料时的规则校验
const updateBaseUserInfoRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_@-]{1,16}$/, message: '用户名只能包含字母、数字和 _ @ -，且长度为 1 到 16 位', trigger: 'blur' }
    ],
    email: [
        
        { 
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
          message: '不符合邮箱格式', 
          trigger: 'blur' 
        }
    ]
};

//修改密码时的校验
const updatePwdRules = {

     oldPassword: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9@]{6,16}$/, message: '密码必须为 6 到 16 位的字母或数字或@组成', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9@]{6,16}$/, message: '新密码必须为 6 到 16 位的字母或数字或@组成', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: (rule, value, callback) => {
            if (value !== pwdData.value.newPassword) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        }, trigger: 'blur' }
    ]
};


// 重置用户基本资料函数
const resetBaseUserInfo = () => {
  userInfo.value = {
    username: '',
    email: '',
    sex: '', // 重置性别
  }
}

//重置用户修改的密码
const resetPwd = ()=>{
  //重置数据
  pwdData.value={
  oldPassword:'',
  newPassword:'',
  confirmPassword:''
  }
}

import {updateBaseUserInfoService ,updatePasswordService,userAvatarUpdateService } from '@/api/user';
//修改用户的基本信息
const updateBaseUserInfo = async()=>{
  let result = await updateBaseUserInfoService(baseUserInfoData.value);
  ElMessage.success('修改成功');
  //更新pinia用户信息
  userInfoStore.setInfo(baseUserInfoData.value)
}

//修改用户密码
const updatePwd = async()=>{
  let result = await updatePasswordService(pwdData.value);
  ElMessage.success('密码修改成功')
}

//图片上传成功回调函数
const uploadSuccess = (result)=>{
  imgUrl.value = result.data;
}

//头像修改
const updateAvatar = ()=>{
  //调用接口
  let result = userAvatarUpdateService(imgUrl.value);
  ElMessage.success("修改成功");

  //修改pinia中的数据
  userInfoStore.info.userPic=imgUrl.value;

}

</script>

<template>
  <el-card shadow="always">
    <el-tabs type="card">
      <!-- 修改用户基本信息 -->
      <el-tab-pane label="基本信息">
        <el-row class="update-user-info-center">
          <el-col :span="10">
            <el-form :model="baseUserInfoData" label-width="100px" size="default" class="center-form" :rules="updateBaseUserInfoRules">
              <el-form-item label="用户名称" prop="username">
                <el-input v-model="baseUserInfoData.username"></el-input>
              </el-form-item>
            
              <el-form-item label="用户邮箱" prop="email">
                <el-input v-model="baseUserInfoData.email"></el-input>
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="baseUserInfoData.sex" placeholder="请选择性别">
                  <el-option label="未知" value="未知"></el-option>
                  <el-option label="男" value="男"></el-option>
                  <el-option label="女" value="女"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="success" class="submit-button" @click="updateBaseUserInfo">提交修改</el-button>
                <el-button type="primary" @click="resetBaseUserInfo" class="reset-button">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="更换头像">
        <el-row class="update-avatar-center">
            <el-col :span="12">
                <el-upload 
                    ref="uploadRef"
                    class="avatar-uploader" 
                    :show-file-list="false"
                    :auto-upload="true"
                    action="/api/upload"
                    name="file"
                    :headers="{'Authorization':tokenStore.token}"
                    :on-success="uploadSuccess"
                    >
                    <img v-if="imgUrl" :src="imgUrl" class="avatar" />
                    <img v-else :src="defaultAvatar" width="278" />
                </el-upload>
                <br />
                <el-button type="primary" :icon="Plus" size="large" class="select-picture-button" @click="uploadRef.$el.querySelector('input').click()">
                    选择图片
                </el-button>
                <el-button type="success" @click="updateAvatar" :icon="Upload" size="large" class="upload-avatar-button">
                    上传头像
                </el-button>
            </el-col>
        </el-row>
      </el-tab-pane>
      <!-- 修改用户密码 -->
      <el-tab-pane label="修改密码">
        <el-row class="update-password-center">
          <el-col :span="10">
            <el-form :model="pwdData" label-width="100px" size="default" class="center-form" :rules="updatePwdRules">
              <el-form-item label="原密码" prop="oldPassword" >
                <el-input v-model="pwdData.oldPassword" show-password="true"></el-input>
              </el-form-item>
            
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="pwdData.newPassword" type="password" show-password="true"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="pwdData.confirmPassword" type="password" show-password="true"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="success" class="submit-button" @click="updatePwd">提交修改</el-button>
                <el-button type="primary" @click="resetPwd" class="reset-button">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
.el-card {
  width: 93vw;
  height: 93vh;
  margin-top: 1vh;
  margin-left: 0.5vw;
}

/* 完全居中 */
.update-password-center,.update-user-info-center {
  margin-top: 22vh;
  margin-left: 28vw;
}

.update-avatar-center{
  margin-top: 10vh;
  margin-left: 35vw;
}

.el-tabs {
  width: 100vw;
  height: 100vh;
}

/* 调整按钮大小和间距 */
.submit-button,
.reset-button {
  width: 120px; /* 设置按钮宽度相同 */
  margin-top: 30px;
}

.reset-button {
  margin-left: 120px; /* 向右移动 */
}

.select-picture-button,.upload-avatar-button{
  margin-top: 5vh;
}
.upload-avatar-button{
  margin-left: 2vw;
}

.avatar-uploader {
  :deep() {
    .avatar {
      width: 278px;
      height: 278px;
      display: block;
    }

    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }

    .el-upload:hover {
      border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 278px;
      height: 278px;
      text-align: center;
    }
  }
}

</style>
