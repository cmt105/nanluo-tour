Page({
  data: {
    // 可添加用户相关数据
  },

  onLoad(options) {},

  onShow() {
    // 每次显示用户页可刷新数据
  },

  // 跳转到收藏景点列表
  goToFavPoi() {
    wx.navigateTo({
      url: '/pages/fav-poi/fav-poi'
    });
  },

  // 跳转到收藏路线列表
  goToFavRoute() {
    wx.navigateTo({
      url: '/pages/fav-route/fav-route'
    });
  },

  // 跳转到系统设置（示例）
  goToSetting() {
    wx.openSetting({
      success: (res) => {
        console.log('打开设置成功', res);
      }
    });
  },

  onReady() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
});