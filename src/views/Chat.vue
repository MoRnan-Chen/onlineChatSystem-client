<script setup>
  import { Search, Plus } from '@element-plus/icons-vue'
  import { getFriendListService,getFriendChatRecordService, searchUsersService,addFriendService } from '@/api/user';
  import { ref } from 'vue';
  import useUserInfoStore from '@/stores/userInfo';
  import EmojiPicker from "vue3-emoji-picker";
  import "vue3-emoji-picker/css";
  import { GrinningFace } from '@icon-park/vue-next';
  import useWebSocket from '@/utils/useWebSocket';
import { ElMessage } from 'element-plus';

  const  userInfoStore = useUserInfoStore();

  //默认头像
  const defaultAvatar = ref('https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png');

  const friendList = ref([])
  const keyword = ref('');
  const searchList = ref([]); 
  const currentFriend = ref(null);
  const messages = ref([]);
  const newMessage = ref({
    content:'',     //信息内容
    fromId:'',      //发送者id
    toId:'',        //接收者id
    type:''         //0为文本，1为文件
  });

  //控制表情框的显示
  const showDialog = ref(false);

  //控制搜索列表的显示
  const dialogSearchVisible = ref(false);

  //获取好友列表
  const getFriendList = async () => {
    let result = await getFriendListService();
    
    friendList.value = result.data;
  }
  
  //调用获取好友列表函数
  getFriendList();

  //选择聊天对象
  const selectFriend = async (friend) => {
    currentFriend.value = friend;
    //清空原先的聊天记录
    messages.value=[];
    //获取与当前聊天好友的聊天记录
    let result = await getFriendChatRecordService(userInfoStore.info.id,currentFriend.value.id);
    messages.value=result.data;
  };

  // 处理收到的 WebSocket 消息
  const handleMessage = (event) => {
    messages.value.push(JSON.parse(event.data));
  };

  // 使用可组合函数初始化 WebSocket
const { sendMessage: sendSocketMessage } = useWebSocket(
  `ws://localhost:8080/singleChat/${userInfoStore.info.id}`,
  handleMessage
);

// 发送消息的函数
const sendMessage = () => {
  if (newMessage.value.content.trim() === '') return;

  newMessage.value.fromId = userInfoStore.info.id;
  newMessage.value.toId = currentFriend.value.id;
  newMessage.value.type = 0;

  // 通过 WebSocket 发送消息
  if(sendSocketMessage(JSON.stringify(newMessage.value)))
  {
  //如果发送成功，将消息添加到本地消息数组中
  messages.value.push({ ...newMessage.value });
  }

  // 清空输入框
  newMessage.value.content = '';
};
  //选择表情
  const selectEmoji = emoji=>{
    //将表情拼接要发送的信息里
    newMessage.value.content = newMessage.value.content+emoji.i;
  }

  //搜索用户
 const searchUsers=async()=>
  {
    if(!keyword.value || typeof keyword.value !== 'string' || keyword.value.trim() === ''){
      ElMessage.warning("搜索内容不能为空！");
    }else{
      let result = await searchUsersService(keyword.value);
      searchList.value = result.data;
      dialogSearchVisible.value = true;
    }
  }
// 添加好友的函数
  const addFriend = async (user) => {
  
    const result = await addFriendService(user.id);
    ElMessage.success("好友添加发送成功！");

};

</script>

<template>
  <el-container>
    <!-- 左侧侧边栏（好友列表） -->
    <el-aside width="18vw">
      <div class="search-layout">
        <el-input
          v-model="keyword"
          placeholder="搜索"
          style="width: 14vw"
          :prefix-icon="Search"
          @keyup.enter="searchUsers"
        />
        <el-icon style="margin-left: 8px; background-color: #ffffff;" 
        size="24" color="#606266" @click="searchUsers">
          <Search />
        </el-icon>
        <!-- 搜索结果框 -->
        <el-dialog  v-model="dialogSearchVisible" title="搜索结果" width="400px">
          <el-scrollbar style="max-height: 300px; overflow-y: auto;">
    <template v-if="searchList.length > 0">
      <div v-for="user in searchList" :key="user.id" class="search-result-item">
        <el-avatar :src="user.userPic ? user.userPic : defaultAvatar" size="32"></el-avatar>
        <span class="user-name">{{ user.username }}</span>
        <el-button type="primary" size="mini" @click="addFriend(user)">添加</el-button>
      </div>
    </template>
    <template v-else>
      <p>没有找到相关用户。</p>
    </template>
  </el-scrollbar>
        </el-dialog>
      </div>

      <el-divider style="margin: 0; width: 18vw;" class="horizontal-divider" direction="horizontal" />

      <el-scrollbar height="100vh">
        <template v-for="(friend, index) in friendList" :key="friend.id">
          <p class="scrollbar-demo-item" @click="selectFriend(friend)">
            <el-avatar :src="friend.userPic ? friend.userPic : defaultAvatar"></el-avatar>
            <span class="friend-name">{{ friend.username }}</span>
          </p>
          <!-- 在每个好友项后添加水平分割线，除了最后一个 -->
          <el-divider
            v-if="index !== friendList.length - 1"
            style="margin: 0; width: 18vw;"
            class="horizontal-divider"
            direction="horizontal"
          />
        </template>
      </el-scrollbar>
    </el-aside>

    <el-divider
      style="margin: 0; height: 100vh;"
      direction="vertical"
      class="vertical-divider"
    />

    <el-container>
      <!-- 聊天头部 -->
      <el-header class="chat-header">
        <div v-if="currentFriend">
          <h3>{{ currentFriend.username }}</h3>
        </div>
      </el-header>

      <el-divider
        style="margin: 0;"
        class="horizontal-divider"
        direction="horizontal"
      />

      <!-- 聊天内容和输入区域 -->
      <el-main class="chat-main">
        <div v-if="currentFriend" class="chat-window">
          <el-scrollbar class="chat-content">
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="[
                'message-row',
                message.fromId == userInfoStore.info.id
                  ? 'my-message'
                  : 'friend-message',
              ]"
            >
              <!-- 头像 -->
              <el-avatar
                class="message-avatar"
                :src="
                  message.fromId == userInfoStore.info.id
                    ? userInfoStore.info.userPic || defaultAvatar
                    : currentFriend.userPic || defaultAvatar
                "
              ></el-avatar>
              <!-- 聊天气泡 -->
              <div class="message-bubble">
                <p>{{ message.content }}</p>
              </div>
            </div>
          </el-scrollbar>

          <!-- 表情选择框 -->
          <div v-if="showDialog" class="emoji-picker-container">
            <EmojiPicker :native="true" @select="selectEmoji" />
          </div>
          <el-divider
            style="margin: 0;"
            class="horizontal-divider"
            direction="horizontal"
          />

          <div class="chat-input">
          

            <el-input
              v-model="newMessage.content"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
            >
            <template  #prepend>
              <el-button type="text"  @click="showDialog = !showDialog" style="display: flex; align-items: center; justify-content: center;">
              <grinning-face theme="outline" size="30" fill="#333" :strokeWidth="2"/>
            </el-button>

            </template>
            </el-input>
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </div>
        </div>

        <!-- 当未选择好友时的提示 -->
        <div v-else class="no-friend-selected">
          <p>请选择一个好友开始聊天</p>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>


<style scoped>

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative; /* 保证相对定位用于控制子元素的位置 */
}

/* 聊天头部样式 */
.chat-header {
  background-color: #f5f5f5;
  padding: 10px 20px;
  height: 60px;
  display: flex;
  align-items: center;
  
}

/* 聊天内容区域 */
.chat-main {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px - 1px); /* 减去头部高度和分割线高度 */
  
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 消息行 */
.message-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.chat-input {
  display: flex;
  padding: 20px;
  background-color: #f5f5f5;
}

.chat-input .el-input {
  flex: 1;
  margin-right: 10px;
}

/* 当前用户的消息 */
.my-message {
  flex-direction: row-reverse;
}

/* 好友的消息 */
.friend-message {
  flex-direction: row;
}

/* 头像样式 */
.message-avatar {
  width: 40px;
  height: 40px;
}

/* 聊天气泡 */
.message-bubble {
  max-width: 60%;
  padding: 10px;
  border-radius: 10px;
  margin: 0 10px;
  position: relative;
}

/* 聊天气泡内容 */
.message-bubble p {
  margin: 0;
  word-wrap: break-word;
}

/* 气泡颜色 */
.my-message .message-bubble {
  background-color: #9cda62;
}

.friend-message .message-bubble {
  background-color: #ffffff;
}

/* 当前用户消息的气泡箭头 */
.my-message .message-bubble::after {
  content: '';
  position: absolute;
  right: -17px;
  top: 10px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent transparent #9cda62;
}

/* 好友消息的气泡箭头 */
.friend-message .message-bubble::after {
  content: '';
  position: absolute;
  left: -17px;
  top: 10px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent #ffffff transparent transparent;
}

/* 未选择好友时的提示 */
.no-friend-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #888;
}

.el-aside {
  overflow: hidden; /* 隐藏滚动条 */
  background-color: #f5f5f5;
  margin: 0px;
}

/* 搜索区域样式布局 */
.search-layout {
  height: 60px;
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  width: 100%;
  background-color: #f7f7f7;
}

.vertical-divider {
  border-left-width: 1px; /* 设置左边框宽度，调整为您需要的粗细 */
  border-left-color: #dbdada; /* 设置左边框颜色 */
  border-left-style: solid; /* 设置左边框样式 */
}

.horizontal-divider {
  border-top-width: 1px; /* 设置顶部边框宽度，调整为您需要的粗细 */
  border-top-color: #dbdada; /* 设置顶部边框颜色 */
  border-top-style: solid; /* 设置顶部边框样式 */
}

/* 调整好友列表项的布局 */
.scrollbar-demo-item {
  display: flex;
  align-items: flex-start; /* 让头像和名字靠顶部对齐 */
  padding-left: 10px; /* 为整个列表项添加左间隙 */
  height: 50px;
  text-align: left;
  background: #f9f9f9;
  color: #151514;
  width: 18vw;
  margin: 0; /* 消除外边距 */
  cursor: pointer;
}

/* 头像样式 */
.scrollbar-demo-item .el-avatar {
  margin-right: 10px; /* 给头像和名字之间添加间隙 */
  margin-top: 5px; /* 给头像顶部添加间隙，调整垂直位置 */
}

/* 名字样式 */
.scrollbar-demo-item .friend-name {
  font-size: 18px; /* 调整名字字体大小 */
  line-height: 1.5; /* 调整行高，控制名字的垂直位置 */
  margin-top: 5px; /* 上移名字 */
}

/* 默认隐藏滚动条 */
.chat-content ::v-deep .el-scrollbar__bar {
  opacity: 0;
  transition: opacity 0.3s;
}

/* 当鼠标悬停在 chat-content 区域时，显示滚动条 */
.chat-content:hover ::v-deep .el-scrollbar__bar {
  opacity: 1;
}

/* 调整溢出行为，防止滚动条隐藏时滚动内容 */
.chat-content ::v-deep .el-scrollbar__wrap {
  overflow: hidden;
}

.chat-content:hover ::v-deep .el-scrollbar__wrap {
  overflow: auto;
}
/* 表情选择框容器位置固定 */
.emoji-picker-container {
  position: absolute;
  bottom: 80px; /* 保证表情框在输入框上方，避免与其他元素重叠 */
  left: 20px; /* 确保表情框左浮动，稍微离开边缘 */
  z-index: 1000;
}

/* 新增搜索结果项的样式 */
.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item .user-name {
  flex: 1;
  margin-left: 10px;
  font-size: 16px;
  color: #333;
}

.search-result-item .el-button {
  margin-left: 10px;
}
</style>
