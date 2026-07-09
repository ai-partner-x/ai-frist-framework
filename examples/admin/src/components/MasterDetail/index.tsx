/**
 * Master-Detail 布局组件
 * 基于 SAP Fiori 设计规范实现
 * 左侧列表 + 右侧详情的经典布局
 * 支持 Detail 区域内编辑模式
 */

import { useState, type ReactNode } from 'react';
import { cn, Input, Button } from '@aiko-boot/admin-component';

// ===== 类型定义 =====

export interface MasterDetailItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  status?: {
    label: string;
    color: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
  };
  badge?: string | number;
  icon?: ReactNode;
}

export type EditMode = 'view' | 'edit' | 'create';

export interface MasterDetailProps<T extends MasterDetailItem> {
  /** 页面标题 */
  title: string;
  /** 页面副标题 */
  subtitle?: string;
  /** 页面图标 */
  headerIcon?: ReactNode;
  /** 数据列表 */
  items: T[];
  /** 当前选中项 ID */
  selectedId?: string;
  /** 选中变化回调 */
  onSelect?: (item: T) => void;
  /** 渲染详情内容（查看模式），第二个参数为操作按钮 */
  renderDetail: (item: T, actionButtons?: ReactNode) => ReactNode;
  /** 渲染编辑表单（编辑/新建模式） */
  renderForm?: (item: T | null, mode: EditMode) => ReactNode;
  /** 渲染空状态 */
  renderEmpty?: () => ReactNode;
  /** 搜索占位符 */
  searchPlaceholder?: string;
  /** 搜索回调 */
  onSearch?: (keyword: string) => void;
  /** 是否显示新建按钮 */
  showCreate?: boolean;
  /** 新建按钮文字 */
  createLabel?: string;
  /** 是否允许编辑 */
  allowEdit?: boolean;
  /** 是否允许删除 */
  allowDelete?: boolean;
  /** 保存回调 */
  onSave?: (item: T | null, mode: EditMode) => void;
  /** 删除回调 */
  onDelete?: (item: T) => void;
  /** Master 列表宽度 */
  masterWidth?: number;
}

// ===== 状态颜色映射 =====
const statusColors = {
  green: { bg: 'bg-emerald-500', text: 'text-emerald-600' },
  yellow: { bg: 'bg-amber-500', text: 'text-amber-600' },
  red: { bg: 'bg-red-500', text: 'text-red-600' },
  gray: { bg: 'bg-gray-400', text: 'text-gray-600' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
};

// ===== 图标 =====
const Icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3 3" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="8" width="32" height="32" rx="4" />
      <path d="M16 20h16M16 28h8" strokeLinecap="round" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" />
      <path d="M10 4l2 2" />
    </svg>
  ),
  delete: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M6.5 7v5M9.5 7v5M3.5 4l.5 10a1 1 0 001 1h6a1 1 0 001-1l.5-10" />
    </svg>
  ),
};

// 导出图标供外部使用
export const MasterDetailIcons = Icons;

// ===== 主组件 =====

export function MasterDetail<T extends MasterDetailItem>({
  title,
  subtitle,
  headerIcon,
  items,
  selectedId,
  onSelect,
  renderDetail,
  renderForm,
  renderEmpty,
  searchPlaceholder = '搜索...',
  onSearch,
  showCreate = true,
  createLabel = '新建',
  allowEdit = true,
  allowDelete = true,
  onSave,
  onDelete,
  masterWidth = 360,
}: MasterDetailProps<T>) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(selectedId || items[0]?.id);
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const currentSelectedId = selectedId ?? internalSelectedId;
  const selectedItem = items.find(item => item.id === currentSelectedId);
  const isEditing = editMode !== 'view';

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    onSearch?.(value);
  };

  const handleSelect = (item: T) => {
    if (isEditing) return; // 编辑模式下不允许切换
    setInternalSelectedId(item.id);
    onSelect?.(item);
  };

  const handleCreate = () => {
    setEditMode('create');
  };

  const handleEdit = () => {
    setEditMode('edit');
  };

  const handleCancel = () => {
    setEditMode('view');
  };

  const handleSave = () => {
    onSave?.(editMode === 'create' ? null : selectedItem || null, editMode);
    setEditMode('view');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      onDelete?.(selectedItem);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="h-[calc(100vh-56px-48px)] flex flex-col bg-gray-50 overflow-hidden rounded-lg shadow-sm">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {headerIcon && (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {headerIcon}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              {subtitle && <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {showCreate && !isEditing && (
            <button
              onClick={handleCreate}
              className="h-9 px-4 rounded-lg bg-white text-blue-600 text-sm font-medium hover:bg-blue-50 flex items-center gap-2 transition-colors"
            >
              {Icons.plus}
              <span>{createLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Master 列表 */}
        <div 
          className={cn(
            "flex flex-col bg-white border-r border-gray-200 transition-opacity",
            isEditing && "opacity-60 pointer-events-none"
          )}
          style={{ width: masterWidth, minWidth: masterWidth }}
        >
          {/* 搜索框 */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {Icons.search}
              </div>
              <Input
                type="text"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 h-9 bg-gray-50"
                disabled={isEditing}
              />
            </div>
          </div>

          {/* 列表区域 */}
          <div className="flex-1 overflow-y-auto">
            {items.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <MasterListItem
                    key={item.id}
                    item={item}
                    isSelected={item.id === currentSelectedId && editMode !== 'create'}
                    onClick={() => handleSelect(item)}
                    disabled={isEditing}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                {Icons.empty}
                <p className="mt-3 text-sm">暂无数据</p>
              </div>
            )}
          </div>

          {/* 列表底部统计 */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">共 {items.length} 项</span>
          </div>
        </div>

        {/* Detail 详情 */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* 内容区域 - 可滚动 */}
          <div className="flex-1 overflow-y-auto">
            {editMode === 'create' && renderForm ? (
              <div className="p-4">{renderForm(null, 'create')}</div>
            ) : editMode === 'edit' && selectedItem && renderForm ? (
              <div className="p-4">{renderForm(selectedItem, 'edit')}</div>
            ) : selectedItem ? (
              <div className="p-4">
                {renderDetail(selectedItem, (allowEdit || allowDelete) ? (
                  <div className="flex items-center gap-2">
                    {allowEdit && renderForm && (
                      <button
                        onClick={handleEdit}
                        className="h-8 px-3 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
                      >
                        {Icons.edit}
                        <span>编辑</span>
                      </button>
                    )}
                    {allowDelete && onDelete && (
                      <button
                        onClick={handleDeleteClick}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                        title="删除"
                      >
                        {Icons.delete}
                      </button>
                    )}
                  </div>
                ) : undefined)}
              </div>
            ) : renderEmpty ? (
              renderEmpty()
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {Icons.empty}
                <p className="mt-3 text-sm">请选择一项查看详情</p>
              </div>
            )}
          </div>

          {/* 底部粘性工具栏 - 只在编辑模式显示 */}
          {isEditing && (
            <div className="flex-shrink-0 h-11 px-6 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#DC2626" strokeWidth="2">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6v5M10 13.5v.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
                <p className="mt-2 text-sm text-gray-600">
                  确定要删除 <span className="font-medium text-gray-900">{selectedItem.title}</span> 吗？此操作不可撤销。
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>删除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Master 列表项 =====

interface MasterListItemProps<T extends MasterDetailItem> {
  item: T;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function MasterListItem<T extends MasterDetailItem>({ 
  item, 
  isSelected, 
  onClick,
  disabled,
}: MasterListItemProps<T>) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        'px-4 py-3 transition-colors relative',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        isSelected 
          ? 'bg-blue-50 border-l-3 border-l-blue-500' 
          : disabled ? 'border-l-3 border-l-transparent' : 'hover:bg-gray-50 border-l-3 border-l-transparent'
      )}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        {item.icon && (
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
          )}>
            {item.icon}
          </div>
        )}

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              'text-sm font-medium truncate',
              isSelected ? 'text-blue-700' : 'text-gray-900'
            )}>
              {item.title}
            </h3>
            {item.badge && (
              <span className="flex-shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </div>
          
          {item.subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
          )}
          
          {item.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>

        {/* 状态 */}
        {item.status && (
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', statusColors[item.status.color].bg)} />
            <span className={cn('text-xs', statusColors[item.status.color].text)}>
              {item.status.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Detail 区块组件 =====

export interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function DetailSection({ 
  title, 
  children, 
  className,
}: DetailSectionProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', className)}>
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ===== Detail 字段组件 =====

export interface DetailFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );
}

// ===== Detail 字段网格 =====

export interface DetailFieldGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DetailFieldGrid({ children, columns = 3, className }: DetailFieldGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <dl className={cn('grid gap-x-6 gap-y-4', gridCols[columns], className)}>
      {children}
    </dl>
  );
}

export default MasterDetail;
