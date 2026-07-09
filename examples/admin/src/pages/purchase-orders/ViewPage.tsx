/**
 * 采购订单详情页面
 * 基于 SAP Fiori Object Page 设计
 */

import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@aiko-boot/admin-component';
import { EditableTable, TableText, type EditableTableColumn } from '../../components/EditableTable';

// 图标
const Icons = {
  back: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v6A1.5 1.5 0 003 10.5h2.5" />
    </svg>
  ),
  print: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6V1.5h8V6M4 11h8v3.5H4zM1.5 6h13v5a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 11V6z" />
    </svg>
  ),
  more: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  ),
  doc: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 2h7l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path d="M12 2v4h4M6 10h8M6 14h5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 11V7.5M8 5.5v-.01" strokeLinecap="round" />
    </svg>
  ),
};

// 状态配置
const statusConfig = {
  draft: { label: '草稿', headerBg: 'from-gray-500 to-gray-600', badgeBg: 'bg-white/20' },
  confirmed: { label: '已确认', headerBg: 'from-blue-500 to-indigo-600', badgeBg: 'bg-white/20' },
  sent: { label: '已发送', headerBg: 'from-amber-500 to-orange-600', badgeBg: 'bg-white/20' },
  received: { label: '已收货', headerBg: 'from-emerald-500 to-teal-600', badgeBg: 'bg-white/20' },
  invoiced: { label: '已开票', headerBg: 'from-purple-500 to-indigo-600', badgeBg: 'bg-white/20' },
  completed: { label: '已完成', headerBg: 'from-green-500 to-emerald-600', badgeBg: 'bg-white/20' },
  cancelled: { label: '已取消', headerBg: 'from-red-500 to-rose-600', badgeBg: 'bg-white/20' },
};

// 模拟详情数据
const mockDetail = {
  id: '1',
  poNumber: 'PO-2024-0089',
  prRef: 'PR-2024-0156',
  status: 'sent',
  supplier: 'Apple 授权经销商',
  supplierCode: 'VD-001',
  supplierContact: '王经理',
  supplierPhone: '021-12345678',
  paymentTerms: '月结30天',
  incoterms: 'DDP',
  totalAmount: 189000,
  taxAmount: 21862.83,
  netAmount: 167137.17,
  currency: 'CNY',
  createdAt: '2024-01-20 10:30',
  createdBy: '张三',
  companyCode: '1000',
  companyName: '演示公司',
  purchaseOrg: '1000',
  purchaseGroup: 'P01',
  buyer: '张三',
  deliveryDate: '2024-02-01',
  deliveryAddress: '上海市浦东新区张江高科技园区xx路xx号',
  items: [
    { id: '1', lineNo: '10', material: 'M-1001', description: 'MacBook Pro 14" M3 Pro', quantity: 5, unit: '台', unitPrice: 18900, netAmount: 94500, taxAmount: 10917.70, status: 'open' },
    { id: '2', lineNo: '20', material: 'M-1002', description: 'MacBook Pro 14" M3 Max', quantity: 5, unit: '台', unitPrice: 18900, netAmount: 94500, taxAmount: 10945.13, status: 'open' },
  ],
};

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const data = mockDetail;
  const status = statusConfig[data.status as keyof typeof statusConfig];

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
              <button 
                onClick={() => navigate('/purchase-orders')}
                className="hover:text-white flex items-center gap-1"
              >
                {Icons.back}
                采购订单管理
              </button>
              <span>/</span>
              <span className="text-white">{data.poNumber}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {Icons.doc}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold">{data.poNumber}</h1>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                      {status.label}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{data.supplier}</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/purchase-orders/${id}/edit`)}
                  className="h-10 px-5 rounded-lg bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 flex items-center gap-2 transition-colors shadow-sm"
                >
                  {Icons.edit}
                  <span>编辑</span>
                </button>
                <button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  {Icons.copy}
                </button>
                <button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  {Icons.print}
                </button>
                <button className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  {Icons.more}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 关键信息 */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">订单日期</p>
              <p className="text-sm font-medium text-gray-900">{data.createdAt.split(' ')[0]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">交货日期</p>
              <p className="text-sm font-medium text-gray-900">{data.deliveryDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">采购员</p>
              <p className="text-sm font-medium text-gray-900">{data.buyer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">参考申请</p>
              <button className="text-sm font-medium text-blue-600 hover:underline">{data.prRef}</button>
            </div>
          </div>
        </div>

        {/* 金额指标 */}
        <div className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatAmount(data.netAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">净金额</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatAmount(data.taxAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">税额</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatAmount(data.totalAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">总金额</p>
            </div>
          </div>
        </div>
      </div>

      {/* 供应商信息 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">供应商信息</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">供应商</p>
            <p className="text-sm text-gray-900">{data.supplier}</p>
            <p className="text-xs text-gray-400">{data.supplierCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">联系人</p>
            <p className="text-sm text-gray-900">{data.supplierContact}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">电话</p>
            <p className="text-sm text-gray-900">{data.supplierPhone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">付款条款</p>
            <p className="text-sm text-gray-900">{data.paymentTerms}</p>
          </div>
          <div className="md:col-span-4">
            <p className="text-xs text-gray-400 mb-1">交货地址</p>
            <p className="text-sm text-gray-900">{data.deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* 组织数据 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">组织数据</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">公司代码</p>
            <p className="text-sm text-gray-900">{data.companyCode} - {data.companyName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">采购组织</p>
            <p className="text-sm text-gray-900">{data.purchaseOrg}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">采购组</p>
            <p className="text-sm text-gray-900">{data.purchaseGroup}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">贸易条款</p>
            <p className="text-sm text-gray-900">{data.incoterms}</p>
          </div>
        </div>
      </div>

      {/* 行项目 */}
      <EditableTable<typeof data.items[0]>
        header={{
          title: '行项目',
          subtitle: `${data.items.length} 项`,
        }}
        columns={[
          {
            key: 'lineNo',
            title: '行号',
            width: 60,
            render: (record) => <TableText>{record.lineNo}</TableText>,
          },
          {
            key: 'material',
            title: '物料',
            width: 120,
            render: (record) => (
              <span className="text-sm font-medium text-blue-600">{record.material}</span>
            ),
          },
          {
            key: 'description',
            title: '描述',
            width: 200,
            render: (record) => <TableText>{record.description}</TableText>,
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
            key: 'netAmount',
            title: '净金额',
            width: 100,
            align: 'right',
            render: (record) => <TableText variant="bold">{formatAmount(record.netAmount)}</TableText>,
          },
          {
            key: 'taxAmount',
            title: '税额',
            width: 100,
            align: 'right',
            render: (record) => <TableText variant="muted">{formatAmount(record.taxAmount)}</TableText>,
          },
          {
            key: 'status',
            title: '状态',
            width: 80,
            align: 'center',
            render: (record) => (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                {record.status === 'open' ? '待收货' : '已收货'}
              </span>
            ),
          },
        ] as EditableTableColumn<typeof data.items[0]>[]}
        dataSource={data.items}
        rowKey="id"
        minWidth={800}
        showIndex={false}
        footer={
          <tr className="bg-gray-50/80 border-t border-gray-200">
            <td colSpan={5} className="px-3 py-3 text-right text-sm font-medium text-gray-500">合计</td>
            <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">{formatAmount(data.netAmount)}</td>
            <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">{formatAmount(data.taxAmount)}</td>
            <td></td>
          </tr>
        }
      />

      {/* 审批历史 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">处理记录</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">订单发送至供应商</p>
                  <span className="text-xs text-gray-400">2024-01-20 14:30</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">张三 通过邮件发送采购订单</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">订单确认</p>
                  <span className="text-xs text-gray-400">2024-01-20 11:00</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">采购经理 李四 确认采购订单</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">订单创建</p>
                  <span className="text-xs text-gray-400">2024-01-20 10:30</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">张三 基于采购申请 {data.prRef} 创建</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPage;
