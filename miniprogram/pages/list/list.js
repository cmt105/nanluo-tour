const db = wx.cloud.database();

Page({
  data: {
    pois: [],       // 景点列表（对应美食页面foodList）
    searchKey: ''   // 搜索关键词（和美食页面一致）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 页面加载获取全部景点，和美食页面onLoad逻辑一致
    this.getPoiList();
  },

  /**
   * 获取景点列表（仿照美食页面getFoodListByType，简化无分类，保留搜索）
   */
  getPoiList() {
    let query = db.collection('pois');

    // 叠加搜索条件（和美食页面模糊搜索逻辑一致）
    const { searchKey } = this.data;
    if (searchKey.trim()) {
      query = query.where({
        name: db.RegExp({
          regexp: searchKey.trim(),
          options: 'i' // 忽略大小写
        })
      });
    }

    // 发起请求，直接赋值数据（和美食页面一致，不修改图片路径）
    query.get()
      .then(res => {
        this.setData({
          pois: res.data || [] // 直接将数据库返回的景点数据赋值给页面
        });
      })
      .catch(err => {
        console.error("获取景点数据失败：", err);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      });
  },

  /**
   * 搜索框输入事件（和美食页面onSearchInput逻辑完全一致）
   */
  onSearchInput(e) {
    const searchKey = e.detail.value || "";
    this.setData({ searchKey }, () => {
      // 输入实时刷新列表
      this.getPoiList();
    });
  },

  /**
   * 跳转详情页（仿照美食页面goToDetail）
   */
  goToDetail(e) {
    const poiId = e.currentTarget.dataset.id;
    if (!poiId) {
      wx.showToast({ title: '无法获取景点信息', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/detail/detail?id=${poiId}`,
      fail: (err) => {
        console.error("页面跳转失败：", err);
        wx.showToast({ title: '跳转失败，请检查页面路径', icon: 'none' });
      }
    });
  }
});