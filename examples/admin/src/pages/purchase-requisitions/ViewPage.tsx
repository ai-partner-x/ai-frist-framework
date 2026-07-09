/**
 * 采购申请详情页面
 * 基于 SAP Fiori Object Page 设计
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@aiko-boot/admin-component';
import { EditableTable, TableText, type EditableTableColumn } from '../../components/EditableTable';

// 图标
const Icons = {
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M12.5 4v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 13V4" strokeLinecap="round" />
    </svg>
  ),
  share: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="4" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 7l4-2M6 9l4 2" />
    </svg>
  ),
  star: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1l2.2 4.4 4.8.7-3.5 3.4.8 4.8L8 12l-4.3 2.3.8-4.8-3.5-3.4 4.8-.7L8 1z" strokeLinejoin="round" />
    </svg>
  ),
  more: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
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
  box: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 1L13 4v6l-6 3-6-3V4l6-3z" />
      <path d="M7 7v6M7 7L1 4M7 7l6-3" />
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
  doc: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 2h7l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path d="M12 2v4h4M6 10h8M6 14h5" strokeLinecap="round" />
    </svg>
  ),
};

// 状态配置
const statusConfig = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600', headerBg: 'from-gray-500 to-gray-600' },
  pending: { label: '待审批', color: 'bg-amber-50 text-amber-700', headerBg: 'from-amber-500 to-orange-500' },
  approved: { label: '已批准', color: 'bg-emerald-50 text-emerald-700', headerBg: 'from-emerald-500 to-teal-500' },
  rejected: { label: '已拒绝', color: 'bg-red-50 text-red-600', headerBg: 'from-red-500 to-rose-500' },
  processing: { label: '处理中', color: 'bg-blue-50 text-blue-600', headerBg: 'from-blue-500 to-indigo-500' },
};

// 模拟详情数据
const mockDetail = {
  prNumber: 'PR-2024-0156',
  description: 'IT设备采购申请 - 研发部笔记本电脑',
  status: 'pending',
  createdAt: '2024-01-15 14:30',
  requester: '张三',
  department: '研发部',
  companyCode: '1000',
  purchaseOrg: '1000 - 总部采购组织',
  purchaseGroup: '001 - IT采购组',
  priority: 'high',
  deliveryDate: '2024-02-15',
  totalQuantity: 10,
  totalAmount: 189000,
  currency: 'CNY',
  items: [
    { id: '1', lineNum: 10, materialCode: 'IT-001', materialName: 'MacBook Pro 14" M3', quantity: 10, unit: '台', unitPrice: 18900, amount: 189000, deliveryDate: '2024-02-15' },
  ],
  workflow: [
    { step: 1, title: '创建', user: '张三', time: '2024-01-15 14:30', status: 'completed' },
    { step: 2, title: '部门审批', user: '李经理', time: '2024-01-15 16:00', status: 'completed' },
    { step: 3, title: '财务审批', user: '王财务', time: '', status: 'current' },
    { step: 4, title: '采购执行', user: '', time: '', status: 'pending' },
  ],
};

// Section 导航配置
const sections = [
  { id: 'basic', label: '基本信息' },
  { id: 'items', label: '行项目' },
  { id: 'workflow', label: '审批流程' },
  { id: 'related', label: '相关主数据' },
];

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data] = useState(mockDetail);
  const [activeSection, setActiveSection] = useState('basic');

  const status = statusConfig[data.status as keyof typeof statusConfig];

  // 滚动到指定 Section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatAmount = (amount: number) => `¥${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Object Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 彩色标题区 - 统一蓝色主题 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden">
          {/* 装饰圆形 */}
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-16 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5" />
          
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
              <span className="text-white">{data.prNumber}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {Icons.doc}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold">{data.description || data.prNumber}</h1>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                      {status.label}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{data.prNumber}</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/purchase-requisitions/${id}/edit`)}
                  className="h-9 px-4 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  {Icons.edit}
                  <span>编辑</span>
                </button>
                <button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  {Icons.more}
                </button>
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
                <p className="text-sm font-medium text-gray-900">{data.createdAt.split(' ')[0]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Icons.calendar}
              <div>
                <p className="text-xs text-gray-500">交货日期</p>
                <p className="text-sm font-medium text-gray-900">{data.deliveryDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Icons.user}
              <div>
                <p className="text-xs text-gray-500">申请人</p>
                <p className="text-sm font-medium text-gray-900">{data.requester}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Icons.building}
              <div>
                <p className="text-xs text-gray-500">公司代码</p>
                <p className="text-sm font-medium text-gray-900">{data.companyCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 数值指标区 */}
        <div className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{data.totalQuantity}</p>
              <p className="text-xs text-gray-500 mt-1">申请数量 (台)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{formatAmount(data.items[0]?.unitPrice || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">单价 ({data.currency})</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{formatAmount(data.totalAmount)}</p>
              <p className="text-xs text-gray-500 mt-1">总金额 ({data.currency})</p>
            </div>
          </div>
        </div>

        {/* Section 导航 */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white sticky top-14 z-10">
          <nav className="flex gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主内容区 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div id="section-basic" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-32">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">基本信息</h2>
              <p className="text-xs text-gray-500 mt-0.5">采购申请的基本详情</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">申请描述</p>
                  <p className="text-sm text-gray-900">{data.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">优先级</p>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    data.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {data.priority === 'high' ? '高' : data.priority === 'normal' ? '普通' : '低'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">部门</p>
                  <p className="text-sm text-gray-900">{data.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">采购组织</p>
                  <p className="text-sm text-gray-900">{data.purchaseOrg}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">采购组</p>
                  <p className="text-sm text-gray-900">{data.purchaseGroup}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 行项目 */}
          <EditableTable<typeof data.items[0]>
            header={{
              title: '行项目',
              subtitle: '采购物料明细',
            }}
            columns={[
              {
                key: 'lineNum',
                title: '行号',
                width: 60,
                render: (record) => <TableText variant="muted">{record.lineNum}</TableText>,
              },
              {
                key: 'material',
                title: '物料',
                width: 200,
                render: (record) => (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.materialName}</p>
                    <p className="text-xs text-gray-400">{record.materialCode}</p>
                  </div>
                ),
              },
              {
                key: 'quantity',
                title: '数量',
                width: 100,
                align: 'right',
                render: (record) => (
                  <span>
                    <TableText>{record.quantity}</TableText>
                    <TableText variant="muted" className="ml-1 text-xs">{record.unit}</TableText>
                  </span>
                ),
              },
              {
                key: 'unitPrice',
                title: '单价',
                width: 100,
                align: 'right',
                render: (record) => <TableText>{formatAmount(record.unitPrice)}</TableText>,
              },
              {
                key: 'amount',
                title: '金额',
                width: 100,
                align: 'right',
                render: (record) => <TableText variant="bold">{formatAmount(record.amount)}</TableText>,
              },
              {
                key: 'deliveryDate',
                title: '交货日期',
                width: 100,
                render: (record) => <TableText variant="muted">{record.deliveryDate}</TableText>,
              },
            ] as EditableTableColumn<typeof data.items[0]>[]}
            dataSource={data.items}
            rowKey="id"
            minWidth={700}
            showIndex={false}
            footer={
              <tr className="bg-gray-50/80 border-t border-gray-200">
                <td colSpan={4} className="px-3 py-3 text-right text-sm font-medium text-gray-700">合计</td>
                <td className="px-3 py-3 text-right text-sm font-semibold text-blue-600">{formatAmount(data.totalAmount)}</td>
                <td></td>
              </tr>
            }
          />
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 审批流程 */}
          <div id="section-workflow" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-32">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              {Icons.workflow}
              <h3 className="font-medium text-gray-900 text-sm">审批流程</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {data.workflow.map((step, index) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs",
                        step.status === 'completed' ? 'bg-emerald-500' :
                        step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      )}>
                        {step.status === 'completed' ? Icons.check : step.step}
                      </div>
                      {index < data.workflow.length - 1 && (
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
          <div id="section-related" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-32">
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
    </div>
  );
}

export default ViewPage;
