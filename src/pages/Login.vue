<template>
  <div class="login_container">
      <div class="login_box">
          <!-- 头像部分 -->
          <div class="avatar_box">
              <img src="../assets/logo.png" alt="">
          </div>
          <!-- 表单部分 -->
          <el-form 
          label-width="0px" 
          class="login_form"
          :model="loginForm"
          ref="loginFormRef"
          :rules="loginFormRules">
            <!-- 登录名 -->
            <el-form-item prop="username">
                <el-input
                placeholder="用户名"
                prefix-icon="el-icon-user"
                v-model="loginForm.username"
                ></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="password">
                <el-input
                placeholder="密码"
                prefix-icon="el-icon-lock"
                type="password"
                v-model="loginForm.password"
                ></el-input>
            </el-form-item>
            <!-- 按钮 -->
            <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetLoginForm">重置</el-button>
            </el-form-item>
          </el-form>
      </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            loginForm:{
                username:'admin',
                password:'123456'
            },
            loginFormRules:{
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '密码长度在 3 到 6 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
                ],  
            }
        }
    },
    methods: {
        resetLoginForm(){
            this.$refs.loginFormRef.resetFields();
        },
        login(){
            this.$refs.loginFormRef.validate(async valid => {
                if (!valid) return;
                const {data: res} = await this.$http.post("login", this.loginForm);
                if (res.meta.status !== 200) return this.$message.error(`${res.meta.msg}`);
                this.$message.success('登录成功！');
                //登录成功后，将 token 报存在 sessionStorage 中
                window.sessionStorage.setItem("token", res.data.token);
                //通过编程式导航跳转到主页
                this.$router.push('/home')
            });
        }
    },
}
</script>

<style scoped>
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
    }
    .login_box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

    }
    .avatar_box{
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
    }
    .avatar_box img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
    .login_form{
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }
    .btns{
        display: flex;
        justify-content: flex-end;
    }
</style>