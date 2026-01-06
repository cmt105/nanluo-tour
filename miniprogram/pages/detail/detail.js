const db = wx.cloud.database();
Page({
  data: { poi: {} },
  onLoad: function (options) {
    // 接收 list 页面传来的 id 参数 [cite: 271]
    db.collection('pois').doc(options.id).get().then(res => {
      this.setData({ poi: res.data });
      wx.setNavigationBarTitle({ title: res.data.name }); // 动态设置标题
    });
  }
})