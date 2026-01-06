// pages/list/list.js
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pois: [],       // 存放显示的景点列表
    searchKey: ''   // 搜索关键词
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getData();
  },

  /**
   * 获取所有景点数据
   */
  getData: function () {
    wx.showLoading({ title: '加载中...' });
    db.collection('pois').get().then(res => {
      this.setData({
        pois: res.data
      });
      wx.hideLoading();
    }).catch(err => {
      console.error("获取数据失败", err);
      wx.hideLoading();
    });
  },

  /**
   * 搜索输入处理
   */
  onSearch: function (e) {
    const key = e.detail.value;
    this.setData({ searchKey: key });

    // 如果关键词为空，恢复显示全部
    if (!key) {
      this.getData();
      return;
    }

    // 使用正则表达式进行模糊搜索
    db.collection('pois').where({
      name: db.RegExp({
        regexp: key,
        options: 'i', // 忽略大小写
      })
    }).get().then(res => {
      this.setData({
        pois: res.data
      });
    });
  },

  /**
   * 清除搜索内容
   */
  clearSearch: function () {
    this.setData({ searchKey: '' });
    this.getData();
  },

  /**
   * 核心跳转逻辑：传递数字 id
   */
  goToDetail: function (e) {
    // 这里拿到的 id 是你在 list.wxml 中通过 data-id="{{item.id}}" 绑定的值
    const id = e.currentTarget.dataset.id;
    
    if (id !== undefined) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    } else {
      console.error("未获取到有效的景点ID，请检查 list.wxml 中的 data-id 绑定");
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '南锣鼓巷景点发现',
      path: '/pages/list/list'
    };
  }
});