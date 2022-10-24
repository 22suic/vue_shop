<template>
  <div>
    <!-- 面包屑导航 -->
    <Breadcrumb :path="$route.path" />

    <el-card>
      <!-- 搜索框添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrders"
            @change="getOrders"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrders"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="100"
        ></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="100"
        ></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="160">
          <template slot-scope="scope">
            {{ (scope.row.create_time * 1000) | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="addressEdit"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="orderLocation(scope.row.order_id)"
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

    <el-dialog
      title="修改地址"
      :visible.sync="addEditDialogVisible"
      width="50%"
      @close="handleClose"
    >
      <el-form
        :model="addressRuleForm"
        :rules="addressRules"
        ref="addressRuleForm"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressRuleForm.address1"
            :options="cityData"
            :props="propsCascader"
            style="width: 50%"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressRuleForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addEditDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="物流进度"
      :visible.sync="orderLocationDialogVisible"
      width="30%"
    >
      <el-timeline reverse>
        <el-timeline-item
          v-for="(item, index) in orderLocationInfo"
          :key="index"
          :timestamp="item.time"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from "./citydata";

export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      orderList: [],
      cityData,
      addEditDialogVisible: false,
      addressRuleForm: {
        address1: [],
        address2: "",
      },
      addressRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      // 级联选择框的配置对象
      propsCascader: {
        expandTrigger: "hover",
      },
      orderLocationDialogVisible: false,
      // 物流信息数据
      orderLocationInfo: [
        {
          time: "2018-05-10 09:39:00",
          ftime: "2018-05-10 09:39:00",
          context: "已签收,感谢使用顺丰,期待再次为您服务",
          location: "",
        },
        {
          time: "2018-05-10 08:23:00",
          ftime: "2018-05-10 08:23:00",
          context:
            "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          location: "",
        },
        {
          time: "2018-05-10 07:32:00",
          ftime: "2018-05-10 07:32:00",
          context: "快件到达 [北京海淀育新小区营业点]",
          location: "",
        },
        {
          time: "2018-05-10 02:03:00",
          ftime: "2018-05-10 02:03:00",
          context:
            "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          location: "",
        },
        {
          time: "2018-05-09 23:05:00",
          ftime: "2018-05-09 23:05:00",
          context: "快件到达 [北京顺义集散中心]",
          location: "",
        },
        {
          time: "2018-05-09 21:21:00",
          ftime: "2018-05-09 21:21:00",
          context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          location: "",
        },
        {
          time: "2018-05-09 13:07:00",
          ftime: "2018-05-09 13:07:00",
          context: "顺丰速运 已收取快件",
          location: "",
        },
        {
          time: "2018-05-09 12:25:03",
          ftime: "2018-05-09 12:25:03",
          context: "卖家发货",
          location: "",
        },
        {
          time: "2018-05-09 12:22:24",
          ftime: "2018-05-09 12:22:24",
          context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          location: "",
        },
        {
          time: "2018-05-08 21:36:04",
          ftime: "2018-05-08 21:36:04",
          context: "商品已经下单",
          location: "",
        },
      ],
    };
  },
  created() {
    this.getOrders();
  },
  methods: {
    async getOrders() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取订单列表失败！");
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    // 分页size改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrders();
    },
    // 页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrders();
    },
    handleClose() {
      this.addressRuleForm.address1 = [];
      this.addressRuleForm.address2 = "";
    },
    addressEdit() {
      this.addEditDialogVisible = true;
    },
    async orderLocation(id) {
      this.orderLocationDialogVisible = true;
      //   try {
      //     const { data: res } = await this.$http.get(
      //       "/kuaidi/1106975712662"
      //     );
      //     if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      //     console.log(res.data);
      //   } catch (error) {
      //     console.log(error)
      //   }
    },
  },
};
</script>