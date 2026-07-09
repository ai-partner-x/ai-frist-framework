/**
 * 磁贴式布局 - 企业级应用门户风格
 * 基于 SAP Fiori Launchpad 设计规范
 */

import { useState, useMemo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  FileText,
  Package,
  Truck,
  Database,
  Settings,
  BarChart3,
  Star,
  Clock,
} from 'lucide-react';
import { cn } from '@aiko-boot/admin-component';

// 页面骨架屏组件
const PageSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/30" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-white/40 rounded" />
            <div className="h-4 w-32 bg-white/30 rounded" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="space-y-1.5">
                <div className="h-3 w-12 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="h-5 w-24 bg-gray-300 rounded mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);
import ShellBar from '../components/ShellBar';

// 应用磁贴配置
export interface AppTile {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  path: string;
  category: string;
  badge?: { label: string; type: 'new' | 'attention' };
}

const appTiles: AppTile[] = [
  // MM-采购
  {
    id: 'pr-create',
    title: '创建采购申请',
    subtitle: '发起新的采购需求',
    description: '创建标准采购申请，支持物料和服务采购',
    icon: <FileText className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-tile-blue))',
    iconColor: 'rgb(var(--fiori-primary))',
    path: '/purchase-requisitions/create',
    category: 'MM-采购',
    badge: { label: '新', type: 'new' },
  },
  {
    id: 'pr-list',
    title: '管理采购申请',
    subtitle: 'F1643 - 采购申请管理',
    description: '查看、编辑和管理所有采购申请',
    icon: <ShoppingCart className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-tile-blue))',
    iconColor: 'rgb(var(--fiori-primary))',
    path: '/purchase-requisitions',
    category: 'MM-采购',
    badge: { label: '核心', type: 'attention' },
  },
  {
    id: 'po-list',
    title: '采购订单',
    subtitle: 'ME21N - 采购订单管理',
    description: '查看和管理采购订单',
    icon: <Package className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-tile-green))',
    iconColor: 'rgb(var(--fiori-success))',
    path: '/purchase-orders',
    category: 'MM-采购',
  },
  {
    id: 'gr-list',
    title: '收货管理',
    subtitle: 'MIGO - 货物移动',
    description: '处理货物接收和库存移动',
    icon: <Truck className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-tile-orange))',
    iconColor: 'rgb(var(--fiori-accent-1))',
    path: '/goods-receipt',
    category: 'MM-采购',
  },
  // 主数据
  {
    id: 'materials',
    title: '物料主数据',
    subtitle: 'F2018 - 物料管理',
    description: '管理物料基本信息',
    icon: <Database className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-tile-purple))',
    iconColor: 'rgb(var(--fiori-accent-4))',
    path: '/master-data/materials',
    category: '主数据',
  },
  {
    id: 'suppliers',
    title: '供应商管理',
    subtitle: 'F0002 - 供应商',
    description: '管理供应商信息',
    icon: <Database className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-tile-teal))',
    iconColor: 'rgb(var(--fiori-accent-6))',
    path: '/master-data/suppliers',
    category: '主数据',
  },
  // 报表
  {
    id: 'reports',
    title: '报表分析',
    subtitle: '数据分析和报表',
    description: '查看各类业务报表',
    icon: <BarChart3 className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-tile-pink))',
    iconColor: 'rgb(var(--fiori-accent-3))',
    path: '/reports',
    category: '报表分析',
  },
  // 系统
  {
    id: 'settings',
    title: '系统设置',
    subtitle: '配置和管理',
    description: '系统配置和用户管理',
    icon: <Settings className="h-6 w-6" />,
    iconBg: 'rgb(var(--fiori-neutral-bg))',
    iconColor: 'rgb(var(--fiori-neutral))',
    path: '/settings',
    category: '系统管理',
  },
];

// 分类配置
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'MM-采购': {
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'rgb(var(--fiori-primary))',
    bg: 'rgb(var(--fiori-tile-blue))',
  },
  '主数据': {
    icon: <Database className="h-5 w-5" />,
    color: 'rgb(var(--fiori-accent-6))',
    bg: 'rgb(var(--fiori-tile-teal))',
  },
  '报表分析': {
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'rgb(var(--fiori-accent-3))',
    bg: 'rgb(var(--fiori-tile-pink))',
  },
  '系统管理': {
    icon: <Settings className="h-5 w-5" />,
    color: 'rgb(var(--fiori-neutral))',
    bg: 'rgb(var(--fiori-neutral-bg))',
  },
};

interface TileLayoutProps {
  onLayoutModeChange: (mode: 'menu' | 'tile') => void;
}

export function TileLayout({ onLayoutModeChange }: TileLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [favorites, setFavorites] = useState<string[]>(['pr-create', 'pr-list']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'all'>('all');

  // 是否在首页
  const isHome = location.pathname === '/';

  // 按分类组织磁贴
  const tilesByCategory = useMemo(() => {
    const filtered = searchQuery
      ? appTiles.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : appTiles;

    const categories = new Map<string, AppTile[]>();
    filtered.forEach((tile) => {
      const cat = tile.category;
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      categories.get(cat)!.push(tile);
    });
    return Array.from(categories.entries());
  }, [searchQuery]);

  const favoriteApps = appTiles.filter((t) => favorites.includes(t.id));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 渲染单个磁贴 - Fiori 风格
  const renderTile = (tile: AppTile, index: number) => (
    <div
      key={tile.id}
      className="tile-animate fiori-tile"
      style={{ animationDelay: `${index * 0.03}s` }}
      onClick={() => navigate(tile.path)}
    >
      {/* 装饰性背景三角 */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 opacity-60"
        style={{
          background: `linear-gradient(135deg, transparent 50%, ${tile.iconBg} 50%)`,
          borderTopRightRadius: '0.75rem',
        }}
      />
      
      {/* 角标 (新/核心等) */}
      {tile.badge && (
        <span
          className={cn(
            'fiori-corner-badge',
            tile.badge.type === 'new' ? 'new' : 'attention'
          )}
        >
          {tile.badge.label}
        </span>
      )}

      {/* 收藏星标 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(tile.id);
        }}
        className={cn(
          'fiori-favorite',
          favorites.includes(tile.id) && 'active'
        )}
      >
        <Star
          className="h-4 w-4"
          fill={favorites.includes(tile.id) ? 'currentColor' : 'none'}
        />
      </button>

      {/* 图标 */}
      <div
        className="fiori-tile-icon mb-4"
        style={{ backgroundColor: tile.iconBg, color: tile.iconColor }}
      >
        {tile.icon}
      </div>

      {/* 标题 */}
      <h3 className="font-semibold text-[rgb(var(--fiori-text-primary))] text-sm mb-1 pr-6">
        {tile.title}
      </h3>
      
      {/* 副标题 */}
      <p className="text-xs text-[rgb(var(--fiori-text-secondary))] mb-2">
        {tile.subtitle}
      </p>
      
      {/* 描述 */}
      {tile.description && (
        <p className="text-xs text-[rgb(var(--fiori-text-tertiary))] line-clamp-2">
          {tile.description}
        </p>
      )}
    </div>
  );

  // 如果不在首页，显示内容页
  if (!isHome) {
    return (
      <div className="min-h-screen bg-[rgb(var(--fiori-background))]">
        <ShellBar 
          layoutMode="tile" 
          onLayoutModeChange={onLayoutModeChange}
          showBackButton
          onBack={() => navigate('/')}
        />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--fiori-background))]">
      <ShellBar layoutMode="tile" onLayoutModeChange={onLayoutModeChange} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 欢迎横幅 - Fiori Horizon 风格 */}
        <div className="relative bg-gradient-to-r from-[rgb(var(--fiori-primary))] to-[#0891b2] rounded-2xl p-8 mb-6 text-white overflow-hidden">
          {/* 装饰圆形 */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-24 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5" />
          
          <div className="relative z-10">
            <h1 className="text-2xl font-semibold mb-2">
              欢迎使用 Aiko Boot 门户
            </h1>
            <p className="text-white/85 text-base mb-4">
              企业级应用统一入口 - 现代化、智能化、标准化
            </p>
            <div className="flex gap-3">
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm">
                {favoriteApps.length} 个收藏
              </span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm">
                {appTiles.length} 个应用
              </span>
            </div>
          </div>
        </div>

        {/* 标签页 - Fiori 风格 */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-[rgb(var(--fiori-border-light))]">
            <button
              onClick={() => setActiveTab('favorites')}
              className={cn(
                'fiori-tab',
                activeTab === 'favorites' && 'active'
              )}
            >
              <Star className="h-4 w-4" />
              <span>收藏夹</span>
              <span className="fiori-badge bg-amber-500">{favoriteApps.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={cn(
                'fiori-tab',
                activeTab === 'recent' && 'active'
              )}
            >
              <Clock className="h-4 w-4" />
              <span>最近使用</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'fiori-tab',
                activeTab === 'all' && 'active'
              )}
            >
              <Home className="h-4 w-4" />
              <span>所有应用</span>
            </button>
          </div>
        </div>

        {/* 内容区 */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteApps.length > 0 ? (
              favoriteApps.map((tile, i) => renderTile(tile, i))
            ) : (
              <div className="col-span-full text-center py-16 text-[rgb(var(--fiori-text-secondary))]">
                <Star className="h-12 w-12 mx-auto mb-4 text-[rgb(var(--fiori-text-tertiary))]" />
                <p>您还没有收藏任何应用</p>
                <p className="text-sm mt-1">点击磁贴上的星标图标添加收藏</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {appTiles.slice(0, 6).map((tile, i) => renderTile(tile, i))}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-8">
            {tilesByCategory.map(([category, tiles]) => {
              const config = categoryConfig[category];
              return (
                <div key={category}>
                  {/* 分组标题 - Fiori 风格 */}
                  <div className="fiori-group-header">
                    <div
                      className="fiori-group-header-icon"
                      style={{
                        backgroundColor: config?.bg || 'rgb(var(--fiori-neutral-bg))',
                        color: config?.color || 'rgb(var(--fiori-neutral))',
                      }}
                    >
                      {config?.icon || <Home className="h-5 w-5" />}
                    </div>
                    <div>
                      <h2 className="fiori-group-header-title">{category}</h2>
                      <p className="fiori-group-header-count">{tiles.length} 个应用</p>
                    </div>
                  </div>
                  
                  {/* 磁贴网格 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tiles.map((tile, i) => renderTile(tile, i))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default TileLayout;
