const db = wx.cloud.database();

Page({
  data: {
    favRouteIds: [], // 收藏的路线ID
    favRouteList: [] // 收藏的路线详情
  },

  onShow() {
    this.loadFavRoute();
  },

  // 加载收藏的路线
  loadFavRoute() {
    // 1. 获取本地收藏的路线ID
    const favRouteIds = wx.getStorageSync('favRouteIds') || [];
    this.setData({ favRouteIds });

    if (favRouteIds.length === 0) {
      this.setData({ favRouteList: [] });
      return;
    }

    // 2. 从云数据库获取这些路线的详情
    wx.showLoading({ title: '加载中...' });
    db.collection('routes').where({
      _id: db.command.in(favRouteIds) // 筛选收藏的路线
    }).get().then(res => {
      this.setData({
        favRouteList: res.data
      });
      wx.hideLoading();
    }).catch(err => {
      console.error('加载收藏路线失败', err);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 点击路线跳转到路线详情
  goToRouteDetail(e) {
    // 如果需要路线详情页，可扩展此逻辑，这里暂时提示
    wx.showToast({ title: '点击了' + e.currentTarget.dataset.name, icon: 'none' });
  },

  // 取消收藏路线
  cancelFav(e) {
    const routeId = e.currentTarget.dataset.routeid;
    // 1. 更新本地存储
    let favRouteIds = wx.getStorageSync('favRouteIds') || [];
    favRouteIds = favRouteIds.filter(id => id !== routeId);
    wx.setStorageSync('favRouteIds', favRouteIds);
    
    // 2. 更新页面数据
    let favRouteList = this.data.favRouteList.filter(item => item._id !== routeId);
    this.setData({
      favRouteIds,
      favRouteList
    });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  }
});