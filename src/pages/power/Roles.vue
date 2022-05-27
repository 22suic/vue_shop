<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 表格 -->
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
            <template slot-scope="scope">
                <el-row :class="['vcenter', 'bdbottom', i1 === 0 ? 'bdtop' : '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                    <!-- 一级权限 -->
                    <el-col :span="5">
                        <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 二、三级权限 -->
                    <el-col :span="19">
                        <el-row :class="['vcenter', i2 === 0 ? '' : 'bdtop']" v-for="(item2, i2) in item1.children" :key="item2.id">
                            <!-- 二级权限 -->
                            <el-col :span="6">
                                <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 三级权限 -->
                            <el-col :span="18">
                                <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="showEditDialog(scope.row.id)"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              @click="delectRoles(scope.row.id)"></el-button>
            <el-tooltip
              effect="dark"
              content="分配权限"
              placement="top"
              :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
                @click="showSetRightsDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="dialogClosed('addFormRef')">
        <el-form :model="addForm" :rules="formRules" label-width="80px" ref="addFormRef">
            <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述">
            <el-input v-model="addForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="dialogClosed('editFormRef')">
        <el-form :model="editForm" :rules="formRules" label-width="80px" ref="editFormRef">
            <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述">
            <el-input v-model="editForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setDialogVisible"
        width="50%"
        @close="setRightsDialogClosed">
        <el-tree :data="rightsList" :props="treeProps" default-expand-all show-checkbox node-key="id" :default-checked-keys="checkedRights" ref="setRightsTreeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRoleRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 添加角色对话框显示
      addDialogVisible: false,
      // 修改角色对话框显示
      editDialogVisible: false,
      // 添加角色表单信息
      addForm: {
          roleName: '',
          roleDesc: ''
      },
      // 添加角色表单规则
      formRules: {
          roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' },
              { min: 3, max: 6, message: '角色名长度在 3 到 6 个字符', trigger: 'blur' }]
      },
      // 保存修改时查询到的用户信息
      editForm: {},
      // 分配权限对话框展示状态
      setDialogVisible: false,
      // 所有权限列表
      rightsList: [],
      // 分配权限对话框树形规则
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 分配权限对话框默认选中ID数组
      checkedRights: [],
      // 分配当前角色权限时的当前角色id
      roleId: ''
    };
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败！");
      this.rolesList = res.data
    },
    // 添加角色
    addRoles(){
        this.$refs.addFormRef.validate(async valid => {
            if (!valid) return
            const {data: res} = await this.$http.post('roles', this.addForm)
            if(res.meta.status !== 201) return this.$message.error('添加角色失败！')
            this.addDialogVisible = false
            this.getRolesList()
            this.$message.success('添加角色成功！')
        })
    },
    // 展示修改用户对话框
    async showEditDialog(id){
        const {data: res} = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('查询角色信息失败！')
        this.editForm = res.data
        this.editDialogVisible = true
    },
    // 角色删除
    async delectRoles(id){
        const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(error => error)
        if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
        const {data: res} = await this.$http.delete('roles/' + id)
        this.getRolesList()
        this.$message.success('角色删除成功！')
    },
    // 用户表单重置
    dialogClosed(refStr){
        this.$refs[refStr].resetFields()
    },
    // 修改角色
    editRoles(){
        this.$refs.editFormRef.validate(async valid => {
            if (!valid) return
            const {data: res} = await this.$http.put('roles/' + this.editForm.roleId, {roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc})
            if(res.meta.status !== 200) return this.$message.error('修改角色信息失败！')
            this.editDialogVisible = false
            this.getRolesList()
            this.$message.success('修改角色信息成功！')
        })
    },
    // 根据id删除对应权限
    async removeRightById(role, rightId){
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            role.children = res.data
    },
    // 获取进入分配权限对话框时的选中权限
    getRightsChecked(node, arr){
      if (!node.children) return arr.push(node.id)
      node.children.forEach(element => {
        this.getRightsChecked(element, arr)
      });
    },
    // 展示设置权限对话框
    async showSetRightsDialog(role){
      this.roleId = role.id
      const {data: res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.rightsList = res.data
      this.getRightsChecked(role, this.checkedRights)
      this.setDialogVisible = true
    },
    // 分配权限对话框关闭事件
    setRightsDialogClosed(){
      this.checkedRights = []
    },
    // 为当前角色分配权限
    async setRoleRights(){
      const keys = [
        ...this.$refs.setRightsTreeRef.getCheckedKeys(),
        ...this.$refs.setRightsTreeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {data :res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.getRolesList()
      this.setDialogVisible = false
      this.$message.success('分配权限成功！')
    }
  }
};
</script>

<style scoped>
    .el-tag {
        margin: 7px;
    }
    .bdtop {
        border-top: 1px solid #eee;
    }
    .bdbottom {
        border-bottom: 1px solid #eee;
    }
    .vcenter {
        display: flex;
        align-items: center;
    }
</style>