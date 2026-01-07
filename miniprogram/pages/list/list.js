const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pois: [],       // 用于存放转换后的景点列表
    searchKey: ''   // 搜索关键词
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 页面加载时自动获取数据
    this.getPoiList();
  },

  /**
   * 获取景点数据（核心：包含搜索过滤和图片转换）
   */
  getPoiList: function () {
    wx.showLoading({ title: '加载中...' });
    let query = db.collection('pois');

    // 1. 实现模糊搜索逻辑：根据 searchKey 过滤
    if (this.data.searchKey.trim()) {
      query = query.where({
        name: db.RegExp({
          regexp: this.data.searchKey.trim(),
          options: 'i' // 忽略大小写
        })
      });
    }

    // 2. 发起数据库查询
    query.get().then(res => {
      // 3. 关键补丁：必须转换链接，否则报 500/403 错误
      this.convertCloudImages(res.data);
    }).catch(err => {
      console.error("数据库查询失败", err);
      wx.hideLoading();
    });
  },

  /**
   * 救命补丁：将 cloud:// 转换为临时的 HTTPS 链接
   * 解决：渲染层 500 路径错误 和 跨用户访问 403 错误
   */
  convertCloudImages: function (originalData) {
    if (!originalData || originalData.length === 0) {
      this.setData({ pois: [] });
      wx.hideLoading();
      return;
    }

    // 提取所有图片的 Cloud ID 组成数组
    const fileList = originalData.map(item => item.img);

    wx.cloud.getTempFileURL({
      fileList: fileList,
      success: res => {
        // 将转换后的 https 链接重新注入数据中
        const updatedList = originalData.map((item, index) => {
          return {
            ...item,
            // 使用返回的 tempFileURL 替换原本的 cloud:// 链接
            img: res.fileList[index].tempFileURL 
          };
        });

        this.setData({
          pois: updatedList
        });
        wx.hideLoading();
      },
      fail: err => {
        console.error("图片转换失败", err);
        this.setData({ pois: originalData }); // 兜底显示
        wx.hideLoading();
      }
    });
  },

  /**
   * 修复报错：处理搜索框输入事件
   * 对应 WXML 中的 bindinput="onSearch"
   */
  onSearch: function (e) {
    const key = e.detail.value || "";
    this.setData({
      searchKey: key
    }, () => {
      // 输入后实时触发搜索
      this.getPoiList();
    });
  },

  /**
   * 修复报错：跳转至详情页
   * 对应 WXML 中的 bindtap="goToDetail"
   */
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`,
        fail: err => {
          console.error("跳转失败，请检查 app.json 是否注册了 detail 页面", err);
        }
      });
    } else {
      console.error("未获取到 dataset-id，请检查 WXML 是否写了 data-id=\"{{item._id}}\"");
    }
  },

  /**
   * 清除搜索
   */
  clearSearch: function () {
    this.setData({ searchKey: '' }, () => {
      this.getPoiList();
    });
  }
});