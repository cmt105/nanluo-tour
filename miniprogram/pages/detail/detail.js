const db = wx.cloud.database();

Page({
  data: {
    poi: {},
    isFav: false,
    currentTab: "简介"
  },

  onLoad: function (options) {
    wx.showLoading({ title: '加载中...' });
    const targetId = Number(options.id);
    
    db.collection('pois').where({ id: targetId }).get().then(res => {
      if (res.data.length > 0) {
        const poiData = res.data[0];
        // 补全默认值
        poiData.openTime = poiData.openTime || "08:00-17:30";
        poiData.score = poiData.score || "4.8";
        // 补全经纬度默认值（南锣鼓巷GCJ02坐标系，6位小数）
        poiData.latitude = poiData.latitude || 39.938650;
        poiData.longitude = poiData.longitude || 116.405210;
        
        // 修复云存储图片显示
        if (poiData.img && poiData.img.startsWith('cloud://')) {
          wx.cloud.getTempFileURL({
            fileList: [poiData.img]
          }).then(tempRes => {
            poiData.img = tempRes.fileList[0].tempFileURL;
            this.setData({ poi: poiData });
          }).catch(() => {
            // 图片加载失败用兜底图
            poiData.img = 'https://img.yzcdn.cn/vant/cat.jpeg';
            this.setData({ poi: poiData });
          });
        }
        
        this.setData({ poi: poiData });
        wx.setNavigationBarTitle({ title: poiData.name });
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

  // 切换简介/游玩贴士标签
  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  // 图片预览功能
  previewImage: function() {
    if (!this.data.poi.img) return;
    wx.previewImage({
      current: this.data.poi.img,
      urls: [this.data.poi.img]
    });
  },

  // 收藏/取消收藏功能
  onFavorite: function() {
    const poi = this.data.poi;
    let favList = wx.getStorageSync('favList') || [];
    const index = favList.findIndex(item => item.id === poi.id);
    
    if (index === -1) {
      favList.push({ id: poi.id, name: poi.name, img: poi.img });
      this.setData({ isFav: true });
      wx.showToast({ title: '收藏成功', icon: 'success' });
    } else {
      favList.splice(index, 1);
      this.setData({ isFav: false });
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    }
    wx.setStorageSync('favList', favList);
  },

  // 检查是否已收藏
  checkIfFav: function(id) {
    let favList = wx.getStorageSync('favList') || [];
    this.setData({ isFav: favList.some(item => item.id === id) });
  },

  // 修改后：直接打开景点位置，跳过权限弹窗和路线规划
  openMap() {
    const { name, address, latitude, longitude } = this.data.poi;
    
    // 校验基础信息
    if (!name || !address || !latitude || !longitude) {
      wx.showToast({ title: '景点位置信息不完整', icon: 'none' });
      return;
    }

    // 直接打开景点位置，自动唤起手机默认地图App（高德/腾讯等）
    wx.openLocation({
      name: name,
      address: address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      scale: 18
    });
  }
});