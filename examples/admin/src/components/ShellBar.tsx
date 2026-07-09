/**
 * Aiko Boot Shell Bar
 * 现代化设计 - 更精致的顶部导航栏
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@aiko-boot/admin-component';

// 精致的 SVG 图标
const Icons = {
  menu: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  back: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4L6 9l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  grid: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" opacity="0.9">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5" />
    </svg>
  ),
  list: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" opacity="0.9">
      <rect x="2" y="3" width="3" height="3" rx="0.75" />
      <rect x="7" y="3" width="9" height="3" rx="0.75" />
      <rect x="2" y="8" width="3" height="3" rx="0.75" />
      <rect x="7" y="8" width="9" height="3" rx="0.75" />
      <rect x="2" y="13" width="3" height="3" rx="0.75" />
      <rect x="7" y="13" width="9" height="3" rx="0.75" />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15 7a5 5 0 00-10 0c0 5.5-2.5 7-2.5 7h15S15 12.5 15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 17a2 2 0 01-3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  help: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 7.5a2.5 2.5 0 014.5 1.5c0 1.5-2 2.25-2 2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.75" fill="currentColor" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <circle cx="9" cy="6" r="3.5" />
      <path d="M2.5 17c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="2" />
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" strokeLinecap="round" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 16H4a2 2 0 01-2-2V4a2 2 0 012-2h3M12.5 12.5L16 9l-3.5-3.5M16 9H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export interface ShellBarProps {
  title?: string;
  logo?: React.ReactNode;
  userName?: string;
  notificationCount?: number;
  layoutMode: 'menu' | 'tile';
  onLayoutModeChange: (mode: 'menu' | 'tile') => void;
  onMenuToggle?: () => void;
  onLogout?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function ShellBar({
  title = 'Aiko Boot',
  logo,
  userName = '用户',
  notificationCount = 3,
  layoutMode,
  onLayoutModeChange,
  onMenuToggle,
  onLogout,
  showBackButton = false,
  onBack,
}: ShellBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-14 px-4 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-sm">
      {/* 左侧 - 返回按钮 + Logo + 标题 */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all"
            title="返回门户"
          >
            {Icons.back}
          </button>
        )}
        
        <Link to="/" className="flex items-center gap-3 group">
          {logo || (
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            >
              A
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-[15px] leading-tight">{title}</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">Enterprise Platform</span>
          </div>
        </Link>
      </div>

      {/* 中间 - 搜索框 */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            {Icons.search}
          </div>
          <input
            type="text"
            placeholder="搜索应用、功能..."
            className="w-full h-10 pl-11 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* 右侧 - 工具栏 */}
      <div className="flex items-center gap-1">
        {/* 布局切换 */}
        <div className="flex items-center p-1 rounded-xl bg-gray-100 mr-2">
          <button
            onClick={() => onLayoutModeChange('tile')}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              layoutMode === 'tile'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            )}
            title="磁贴视图"
          >
            {Icons.grid}
          </button>
          <button
            onClick={() => onLayoutModeChange('menu')}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              layoutMode === 'menu'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            )}
            title="菜单视图"
          >
            {Icons.list}
          </button>
        </div>

        {/* 通知 */}
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all relative">
          {Icons.bell}
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-white bg-gradient-to-r from-red-500 to-rose-500 shadow-sm shadow-red-500/30">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* 帮助 */}
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all">
          {Icons.help}
        </button>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-200 mx-2" />

        {/* 用户 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-500/20"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            >
              {Icons.user}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{userName}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-400 hidden sm:block">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              
              <div 
                className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl py-2 z-50 overflow-hidden"
                style={{
                  boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* 用户信息头部 */}
                <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 mx-2 rounded-xl mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
                      style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      }}
                    >
                      {Icons.user}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">admin@company.com</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-blue-500 text-white text-[10px] font-semibold rounded-full">
                      管理员
                    </span>
                    <span className="px-2.5 py-1 bg-white text-gray-600 text-[10px] font-medium rounded-full border border-gray-200">
                      Pro 版本
                    </span>
                  </div>
                </div>

                {/* 菜单项 */}
                <div className="px-2">
                  <button className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors group">
                    <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{Icons.user}</span>
                    <span className="text-gray-700">个人资料</span>
                  </button>
                  <button className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors group">
                    <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{Icons.settings}</span>
                    <span className="text-gray-700">账户设置</span>
                  </button>
                  <button className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors group">
                    <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{Icons.help}</span>
                    <span className="text-gray-700">帮助中心</span>
                  </button>
                </div>

                <div className="my-2 mx-3 border-t border-gray-100" />

                <div className="px-2 pb-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-red-50 flex items-center gap-3 text-sm transition-colors group"
                  >
                    <span className="text-gray-400 group-hover:text-red-500 transition-colors">{Icons.logout}</span>
                    <span className="text-gray-700 group-hover:text-red-600">退出登录</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default ShellBar;
