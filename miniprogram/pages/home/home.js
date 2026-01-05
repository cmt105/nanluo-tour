// pages/home/home.js
const db = wx.cloud.database()

// 准备好的8条核心数据
const poiData = [
  {"name":"南锣鼓巷南口","address":"地安门东大街入口","category":"地标","tags":["游览起点","打卡地标"],"desc":"南锣鼓巷的南端起点，标志性的牌楼矗立于此。","image":"https://images.unsplash.com/photo-1599572236599-c3230490c07d?auto=format&fit=crop&w=600&q=80","latitude":39.933,"longitude":116.403},
  {"name":"齐白石旧居纪念馆","address":"雨儿胡同13号","category":"名人故居","tags":["艺术大师","三进四合院","必看"],"desc":"齐白石先生晚年居住与创作的地方。","image":"https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=600&q=80","latitude":39.935,"longitude":116.402},
  {"name":"茅盾故居","address":"后圆恩寺胡同13号","category":"名人故居","tags":["文学巨匠","红色文化"],"desc":"茅盾先生1974年至1981年的住所。","image":"https://images.unsplash.com/photo-1597816023307-e81561730079?auto=format&fit=crop&w=600&q=80","latitude":39.936,"longitude":116.404},
  {"name":"菊儿胡同","address":"南锣鼓巷中段东侧","category":"特色胡同","tags":["建筑大奖","新四合院"],"desc":"由吴良镛教授主持设计的“类四合院”工程。","image":"https://images.unsplash.com/photo-1543431614-3d98f983637e?auto=format&fit=crop&w=600&q=80","latitude":39.937,"longitude":116.405},
  {"name":"僧格林沁王府","address":"炒豆胡同73号","category":"王府遗址","tags":["清代王府","历史厚重"],"desc":"晚清名将僧格林沁的府邸。","image":"https://images.unsplash.com/photo-1563273941-26c3d8a6797a?auto=format&fit=crop&w=600&q=80","latitude":39.934,"longitude":116.406},
  {"name":"雨儿胡同","address":"南锣鼓巷中段西侧","category":"特色胡同","tags":["老北京风情","静谧"],"desc":"南锣鼓巷西侧最著名的胡同之一。","image":"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=600&q=80","latitude":39.935,"longitude":116.401},
  {"name":"黑芝麻胡同","address":"南锣鼓巷北段西侧","category":"特色胡同","tags":["官学旧址","文化"],"desc":"拥有清代镶黄旗官学遗址，文化底蕴深厚。","image":"https://images.unsplash.com/photo-1558223637-259160a2b02a?auto=format&fit=crop&w=600&q=80","latitude":39.938,"longitude":116.400},
  {"name":"万庆当铺","address":"南锣鼓巷3号","category":"商业遗存","tags":["老字号","商业历史"],"desc":"清末民初的老字号当铺遗存。","image":"https://images.unsplash.com/photo-1543158028-c9233f2a832d?auto=format&fit=crop&w=600&q=80","latitude":39.932,"longitude":116.403}
]

Page({
  onLoad: function () {
    // 页面加载时自动执行：一键导入数据
    this.autoImportData()
  },

  // === 核心：自动导入脚本 ===
  autoImportData() {
    console.log('正在检查数据库...')
    db.collection('pois').count().then(res => {
      console.log('当前数据库共有记录数:', res.total)
      if (res.total === 0) {
        console.log('数据库为空，开始自动写入8条数据...')
        // 循环写入
        poiData.forEach(item => {
          db.collection('pois').add({
            data: item
          }).then(res => {
            console.log('✅ 成功写入:', item.name)
          }).catch(err => {
            console.error('❌ 写入失败:', err)
          })
        })
        wx.showToast({ title: '数据正在写入...', icon: 'loading' })
      } else {
        console.log('⚡ 数据库里已经有数据了，跳过写入，防止重复！')
      }
    })
  },

  // 跳转逻辑
  goToDiscover() {
    wx.switchTab({
      url: '/pages/list/list'
    })
  }
})