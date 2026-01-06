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
      // 获取本地收藏的路线ID列表
      const favRouteIds = wx.getStorageSync('favRouteIds') || [];
      // 为每条路线添加是否收藏的标记
      const routes = res.data.map(route => {
        route.isFav = favRouteIds.includes(route._id);
        return route;
      });
      this.setData({
        routes: routes
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
  },

  // 新增：路线收藏/取消收藏功能
  toggleRouteFav: function(e) {
    const routeId = e.currentTarget.dataset.routeid;
    const routeIndex = e.currentTarget.dataset.index;
    // 获取当前路线的收藏状态
    const isFav = this.data.routes[routeIndex].isFav;
    
    // 获取本地收藏列表并更新
    let favRouteIds = wx.getStorageSync('favRouteIds') || [];
    if (isFav) {
      // 取消收藏：从列表中移除
      favRouteIds = favRouteIds.filter(id => id !== routeId);
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      // 收藏：添加到列表
      favRouteIds.push(routeId);
      wx.showToast({ title: '收藏成功', icon: 'success' });
    }
    // 保存到本地存储
    wx.setStorageSync('favRouteIds', favRouteIds);
    
    // 更新页面数据
    const routes = [...this.data.routes];
    routes[routeIndex].isFav = !isFav;
    this.setData({ routes });
  }
});