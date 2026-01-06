Page({
  data: {
    favPoiList: [] // 已收藏的景点列表
  },

  onShow() {
    // 每次显示页面都重新加载收藏数据
    this.loadFavPoi();
  },

  // 加载本地收藏的景点
  loadFavPoi() {
    const favList = wx.getStorageSync('favList') || [];
    this.setData({
      favPoiList: favList
    });
  },

  // 点击收藏景点跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 取消收藏景点
  cancelFav(e) {
    const index = e.currentTarget.dataset.index;
    let favList = this.data.favPoiList;
    // 移除对应项
    favList.splice(index, 1);
    // 更新本地存储和页面数据
    wx.setStorageSync('favList', favList);
    this.setData({
      favPoiList: favList
    });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  }
});