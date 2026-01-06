// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // 初始化云开发环境
      wx.cloud.init({
        // env 参数决定连接哪个环境，不填则默认连接第一个
        // 如果你有多个环境，建议填入环境ID
        env: 'cloud1-8gv46cfnc1a626b4',
        traceUser: true,
      })
    }
  }
})