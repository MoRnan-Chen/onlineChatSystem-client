<script setup>
import {
  Edit,
  User,
  Orange,
  Avatar,
  ChatDotRound,
  SwitchButton,
  ChatLineRound
  
} from '@element-plus/icons-vue'

import { ref } from 'vue'
import { useTokenStore } from '@/stores/token';
import { useRouter } from 'vue-router';
const router = useRouter();
const tokenStore = useTokenStore();

const defaultAvatar = ref('https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png');

//获取用户信息
import { userInfoService } from '@/api/user';
import useUserInfoStore from '@/stores/userInfo';
const userInfo = useUserInfoStore();
const getUserInfo = async ()=>{
  let result = await userInfoService();
  //把用户信息存进pinia
  userInfo.setInfo(result.data);
}
getUserInfo();

//退出登录
import { ElMessage, ElMessageBox } from 'element-plus'
const logout = () => {
  ElMessageBox.confirm(
    '你确定要退出吗？',
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '退出登录成功',
      })
      //移除token和userInfo
      userInfo.removeInfo();
      tokenStore.removeToken();
      //跳转到登录界面
      router.push('/login');
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消退出登录',
      })
    })
}
</script>

<template>

    <el-container>
      <el-aside width="65px" >
        <el-menu 
        default-active="/chat"
        active-text-color="#54FF9F"
        background-color="#2e2e2e"
        text-color="#fff"       
        router="true"
        >    
          <el-menu-item class="avatar-menu">       
              <el-avatar
                shape="square"
                size="40"
                 class="avatar"
                :src="userInfo.info.userPic ? userInfo.info.userPic : defaultAvatar"
              />           
          </el-menu-item>
         
          <el-menu-item index="/chat">
            <el-icon><ChatDotRound /></el-icon>
          </el-menu-item>

          <el-menu-item index="/group-chat">
            <el-icon><ChatLineRound /></el-icon>
          </el-menu-item>

          <el-menu-item index="contacts">
            <el-icon><User /></el-icon>
          </el-menu-item>
          <el-menu-item index="moments">
            <el-icon><Orange /></el-icon>
          </el-menu-item>
          <el-menu-item index="/updateUserInfo">
            <el-icon><Edit /></el-icon>
          </el-menu-item>
          <!-- 退出登录 -->
          <el-menu-item @click="logout">
            <el-icon><SwitchButton /></el-icon>
          </el-menu-item>
        
        </el-menu>
      </el-aside>
      
        <router-view></router-view>
      
    </el-container>

</template>

<style scoped>
.el-container {
  height: 100vh;
}

.el-aside {
    background-color: #ffffff;
    overflow :hidden;/* 隐藏滚动条 */
  }

  .el-main {
    height: 100vh;
    width: 100vw;
    overflow :hidden;/* 隐藏滚动条 */
    background-color: #ffffff;
  }
.el-menu
{
  height: 100vh;
}



.avatar-menu {
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
}
.avatar{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}
</style>
