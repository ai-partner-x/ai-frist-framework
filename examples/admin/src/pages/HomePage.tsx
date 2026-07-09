/**
 * 首页 - Fiori 风格仪表盘
 */

import { useNavigate } from 'react-router-dom';

// 自定义图标
const Icons = {
  cart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  package: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  ),
  truck: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  ),
  trendUp: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 11l4-4 3 3 5-5M10 5h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trendDown: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 5l4 4 3-3 5 5M10 11h4V7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4v4l2.5 1.5" strokeLinecap="round" />
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  file: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 1H4a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-7-7z" />
      <path d="M11 1v7h7" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// 统计数据
const stats = [
  {
    title: '待处理采购申请',
    value: 12,
    trend: { value: '+3', direction: 'up' as const },
    color: '#0070f2',
    bgColor: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    icon: Icons.cart,
  },
  {
    title: '进行中订单',
    value: 8,
    trend: { value: '-2', direction: 'down' as const },
    color: '#107e3e',
    bgColor: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    icon: Icons.package,
  },
  {
    title: '待收货',
    value: 5,
    trend: { value: '+1', direction: 'up' as const },
    color: '#df8f00',
    bgColor: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    icon: Icons.truck,
  },
  {
    title: '本月采购额',
    value: '¥125,430',
    trend: { value: '+12%', direction: 'up' as const },
    color: '#a100c2',
    bgColor: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    icon: Icons.chart,
  },
];

// 快捷操作
const quickActions = [
  { title: '创建采购申请', desc: '发起新的采购需求', icon: Icons.cart, color: '#0070f2', path: '/purchase-requisitions/create' },
  { title: '查看订单', desc: '管理采购订单', icon: Icons.package, color: '#107e3e', path: '/purchase-orders' },
  { title: '收货确认', desc: '确认货物接收', icon: Icons.truck, color: '#df8f00', path: '/goods-receipt' },
  { title: '查看报表', desc: '数据分析报表', icon: Icons.chart, color: '#a100c2', path: '/reports' },
];

// 最近活动
const recentActivities = [
  { type: 'created', title: '创建采购申请 PR-2024-0156', time: '10 分钟前', user: '张三' },
  { type: 'approved', title: '采购订单 PO-2024-0089 已审批', time: '30 分钟前', user: '李经理' },
  { type: 'received', title: '收货单 GR-2024-0234 已确认', time: '1 小时前', user: '王五' },
  { type: 'created', title: '创建采购申请 PR-2024-0155', time: '2 小时前', user: '赵六' },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">首页概览</h1>
          <p className="text-sm text-gray-500 mt-0.5">欢迎回来！以下是您的工作概况</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {Icons.clock}
          <span>最后更新: 刚刚</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* 背景装饰 */}
            <div
              className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-50 group-hover:opacity-70 transition-opacity"
              style={{ background: stat.bgColor }}
            />
            
            <div className="relative">
              {/* 图标 */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
              
              {/* 标题 */}
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              
              {/* 数值和趋势 */}
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full mb-1 ${
                    stat.trend.direction === 'up'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {stat.trend.direction === 'up' ? Icons.trendUp : Icons.trendDown}
                  {stat.trend.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 快捷操作 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">快捷操作</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left bg-gradient-to-br from-white to-gray-50/50"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${action.color}12`, color: action.color }}
                    >
                      {action.icon}
                    </div>
                    <p className="font-medium text-gray-900 mb-0.5">{action.title}</p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">最近活动</h2>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                查看全部 {Icons.arrowRight}
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivities.map((activity, index) => (
                <div key={index} className="px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        activity.type === 'created'
                          ? 'bg-blue-50 text-blue-500'
                          : activity.type === 'approved'
                          ? 'bg-green-50 text-green-500'
                          : 'bg-orange-50 text-orange-500'
                      }`}
                    >
                      {activity.type === 'created' ? Icons.file : activity.type === 'approved' ? Icons.check : Icons.truck}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {activity.user} · {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 待办事项提示 */}
      <div 
        className="rounded-xl p-5 flex items-center justify-between"
        style={{ 
          background: 'linear-gradient(135deg, #0070f2 0%, #0055cc 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
            {Icons.cart}
          </div>
          <div className="text-white">
            <p className="font-semibold">您有 12 个待处理的采购申请</p>
            <p className="text-sm text-white/80 mt-0.5">建议尽快处理以避免延误</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/purchase-requisitions')}
          className="px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors shadow-sm"
        >
          立即处理
        </button>
      </div>
    </div>
  );
}

export default HomePage;
