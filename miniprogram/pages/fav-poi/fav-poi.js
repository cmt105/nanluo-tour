const db = wx.cloud.database();

Page({
  data: {
    favPoiList: [] // 已收藏的景点列表
  },

  onShow() {
    // 每次显示页面都重新加载收藏数据
    this.loadFavPoi();
  },

  /**
   * 修复：返回首页功能
   * 使用 reLaunch 强力跳转，适应项目中的 index/home 路径冲突
   */
  goBack() {
    console.log("正在从收藏景点页返回首页...");
    wx.reLaunch({
      url: '/pages/index/index', // 对应 app.json 中的主页路径
      fail: (err) => {
        console.warn("跳转 index 失败，尝试 home 路径", err);
        // 兜底方案：如果 index 不在 tabBar 中，尝试跳转到 home 文件夹
        wx.reLaunch({
          url: '/pages/home/home'
        });
      }
    });
  },

  /**
   * 加载并转换本地收藏的景点图片
   */
  loadFavPoi() {
    const favList = wx.getStorageSync('favList') || [];
    
    if (favList.length === 0) {
      this.setData({ favPoiList: [] });
      return;
    }

    // 关键补丁：如果图片是 cloud:// 链接，必须转换，否则报 500 错误
    const fileList = favList.map(item => item.img).filter(img => img && img.startsWith('cloud://'));

    if (fileList.length === 0) {
      this.setData({ favPoiList: favList });
      return;
    }

    wx.showLoading({ title: '加载中...' });
    wx.cloud.getTempFileURL({
      fileList: fileList,
      success: res => {
        const updatedList = favList.map(item => {
          const fileInfo = res.fileList.find(f => f.fileID === item.img);
          return {
            ...item,
            img: fileInfo ? fileInfo.tempFileURL : item.img
          };
        });
        this.setData({ favPoiList: updatedList });
        wx.hideLoading();
      },
      fail: () => {
        this.setData({ favPoiList: favList });
        wx.hideLoading();
      }
    });
  },

  // 点击收藏景点跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    }
  },

  // 取消收藏景点
  cancelFav(e) {
    const index = e.currentTarget.dataset.index;
    let favList = this.data.favPoiList;
    favList.splice(index, 1);
    
    wx.setStorageSync('favList', favList);
    this.setData({ favPoiList: favList });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  }
});