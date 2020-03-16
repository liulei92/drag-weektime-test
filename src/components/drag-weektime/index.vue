<template>
  <div class="c-weektime">
    <div class="c-schedue"></div>
    <div
      :class="{ 'c-schedue': true, 'c-schedue-notransi': mode }"
      :style="styleValue"
    ></div>

    <table :class="{ 'c-min-table': colspan < 2 }" class="c-weektime-table">
      <thead class="c-weektime-head">
        <tr>
          <th rowspan="8" class="week-td">星期/时间</th>
          <th :colspan="12 * colspan">00:00 - 12:00</th>
          <th :colspan="12 * colspan">12:00 - 24:00</th>
        </tr>
        <tr>
          <td v-for="t in theadArr" :key="t" :colspan="colspan">{{ t }}</td>
        </tr>
      </thead>
      <tbody class="c-weektime-body">
        <tr v-for="t in weektimeData" :key="t.row">
          <td>{{ t.value }}</td>
          <td
            v-for="n in t.child"
            :key="`${n.row}-${n.col}`"
            :data-week="n.row"
            :data-time="n.col"
            :class="selectClasses(n)"
            @mouseenter="cellEnter(n)"
            @mousedown="cellDown(n)"
            @mouseup="cellUp(n)"
            class="weektime-atom-item"
          ></td>
        </tr>
        <tr>
          <td colspan="49" class="c-weektime-preview">
            <div class="g-clearfix c-weektime-con">
              <span class="g-pull-left">{{
                showResult && selectState
                  ? "已选择时间段"
                  : "可拖动鼠标选择时间段"
              }}</span>
              <a @click.prevent="handleClear" class="g-pull-right">清空选择</a>
            </div>
            <div v-if="showResult && selectState" class="c-weektime-time">
              <div v-for="t in selectValue" :key="t.id">
                <p>
                  <span class="g-tip-text">{{ t.week }}：</span>
                  <span>{{ t.value }}</span>
                </p>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  createArr,
  splicing,
  inserting,
  createWeektimeData
} from "./weektime_data";

export default {
  name: "DragWeektime",
  value: {
    prop: "model",
    event: "input"
  },
  props: {
    value: {
      type: Array,
      required: true
    },
    // 粒度 1 为 7*24 即 24小时; 2 为 7*48 即 48个30分
    colspan: {
      type: Number,
      default() {
        return 2;
      }
    },
    // 是否展示 选择时间段的结果
    showResult: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  data() {
    return {
      weektimeData: [],
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      mode: 0,
      row: 0,
      col: 0,
      theadArr: [],
      selfValue: []
    };
  },
  computed: {
    styleValue() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        left: `${this.left}px`,
        top: `${this.top}px`
      };
    },
    selectValue() {
      // 将选中的值映射到 weektimedata上, 使其选中
      return this.value !== undefined
        ? this.value.filter(item => item.value)
        : this.selfValue;
    },
    // 计算是否有选中
    selectState() {
      return this.value.some(ret => ret.value);
    },
    // 判断当前item是否选中
    selectClasses() {
      return n => (n.check ? "ui-selected" : "");
    }
  },
  watch: {
    selectValue: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          // 根据已选择 进行分割 已选 和 未选
          const checkedId = newVal.map(item => +item.id);
          let checked = [];
          let unchecked = [];
          this.weektimeData.forEach(item => {
            if (checkedId.includes(+item.row)) {
              checked.push(item);
            } else {
              unchecked.push(item);
            }
          });
          // 先将未选的 全部改为false
          unchecked.forEach(item => {
            item.child.forEach(t => {
              this.$set(t, "check", false);
            });
          });
          // 再来处理 已选
          checked = checked.map(item => {
            const value = newVal.filter(t => +t.id === +item.row)[0].value;
            return {
              ...item,
              child: inserting(value, item.child, this.colspan)
            };
          });
          this.weektimeData = checked
            .concat(unchecked)
            .sort((a, b) => a.row - b.row);
        }
      },
      deep: true, // 对象内部的属性监听，也叫深度监听
      immediate: true // 立即执行
    }
  },
  created() {
    this.weektimeData = createWeektimeData(this.colspan);
    this.theadArr = createArr(24);
  },
  methods: {
    cellEnter(item) {
      const ele = document.querySelector(
        `td[data-week='${item.row}'][data-time='${item.col}']`
      );
      if (ele && !this.mode) {
        this.left = ele.offsetLeft;
        this.top = ele.offsetTop;
      } else if (item.col <= this.col && item.row <= this.row) {
        this.width = (this.col - item.col + 1) * ele.offsetWidth;
        this.height = (this.row - item.row + 1) * ele.offsetHeight;
        this.left = ele.offsetLeft;
        this.top = ele.offsetTop;
      } else if (item.col >= this.col && item.row >= this.row) {
        this.width = (item.col - this.col + 1) * ele.offsetWidth;
        this.height = (item.row - this.row + 1) * ele.offsetHeight;
        if (item.col > this.col && item.row === this.row)
          this.top = ele.offsetTop;
        if (item.col === this.col && item.row > this.row)
          this.left = ele.offsetLeft;
      } else if (item.col > this.col && item.row < this.row) {
        this.width = (item.col - this.col + 1) * ele.offsetWidth;
        this.height = (this.row - item.row + 1) * ele.offsetHeight;
        this.top = ele.offsetTop;
      } else if (item.col < this.col && item.row > this.row) {
        this.width = (this.col - item.col + 1) * ele.offsetWidth;
        this.height = (item.row - this.row + 1) * ele.offsetHeight;
        this.left = ele.offsetLeft;
      }
    },
    cellDown(item) {
      const ele = document.querySelector(
        `td[data-week='${item.row}'][data-time='${item.col}']`
      );
      this.check = Boolean(item.check);
      this.mode = 1;
      if (ele) {
        this.width = ele.offsetWidth;
        this.height = ele.offsetHeight;
      }

      this.row = item.row;
      this.col = item.col;
    },
    cellUp(item) {
      if (item.col <= this.col && item.row <= this.row) {
        this.selectWeek(
          [item.row, this.row],
          [item.col, this.col],
          !this.check
        );
      } else if (item.col >= this.col && item.row >= this.row) {
        this.selectWeek(
          [this.row, item.row],
          [this.col, item.col],
          !this.check
        );
      } else if (item.col > this.col && item.row < this.row) {
        this.selectWeek(
          [item.row, this.row],
          [this.col, item.col],
          !this.check
        );
      } else if (item.col < this.col && item.row > this.row) {
        this.selectWeek(
          [this.row, item.row],
          [item.col, this.col],
          !this.check
        );
      }

      this.width = 0;
      this.height = 0;
      this.mode = 0;
    },
    selectWeek(row, col, check) {
      const [minRow, maxRow] = row;
      const [minCol, maxCol] = col;
      this.weektimeData.forEach(item => {
        item.child.forEach(t => {
          if (
            t.row >= minRow &&
            t.row <= maxRow &&
            t.col >= minCol &&
            t.col <= maxCol
          ) {
            this.$set(t, "check", check);
          }
        });
      });
      const selectArr = this.weektimeData
        .map(item => {
          return {
            id: item.row,
            week: item.value,
            value: splicing(item.child)
          };
        })
        .filter(item => item.value);
      this.selfValue = selectArr;
      this.$emit("input", selectArr);
    },
    // 清除
    handleClear() {
      this.weektimeData.forEach(item => {
        item.child.forEach(t => {
          this.$set(t, "check", false);
        });
      });
      this.$emit("input", []);
      this.$emit("on-clear");
    }
  }
};
</script>

<style lang="less" scoped>
.c-weektime {
  min-width: 640px;
  position: relative;
  display: inline-block;
}
.c-schedue {
  background: #598fe6;
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0.6;
  pointer-events: none;
}
.c-schedue-notransi {
  transition: width 0.12s ease, height 0.12s ease, top 0.12s ease,
    left 0.12s ease;
}
.c-weektime-table {
  border-collapse: collapse;
  th {
    vertical-align: inherit;
    font-weight: bold;
  }
  tr {
    height: 30px;
  }
  tr,
  td,
  th {
    user-select: none;
    border: 1px solid #dee4f5;
    text-align: center;
    min-width: 12px;
    line-height: 1.8em;
    transition: background 0.2s ease;
  }
  .c-weektime-head {
    font-size: 12px;
    .week-td {
      width: 70px;
    }
  }
  .c-weektime-body {
    font-size: 12px;
    td {
      &.weektime-atom-item {
        user-select: unset;
        background-color: #f5f5f5;
      }
      &.ui-selected {
        background-color: #598fe6;
      }
    }
  }
  .c-weektime-preview {
    line-height: 2.4em;
    padding: 0 10px;
    font-size: 14px;
    .c-weektime-con {
      line-height: 46px;
      user-select: none;
    }
    .c-weektime-time {
      text-align: left;
      line-height: 2.4em;
      p {
        max-width: 625px;
        line-height: 1.4em;
        word-break: break-all;
        margin-bottom: 8px;
      }
    }
  }
}
.c-min-table {
  tr,
  td,
  th {
    min-width: 24px;
  }
}
.g-clearfix {
  &:after,
  &:before {
    clear: both;
    content: " ";
    display: table;
  }
}
.g-pull-left {
  float: left;
}
.g-pull-right {
  float: right;
}
.g-tip-text {
  color: #999;
}
</style>
