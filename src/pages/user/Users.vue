<template>
  <div>
      <!-- 面包屑导航 -->
      <Breadcrumb :path="$route.path"/>

      <!-- 卡片视图 -->
      <el-card>
          <!-- 用户搜索与添加 -->
          <el-row :gutter="20">
              <el-col :span="8">
                  <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList" @change="getUserList">
                      <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                  </el-input>
              </el-col>
              <el-col :span="4">
                  <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
              </el-col>
          </el-row>
          <!-- 用户列表 -->
          <el-table :data="userList" border stripe>
              <el-table-column type="index" ></el-table-column>
              <el-table-column label="姓名" prop="username"></el-table-column>
              <el-table-column label="邮箱" prop="email"></el-table-column>
              <el-table-column label="电话" prop="mobile"></el-table-column>
              <el-table-column label="角色" prop="role_name"></el-table-column>
              <el-table-column label="状态" prop="mg_state">
                  <template slot-scope="scope">
                      <el-switch
                        v-model="scope.row.mg_state"
                        @change="userStateChanged(scope.row)">
                      </el-switch>
                  </template>
              </el-table-column>
              <el-table-column label="操作">
                  <template slot-scope="scope">
                      <el-button type="primary" icon="el-icon-edit" circle @click="showEditDialog(scope.row.id)"></el-button>
                      <el-button type="danger" icon="el-icon-delete" circle @click="delectUser(scope.row.id)"></el-button>
                      <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" circle @click="showSetRoleDiglog(scope.row)"></el-button>
                      </el-tooltip>
                  </template>
              </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
          <!-- 添加用户对话框 -->
          <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="30%"
            @close="dialogClosed('addFormRef')">
            <el-form :model="addForm" :rules="formRules" label-width="80px" ref="addFormRef">
                <el-form-item label="用户名称" prop="username">
                <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
          </el-dialog>
          <!-- 修改用户对话框 -->
          <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="30%"
            @close="dialogClosed('editFormRef')">
            <el-form :model="editForm" :rules="formRules" label-width="80px" ref="editFormRef">
                <el-form-item label="用户名称" prop="username">
                <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
          </el-dialog>
          <!-- 分配角色对话框 -->
          <el-dialog
            title="提示"
            :visible.sync="setRoleDialogVisible"
            width="50%" 
            @close="setRoleDialogClosed">
            <div>
                <p>当前的用户：{{this.userInfo.username}}</p>
                <p>当前的角色：{{this.userInfo.role_name}}</p>
                <p>分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择角色">
                        <el-option
                        v-for="item in rolesList"
                        :key="item.id"
                        :label="item.roleName"
                        :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRole">确 定</el-button>
            </span>
          </el-dialog>
      </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../../components/Breadcrumb.vue'

export default {
    components:{Breadcrumb},
    data() {
        // 邮箱自定义校验规则
        var checkEmail = (_, value, cb) => {
            const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
            if (regEmail.test(value)) {
                return cb()
            }
            cb(new Error('邮箱格式不正确'))
        }
        // 手机号自定义校验规则
        var checkMobile = (_, value, cb) => {
            const regEmail = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
            if (regEmail.test(value)) {
                return cb()
            }
            cb(new Error('手机号格式不正确'))
        }
        return {
            // 获取用户列表参数对象
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            // 用户列表
            userList: [],
            total: 0,
            // 添加用户对话框显示
            addDialogVisible: false,
            // 修改用户对话框显示
            editDialogVisible: false,
            // 添加用户表单信息
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加用户表单规则
            formRules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '用户名长度在 3 到 6 个字符', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }],
                email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger: 'blur'}],
                mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' },
                        { validator: checkMobile, trigger: 'blur'}]
            },
            // 保存修改时查询到的用户信息
            editForm: {},
            // 分配角色对话框显示状态
            setRoleDialogVisible: false,
            // 分配角色对话框的当前用户信息
            userInfo: {},
            // 已选中的角色id值
            selectedRoleId: '',
            // 全部角色列表
            rolesList: {}
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList(){
            const {data: res} = await this.$http.get('users', {params: this.queryInfo})
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.userList = res.data.users
            this.total = res.data.total
        },
        // 分页
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 用户状态修改
        async userStateChanged(userinfo){
            const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state
                this.$message.error('更新用户状态失败！')
            }
            this.$message.success('更新用户状态成功！')
        },
        // 用户表单重置
        dialogClosed(refStr){
            this.$refs[refStr].resetFields()
        },
        // 添加用户
        addUser(){
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.post('users', this.addForm)
                if(res.meta.status !== 201) return this.$message.error('添加用户失败！')
                this.addDialogVisible = false
                this.getUserList()
                this.$message.success('添加用户成功！')
            })
        },
        // 展示修改用户对话框
        async showEditDialog(id){
            const {data: res} = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 修改用户
        editUser(){
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.put('users/' + this.editForm.id, {email: this.editForm.email, mobile: this.editForm.mobile})
                if(res.meta.status !== 200) return this.$message.error('修改用户信息失败！')
                this.editDialogVisible = false
                this.getUserList()
                this.$message.success('修改用户信息成功！')
            })
        },
        // 删除用户
        async delectUser(id){
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const {data: res} = await this.$http.delete('users/' + id)
            this.getUserList()
            this.$message.success('用户删除成功！')
        },
        // 分配角色对话框显示
        showSetRoleDiglog(userInfo){
            this.userInfo = userInfo
            this.getRolesList()
            this.setRoleDialogVisible = true
        },
        // 获取角色列表
        async getRolesList() {
            const { data: res } = await this.$http.get("roles");
            if (res.meta.status !== 200)
                return this.$message.error("获取角色列表失败！");
            this.rolesList = res.data
        },
        // 分配角色
        async setRole(){
            if (!this.selectedRoleId) return this.$message.error('请先选择要分配的角色')
            const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
            if (res.meta.status !== 200) return this.$message.error('分配角色失败！')
            this.getUserList()
            this.setRoleDialogVisible = false
            this.$message.success('分配角色成功！')
        },
        // 分配角色对话框关闭
        setRoleDialogClosed(){
            this.selectedRoleId = ''
            this.userInfo = {}
        }
    },
}
</script>