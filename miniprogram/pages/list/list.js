// pages/list/list.js
Page({
  data: {
    poiList: []
  },
  onLoad() {
    // 基础库 3.13.1 已自动开启云开发环境 [cite: 227]
    this.loadPOIs();
  },
  loadPOIs() {
    const db = wx.cloud.database();
    // 确保你在云开发控制台已经创建了名为 'pois' 的集合 [cite: 232, 233]
    db.collection('pois').get().then(res => {
      this.setData({ 
        poiList: res.data 
      }); 
    }).catch(err => {
      console.error("数据库读取失败，请检查是否创建了 pois 集合并设置了权限", err);
    });
  }
})