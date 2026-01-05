const db = wx.cloud.database();
Page({
  data: { pois: [] },
  onLoad() {
    wx.showLoading({ title: '加载中...' });
    db.collection('pois').get().then(res => {
      console.log("获取到的数据：", res.data); // 调试用
      this.setData({ pois: res.data });
      wx.hideLoading();
    }).catch(err => {
      console.error("数据库获取失败", err);
      wx.hideLoading();
    });
  }
})