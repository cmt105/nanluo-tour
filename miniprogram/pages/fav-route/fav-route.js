const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    favRouteIds: [], // 收藏的路线ID
    favRouteList: [] // 收藏的路线详情
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次进入页面都重新加载，确保数据实时同步
    this.loadFavRoute();
  },

  /**
   * 修复：返回首页功能
   * 解决点击没反应：使用 reLaunch 强力跳转，适应 index/home 路径冲突
   */
  goBack() {
    console.log("正在执行跳转首页...");
    wx.reLaunch({
      url: '/pages/index/index', // 对应 app.json 中的主页路径
      fail: (err) => {
        console.warn("跳转 index 失败，尝试 home 路径", err);
        // 兜底方案：如果 index 路径不对，跳转到 home 文件夹
        wx.reLaunch({
          url: '/pages/home/home'
        });
      }
    });
  },

  /**
   * 加载收藏的路线数据
   */
  loadFavRoute() {
    // 1. 获取本地收藏的 ID 数组
    const favRouteIds = wx.getStorageSync('favRouteIds') || [];
    this.setData({ favRouteIds });

    if (favRouteIds.length === 0) {
      this.setData({ favRouteList: [] });
      return;
    }

    // 2. 从云数据库获取详情
    wx.showLoading({ title: '加载中...' });
    db.collection('routes').where({
      _id: db.command.in(favRouteIds) // 筛选 ID 在数组中的记录
    }).get().then(res => {
      // 3. 关键补丁：必须转换链接，否则图片报 500/403 错误
      this.convertCloudImages(res.data);
    }).catch(err => {
      console.error('加载收藏路线失败', err);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  /**
   * 救命补丁：批量转换 cloud:// ID 为 https 临时链接
   */
  convertCloudImages(originalData) {
    if (!originalData || originalData.length === 0) {
      this.setData({ favRouteList: [] });
      wx.hideLoading();
      return;
    }

    // 提取路线中的图片 ID（请确保数据库中字段名为 img 或 image）
    const fileList = originalData.map(item => item.img || item.image).filter(id => id && id.startsWith('cloud://'));

    if (fileList.length === 0) {
      this.setData({ favRouteList: originalData });
      wx.hideLoading();
      return;
    }

    wx.cloud.getTempFileURL({
      fileList: fileList,
      success: res => {
        const updatedList = originalData.map((item) => {
          // 在转换结果中查找对应的 URL
          const fileId = item.img || item.image;
          const fileInfo = res.fileList.find(f => f.fileID === fileId);
          return {
            ...item,
            // 替换为转换后的 https 链接
            displayImg: fileInfo ? fileInfo.tempFileURL : fileId 
          };
        });

        this.setData({ favRouteList: updatedList });
        wx.hideLoading();
      },
      fail: () => {
        this.setData({ favRouteList: originalData });
        wx.hideLoading();
      }
    });
  },

  /**
   * 点击跳转到路线详情（示例提示）
   */
  goToRouteDetail(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: '查看：' + name, icon: 'none' });
  },

  /**
   * 取消收藏逻辑
   */
  cancelFav(e) {
    const routeId = e.currentTarget.dataset.routeid;
    
    // 1. 更新本地缓存
    let favRouteIds = wx.getStorageSync('favRouteIds') || [];
    favRouteIds = favRouteIds.filter(id => id !== routeId);
    wx.setStorageSync('favRouteIds', favRouteIds);
    
    // 2. 更新页面展示
    let favRouteList = this.data.favRouteList.filter(item => item._id !== routeId);
    this.setData({
      favRouteIds,
      favRouteList
    });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  }
});