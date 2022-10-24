<template>
  <div>
    <!-- 面包屑导航 -->
    <Breadcrumb :path="$route.path" />

    <el-card>
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>
<script>
import * as echarts from "echarts";

export default {
  data() {
    return {
      // 需要合并的选项
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      }
    };
  },
  async mounted() {
    var myChart = echarts.init(document.getElementById("main"));
    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200)
      return this.$message.error("获取报表数据失败！");
    let newOptions = Object.assign(this.options, res.data)
    // 绘制图表
    myChart.setOption(newOptions);
  }
};
</script>