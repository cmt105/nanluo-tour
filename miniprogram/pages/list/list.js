// 初始化云数据库 [cite: 247, 426]
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据 [cite: 224, 253]
   */
  data: {
    pois: [],        // 存储从数据库获取的8个及以上景点列表 [cite: 215, 303]
    searchKey: ""    // 当前搜索的关键词
  },

  /**
   * 生命周期函数--监听页面加载 [cite: 245]
   */
  onLoad: function (options) {
    this.getData(); // 页面加载时自动调取数据 
  },

  /**
   * 核心功能：从云数据库拉取景点数据 [cite: 250, 254]
   */
  getData: function () {
    const that = this;
    wx.showLoading({
      title: '正在加载景点...',
    });

    // 查询 pois 集合 [cite: 249, 261]
    db.collection('pois').get({
      success: function (res) {
        console.log("成功获取POI列表：", res.data);
        that.setData({
          pois: res.data // 将云端数据绑定到页面变量 
        });
        wx.hideLoading();
        wx.stopPullDownRefresh(); // 停止可能的下拉刷新状态
      },
      fail: function (err) {
        console.error("数据库拉取失败：", err);
        wx.hideLoading();
        wx.showToast({
          title: '数据拉取失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 核心功能：简单搜索功能实现 [cite: 281, 292, 362]
   * 逻辑：通过正则匹配名称字段，实现模糊查询
   */
  onSearch: function (e) {
    const that = this;
    let keyword = e.detail.value; // 获取输入框中的值
    
    // 如果搜索框为空，则恢复加载全部景点
    if (!keyword) {
      this.getData();
      return;
    }

    wx.showLoading({
      title: '搜索中...',
    });

    // 利用云数据库 RegExp 实现模糊搜索 [cite: 281, 427]
    db.collection('pois').where({
      name: db.RegExp({
        regexp: keyword,
        options: 'i', // 'i' 表示不区分大小写
      })
    }).get({
      success: res => {
        that.setData({
          pois: res.data
        });
        wx.hideLoading();
      },
      fail: err => {
        console.error("搜索失败：", err);
        wx.hideLoading();
      }
    });
  },

  /**
   * 核心功能：跳转至景点详情页 [cite: 271, 290, 364]
   * 逻辑：携带当前景点的数据库 _id 进行跳转 [cite: 312]
   */
  goToDetail: function (e) {
    // 从 wxml 的 data-id 属性中获取唯一标识 [cite: 271]
    let id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id, // 将 ID 传给详情页进行数据二次查询 [cite: 271]
      fail: function() {
        wx.showToast({
          title: '跳转失败，请检查详情页路径',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作 [cite: 197]
   */
  onPullDownRefresh: function () {
    this.getData(); // 下拉时重新同步云端数据 [cite: 241, 431]
  },

  /**
   * 用户点击右上角分享 [cite: 373]
   */
  onShareAppMessage: function () {
    return {
      title: '我在南锣鼓巷发现这些好玩的地方，快来看看！',
      path: '/pages/list/list'
    }
  }
})