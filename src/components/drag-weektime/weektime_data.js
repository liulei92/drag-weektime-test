const formatDate = (date, fmt) => {
  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
};

const formatWeektime = (col, max) => {
  const s = +max === 2 ? 1 : 2;
  const timestamp = 1542384000000; // '2018-11-17 00:00:00'
  const beginstamp = timestamp + col * 1800000 * s; // col * 30 * 60 * 1000
  const endstamp = beginstamp + 1800000 * s;

  const begin = formatDate(new Date(beginstamp), "hh:mm");
  const end = formatDate(new Date(endstamp), "hh:mm");
  return `${begin}-${end}`;
};

const computeMin = arr => {
  return arr.reduce((sum, t, i) => {
    if (i === 0) {
      sum += parseInt(t) * 60;
    } else {
      sum += parseInt(t);
    }
    return sum;
  }, 0);
};

export const createArr = len => {
  return Array.from(Array(len)).map((ret, id) => id);
};

export const splicing = list => {
  let same;
  let i = -1;
  const len = list.length;
  const arr = [];

  if (!len) return;
  while (++i < len) {
    const item = list[i];
    if (item.check) {
      if (item.check !== Boolean(same)) {
        arr.push(...["、", item.begin, "-", item.end]);
      } else if (arr.length) {
        arr.pop();
        arr.push(item.end);
      }
    }
    same = Boolean(item.check);
  }
  arr.shift();
  return arr.join("");
};

export const inserting = (value, list, max = 2) => {
  const valueArr = value.split("、");
  const times = [];
  const min = +max === 2 ? 30 : 60;
  valueArr.forEach(item => {
    const v = item.split("-");
    const s = computeMin(v[0].split(":"));
    const e = computeMin(v[1].split(":"));
    const c = (e - s) / min;
    const b = s / min;
    for (let i = 0; i < c; i++) {
      times.push(formatWeektime(b + i, max));
    }
  });
  return list.map(item => {
    let check = false;
    if (times.includes(item.value)) {
      check = true;
    }
    return {
      ...item,
      check
    };
  });
};

export const createWeektimeData = (max = 2) => {
  return [
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
    "星期日"
  ].map((ret, index) => {
    const children = (ret, row, len) => {
      return createArr(len).map((t, col) => {
        const time = formatWeektime(col, max);
        return {
          week: ret,
          value: time,
          begin: time.split("-")[0],
          end: time.split("-")[1],
          row,
          col
        };
      });
    };
    return {
      value: ret,
      row: index,
      child: children(ret, index, 24 * max)
    };
  });
};
