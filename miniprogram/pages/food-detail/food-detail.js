Page({
  data: {
    foodDetail: {}, // 当前美食详情
    commentList: [] // 当前美食的专属评价列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const foodId = options.id; // 获取从美食列表传递的美食_id
    if (!foodId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack(); // 返回上一页
      return;
    }

    // 并行获取：美食详情 + 专属评价
    this.getFoodDetail(foodId);
    this.getFoodComment(foodId);
  },

  /**
   * 获取美食详情（根据_id查询）
   */
  getFoodDetail(foodId) {
    wx.cloud.database().collection('food')
      .doc(foodId) // 精准查询单条美食数据
      .get()
      .then(res => {
        this.setData({ 
          foodDetail: res.data || {} 
        });
      })
      .catch(err => {
        console.error("【获取美食详情失败】：", err);
        wx.showToast({ title: '美食数据加载失败', icon: 'none' });
      });
  },

  /**
   * 获取该美食的专属评价（根据foodId筛选+倒序排列）
   */
  getFoodComment(foodId) {
    const db = wx.cloud.database();
    db.collection('comment')
      .where({
        foodId: foodId // 只查询当前美食的评价，实现专属关联
      })
      .orderBy("commentTime", "desc") // 按评价时间倒序，最新评价在前
      .get()
      .then(res => {
        this.setData({ 
          commentList: res.data || [] 
        });
      })
      .catch(err => {
        console.error("【获取用户评价失败】：", err);
        wx.showToast({ title: '评价数据加载失败', icon: 'none' });
      });
  },

  /**
   * 显示评价提交弹窗（简化版：直接提交模拟数据，真实场景可扩展表单弹窗）
   */
  showCommentModal() {
    const { foodDetail } = this.data;
    if (!foodDetail._id) {
      wx.showToast({ title: '美食信息未加载完成', icon: 'none' });
      return;
    }

    // 模拟用户评价数据（真实场景需通过表单收集：评分、文字、图片）
    const newComment = {
      foodId: foodDetail._id, // 关联当前美食
      userId: `user_${new Date().getTime().toString().slice(-4)}`, // 临时用户ID，后续替换为OpenID
      userName: '匿名用户', // 后续可替换为微信昵称
      userAvatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLLPicSdVicCV1uSfiaDqfAAWia8bH8GibqfYlXrUia8LibQ0Y9U8aZtO8XHfY5gU4jicicia4Uia8bH8GibqfYlX/132', // 默认头像
      score: '4.9', // 模拟评分
      commentText: '味道很不错，性价比高，值得推荐给朋友！', // 模拟评价文字
      commentTime: new Date().toLocaleDateString(), // 获取当前日期
      commentImg: '' // 暂无评价图片，真实场景可通过云存储上传
    };

    // 提交评价到comment集合，实现持久化存储
    wx.cloud.database().collection('comment')
      .add({
        data: newComment
      })
      .then(res => {
        wx.showToast({ title: '评价提交成功', icon: 'success' });
        // 重新加载评价列表，实时展示新提交的评价
        this.getFoodComment(foodDetail._id);
      })
      .catch(err => {
        console.error("【提交评价失败】：", err);
        wx.showToast({ title: '评价提交失败，请稍后再试', icon: 'none' });
      });
  },

  /**
   * 点击立即预订，跳转到预订页面（从已有businessTime拆分开店/闭店时间，无需修改数据库）
   */
  onBookTap() {
    const { foodDetail } = this.data;
    // 可选：判断美食信息是否加载完成，避免无效跳转
    if (!foodDetail._id) {
      wx.showToast({ title: '美食信息未加载完成，无法预订', icon: 'none' });
      return;
    }

    // 核心：从已有businessTime字段拆分开店/闭店时间（格式："08:30-23:00" → 拆分出两个时间）
    const businessTime = foodDetail.businessTime || "09:00-18:00"; // 兜底默认值，兼容无此字段的情况
    const [shopOpenTime, shopCloseTime] = businessTime.split("-"); // 按横杠拆分，获取开店和闭店时间

    // 跳转至预订页面，携带美食名称、ID及拆分后的营业时间参数
    wx.navigateTo({
      url: `/pages/book/book?foodName=${encodeURIComponent(foodDetail.foodName || '未知美食')}&foodId=${foodDetail._id}&shopOpenTime=${encodeURIComponent(shopOpenTime)}&shopCloseTime=${encodeURIComponent(shopCloseTime)}`,
      fail: (err) => {
        console.error("【跳转预订页面失败】：", err);
        wx.showToast({ title: '预订页面未找到，请检查页面配置', icon: 'none' });
      }
    });
  },

  /**
   * 点击分享按钮，显示分享提示（可扩展为微信好友/朋友圈分享）
   */
  onShareTap() {
    const { foodDetail } = this.data;
    // 微信小程序原生分享（需在模拟器/真机中测试，开发者工具部分功能受限）
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    // 自定义分享提示
    wx.showToast({
      title: '可分享给好友哦',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 可选：自定义分享给微信好友的内容（原生分享回调）
   */
  onShareAppMessage() {
    const { foodDetail } = this.data;
    return {
      title: `推荐你尝试：${foodDetail.foodName || '南锣鼓巷特色美食'}`,
      path: `/pages/food-detail/food-detail?id=${foodDetail._id || ''}`,
      imageUrl: foodDetail.foodImg || '/images/default-food.png'
    };
  },

  /**
   * 可选：自定义分享到朋友圈的内容（原生分享回调）
   */
  onShareTimeline() {
    const { foodDetail } = this.data;
    return {
      title: `南锣鼓巷必吃：${foodDetail.foodName || '特色美食'}`,
      imageUrl: foodDetail.foodImg || '/images/default-food.png'
    };
  }
});