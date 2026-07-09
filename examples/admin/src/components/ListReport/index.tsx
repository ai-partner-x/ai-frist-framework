/**
 * ListReport 组件
 * 基于 SAP Fiori List Report Floorplan 设计
 * 一体化卡片风格，包含 Header、工具栏、搜索筛选、数据表格
 */

import * as React from 'react';
import { cn, DataTable, type DataTableColumn, type DataTableProps } from '@aiko-boot/admin-component';

// ===== 图标 =====
const Icons = {
  refresh: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8a6 6 0 0110.89-3.48M14 8a6 6 0 01-10.89 3.48" />
      <path d="M2 3v3h3M14 13v-3h-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  download: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  columns: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="4" height="12" rx="1" />
      <rect x="10" y="2" width="4" height="12" rx="1" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5l1.5 1.5M3 13l1.5-1.5M11.5 4.5l1.5-1.5" strokeLinecap="round" />
    </svg>
  ),
  help: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6 6a2 2 0 113 1.73c0 .77-.5 1.27-.5 1.27" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </svg>
  ),
  filter: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h12M4 7h8M6 11h4" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ===== 类型定义 =====

export interface ListReportHeaderConfig {
  /** 页面标题 */
  title: string;
  /** 副标题/描述 */
  subtitle?: string;
  /** 标签（如 List Report） */
  tag?: string;
  /** 自定义图标 */
  icon?: React.ReactNode;
}

export interface ListReportToolbarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** 主操作按钮样式 */
  primary?: boolean;
}

export interface ListReportProps<T> {
  /** Header 配置 */
  header: ListReportHeaderConfig;
  
  /** 表格数据 */
  data: T[];
  /** 表格列定义 */
  columns: DataTableColumn<T>[];
  /** 数据总数 */
  totalCount?: number;
  /** 加载状态 */
  loading?: boolean;
  
  /** 主操作按钮（如"创建"） */
  primaryAction?: ListReportToolbarAction;
  /** 行选择操作按钮 */
  selectionActions?: ListReportToolbarAction[];
  
  /** 搜索配置 */
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  
  /** 筛选配置 */
  showFilter?: boolean;
  onFilterToggle?: () => void;
  filterContent?: React.ReactNode;
  /** 已选筛选条件数量 */
  filterCount?: number;
  /** 清除筛选 */
  onFilterClear?: () => void;
  
  /** 事件回调 */
  onRefresh?: () => void;
  onExport?: () => void;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (rows: T[]) => void;
  
  /** 分页配置 */
  pageSize?: number;
  pageIndex?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  
  /** 获取行 ID */
  getRowId?: (row: T) => string;
  
  /** 自定义类名 */
  className?: string;
}

// ===== 主组件 =====

export function ListReport<T>({
  header,
  data,
  columns,
  totalCount,
  loading = false,
  primaryAction,
  selectionActions = [],
  searchPlaceholder = '搜索...',
  onSearch,
  showFilter = false,
  onFilterToggle,
  filterContent,
  filterCount = 0,
  onFilterClear,
  onRefresh,
  onExport,
  onRowClick,
  onSelectionChange,
  pageSize = 10,
  pageIndex = 0,
  onPaginationChange,
  getRowId,
  className,
}: ListReportProps<T>) {
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<T[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const displayCount = data.length;
  
  // 计算总筛选数量（包含搜索框）
  const totalFilterCount = filterCount + (searchValue ? 1 : 0);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSelectionChange = (rows: T[]) => {
    setSelectedRows(rows);
    onSelectionChange?.(rows);
  };

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', className)}>
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden">
        {/* 装饰圆形 */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 图标 */}
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                {header.icon || Icons.filter}
              </div>
              {/* 标题 */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold">{header.title}</h1>
                  {header.tag && (
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                      {header.tag}
                    </span>
                  )}
                </div>
                {header.subtitle && (
                  <p className="text-white/80 text-sm">{header.subtitle}</p>
                )}
              </div>
            </div>

            {/* 主操作按钮 */}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="h-10 px-5 rounded-lg bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {primaryAction.icon || Icons.plus}
                <span>{primaryAction.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== 工具栏 ===== */}
      <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedRows.length > 0 ? (
              <>
                <span className="text-sm text-blue-600 font-medium">
                  已选择 {selectedRows.length} 项
                </span>
                {selectionActions.length > 0 && (
                  <>
                    <div className="w-px h-5 bg-gray-200" />
                    {selectionActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="h-8 px-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500">
                显示 {displayCount} 项
              </span>
            )}
          </div>

          {/* 工具按钮 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors",
                isRefreshing && "animate-spin"
              )}
              title="刷新"
            >
              {Icons.refresh}
            </button>
            {onExport && (
              <button
                onClick={onExport}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="导出"
              >
                {Icons.download}
              </button>
            )}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="列设置">
              {Icons.columns}
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="设置">
              {Icons.settings}
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="帮助">
              {Icons.help}
            </button>
          </div>
        </div>
      </div>

      {/* ===== 搜索筛选栏 ===== */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {Icons.search}
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors",
                searchValue ? "bg-white" : "bg-gray-50"
              )}
            />
          </div>
          
          {/* 筛选按钮 */}
          {onFilterToggle && (
            <button
              onClick={onFilterToggle}
              className={cn(
                "h-9 px-3 rounded-lg text-sm flex items-center gap-2 transition-colors",
                showFilter || totalFilterCount > 0 ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {Icons.filter}
              <span>筛选</span>
              {totalFilterCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                  {totalFilterCount}
                </span>
              )}
            </button>
          )}
          
          {/* 清除筛选按钮 */}
          {totalFilterCount > 0 && onFilterClear && (
            <button
              onClick={() => {
                setSearchValue('');
                onFilterClear();
              }}
              className="h-9 px-3 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" strokeLinecap="round" />
              </svg>
              <span>清除筛选</span>
            </button>
          )}
          
          {/* 应用按钮 */}
          <button className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            应用
          </button>
        </div>

        {/* 筛选内容区域 */}
        {showFilter && filterContent && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {filterContent}
          </div>
        )}
      </div>

      {/* ===== 数据表格 ===== */}
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        enableRowSelection
        onSelectionChange={handleSelectionChange}
        totalCount={totalCount}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPaginationChange={onPaginationChange}
        onRowClick={onRowClick}
        getRowId={getRowId}
      />
    </div>
  );
}

// 导出图标供外部使用
export const ListReportIcons = Icons;

export default ListReport;
