<template>
  <div>
    <!-- 面包屑导航 -->
    <Breadcrumb :path="$route.path" />

    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning">
      </el-alert>

      <!-- 级联选择框 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="propsCascader"
            @change="cascaderHandleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 标签页 -->
      <el-tabs v-model="activeName" @tab-click="tabHandleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col>
              <el-button
                type="primary"
                :disabled="isBtnShow"
                @click="showDialog('showAdd')"
                >添加参数</el-button
              >
            </el-col>
          </el-row>
          <!-- 表格 -->
          <el-table :data="manyParamsList" border style="width: 100%" stripe>
            <el-table-column type="expand">
              <!-- tag 标签 -->
              <template slot-scope="scope">
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleTagClose(scope.row, i)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >添加参数项</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showDialog('showEdit', scope.row)"
                  >修改</el-button
                >
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delParams(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col>
              <el-button
                type="primary"
                :disabled="isBtnShow"
                @click="showDialog('showAdd')"
                >添加属性</el-button
              >
            </el-col>
          </el-row>
          <!-- 表格 -->
          <el-table :data="onlyAttriList" border style="width: 100%" stripe>
            <el-table-column type="expand">
              <!-- tag 标签 -->
              <template slot-scope="scope">
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleTagClose(scope.row, i)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >添加参数项</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showDialog('showEdit', scope.row)"
                  >修改</el-button
                >
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delParams(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加或修改参数或属性对话框 -->
      <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="30%"
        @close="dialogClosed('formRef')"
      >
        <el-form
          ref="formRef"
          :model="dialogForm"
          label-width="80px"
          :rules="dialogRules"
        >
          <el-form-item :label="formLabel" prop="attr_name">
            <el-input v-model="dialogForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addOrEditParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from "../../components/Breadcrumb.vue";

export default {
  components: { Breadcrumb },
  data() {
    return {
      // 级联选择框选中项的id
      selectedKeys: [],
      // 物品分类数据
      cateList: [],
      // 级联选择框的配置对象
      propsCascader: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // tabs 激活页面
      activeName: "many",
      // 动态参数列表
      manyParamsList: [],
      // 静态属性列表
      onlyAttriList: [],
      // 对话框显示
      dialogVisible: false,
      // 添加属性或参数验证规则
      dialogRules: {
        attr_name: [{ required: true, message: "请输入名称", trigger: "blur" }],
      },
      // 添加属性或参数对象
      dialogForm: {
        attr_name: "",
      },
      // 用来判断添加还是编辑
      btnRef: "",
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取物品分类的数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("货物物品分类数据失败！");
      this.cateList = res.data;
    },
    // 当级联选择器发生变化时触发
    cascaderHandleChange() {
      // 判断选中的是否为第三级
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyParamsList = [];
        this.onlyAttriList = [];
        return;
      }
      this.getParamsList(this.selectedId);
    },
    // tab标签页点击
    tabHandleClick() {
      if (this.selectedKeys.length) {
        if (this.activeName === "only") {
          if (!this.onlyAttriList.length) this.getParamsList(this.selectedId);
        } else {
          if (!this.manyParamsList) this.getParamsList(this.selectedId);
        }
      }
    },
    // 参数列表获取
    async getParamsList(id) {
      const { data: res } = await this.$http.get(
        `categories/${id}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200)
        return this.$message.error("获取参数列表失败！");
      console.log(res.data);
      res.data.forEach((item) => {
        console.log(item.attr_vals.split(","));
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      if (this.activeName === "many") this.manyParamsList = res.data;
      else this.onlyAttriList = res.data;
    },
    // 添加按钮
    showDialog(ref, row) {
      this.dialogVisible = true;
      this.btnRef = ref;
      if (ref === "showEdit") {
        this.getparamsById(row.attr_id);
      }
    },
    // 根据id获取参数
    async getparamsById(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.selectedId}/attributes/${attrId}`,
        { attr_sel: this.activeName }
      );
      if (res.meta.status !== 200) return this.$message.error("获取数据失败！");
      console.log(res.data);
      this.dialogForm = res.data;
      console.log(this.dialogForm);
    },
    // 添加或修改属性或参数
    addOrEditParams() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return;
        // 判断是添加还是修改操作
        if (this.btnRef === "showAdd") {
          const { data: res } = await this.$http.post(
            `categories/${this.selectedId}/attributes`,
            { attr_name: this.dialogForm.attr_name, attr_sel: this.activeName }
          );
          if (res.meta.status !== 201) return this.$message.error("添加失败！");
          this.$message.success("添加参数成功！");
        } else {
          const { data: res } = await this.$http.put(
            `categories/${this.dialogForm.cat_id}/attributes/${this.dialogForm.attr_id}`,
            {
              attr_name: this.dialogForm.attr_name,
              attr_sel: this.activeName
            }
          );
          if (res.meta.status !== 200)
            return this.$message.error("修改失败！");
          this.$message.success("修改参数成功！");
        }
        this.getParamsList(this.selectedId);
        this.dialogVisible = false;
      });
    },
    // 对话框关闭时表单重置
    dialogClosed(refStr) {
      this.$refs[refStr].resetFields();
    },
    // 展开行添加标签按钮点击
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 展开行input框失去焦点
    async handleInputConfirm(row) {
      if (!row.inputValue.trim().length) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      const { data: res } = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(","),
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("添加参数项失败！");
      this.$message.success("添加参数项成功！");
    },
    // 展开行删除标签
    async handleTagClose(row, i) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数项, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((error) => error);
      if (confirmResult !== "confirm") return this.$message.info("已取消删除");
      row.attr_vals.splice(i, 1);
      const { data: res } = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(","),
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("删除参数项失败！");
      this.$message.success("删除参数项成功！");
    },
    // 删除参数
    async delParams(row) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((error) => error);
      if (confirmResult !== "confirm") return this.$message.info("已取消删除");
      const {data: res} = await this.$http.delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.getParamsList(this.selectedId);
      this.$message.success('删除参数成功！')
    }
  },
  computed: {
    // 计算是否显示添加按钮
    isBtnShow() {
      if (this.selectedKeys.length) return false;
      else return true;
    },
    // 计算添加或修改对话框标题
    dialogTitle() {
      if (this.btnRef === "showAdd") {
        if (this.activeName === "many") return "添加动态参数";
        else return "添加静态属性";
      } else {
        if (this.activeName === "many") return "修改动态参数";
        else return "修改静态属性";
      }
    },
    // 计算表单label
    formLabel() {
      if (this.activeName === "many") return "动态参数";
      else return "静态属性";
    },
    // 计算级联选择框所选id数组最后一位
    selectedId() {
      if (this.selectedKeys.length === 3)
        return this.selectedKeys[this.selectedKeys.length - 1];
    },
  },
};
</script>

<style scoped>
.el-cascader {
  width: 250px;
  margin: 15px 0;
}
.el-alert {
  width: 500px;
}
.el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 150px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>