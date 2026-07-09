/**
 * 创建采购申请页面
 * 基于 SAP Fiori Create Object Page 设计
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Select, Input, Label } from '@aiko-boot/admin-component';
import { EditableTable, TableInput, TableSelect, TableText, TableDeleteButton, type EditableTableColumn } from '../../components/EditableTable';

// 图标
const Icons = {
  back: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12.5 5L7.5 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  save: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v9a1 1 0 01-1 1z" />
      <path d="M10 2v3H6M5 9h6M5 12h6" strokeLinecap="round" />
    </svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2L7 9M14 2l-4 12-3-5-5-3 12-4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cancel: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M12.5 4v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 13V4" strokeLinecap="round" />
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3.5 5.5l3.5 3 3.5-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="11" rx="1" />
      <path d="M2 6h12M5 1v3M11 1v3" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" />
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <path d="M6 5h4M6 8h4M6 11h4" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7v4M8 5v.5" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="4" />
      <path d="M9 9l3.5 3.5" strokeLinecap="round" />
    </svg>
  ),
};

// 物料选项（模拟数据）
const materialOptions = [
  { code: 'IT-001', name: 'MacBook Pro 14" M3', unit: '台', price: 18900 },
  { code: 'IT-015', name: 'Dell 27" 4K显示器', unit: '台', price: 3500 },
  { code: 'IT-032', name: '无线键鼠套装', unit: '套', price: 299 },
  { code: 'OF-023', name: 'A4复印纸 80g', unit: '包', price: 25 },
  { code: 'FN-008', name: '人体工学办公椅', unit: '把', price: 2800 },
];

// 行项目类型
interface LineItem {
  id: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  deliveryDate: string;
  note: string;
}

export function CreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // 表头信息
  const [headerData, setHeaderData] = useState({
    requester: '当前用户',
    department: '研发部',
    companyCode: '1000',
    purchaseOrg: '1000',
    purchaseGroup: '001',
    requestDate: new Date().toISOString().split('T')[0],
    description: '',
    priority: 'normal',
  });

  // 行项目
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      materialCode: '',
      materialName: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      amount: 0,
      deliveryDate: '',
      note: '',
    },
  ]);

  // 添加行项目
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: String(Date.now()),
        materialCode: '',
        materialName: '',
        quantity: 1,
        unit: '',
        unitPrice: 0,
        amount: 0,
        deliveryDate: '',
        note: '',
      },
    ]);
  };

  // 删除行项目
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  // 更新行项目
  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // 如果选择了物料，自动填充信息
        if (field === 'materialCode') {
          const material = materialOptions.find((m) => m.code === value);
          if (material) {
            updated.materialName = material.name;
            updated.unit = material.unit;
            updated.unitPrice = material.price;
            updated.amount = updated.quantity * material.price;
          }
        }

        // 计算金额
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = updated.quantity * updated.unitPrice;
        }

        return updated;
      })
    );
  };

  // 计算总金额
  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  // 保存
  const handleSave = async () => {
    setSaving(true);
    // 模拟保存
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    navigate('/purchase-requisitions');
  };

  // 提交审批
  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    navigate('/purchase-requisitions');
  };

  // 取消
  const handleCancel = () => {
    navigate('/purchase-requisitions');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* SAP Fiori Create Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* 彩色渐变头部 - 统一蓝色主题 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
          
          <div className="relative z-10">
            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
              <button onClick={() => navigate('/purchase-requisitions')} className="hover:text-white flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 4l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                采购申请管理
              </button>
              <span>/</span>
              <span className="text-white">创建采购申请</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {Icons.plus}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold">创建采购申请</h1>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                      新建模式
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">新建采购申请项目</p>
                </div>
              </div>

              {/* 右侧操作按钮 */}
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  {Icons.info}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 关键信息区域 */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="text-gray-400">{Icons.calendar}</div>
              <div>
                <p className="text-xs text-gray-500">申请日期</p>
                <p className="text-sm font-medium text-gray-900">{headerData.requestDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-gray-400">{Icons.user}</div>
              <div>
                <p className="text-xs text-gray-500">申请人</p>
                <p className="text-sm font-medium text-gray-900">{headerData.requester}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-gray-400">{Icons.building}</div>
              <div>
                <p className="text-xs text-gray-500">公司代码</p>
                <p className="text-sm font-medium text-gray-900">{headerData.companyCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-gray-400">{Icons.building}</div>
              <div>
                <p className="text-xs text-gray-500">采购组织</p>
                <p className="text-sm font-medium text-gray-900">{headerData.purchaseOrg} - 总部采购组织</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作指南 */}
        <div className="p-6 bg-gray-50/50">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
            <span>📝 填写必填字段以创建申请</span>
            <span>💡 使用值帮助选择物料</span>
            <span>📋 至少添加一个行项目</span>
            <span>⚡ 快捷键：Ctrl+S 保存</span>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="space-y-6">

        {/* 基本信息 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">基本信息</h2>
            <p className="text-xs text-gray-500 mt-0.5">填写采购申请的基本详情</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 申请描述 */}
              <div className="lg:col-span-2">
                <Label className="block text-sm font-medium text-gray-700 mb-1.5">
                  申请描述 <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={headerData.description}
                  onChange={(e) => setHeaderData({ ...headerData, description: e.target.value })}
                  placeholder="请输入采购申请描述"
                />
              </div>

              {/* 优先级 */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1.5">优先级</Label>
                <Select
                  value={headerData.priority}
                  onChange={(e) => setHeaderData({ ...headerData, priority: e.target.value })}
                  options={[
                    { value: 'low', label: '低' },
                    { value: 'normal', label: '普通' },
                    { value: 'high', label: '高' },
                    { value: 'urgent', label: '紧急' },
                  ]}
                />
              </div>

              {/* 申请人 */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1.5">申请人</Label>
                <Input
                  type="text"
                  value={headerData.requester}
                  readOnly
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              {/* 部门 */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1.5">部门</Label>
                <Input
                  type="text"
                  value={headerData.department}
                  readOnly
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              {/* 采购组织 */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1.5">采购组织</Label>
                <Select
                  value={headerData.purchaseOrg}
                  onChange={(e) => setHeaderData({ ...headerData, purchaseOrg: e.target.value })}
                  options={[
                    { value: '1000', label: '1000 - 总部采购组织' },
                    { value: '2000', label: '2000 - 华东采购组织' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 行项目 */}
        <EditableTable<typeof lineItems[0]>
          header={{
            title: '行项目',
            subtitle: '添加需要采购的物料明细',
            actions: (
              <button
                onClick={addLineItem}
                className="h-8 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
              >
                {Icons.plus}
                <span>添加行</span>
              </button>
            ),
          }}
          columns={[
            {
              key: 'index',
              title: '#',
              width: 40,
              render: (_, index) => <TableText variant="muted">{index + 1}</TableText>,
            },
            {
              key: 'materialCode',
              title: <>物料 <span className="text-red-500">*</span></>,
              width: 160,
              required: true,
              render: (record) => (
                <TableSelect
                  value={record.materialCode}
                  onChange={(v) => updateLineItem(record.id, 'materialCode', v)}
                  options={materialOptions.map((m) => ({ value: m.code, label: m.code }))}
                  placeholder="选择物料"
                />
              ),
            },
            {
              key: 'materialName',
              title: '物料描述',
              width: 180,
              render: (record) => (
                <TableInput value={record.materialName} readOnly placeholder="-" />
              ),
            },
            {
              key: 'quantity',
              title: <>数量 <span className="text-red-500">*</span></>,
              width: 90,
              align: 'right',
              required: true,
              render: (record) => (
                <TableInput
                  type="number"
                  value={record.quantity}
                  onChange={(v) => updateLineItem(record.id, 'quantity', Number(v))}
                  align="right"
                />
              ),
            },
            {
              key: 'unit',
              title: '单位',
              width: 60,
              align: 'center',
              render: (record) => <TableText variant="muted">{record.unit || '-'}</TableText>,
            },
            {
              key: 'unitPrice',
              title: '单价',
              width: 100,
              align: 'right',
              render: (record) => (
                <TableText variant="muted">
                  {record.unitPrice > 0 ? `¥${record.unitPrice.toLocaleString()}` : '-'}
                </TableText>
              ),
            },
            {
              key: 'amount',
              title: '金额',
              width: 100,
              align: 'right',
              render: (record) => (
                <TableText variant="bold">
                  {record.amount > 0 ? `¥${record.amount.toLocaleString()}` : '-'}
                </TableText>
              ),
            },
            {
              key: 'deliveryDate',
              title: '交货日期',
              width: 130,
              render: (record) => (
                <TableInput
                  type="date"
                  value={record.deliveryDate}
                  onChange={(v) => updateLineItem(record.id, 'deliveryDate', v)}
                />
              ),
            },
            {
              key: 'actions',
              title: '',
              width: 56,
              render: (record) => (
                <TableDeleteButton
                  onClick={() => removeLineItem(record.id)}
                  disabled={lineItems.length === 1}
                />
              ),
            },
          ] as EditableTableColumn<typeof lineItems[0]>[]}
          dataSource={lineItems}
          rowKey="id"
          minWidth={900}
          showIndex={false}
          footer={
            <tr className="bg-gray-50/80 border-t border-gray-200">
              <td colSpan={6} className="px-3 py-3 text-right text-sm font-medium text-gray-700">合计金额</td>
              <td className="px-3 py-3 text-right text-base font-semibold text-blue-600">¥{totalAmount.toLocaleString()}</td>
              <td colSpan={2}></td>
            </tr>
          }
        />
      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={saving || submitting}
            className="h-10 px-5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {Icons.cancel}
            <span>取消</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving || submitting}
            className="h-10 px-5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-600/20"
          >
            {submitting ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              Icons.send
            )}
            <span>{submitting ? '提交中...' : '提交审批'}</span>
          </button>

          <div className="flex">
            <button
              onClick={handleSave}
              disabled={saving || submitting}
              className="h-10 px-5 rounded-l-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                Icons.save
              )}
              <span>{saving ? '保存中...' : '保存'}</span>
            </button>
            <button
              disabled={saving || submitting}
              className="h-10 px-2 rounded-r-lg bg-blue-600 text-white hover:bg-blue-700 border-l border-blue-500 disabled:opacity-50"
            >
              {Icons.chevronDown}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;
