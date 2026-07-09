/**
 * EditableTable 表单内嵌可编辑表格组件
 * 用于采购申请行项目、收货物料等场景
 * 注意：列表页请使用 @aiko-boot/admin-component 中的 DataTable
 */

import type { ReactNode } from 'react';
import { cn, Select } from '@aiko-boot/admin-component';

// ============ 类型定义 ============
export interface EditableTableColumn<T> {
  /** 列标识 */
  key: string;
  /** 表头标题 */
  title: string | ReactNode;
  /** 列宽 */
  width?: string | number;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否必填（显示红色星号） */
  required?: boolean;
  /** 渲染单元格内容 */
  render: (record: T, index: number) => ReactNode;
}

export interface EditableTableProps<T> {
  /** 列配置 */
  columns: EditableTableColumn<T>[];
  /** 数据源 */
  dataSource: T[];
  /** 行唯一标识字段 */
  rowKey: keyof T | ((record: T) => string);
  /** 表头区域 */
  header?: {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
  };
  /** 表尾汇总行 */
  footer?: ReactNode;
  /** 空状态提示 */
  emptyText?: string;
  /** 最小宽度 */
  minWidth?: number;
  /** 自定义 className */
  className?: string;
  /** 是否显示序号列 */
  showIndex?: boolean;
  /** 嵌入模式（无边框、无圆角、融入页面） */
  embedded?: boolean;
}

// ============ 组件实现 ============
export function EditableTable<T>({
  columns,
  dataSource,
  rowKey,
  header,
  footer,
  emptyText = '暂无数据',
  minWidth = 900,
  className,
  showIndex = true,
  embedded = false,
}: EditableTableProps<T>) {
  // 获取行 key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  return (
    <div className={cn(
      'overflow-hidden',
      !embedded && 'bg-white rounded-xl border border-gray-200 shadow-sm',
      embedded && '-mx-6 -mb-6 -mt-6',
      className
    )}>
      {/* 表头区域 */}
      {header && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{header.title}</h2>
            {header.subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{header.subtitle}</p>
            )}
          </div>
          {header.actions && <div className="flex items-center gap-2">{header.actions}</div>}
        </div>
      )}

      {/* 表格区域 */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth }}>
          <thead>
            <tr className="bg-gray-50/80">
              {showIndex && (
                <th className="w-10 px-3 py-3 text-left text-xs font-semibold text-gray-600">#</th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-3 py-3 text-xs font-semibold text-gray-600',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.align !== 'center' && col.align !== 'right' && 'text-left'
                  )}
                  style={{ width: col.width }}
                >
                  {col.title}
                  {col.required && <span className="text-red-500 ml-0.5">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dataSource.length > 0 ? (
              dataSource.map((record, index) => (
                <tr key={getRowKey(record, index)} className="hover:bg-gray-50/50">
                  {showIndex && (
                    <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3 py-2',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render(record, index)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showIndex ? 1 : 0)}
                  className="px-3 py-12 text-center text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
          {footer && dataSource.length > 0 && (
            <tfoot>
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ============ 辅助组件 ============

/** 表格输入框 */
export function TableInput({
  type = 'text',
  value,
  onChange,
  readOnly,
  placeholder,
  className,
  align = 'left',
  ...props
}: {
  type?: 'text' | 'number' | 'date';
  value: string | number;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={cn(
        'w-full h-9 px-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400',
        readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...props}
    />
  );
}

/** 表格选择框 */
export function TableSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  searchIcon?: ReactNode;
}) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={placeholder ? [{ value: '', label: placeholder }, ...options] : options}
      className={cn('h-9', className)}
    />
  );
}

/** 表格文本 */
export function TableText({
  children,
  className,
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'mono' | 'bold' | 'primary';
}) {
  const variantStyles = {
    default: 'text-sm text-gray-900',
    muted: 'text-sm text-gray-600',
    mono: 'font-mono text-xs text-gray-600',
    bold: 'text-sm font-medium text-gray-900',
    primary: 'text-sm font-semibold text-blue-600',
  };

  return (
    <span className={cn(variantStyles[variant], className)}>
      {children}
    </span>
  );
}

/** 表格删除按钮 */
export function TableDeleteButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M12.5 4v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 13V4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** 表格汇总行 */
export function TableFooterRow({
  label,
  value,
  colSpan,
  valueColSpan = 1,
  tailColSpan = 0,
}: {
  label: string;
  value: ReactNode;
  colSpan: number;
  valueColSpan?: number;
  tailColSpan?: number;
}) {
  return (
    <tr className="bg-gray-50/80 border-t border-gray-200">
      <td colSpan={colSpan} className="px-3 py-3 text-right text-sm font-medium text-gray-700">
        {label}
      </td>
      <td colSpan={valueColSpan} className="px-3 py-3 text-right">
        {value}
      </td>
      {tailColSpan > 0 && <td colSpan={tailColSpan}></td>}
    </tr>
  );
}

export default EditableTable;
