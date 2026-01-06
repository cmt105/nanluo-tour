const db = wx.cloud.database();
Page({
  data: {
    poi: {},
    isFav: false
  },
  onLoad: function (options) {
    wx.showLoading({ title: '加载中...' });
    // 错误处理：强制转换 ID 类型，解决“未找到景点”问题
    const targetId = Number(options.id);
    
    db.collection('pois').where({ id: targetId }).get().then(res => {
      if (res.data.length > 0) {
        this.setData({ poi: res.data[0] });
        wx.setNavigationBarTitle({ title: res.data[0].name });
        this.checkIfFav(targetId);
      } else {
        wx.showToast({ title: '景点已下架', icon: 'none' });
      }
      wx.hideLoading();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '详情加载失败', icon: 'none' });
    });
  },

  // 交互：大图预览
  previewImage: function() {
    wx.previewImage({
      current: this.data.poi.img,
      urls: [this.data.poi.img]
    });
  },

  // 扩展功能：本地收藏逻辑
  onFavorite: function() {
    const poi = this.data.poi;
    let favList = wx.getStorageSync('favList') || [];
    const index = favList.findIndex(item => item.id === poi.id);
    
    if (index === -1) {
      favList.push({ id: poi.id, name: poi.name, img: poi.img });
      this.setData({ isFav: true });
      wx.showToast({ title: '收藏成功' });
    } else {
      favList.splice(index, 1);
      this.setData({ isFav: false });
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    }
    wx.setStorageSync('favList', favList);
  },

  checkIfFav: function(id) {
    let favList = wx.getStorageSync('favList') || [];
    this.setData({ isFav: favList.some(item => item.id === id) });
  }
});