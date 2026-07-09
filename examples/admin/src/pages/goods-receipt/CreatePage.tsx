/**
 * 收货创建页面
 * 使用通用 ObjectPage 组件
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Label } from '@aiko-boot/admin-component';
import { ObjectPage } from '../../components/ObjectPage';
import { EditableTable, TableInput, TableText, type EditableTableColumn } from '../../components/EditableTable';

// 图标
const Icons = {
  truck: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 4h11v10H1zM12 8h4l2.5 3.5v4.5H12z" />
      <circle cx="4.5" cy="15.5" r="1.5" />
      <circle cx="15" cy="15.5" r="1.5" />
    </svg>
  ),
  save: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v9a1 1 0 01-1 1z" />
      <path d="M10 2v3H6M5 9h6M5 12h6" strokeLinecap="round" />
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
};

export function CreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    poRef: '',
    plant: '1000',
    storageLocation: 'WH01',
  });

  // 模拟采购订单物料数据
  const poMaterials: Record<string, Array<{
    id: string;
    materialCode: string;
    materialName: string;
    orderedQty: number;
    receivedQty: number;
    unit: string;
    receiveQty: number;
  }>> = {
    'PO-2024-0090': [
      { id: '1', materialCode: 'IT-001', materialName: 'MacBook Pro 14" M3', orderedQty: 10, receivedQty: 5, unit: '台', receiveQty: 0 },
      { id: '2', materialCode: 'IT-015', materialName: 'Dell 27" 4K显示器', orderedQty: 20, receivedQty: 10, unit: '台', receiveQty: 0 },
      { id: '3', materialCode: 'IT-032', materialName: '无线键鼠套装', orderedQty: 50, receivedQty: 30, unit: '套', receiveQty: 0 },
    ],
    'PO-2024-0091': [
      { id: '1', materialCode: 'FN-008', materialName: '人体工学办公椅', orderedQty: 15, receivedQty: 0, unit: '把', receiveQty: 0 },
      { id: '2', materialCode: 'OF-023', materialName: 'A4复印纸 80g', orderedQty: 100, receivedQty: 50, unit: '包', receiveQty: 0 },
    ],
  };

  // 当前选中的采购订单物料
  const [materials, setMaterials] = useState<typeof poMaterials['PO-2024-0090']>([]);

  // 选择采购订单时加载物料
  const handlePoChange = (poRef: string) => {
    setFormData({ ...formData, poRef });
    if (poRef && poMaterials[poRef]) {
      // 复制物料并设置默认收货数量（未收货数量）
      setMaterials(poMaterials[poRef].map(m => ({
        ...m,
        receiveQty: m.orderedQty - m.receivedQty,
      })));
    } else {
      setMaterials([]);
    }
  };

  // 更新收货数量
  const updateReceiveQty = (id: string, qty: number) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, receiveQty: Math.max(0, Math.min(qty, m.orderedQty - m.receivedQty)) } : m
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    navigate('/goods-receipt');
  };

  // 当前日期
  const today = new Date().toISOString().split('T')[0];

  return (
    <ObjectPage
      mode="create"
      backPath="/goods-receipt"
      breadcrumb="收货管理"
      title="创建收货单"
      subtitle="新建收货单据"
      headerIcon={Icons.truck}
      headerFields={[
        { icon: Icons.calendar, label: '收货日期', value: today },
        { icon: Icons.user, label: '收货人', value: '当前用户' },
        { icon: Icons.building, label: '工厂', value: '1000 - 总部' },
        { icon: Icons.building, label: '存储位置', value: 'WH01 - 主仓库' },
      ]}
      tips={[
        '📦 选择采购订单后自动加载物料',
        '📋 确认收货数量后保存',
        '⚡ 快捷键：Ctrl+S 保存',
      ]}
      actions={[
        {
          key: 'cancel',
          label: '取消',
          variant: 'secondary',
          onClick: () => navigate('/goods-receipt'),
          showInModes: ['create'],
        },
        {
          key: 'save',
          label: saving ? '保存中...' : '保存',
          icon: Icons.save,
          variant: 'primary',
          onClick: handleSave,
          loading: saving,
          showInModes: ['create'],
          showDropdown: true,
        },
      ]}
      showSectionNav={false}
      sections={[
        {
          id: 'basic',
          title: '基本信息',
          content: (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs text-gray-500 mb-1">采购订单 *</Label>
                <Select
                  value={formData.poRef}
                  onChange={(e) => handlePoChange(e.target.value)}
                  placeholder="选择采购订单"
                  options={[
                    { value: '', label: '选择采购订单' },
                    { value: 'PO-2024-0090', label: 'PO-2024-0090 - 办公设备采购' },
                    { value: 'PO-2024-0091', label: 'PO-2024-0091 - IT设备补充' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">工厂 *</Label>
                <Select
                  value={formData.plant}
                  onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                  options={[
                    { value: '1000', label: '1000 - 总部' },
                    { value: '2000', label: '2000 - 华东分部' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">存储位置 *</Label>
                <Select
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  options={[
                    { value: 'WH01', label: 'WH01 - 主仓库' },
                    { value: 'WH02', label: 'WH02 - 备用仓库' },
                  ]}
                />
              </div>
            </div>
          ),
        },
        {
          id: 'items',
          title: '收货物料',
          subtitle: materials.length > 0 ? `共 ${materials.length} 项` : '选择采购订单后自动加载',
          content: (
            <EditableTable<typeof materials[0]>
              columns={[
                {
                  key: 'materialCode',
                  title: '物料编码',
                  width: 120,
                  render: (record) => <TableText variant="mono">{record.materialCode}</TableText>,
                },
                {
                  key: 'materialName',
                  title: '物料名称',
                  width: 200,
                  render: (record) => <TableText>{record.materialName}</TableText>,
                },
                {
                  key: 'orderedQty',
                  title: '订单数量',
                  width: 100,
                  align: 'right',
                  render: (record) => <TableText variant="muted">{record.orderedQty}</TableText>,
                },
                {
                  key: 'receivedQty',
                  title: '已收货',
                  width: 100,
                  align: 'right',
                  render: (record) => <TableText variant="muted">{record.receivedQty}</TableText>,
                },
                {
                  key: 'receiveQty',
                  title: '本次收货',
                  width: 120,
                  align: 'right',
                  required: true,
                  render: (record) => (
                    <TableInput
                      type="number"
                      value={record.receiveQty}
                      onChange={(val) => updateReceiveQty(record.id, parseInt(val) || 0)}
                      min={0}
                      max={record.orderedQty - record.receivedQty}
                      align="right"
                    />
                  ),
                },
                {
                  key: 'unit',
                  title: '单位',
                  width: 80,
                  align: 'center',
                  render: (record) => <TableText variant="muted">{record.unit}</TableText>,
                },
              ] as EditableTableColumn<typeof materials[0]>[]}
              dataSource={materials}
              rowKey="id"
              emptyText="请先选择采购订单"
              minWidth={700}
              showIndex={true}
              embedded={true}
            />
          ),
        },
      ]}
    />
  );
}

export default CreatePage;
