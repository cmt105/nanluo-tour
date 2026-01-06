const db = wx.cloud.database()

// 8条景点数据（国内稳定图片链接）
const poiData = [
  {"name":"南锣鼓巷南口","address":"地安门东大街入口","category":"地标","tags":["游览起点","打卡地标"],"desc":"南锣鼓巷的南端起点，标志性的牌楼矗立于此。","image":"https://wx3.sinaimg.cn/mw690/006y8mN6ly1g6e2tdgve1j30u00k0n0j.jpg","latitude":39.933,"longitude":116.403},
  {"name":"齐白石旧居纪念馆","address":"雨儿胡同13号","category":"名人故居","tags":["艺术大师","三进四合院","必看"],"desc":"齐白石先生晚年居住与创作的地方。","image":"https://wx4.sinaimg.cn/mw690/006y8mN6ly1g6e2tcmuoxj30u00k00v0.jpg","latitude":39.935,"longitude":116.402},
  {"name":"茅盾故居","address":"后圆恩寺胡同13号","category":"名人故居","tags":["文学巨匠","红色文化"],"desc":"茅盾先生1974年至1981年的住所。","image":"https://wx1.sinaimg.cn/mw690/006y8mN6ly1g6e2tbvk0wj30u00k0ad7.jpg","latitude":39.936,"longitude":116.404},
  {"name":"菊儿胡同","address":"南锣鼓巷中段东侧","category":"特色胡同","tags":["建筑大奖","新四合院"],"desc":"由吴良镛教授主持设计的“类四合院”工程。","image":"https://wx2.sinaimg.cn/mw690/006y8mN6ly1g6e2t9807sj30u00k00tp.jpg","latitude":39.937,"longitude":116.405},
  {"name":"僧格林沁王府","address":"炒豆胡同73号","category":"王府遗址","tags":["清代王府","历史厚重"],"desc":"晚清名将僧格林沁的府邸。","image":"https://wx3.sinaimg.cn/mw690/006y8mN6ly1g6e2t8500lj30u00k075k.jpg","latitude":39.934,"longitude":116.406},
  {"name":"雨儿胡同","address":"南锣鼓巷中段西侧","category":"特色胡同","tags":["老北京风情","静谧"],"desc":"南锣鼓巷西侧最著名的胡同之一。","image":"https://wx4.sinaimg.cn/mw690/006y8mN6ly1g6e2t71v3lj30u00k0779.jpg","latitude":39.935,"longitude":116.401},
  {"name":"黑芝麻胡同","address":"南锣鼓巷北段西侧","category":"特色胡同","tags":["官学旧址","文化"],"desc":"拥有清代镶黄旗官学遗址，文化底蕴深厚。","image":"https://wx1.sinaimg.cn/mw690/006y8mN6ly1g6e2t5z69jj30u00k00wv.jpg","latitude":39.938,"longitude":116.400},
  {"name":"万庆当铺","address":"南锣鼓巷3号","category":"商业遗存","tags":["老字号","商业历史"],"desc":"清末民初的老字号当铺遗存。","image":"https://wx2.sinaimg.cn/mw690/006y8mN6ly1g6e2t4n54bj30u00k0769.jpg","latitude":39.932,"longitude":116.403}
]

Page({
  data: {
    // 轮播图数据
    swiperList: [
      { img: "cloud://cloud1-8gv46cfnc1a626b4.636c-cloud1-8gv46cfnc1a626b4-1394447167/poi_009.png", text: "南锣鼓巷 · 740年时光" },
      { img: "cloud://cloud1-8gv46cfnc1a626b4.636c-cloud1-8gv46cfnc1a626b4-1394447167/poi_002.png", text: "名人故居 · 文化印记" },
      { img: "cloud://cloud1-8gv46cfnc1a626b4.636c-cloud1-8gv46cfnc1a626b4-1394447167/poi_004.png", text: "特色胡同 · 烟火人间" }
    ],
    // 今日推荐（大尺寸样式）
    recommendPoi: {
      name: "齐白石旧居纪念馆",
      tag: "艺术·静谧",
      desc: "齐白石先生晚年居住与创作的地方，藏着老北京的艺术风骨",
      image: "cloud://cloud1-8gv46cfnc1a626b4.636c-cloud1-8gv46cfnc1a626b4-1394447167/poi_003.png"
    }
  },

  onLoad: function () {
    this.autoImportData()
  },

  // 数据自动导入逻辑
  autoImportData() {
    console.log('正在检查数据库...')
    db.collection('pois').count().then(res => {
      if (res.total === 0) {
        console.log('数据库为空，开始写入数据...')
        poiData.forEach(item => {
          db.collection('pois').add({ data: item }).then(res => {
            console.log('✅ 成功写入:', item.name)
          }).catch(err => {
            console.error('❌ 写入失败:', err)
          })
        })
        wx.showToast({ title: '数据正在写入...', icon: 'loading', duration: 2000 })
      } else {
        console.log('⚡ 数据库已有数据，跳过写入！')
      }
    })
  },

  // 主按钮跳转发现页
  startExplore() {
    wx.switchTab({
      url: '/pages/list/list'
    })
  }
  // 删除跳转详情页的方法
})