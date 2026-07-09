/**
 * 收货详情页面
 * 使用通用 ObjectPage 组件重构
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ObjectPage } from '../../components/ObjectPage';
import { EditableTable, TableText, TableFooterRow, type EditableTableColumn } from '../../components/EditableTable';
import { cn } from '@aiko-boot/admin-component';

// 图标
const Icons = {
  truck: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 4h11v10H1zM12 8h4l2.5 3.5v4.5H12z" />
      <circle cx="4.5" cy="15.5" r="1.5" />
      <circle cx="15" cy="15.5" r="1.5" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3.5 8.5L6.5 11.5L12.5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  box: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1L14 4v6l-6 3-6-3V4l6-3z" />
      <path d="M8 8v6M8 8L2 4M8 8l6-4" />
    </svg>
  ),
  history: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
    </svg>
  ),
};

// 模拟详情数据
const mockDetail = {
  id: '1',
  grNumber: 'GR-2024-0056',
  poRef: 'PO-2024-0089',
  status: 'received',
  supplier: 'Apple 授权经销商',
  supplierCode: 'VD-001',
  plant: '1000',
  plantName: '上海工厂',
  storageLocation: 'WH01',
  storageName: '主仓库',
  receivedAt: '2024-01-25 14:30',
  receiver: '王五',
  movementType: '101',
  movementTypeName: '采购收货',
  deliveryNote: 'DN-2024-1234',
  billOfLading: 'BL-20240125',
  items: [
    { id: '1', lineNo: '10', material: 'M-1001', description: 'MacBook Pro 14" M3 Pro', orderedQty: 5, receivedQty: 5, unit: '台', batch: 'BATCH001', inspectionResult: '合格' },
    { id: '2', lineNo: '20', material: 'M-1002', description: 'MacBook Pro 14" M3 Max', orderedQty: 5, receivedQty: 5, unit: '台', batch: 'BATCH002', inspectionResult: '合格' },
  ],
  totalOrdered: 10,
  totalReceived: 10,
  history: [
    { status: 'green', title: '收货完成', time: '2024-01-25 14:30', desc: '王五 完成收货入库，共10件物料' },
    { status: 'purple', title: '质量检验', time: '2024-01-25 12:00', desc: '质检员 检验所有物料，结果：全部合格' },
    { status: 'amber', title: '货物到达', time: '2024-01-25 10:00', desc: '仓库确认货物到达，开始卸货' },
    { status: 'gray', title: '收货单创建', time: '2024-01-24 16:00', desc: '系统基于采购订单 PO-2024-0089 自动创建' },
  ],
};

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const data = mockDetail;
  const receivedPercent = Math.round((data.totalReceived / data.totalOrdered) * 100);

  return (
    <ObjectPage
      mode="display"
      backPath="/goods-receipt"
      breadcrumb="收货管理"
      title={data.grNumber}
      subtitle={`参考: ${data.poRef}`}
      status={{ label: '已入库', color: 'green' }}
      headerIcon={Icons.truck}
      headerFields={[
        { label: '收货日期', value: data.receivedAt.split(' ')[0] },
        { label: '收货人', value: data.receiver },
        { label: '移动类型', value: `${data.movementType} - ${data.movementTypeName}` },
        { label: '供应商', value: data.supplier },
      ]}
      kpis={[
        { value: data.totalOrdered, label: '订单数量', color: 'gray' },
        { value: data.totalReceived, label: '已收货数量', color: 'green' },
        { value: `${receivedPercent}%`, label: '完成率', color: 'blue' },
      ]}
      actions={[
        {
          key: 'edit',
          label: '编辑',
          icon: Icons.edit,
          onClick: () => navigate(`/goods-receipt/${id}/edit`),
          showInModes: ['display'],
        },
      ]}
      sections={[
        // 库存信息
        {
          id: 'storage',
          title: '库存信息',
          icon: Icons.box,
          content: (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">工厂</p>
                <p className="text-sm text-gray-900">{data.plant} - {data.plantName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">存储地点</p>
                <p className="text-sm text-gray-900">{data.storageLocation} - {data.storageName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">交货单号</p>
                <p className="text-sm text-gray-900">{data.deliveryNote}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">提单号</p>
                <p className="text-sm text-gray-900">{data.billOfLading}</p>
              </div>
            </div>
          ),
        },
        // 收货明细
        {
          id: 'items',
          title: '收货明细',
          subtitle: `${data.items.length} 项`,
          content: (
            <EditableTable<typeof data.items[0]>
              columns={[
                {
                  key: 'lineNo',
                  title: '行号',
                  width: 60,
                  render: (record) => <TableText variant="muted">{record.lineNo}</TableText>,
                },
                {
                  key: 'material',
                  title: '物料',
                  width: 100,
                  render: (record) => <TableText variant="primary">{record.material}</TableText>,
                },
                {
                  key: 'description',
                  title: '描述',
                  width: 200,
                  render: (record) => <TableText>{record.description}</TableText>,
                },
                {
                  key: 'orderedQty',
                  title: '订单数量',
                  width: 100,
                  align: 'right',
                  render: (record) => (
                    <span>
                      <TableText variant="muted">{record.orderedQty}</TableText>
                      <TableText variant="muted" className="ml-1 text-xs">{record.unit}</TableText>
                    </span>
                  ),
                },
                {
                  key: 'receivedQty',
                  title: '收货数量',
                  width: 100,
                  align: 'right',
                  render: (record) => {
                    const isFullyReceived = record.receivedQty === record.orderedQty;
                    return (
                      <span>
                        <span className={cn("text-sm font-medium", isFullyReceived ? "text-green-600" : "text-amber-600")}>
                          {record.receivedQty}
                        </span>
                        <TableText variant="muted" className="ml-1 text-xs">{record.unit}</TableText>
                      </span>
                    );
                  },
                },
                {
                  key: 'batch',
                  title: '批次',
                  width: 100,
                  render: (record) => <TableText variant="muted">{record.batch}</TableText>,
                },
                {
                  key: 'inspectionResult',
                  title: '检验结果',
                  width: 80,
                  align: 'center',
                  render: (record) => (
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      record.inspectionResult === '合格' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-red-50 text-red-600'
                    )}>
                      {record.inspectionResult}
                    </span>
                  ),
                },
              ] as EditableTableColumn<typeof data.items[0]>[]}
              dataSource={data.items}
              rowKey="id"
              minWidth={800}
              showIndex={false}
              embedded={true}
              footer={
                <tr className="bg-gray-50/80 border-t border-gray-200">
                  <td colSpan={3} className="px-3 py-3 text-right text-sm font-medium text-gray-500">合计</td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">{data.totalOrdered}</td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-green-600">{data.totalReceived}</td>
                  <td colSpan={2}></td>
                </tr>
              }
            />
          ),
        },
        // 处理记录 - 侧边栏
        {
          id: 'history',
          title: '处理记录',
          icon: Icons.history,
          sidebar: true,
          content: (
            <div className="space-y-4">
              {data.history.map((record, index) => {
                const colorMap: Record<string, string> = {
                  green: 'bg-green-500',
                  purple: 'bg-purple-500',
                  amber: 'bg-amber-500',
                  gray: 'bg-gray-300',
                };
                return (
                  <div key={index} className="flex gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", colorMap[record.status])} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{record.title}</p>
                        <span className="text-xs text-gray-400">{record.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{record.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        },
      ]}
    />
  );
}

export default ViewPage;
