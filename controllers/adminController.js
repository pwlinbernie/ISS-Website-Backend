const { ManagementClient } = require('auth0');

// 初始化 Auth0 Management Client
let managementClient = null;

function getManagementClient() {
  if (!managementClient) {
    if (!process.env.AUTH0_MANAGEMENT_CLIENT_ID || !process.env.AUTH0_MANAGEMENT_CLIENT_SECRET) {
      throw new Error('Auth0 Management API 未配置');
    }

    managementClient = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });
  }
  return managementClient;
}

// 獲取所有使用者
exports.getAllUsers = async (req, res) => {
  try {
    const client = getManagementClient();

    // 獲取所有使用者
    const users = await client.users.getAll({
      per_page: 100,
      page: 0
    });

    // 獲取 admin 角色 ID
    const adminRoleId = process.env.AUTH0_ADMIN_ROLE_ID;

    // 為每個使用者取得角色資訊
    const usersWithRoles = await Promise.all(
      users.data.map(async (user) => {
        try {
          const roles = await client.users.getRoles({ id: user.user_id });
          const isAdmin = roles.data.some(role =>
            role.id === adminRoleId || role.name === 'admin'
          );

          return {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            created_at: user.created_at,
            last_login: user.last_login,
            logins_count: user.logins_count,
            isAdmin: isAdmin,
            roles: roles.data
          };
        } catch (error) {
          console.error(`取得使用者 ${user.user_id} 角色失敗:`, error.message);
          return {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            created_at: user.created_at,
            last_login: user.last_login,
            logins_count: user.logins_count,
            isAdmin: false,
            roles: []
          };
        }
      })
    );

    res.json({
      success: true,
      data: usersWithRoles
    });
  } catch (error) {
    console.error('獲取使用者列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取使用者列表失敗',
      error: error.message
    });
  }
};

// 將使用者設為管理員
exports.assignAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const client = getManagementClient();
    const adminRoleId = process.env.AUTH0_ADMIN_ROLE_ID;

    if (!adminRoleId) {
      return res.status(400).json({
        success: false,
        message: 'Admin 角色 ID 未設定'
      });
    }

    // 指派 admin 角色給使用者
    await client.users.assignRoles(
      { id: userId },
      { roles: [adminRoleId] }
    );

    res.json({
      success: true,
      message: '成功將使用者設為管理員'
    });
  } catch (error) {
    console.error('指派管理員角色失敗:', error);
    res.status(500).json({
      success: false,
      message: '指派管理員角色失敗',
      error: error.message
    });
  }
};

// 移除使用者的管理員權限
exports.removeAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const client = getManagementClient();
    const adminRoleId = process.env.AUTH0_ADMIN_ROLE_ID;

    if (!adminRoleId) {
      return res.status(400).json({
        success: false,
        message: 'Admin 角色 ID 未設定'
      });
    }

    // 移除 admin 角色
    await client.users.deleteRoles(
      { id: userId },
      { roles: [adminRoleId] }
    );

    res.json({
      success: true,
      message: '成功移除使用者的管理員權限'
    });
  } catch (error) {
    console.error('移除管理員角色失敗:', error);
    res.status(500).json({
      success: false,
      message: '移除管理員角色失敗',
      error: error.message
    });
  }
};

// 獲取 admin 角色 ID
exports.getAdminRoleId = async (req, res) => {
  try {
    const client = getManagementClient();

    // 搜尋名為 "admin" 的角色
    const roles = await client.roles.getAll();
    const adminRole = roles.data.find(role => role.name === 'admin');

    if (!adminRole) {
      return res.status(404).json({
        success: false,
        message: '找不到 admin 角色'
      });
    }

    res.json({
      success: true,
      data: {
        roleId: adminRole.id,
        roleName: adminRole.name,
        description: adminRole.description
      }
    });
  } catch (error) {
    console.error('獲取 admin 角色 ID 失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取 admin 角色 ID 失敗',
      error: error.message
    });
  }
};
