<template>
  <div>
    <!-- 面包屑导航 -->
    <Breadcrumb :path="$route.path" />

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getList" @change="getList">
            <el-button slot="append" icon="el-icon-search" @click="getList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表 -->
      <el-table :data="goodsList" border stripe style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="103">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="78">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160">
          <template slot-scope="scope">
            {{ (scope.row.add_time * 1000) | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="eaitGoods(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="reMoveById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        // 查询关键字
        query: "",
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10,
      },
      // 商品总数
      total: 0,
      // 商品列表
      goodsList: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 获取商品列表
    async getList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败！");
      this.goodsList = res.data.goods;
      this.total = res.data.total
    },
    // 分页size改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getList();
    },
    // 页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getList();
    },
    // 删除商品
    async reMoveById(id) {
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
      const {data: res} = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！'+res.meta.mes)
      this.$message.success('删除商品成功！')
      this.getList();
    },
    // 跳转添加商品页面
    goAddPage() {
      this.$router.push({name: 'addOrEditGoods', query: {_: 'add'}})
    },
    // 跳转修改商品页面
    eaitGoods(id) {
      this.$router.push({name: 'addOrEditGoods', query: {_: 'edit', id: id}})
    }
  },
};
</script>
<style scoped>
</style>