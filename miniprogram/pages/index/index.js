// miniprogram/pages/index/index.js
Page({
  data: {
    showTip: false,
    powerList: [
      { title: '云托管', tip: '不限语言的全托管容器服务', showItem: false, item: [{ type: 'cloudbaserun', title: '云托管调用' }] },
      { title: '云函数', tip: '安全、免鉴权运行业务代码', showItem: false, item: [{ type: 'getOpenId', title: '获取OpenId' }, { type: 'getMiniProgramCode', title: '生成小程序码' }] },
      { title: '数据库', tip: '安全稳定的文档型数据库', showItem: false, item: [{ type: 'createCollection', title: '创建集合' }, { type: 'selectRecord', title: '增删改查记录' }] },
      { title: '云存储', tip: '自带CDN加速文件存储', showItem: false, item: [{ type: 'uploadFile', title: '上传文件' }] },
      { title: '拓展能力-AI', tip: '云开发 AI 拓展能力', showItem: false, item: [{ type: 'model-guide', title: '大模型对话指引' }] }
    ],
    haveCreateCollection: false,
    title: "",
    content: ""
  },

  // 核心修复：添加 goToList 方法实现跳转
  goToList: function() {
    wx.switchTab({
      url: '/pages/list/list'
    });
  },

  onClickPowerInfo(e) {
    const app = getApp()
    if(!app.globalData.env) {
      wx.showModal({ title: '提示', content: '请在 `miniprogram/app.js` 中正确配置 `env` 参数' })
      return 
    }
    const index = e.currentTarget.dataset.index;
    const powerList = this.data.powerList;
    const selectedItem = powerList[index];
    if (selectedItem.link) {
      wx.navigateTo({ url: `../web/index?url=${selectedItem.link}&title=${selectedItem.title}` });
    } else if (selectedItem.type) {
      wx.navigateTo({ url: `/pages/example/index?envId=${this.data.selectedEnv?.envId}&type=${selectedItem.type}` });
    } else if (selectedItem.page) {
      wx.navigateTo({ url: `/pages/${selectedItem.page}/index` });
    } else if (selectedItem.title === '数据库' && !this.data.haveCreateCollection) {
      this.onClickDatabase(powerList,selectedItem);
    } else {
      selectedItem.showItem = !selectedItem.showItem;
      this.setData({ powerList });
    }
  },

  jumpPage(e) {
    const { type, page } = e.currentTarget.dataset;
    if (type) {
      wx.navigateTo({ url: `/pages/example/index?envId=${this.data.selectedEnv?.envId}&type=${type}` });
    } else {
      wx.navigateTo({ url: `/pages/${page}/index?envId=${this.data.selectedEnv?.envId}` });
    }
  },

  onClickDatabase(powerList,selectedItem) {
    wx.showLoading({ title: '' });
    wx.cloud.callFunction({ name: 'quickstartFunctions', data: { type: 'createCollection' } })
      .then((resp) => {
        if (resp.result.success) { this.setData({ haveCreateCollection: true }); }
        selectedItem.showItem = !selectedItem.showItem;
        this.setData({ powerList });
        wx.hideLoading();
      })
      .catch((e) => {
        wx.hideLoading();
        const { errMsg } = e
        if (errMsg.includes('Environment not found')) {
          this.setData({ showTip: true, title: "云开发环境未找到", content: "检查环境ID与 `miniprogram/app.js` 一致。" });
        }
      });
  },
});