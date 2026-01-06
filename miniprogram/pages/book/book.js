Page({
  data: {
    dateList: [], // 最近7天日期列表
    selectedDate: '', // 选中的日期（默认当天）
    timeList: [], // 动态生成的2小时间隔时间段列表
    selectedTime: '', // 选中的时间段（默认第一个有效时段）
    formData: { // 表单数据（姓名+手机号）
      name: '',
      phone: ''
    },
    // 商家营业时间（从美食详情页接收，默认值兜底）
    shopOpenTime: '09:00',
    shopCloseTime: '18:00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 1. 接收从美食详情页传递的参数（解码处理）
    const shopOpenTime = decodeURIComponent(options.shopOpenTime || this.data.shopOpenTime);
    const shopCloseTime = decodeURIComponent(options.shopCloseTime || this.data.shopCloseTime);
    this.setData({
      shopOpenTime,
      shopCloseTime
    });

    // 2. 生成最近7天日期（默认选中当天，不变）
    this.generateRecent7DaysDate();

    // 3. 核心：优化生成2小时间隔的时间段（匹配商家完整营业时间，无16:00限制）
    this.generate2HourIntervalTimeList();
  },

  /**
   * 生成最近7天日期（不变，默认选中当天）
   */
  generateRecent7DaysDate() {
    const dateList = [];
    const today = new Date();
    const todayTimestamp = today.getTime(); // 今天的时间戳

    // 循环生成最近7天（今天+未来6天）
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(todayTimestamp + i * 24 * 60 * 60 * 1000); // 每天增加24小时
      const day = currentDate.getDate();
      const fullDate = currentDate.toLocaleDateString(); // 完整日期（如2026/1/6）
      const isToday = i === 0; // 第0天是今天

      dateList.push({
        day: day,
        fullDate: fullDate,
        isToday: isToday,
        isActive: isToday, // 默认选中今天
        uniqueKey: `date_${i}_${day}` // 用于wx:key的唯一标识
      });
    }

    // 设置页面数据
    this.setData({
      dateList: dateList,
      selectedDate: dateList[0].fullDate // 默认选中当天
    });
  },

  /**
   * 核心：优化！根据商家完整营业时间，动态生成2小时间隔的时间段（无16:00限制，匹配闭店时间）
   */
  generate2HourIntervalTimeList() {
    const { shopOpenTime, shopCloseTime } = this.data;
    const timeList = [];

    // 1. 解析营业时间（处理 "08:30" → 转为分钟数，方便计算，兼容非整点时间）
    const parseTimeToMinutes = (timeStr) => {
      const [hour, minute] = timeStr.split(':').map(Number);
      return hour * 60 + minute;
    };

    const openMinutes = parseTimeToMinutes(shopOpenTime);
    const closeMinutes = parseTimeToMinutes(shopCloseTime);
    const intervalMinutes = 120; // 2小时 = 120分钟（间隔不变）

    // 2. 从开店时间开始，以2小时为间隔生成时间段（不超过闭店时间）
    let currentStartMinutes = openMinutes;
    while (true) {
      const currentEndMinutes = currentStartMinutes + intervalMinutes; // 时间段结束时间（分钟数）

      // 终止条件：当前开始时间 ≥ 闭店时间，或结束时间 > 闭店时间（避免超出商家营业时间）
      if (currentStartMinutes >= closeMinutes || currentEndMinutes > closeMinutes) {
        // 特殊处理：若最后一段不足2小时，但距离闭店时间≥1小时（可选，保留完整时段优先）
        if (currentStartMinutes < closeMinutes && (closeMinutes - currentStartMinutes) >= 60) {
          // 生成以闭店时间为结束的时间段
          const formatStart = this.formatMinutesToTime(currentStartMinutes);
          const formatEnd = shopCloseTime;
          timeList.push({ time: `${formatStart}-${formatEnd}` });
        }
        break;
      }

      // 3. 格式化时间段（分钟数 → "HH:MM" 格式）
      const formatStart = this.formatMinutesToTime(currentStartMinutes);
      const formatEnd = this.formatMinutesToTime(currentEndMinutes);
      const timeStr = `${formatStart}-${formatEnd}`;

      // 4. 添加到时间段列表
      timeList.push({ time: timeStr });

      // 5. 推进到下一个2小时间隔
      currentStartMinutes = currentEndMinutes;
    }

    // 6. 设置时间段列表，默认选中第一个有效时段
    this.setData({
      timeList: timeList,
      selectedTime: timeList.length > 0 ? timeList[0].time : ''
    });
  },

  /**
   * 辅助方法：分钟数 → "HH:MM" 格式（补零，确保格式统一）
   */
  formatMinutesToTime(minutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  },

  /**
   * 选择日期（不变）
   */
  selectDate(e) {
    const index = e.currentTarget.dataset.index;
    const { dateList } = this.data;

    // 更新日期选中状态
    const newDateList = dateList.map((item, idx) => ({
      ...item,
      isActive: idx === index
    }));

    this.setData({
      dateList: newDateList,
      selectedDate: newDateList[index].fullDate
    });
  },

  /**
   * 选择时间段（不变，适配动态列表）
   */
  selectTime(e) {
    const selectedTime = e.currentTarget.dataset.time;
    this.setData({
      selectedTime: selectedTime
    });
  },

  /**
   * 输入框内容变化（不变）
   */
  inputChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value.trim(); // 去除前后空格

    this.setData({
      [`formData.${key}`]: value
    });
  },

  /**
   * 获取用户信息（不变）
   */
  getUserInfo() {
    wx.getUserProfile({
      desc: '用于快速填写预订联系人姓名',
      success: (res) => {
        if (res.userInfo && res.userInfo.nickName) {
          this.setData({
            'formData.name': res.userInfo.nickName
          });
          wx.showToast({
            title: '姓名已填充',
            icon: 'success',
            duration: 1500
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '授权失败，请手动填写',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 提交预订（不变，保留必填校验）
   */
  submitBook() {
    const { formData, selectedDate, selectedTime } = this.data;
    const { name, phone } = formData;

    // 1. 姓名必填校验
    if (!name) {
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none'
      });
      return;
    }

    // 2. 手机号必填校验
    if (!phone) {
      wx.showToast({
        title: '请输入联系手机号',
        icon: 'none'
      });
      return;
    }

    // 3. 手机号格式校验（11位手机号，以13/14/15/16/17/18/19开头）
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '请输入正确的11位手机号',
        icon: 'none'
      });
      return;
    }

    // 4. 时间段校验（避免无有效时间段提交）
    if (!selectedTime) {
      wx.showToast({
        title: '暂无可用预订时间段',
        icon: 'none'
      });
      return;
    }

    // 5. 预订成功提示（真实场景可提交至云数据库存储预订信息）
    wx.showModal({
      title: '预订成功',
      content: `✅ 预订信息如下：\n日期：${selectedDate}\n时间段：${selectedTime}\n联系人：${name}\n手机号：${phone}\n\n商家将尽快与您联系~`,
      showCancel: false,
      success: () => {
        // 返回上一页（美食详情页）
        wx.navigateBack({
          delta: 1
        });
      }
    });
  }
});