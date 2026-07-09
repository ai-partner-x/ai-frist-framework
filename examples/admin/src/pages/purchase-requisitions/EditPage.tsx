/**
 * 编辑采购申请页面
 * 基于 SAP Fiori Object Page 设计 - 编辑模式
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn, Select, Input, Label } from '@aiko-boot/admin-component';
import { EditableTable, TableInput, TableSelect, TableText, TableDeleteButton, type EditableTableColumn } from '../../components/EditableTable';

// 图标
const Icons = {
  save: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v9a1 1 0 01-1 1z" />
      <path d="M10 2v3H6M5 9h6M5 12h6" strokeLinecap="round" />
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
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1" />
      <path d="M1.5 5.5h11M4 1v2M10 1v2" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="4.5" r="2.5" />
      <path d="M2 13c0-2.5 2-4.5 5-4.5s5 2 5 4.5" />
    </svg>
  ),
  building: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="10" height="10" rx="1" />
      <path d="M5 5h4M5 8h4" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="4" />
      <path d="M9 9l3.5 3.5" strokeLinecap="round" />
    </svg>
  ),
  workflow: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="3" cy="8" r="2" />
      <circle cx="13" cy="4" r="2" />
      <circle cx="13" cy="12" r="2" />
      <path d="M5 8h3M10 5l-2 2M10 11l-2-2" />
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clock: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="5" />
      <path d="M6 3v3l2 1" strokeLinecap="round" />
    </svg>
  ),
  box: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 1L13 4v6l-6 3-6-3V4l6-3z" />
      <path d="M7 7v6M7 7L1 4M7 7l6-3" />
    </svg>
  ),
};

// 物料选项
const materialOptions = [
  { code: 'IT-001', name: 'MacBook Pro 14" M3', unit: '台', price: 18900 },
  { code: 'IT-015', name: 'Dell 27" 4K显示器', unit: '台', price: 3500 },
  { code: 'IT-032', name: '无线键鼠套装', unit: '套', price: 299 },
  { code: 'OF-023', name: 'A4复印纸 80g', unit: '包', price: 25 },
  { code: 'FN-008', name: '人体工学办公椅', unit: '把', price: 2800 },
];

// 状态配置
const statusConfig = {
  draft: { label: '草稿', headerBg: 'from-gray-500 to-gray-600' },
  pending: { label: '待审批', headerBg: 'from-amber-500 to-orange-500' },
  approved: { label: '已批准', headerBg: 'from-emerald-500 to-teal-500' },
  rejected: { label: '已拒绝', headerBg: 'from-red-500 to-rose-500' },
  processing: { label: '处理中', headerBg: 'from-blue-500 to-indigo-500' },
};

// 行项目类型
interface LineItem {
  id: string;
  lineNum: number;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  deliveryDate: string;
}

// 模拟详情数据
const mockDetail = {
  prNumber: 'PR-2024-0156',
  description: 'IT设备采购申请 - 研发部笔记本电脑',
  status: 'pending',
  createdAt: '2024-01-15 14:30',
  requester: '张三',
  department: '研发部',
  companyCode: '1000',
  purchaseOrg: '1000',
  purchaseGroup: '001',
  priority: 'high',
  deliveryDate: '2024-02-15',
  workflow: [
    { step: 1, title: '创建', user: '张三', time: '2024-01-15 14:30', status: 'completed' },
    { step: 2, title: '部门审批', user: '李经理', time: '2024-01-15 16:00', status: 'completed' },
    { step: 3, title: '财务审批', user: '王财务', time: '', status: 'current' },
    { step: 4, title: '采购执行', user: '', time: '', status: 'pending' },
  ],
};

export function EditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 表头数据
  const [headerData, setHeaderData] = useState({
    description: mockDetail.description,
    priority: mockDetail.priority,
    purchaseOrg: mockDetail.purchaseOrg,
    purchaseGroup: mockDetail.purchaseGroup,
  });

  // 行项目
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      lineNum: 10,
      materialCode: 'IT-001',
      materialName: 'MacBook Pro 14" M3',
      quantity: 10,
      unit: '台',
      unitPrice: 18900,
      amount: 189000,
      deliveryDate: '2024-02-15',
    },
  ]);

  const status = statusConfig[mockDetail.status as keyof typeof statusConfig];

  // 更新表头数据
  const updateHeader = (field: string, value: any) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // 添加行项目
  const addLineItem = () => {
    const maxLineNum = Math.max(...lineItems.map(i => i.lineNum), 0);
    setLineItems([
      ...lineItems,
      {
        id: String(Date.now()),
        lineNum: maxLineNum + 10,
        materialCode: '',
        materialName: '',
        quantity: 1,
        unit: '',
        unitPrice: 0,
        amount: 0,
        deliveryDate: '',
      },
    ]);
    setIsDirty(true);
  };

  // 删除行项目
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
      setIsDirty(true);
    }
  };

  // 更新行项目
  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };

      if (field === 'materialCode') {
        const material = materialOptions.find(m => m.code === value);
        if (material) {
          updated.materialName = material.name;
          updated.unit = material.unit;
          updated.unitPrice = material.price;
          updated.amount = updated.quantity * material.price;
        }
      }

      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = updated.quantity * updated.unitPrice;
      }

      return updated;
    }));
    setIsDirty(true);
  };

  // 计算总金额
  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatAmount = (amount: number) => `¥${amount.toLocaleString()}`;

  // 保存
  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setIsDirty(false);
    navigate(`/purchase-requisitions/${id}`);
  };

  // 取消
  const handleCancel = () => {
    navigate(`/purchase-requisitions/${id}`);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Object Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* 彩色标题区 - 统一蓝色主题 */}
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
              <button onClick={() => navigate(`/purchase-requisitions/${id}`)} className="hover:text-white">
                {mockDetail.prNumber}
              </button>
              <span>/</span>
              <span className="text-white">编辑</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {Icons.save}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold">编辑采购申请</h1>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                      {status.label}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{mockDetail.prNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 关键信息区 */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              {Icons.calendar}
              <div>
                <p className="text-xs text-gray-500">申请日期</p>
                <p className="text-sm font-medium text-gray-900">{mockDetail.createdAt.split(' ')[0]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Icons.calendar}
              <div>
                <p className="text-xs text-gray-500">交货日期</p>
                <p className="text-sm font-medium text-gray-900">{mockDetail.deliveryDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Icons.user}
              <div>
                <p className="text-xs text-gray-500">申请人</p>
                <p className="text-sm font-medium text-gray-900">{mockDetail.requester}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Icons.building}
              <div>
                <p className="text-xs text-gray-500">公司代码</p>
                <p className="text-sm font-medium text-gray-900">{mockDetail.companyCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 数值指标区 */}
        <div className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalQuantity}</p>
              <p className="text-xs text-gray-500 mt-1">申请数量</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{lineItems.length}</p>
              <p className="text-xs text-gray-500 mt-1">行项目数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{formatAmount(totalAmount)}</p>
              <p className="text-xs text-gray-500 mt-1">总金额 (CNY)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主内容区 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 - 可编辑 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">基本信息</h2>
              <p className="text-xs text-gray-500 mt-0.5">修改采购申请的基本详情</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 mb-1.5">
                    申请描述 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={headerData.description}
                    onChange={(e) => updateHeader('description', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1.5">优先级</Label>
                  <Select
                    value={headerData.priority}
                    onChange={(e) => updateHeader('priority', e.target.value)}
                    options={[
                      { value: 'low', label: '低' },
                      { value: 'normal', label: '普通' },
                      { value: 'high', label: '高' },
                      { value: 'urgent', label: '紧急' },
                    ]}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1.5">采购组织</Label>
                  <Select
                    value={headerData.purchaseOrg}
                    onChange={(e) => updateHeader('purchaseOrg', e.target.value)}
                    options={[
                      { value: '1000', label: '1000 - 总部采购组织' },
                      { value: '2000', label: '2000 - 华东采购组织' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 行项目 - 可编辑 */}
          <EditableTable<typeof lineItems[0]>
            header={{
              title: '行项目',
              subtitle: '修改采购物料明细',
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
                key: 'lineNum',
                title: '行号',
                width: 60,
                render: (record) => <TableText variant="muted">{record.lineNum}</TableText>,
              },
              {
                key: 'materialCode',
                title: <>物料 <span className="text-red-500">*</span></>,
                width: 140,
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
                  <TableInput value={record.materialName} readOnly />
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
                    {record.unitPrice > 0 ? formatAmount(record.unitPrice) : '-'}
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
                    {record.amount > 0 ? formatAmount(record.amount) : '-'}
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
                width: 48,
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
                <td className="px-3 py-3 text-right text-base font-semibold text-blue-600">{formatAmount(totalAmount)}</td>
                <td colSpan={2}></td>
              </tr>
            }
          />
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 审批流程 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              {Icons.workflow}
              <h3 className="font-medium text-gray-900 text-sm">审批流程</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {mockDetail.workflow.map((step, index) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs",
                        step.status === 'completed' ? 'bg-emerald-500' :
                        step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      )}>
                        {step.status === 'completed' ? Icons.check : step.step}
                      </div>
                      {index < mockDetail.workflow.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-8 mt-1",
                          step.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      {step.user && (
                        <p className="text-xs text-gray-500">{step.user}</p>
                      )}
                      {step.time && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          {Icons.clock} {step.time}
                        </p>
                      )}
                      {step.status === 'current' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                          处理中
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 相关主数据 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              {Icons.box}
              <h3 className="font-medium text-gray-900 text-sm">相关主数据</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">物料</p>
                <p className="text-sm font-medium text-gray-900">IT-001</p>
                <p className="text-xs text-gray-500">MacBook Pro 14" M3</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">供应商</p>
                <p className="text-sm font-medium text-gray-900">VD-001</p>
                <p className="text-xs text-gray-500">Apple 授权经销商</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isDirty && <span className="text-amber-600">* 有未保存的更改</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="h-10 px-5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {Icons.cancel}
              <span>取消</span>
            </button>

            <div className="flex">
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
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
                disabled={saving}
                className="h-10 px-2 rounded-r-lg bg-blue-600 text-white hover:bg-blue-700 border-l border-blue-500 disabled:opacity-50"
              >
                {Icons.chevronDown}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPage;
