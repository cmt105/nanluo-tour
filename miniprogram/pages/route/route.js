const db = wx.cloud.database();

Page({
  data: {
    routes: [] // 初始为空，由云数据库填充
  },

  onLoad: function () {
    this.getRouteData();
  },

  // 核心功能：从云数据库获取动态路线
  getRouteData: function() {
    wx.showLoading({ title: '加载中...' });
    db.collection('routes').get().then(res => {
      this.setData({
        routes: res.data
      });
      wx.hideLoading();
    }).catch(err => {
      console.error("路线获取失败", err);
      wx.hideLoading();
    });
  },

  // 交互功能：点击路线节点跳转至对应的景点详情
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}` 
      });
    }
  }
})