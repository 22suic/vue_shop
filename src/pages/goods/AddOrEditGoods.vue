<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{editOrAdd}}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert
        :title="editOrAdd + '信息'"
        type="warning"
        effect="dark"
        :closable="false"
        center
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="+activeIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单信息 -->
      <el-form
        :model="addOrEditForm"
        :rules="addOrEditForm"
        ref="addOrEditForm"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="tabsBeforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item>
              <el-form-item label="商品名称" prop="goods_name">
                <el-input
                  v-model="addOrEditForm.goods_name"
                  style="width: 50%"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input
                  v-model="addOrEditForm.goods_price"
                  style="width: 50%"
                  type="number"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input
                  v-model="addOrEditForm.goods_weight"
                  style="width: 50%"
                  type="number"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input
                  v-model="addOrEditForm.goods_number"
                  style="width: 50%"
                  type="number"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品分类">
                <el-cascader
                  v-model="addOrEditForm.goods_cat"
                  :options="cateList"
                  :props="propsCascader"
                  @change="cascaderHandleChange"
                  style="width: 50%"
                  clearable
                ></el-cascader>
              </el-form-item>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTabList"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTabList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="actionUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addOrEditForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addOrEditGoods">
                {{editOrAdd}}
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewDialog" width="50%">
      <img :src="previewPath" alt="" width="100%" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 添加或修改商品表单对象
      addOrEditForm: {
        goods_name: "",
        goods_price: '0',
        goods_weight: '0',
        goods_number: '0',
        goods_cat: [],
        pics: [],
        // 商品内容
        goods_introduce: '',
        attrs: []
      },
      // 添加表单规则
      addOrEditFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
      },
      // 激活的步骤条和tab页
      activeIndex: "0",
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      propsCascader: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 商品参数数据
      manyTabList: [],
      // 商品属性数据
      onlyTabList: [],
      // 上传图片的地址
      actionUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      // 上传的请求头部
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      previewDialog: false,
    };
  },
  created() {
    this.getCateList();
    this.getGoodsInfo()
  },
  methods: {
    // 获取要修改商品信息
    async getGoodsInfo() {
      if (this.$route.query._ !== 'edit') return
      const {data: res} = await this.$http.get(`goods/${this.$route.query.id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.goods_cat = res.data.goods_cat.split(',').map(Number)
      res.data.goods_price = res.data.goods_price + ''
      res.data.goods_number = res.data.goods_number + ''
      res.data.goods_weight = res.data.goods_weight + ''
      this.addOrEditForm = res.data
    },
    // 获取商品分类的数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("货物物品分类数据失败！");
      this.cateList = res.data;
    },
    // 当级联选择器发生变化时触发
    cascaderHandleChange() {
      // 判断选中的是否为第三级
      if (this.addOrEditForm.goods_cat.length !== 3) {
        this.addOrEditForm.goods_cat = [];
        return;
      }
    },
    // 切换标签前触发
    tabsBeforeLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addOrEditForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    // tab点击时触发
    async tabClick() {
      if (this.activeIndex === "1" && !this.manyTabList.length) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "many" } }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取参数列表失败！");
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        });
        this.manyTabList = res.data;
      } else if (this.activeIndex === "2" && !this.onlyTabList.length) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "only" } }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取属性列表失败！");
        this.onlyTabList = res.data;
      }
    },
    // 上传成功
    handleSuccess(res) {
      let picInfo = { pic: res.data.tmp_path };
      this.addOrEditForm.pics.push(picInfo);
    },
    // 图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewDialog = true;
    },
    // 移除图片
    handleRemove(file) {
      let tempPath = file.response.data.tmp_path;
      let pic = this.addOrEditForm.pics.findIndex((i) => i.pic === tempPath);
      this.addOrEditForm.pics.splice(pic, 1);
    },
    // 添加或修改商品
    addOrEditGoods() {
      // if (!this.manyTabList.length)
      //     return this.$message.error('商品参数未设置！')
      // else if (!this.onlyTabList.length)
      //     return this.$message.error('商品属性未设置！')
      this.$refs.addOrEditForm.validate(async (valid) => {
          if (!valid) return this.$message.error('还有信息尚未填写！')

          let newaddOrEditForm = JSON.parse(JSON.stringify(this.addOrEditForm))
          newaddOrEditForm.goods_cat = newaddOrEditForm.goods_cat.join(',')
          this.manyTabList.forEach(item => {
              let attr = {
                  attr_id: item.attr_id,
                  attr_value: item.attr_vals.join(',')
              }
              newaddOrEditForm.attrs.push(attr)
          })
          this.onlyTabList.forEach(item => {
              let attr = {
                  attr_id: item.attr_id,
                  attr_value: item.attr_vals
              }
              newaddOrEditForm.attrs.push(attr)
          })
          // 判断添加还是修改操作
          if (this.$route.query._ === 'add') {
            const {data: res} = await this.$http.post('goods', newaddOrEditForm)
            if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
            this.$router.push('/goods')
            this.$message.success('添加商品成功！')
          }else {
            const {data: res} = await this.$http.put(`goods/${newaddOrEditForm.goods_id}`, newaddOrEditForm)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$router.push('/goods')
            this.$message.success('修改商品成功！')
          }
      })
    }
  },
  computed: {
    // 计算级联选择框所选id数组最后一位
    cateId() {
      if (this.addOrEditForm.goods_cat.length === 3) return this.addOrEditForm.goods_cat[2];
      return null;
    },
    // 计算是添加商品还是修改商品
    editOrAdd() {
      if(this.$route.query._ === 'add') {
        return '添加商品'
      }else {
        return '修改商品'
      }
    }
  },
};
</script>
<style scoped>
::v-deep .el-alert__title {
  font-size: 18px;
}
.el-steps {
  margin: 25px 0;
}
.el-form-item {
  margin-top: 5px;
}
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
.addBtn {
    margin-top: 10px;
    float: right;
}
</style>