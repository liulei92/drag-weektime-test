<template>
  <div>
    <h3>DragWeektime</h3>

    <drag-weektime
      v-model="mult_timeRange"
      :showResult="true"
      @on-clear="handleClearCallBack"
    />
  </div>
</template>

<script>
import DragWeektime from "../components/drag-weektime";

export default {
  name: "DragWeektimeTest",
  components: {
    DragWeektime
  },
  data() {
    return {
      mult_timeRange: []
    };
  },
  methods: {
    handleClearCallBack() {
      console.log("清除完毕");
    }
  }
  // mounted() {
  //   setTimeout(() => {
  //     this.mult_timeRange = [
  //       { id: 0, week: "星期一", value: "00:00-00:30、01:00-01:30" },
  //       { id: 1, week: "星期二", value: "03:00-07:30" },
  //       { id: 2, week: "星期三", value: "03:00-07:30" },
  //       { id: 3, week: "星期四", value: "" },
  //       { id: 4, week: "星期五", value: "" },
  //       { id: 5, week: "星期六", value: "" },
  //       { id: 6, week: "星期日", value: "" }
  //     ];
  //   }, 2000);
  // }
};
</script>
