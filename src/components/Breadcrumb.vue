<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{firstItemName}}</el-breadcrumb-item>
        <el-breadcrumb-item>{{secondItemName}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
      
</template>

<script>
    export default {
        data() {
            return {
                firstItemName:'',
                secondItemName:''
            }
        },
        props:['path'],
        created() {
            this.getItemName()
        },
        methods: {
            getItemName() {
                const menuList = JSON.parse(window.sessionStorage.getItem('menuList'))
                // console.log(menuList)
                // for (let i = 0; i < menuList.length; i++) {
                //     for (let j = 0; j < menuList[i].children.length; j++) {
                //         if (menuList[i].children[j].path === this.path.slice(1)) {
                //             this.firstItemName = menuList[i].authName
                //             this.secondItemName = menuList[i].children[j].authName
                //         }
                //     }
                // }
                menuList.forEach(firstMenu => {
                    firstMenu.children.forEach(secondMenu => {
                        if (secondMenu.path === this.path.slice(1)) {
                            this.firstItemName = firstMenu.authName
                            this.secondItemName = secondMenu.authName
                        }
                    })
                })
            }
        }
    }
    
</script>