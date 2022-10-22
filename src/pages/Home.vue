<template>
  <el-container class="home-container">
        <!-- 头部 -->
        <el-header>
            <div class="logo">
                <img src="../assets/logo.png">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="danger" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单 -->
                <el-menu
                    background-color="#606050"
                    text-color="#fff"
                    active-text-color="#e8c82a"
                    unique-opened
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    router
                    :default-active="$route.path.slice(1) === 'addOrEditGoods' ? 'goods' : $route.path.slice(1)">
                    <!-- 一级菜单 -->
                    <el-submenu :index="`${item.id}`" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="iconObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="`${subitem.path}`" v-for="subitem in item.children" :key="subitem.id">
                        <!-- <el-menu-item :index="`${subitem.path}`" v-for="subitem in item.children" :key="subitem.id" @click="saveNavstate(`${subitem.path}`)"> -->
                            <i class="el-icon-ice-cream-round"></i>
                            <span>{{subitem.authName}}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
      </el-container>
</template>

<script>
export default {
    created() {
        this.getMenuList()
        // this.activePath = window.sessionStorage.getItem('saveNavstate')
    },
    data() {
        return {
            menuList:[],
            iconObj:{
                '125':'el-icon-grape',
                '103':'el-icon-watermelon',
                '101':'el-icon-cherry',
                '102':'el-icon-apple',
                '145':'el-icon-pear'
            },
            isCollapse:false,
            // //激活页路径
            // activePath:''
        }
    },
    methods: {
        logout(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        // 获取菜单列表
        async getMenuList(){
            const {data: res} = await this.$http.get('menus')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.menuList = res.data
            window.sessionStorage.setItem('menuList', JSON.stringify(res.data))
        },
        //折叠左侧菜单
        toggleCollapse(){
            this.isCollapse = !this.isCollapse
        },
        // // 保存链接激活页
        // saveNavstate(activePath){
        //     window.sessionStorage.setItem('saveNavstate', activePath)
        //     this.activePath = activePath
        // }
    },
}
</script>

<style scoped>
    .home-container {
        height: 100%;
    }
    .el-header {
        background-color: #e8c82a;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        color: #fff;
        font-size: 20px;
    }
    .logo {
        display: flex;
        align-items: center;
    }
    .logo img {
        height: 100%;
    }
    .logo span {
        padding-left: 15px;
    }
    .el-header button {
        align-self: center;
    }
    .el-aside {
        background-color: #606050;
        border-right: 0;
    }
    .el-menu {
        border-right: 0;
    }
    .el-main {
        background-color: #eaedf1;
    }
    .iconfont {
        margin-right: 10px;
    }
    .toggle-button {
        background-color: rgb(181, 187, 137);
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>