import { createRouter,createWebHistory } from "vue-router";
import ChatVue from "@/views/Chat.vue";
//导入组件
import LoginVue from "@/views/Login.vue";
import LayoutVue from "@/views/Layout.vue";
import UpdateUserInfoVue from "@/views/UpdateUserInfo.vue";

//定义路由关系
const routes = [
    {path:'/login',component:LoginVue},
    {path:'/',component:LayoutVue,redirect: '/chat',
        //子路由
        children:[
            {path:'chat',component:ChatVue},
            
            {path:'updateUserInfo',component:UpdateUserInfoVue}
        ]
    }
]

//创建路由器
const router = createRouter({
    history:createWebHistory(),
    routes:routes
})

//导出路由器
export default router