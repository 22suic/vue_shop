<template>
    <div>
        <!-- 面包屑导航 -->
        <Breadcrumb :path="$route.path"/>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 物品分类表格 -->
            <el-table :data="cateList" row-key="cat_id" border>
                <el-table-column type="index">
                    <!-- 判断是否为根节点，根节点才添加索引 -->
                    <template slot-scope="scope">
                        <span>{{scope.row.cat_level === 0 ? scope.row.index: ''}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="cat_name" label="分类名称"></el-table-column>
                <el-table-column prop="cat_deleted" label="是否有效">
                    <template slot-scope="scope">
                        <i class="el-icon-success" style="color: green" v-if="!scope.row.cat_deleted"></i>
                        <i class="el-icon-error" style="color: red" v-else></i>
                    </template>
                </el-table-column>
                <el-table-column prop="cat_level" label="排序">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
                        <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
                        <el-tag v-else type="warning" size="mini">三级</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            size="mini"
                            @click="delectCate(scope.row.cat_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

            <!-- 添加分类对话框 -->
            <el-dialog
                title="添加分类"
                :visible.sync="addDialogVisible"
                width="30%"
                @close="dialogClosed('addFormRef')">
                <el-form :model="addForm" :rules="formRules" label-width="80px" ref="addFormRef">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="addForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类">
                        <el-cascader
                            v-model="selectedKeys"
                            :options="parentCateList"
                            :props="cascaderProps"
                            @change="parentCateChanged"
                            clearable
                            ref="cascader"></el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCate">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改分类对话框 -->
            <el-dialog
                title="修改分类"
                :visible.sync="editDialogVisible"
                width="30%"
                @close="dialogClosed('editFormRef')">
                <el-form :model="editForm" :rules="formRules" label-width="80px" ref="editFormRef">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="editForm.cat_name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editCate">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 查询条件
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 物品分类数据
            cateList: [],
            // 物品分类总数
            total: 0,
            // 添加分类对话框显示
            addDialogVisible: false,
            // 修改分类对话框显示
            editDialogVisible: false,
            // 添加分类表单信息
            addForm: {
                cat_pid: 0,
                cat_name: '',
                cat_level: 0
            },
            // 添加分类表单规则
            formRules: {
                cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
            },
            // 父级分类
            parentCateList: [],
            // 所选父级分类
            parentCate: '',
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover',
                checkStrictly: true
            },
            // 选中的父级分类ID数组
            selectedKeys: [],
            // 保存要修改的分类参数
            editForm: {}
        }
    },
    created() {
        // 获取物品分类数据
        this.getCateList()
    },
    methods: {
        // 获取分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
            if (res.meta.status !==200) return this.$message.error('获取物品分类失败！')
            res.data.result.forEach((item, i) => (item.index = i + 1))
            this.cateList = res.data.result
            this.total = res.data.total
        },

        // 分页size改变
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },

        // 页码改变
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },

        // 获取父级分类
        async getParentCateList() {
            const {data: res} = await this.$http.get('categories', {params: {type: 2}})
            if (res.meta.status !==200) return this.$message.error('获取物品分类失败！')
            this.parentCateList = res.data
        },

        // 添加分类对话框显示
        showAddDialog() {
            this.addDialogVisible = true
            this.getParentCateList()
        },

        // 选择项发生变化时触发的函数
        parentCateChanged() {
            if (this.selectedKeys[this.selectedKeys.length-1]){
                this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
            }
            else {
                this.addForm.cat_pid = 0
            }
            this.addForm.cat_level = this.selectedKeys.length
            // 级联选择器选中后收起
            this.$refs.cascader.dropDownVisible = false
        },

        // 添加分类
        addCate() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.post('categories', this.addForm)
                if(res.meta.status !== 201) return this.$message.error('添加分类失败！')
                this.addDialogVisible = false
                this.getCateList()
                this.$message.success('添加分类成功！')
            })
        },
        
        // 对话框关闭时表单重置
        dialogClosed(refStr){
            this.$refs[refStr].resetFields()
            this.selectedKeys = []
            this.addForm.cat_pid = 0
            this.addForm.cat_level = 0
        },
        
        // 修改分类对话框显示
        showEditDialog(id) {
            this.editDialogVisible = true
            this.getParentCateByID(id)
        },

        // 根据id查询分类
        async getParentCateByID(id) {
            const {data: res} = await this.$http.get('categories/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询分类信息失败！')
            this.editForm = res.data
            this.editDialogVisible = true
        },

        // 修改分类
        editCate() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.put('categories/' + this.editForm.cat_id, {cat_name: this.editForm.cat_name})
                if(res.meta.status !== 200) return this.$message.error('修改分类信息失败！')
                this.editDialogVisible = false
                this.getCateList()
                this.$message.success('修改分类信息成功！')
            })
        },
        
        // 删除分类
        async delectCate(id){
            const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const {data: res} = await this.$http.delete('categories/' + id)
            this.getCateList()
            this.$message.success('分类删除成功！')
        }
    }
}
</script>