import request from '@/utils/request.js'

//注册接口
export const userRegisterService = (registerData)=>{

    return request.post('/user/register',registerData);
}
//登录接口
export const userLoginService=(loginData)=>{
    return request.post('/user/login',loginData);
}

//获取用户详细信息
export const userInfoService = ()=>{
    return request.get('/user/userInfo')
}  

//修改用户基础信息
export const updateBaseUserInfoService = (baseUserInfoData)=>{
    return request.put('/user/update',baseUserInfoData);
 }

 //修改密码
 export const updatePasswordService = (pwdData)=>{
    return request.patch('/user/updatePwd',pwdData)
 }

 //修改头像
 export const userAvatarUpdateService = (avatarUrl)=>{
    const params = new URLSearchParams();
    params.append("avatarUrl",avatarUrl);
    return request.patch('/user/updateAvatar',params);
 }

 //获取好友列表
 export const getFriendListService = ()=>{
    return request.get("/user/friendList");
 }

 //获取好友聊天记录
 export const getFriendChatRecordService = (myId,friendId)=>{

    return request.get('/user/friendChatRecord',{
      params: { myId, friendId }
  });
 }

   //搜索好友
   export const searchUsersService = (keyword)=>{
    return request.get('/user/searchUsers',{
        params:{keyword}
    })
  }
//添加好友
  export const addFriendService = (userId) => {
    return request.post('/user/addFriend', { userId });
  };