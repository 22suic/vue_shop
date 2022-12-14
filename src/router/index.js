import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Welcome from '../pages/Welcome'
import Users from '../pages/user/Users'
import Rights from '../pages/power/Rights'
import Roles from '../pages/power/Roles'
import Cate from '../pages/goods/Cate'
import Params from '../pages/goods/Params'
import List from '../pages/goods/List'
import AddOrEditGoods from '../pages/goods/AddOrEditGoods'
import Order from '../pages/order/Order'
import Report from '../pages/report/Report'
import '../assets/css/global.css'

Vue.use(VueRouter)

const routes = [
  {path: '/', redirect: '/login'},
  {path: '/login', component: Login},
  {path: '/home', 
   component: Home, 
   redirect: '/welcome',
   children:[
     {path: '/welcome', component: Welcome},
     {path: '/users', component: Users},
     {path: '/rights', component: Rights},
     {path: '/roles', component: Roles},
     {path: '/categories', component: Cate},
     {path: '/params', component: Params},
     {path: '/goods', component: List},
     {name: 'addOrEditGoods', path: '/addOrEditGoods', component: AddOrEditGoods},
     {path: '/orders', component: Order},
     {path: '/reports', component: Report}
    ]}
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
