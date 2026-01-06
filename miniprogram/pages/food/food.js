Page({
  data: {
    foodList: [], // 所有美食数据
    currentTab: "全部", // 当前选中的分类
    tabList: ["全部", "特色小吃", "地方菜系", "甜点饮品"], // 分类列表
    searchKey: "" // 搜索关键词
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时获取全部美食
    this.getFoodListByType("全部");
  },

  // 点击分类标签的事件
  onTabClick(e) {
    const tab = e.currentTarget.dataset.tab;
    // 先更新选中态，再筛选数据
    this.setData({ 
      currentTab: tab,
      searchKey: "" // 切换分类时清空搜索框
    }, () => {
      this.getFoodListByType(tab);
    });
  },

  // 根据分类筛选美食
  getFoodListByType(type) {
    const db = wx.cloud.database();
    let query = db.collection('food');

    // 第一步：筛选分类（非“全部”时）
    if (type !== "全部") {
      query = query.where({ 
        foodType: type 
      });
    }

    // 第二步：如果有搜索关键词，叠加模糊搜索（匹配美食名称）
    const { searchKey } = this.data;
    if (searchKey.trim()) {
      // 重新构造查询条件，同时满足分类和搜索
      const whereCondition = {};
      if (type !== "全部") {
        whereCondition.foodType = type;
      }
      // 模糊匹配foodName，不区分大小写
      whereCondition.foodName = db.RegExp({
        regexp: searchKey.trim(),
        options: 'i'
      });

      query = query.where(whereCondition);
    }

    // 发起数据库请求，添加错误捕获
    query.get()
      .then(res => {
        this.setData({ 
          foodList: res.data || []
        });
      })
      .catch(err => {
        console.error("获取美食数据失败：", err);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      });
  },

  // 搜索框输入事件
  onSearchInput(e) {
    const searchKey = e.detail.value || "";
    this.setData({ searchKey }, () => {
      // 输入时实时筛选，基于当前选中的分类
      this.getFoodListByType(this.data.currentTab);
    });
  },

  // ===================== 新增：点击美食卡片跳转详情页方法 =====================
  goToDetail(e) {
    // 1. 从wxml的data-id中获取美食的唯一标识_id
    const foodId = e.currentTarget.dataset.id;
    
    // 容错处理：如果无法获取美食_id，提示并终止操作
    if (!foodId) {
      wx.showToast({ title: '无法获取美食信息', icon: 'none' });
      return;
    }

    // 2. 跳转到food-detail详情页，并携带美食_id参数（确保路径与你的详情页一致）
    wx.navigateTo({
      url: `/pages/food-detail/food-detail?id=${foodId}`,
      // 跳转失败的容错处理，便于排查问题
      fail: (err) => {
        console.error("页面跳转失败：", err);
        wx.showToast({ title: '页面跳转失败，请检查页面路径', icon: 'none' });
      }
    });
  }
});