import React, { useState } from 'react';
import { Collapse, Button, Space, Input, Modal, List, Typography, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useDrop } from 'react-dnd';

const { Panel } = Collapse;
const { Text } = Typography;

const GroupDropZone = ({ groupId, onDropField, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'field',
    drop: (item) => {
      if (item.fromGroup) {
        // Moving field from another group or main form
        onDropField(groupId, item);
      } else {
        // New field from field list
        const newField = {
          ...item,
          id: Date.now() + Math.random(),
          label: item.label || `${item.type} Field`,
          required: false,
          span: 24,
          placeholder: '',
          options: item.type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
        };
        onDropField(groupId, newField);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        minHeight: '60px',
        padding: '8px',
        border: isOver && canDrop ? '2px dashed #1890ff' : '1px dashed #d9d9d9',
        borderRadius: '4px',
        backgroundColor: isOver && canDrop ? '#f0f8ff' : 'transparent',
        transition: 'all 0.3s ease',
      }}
    >
      {children}
      {isOver && canDrop && (
        <div style={{ 
          textAlign: 'center', 
          color: '#1890ff', 
          fontSize: '12px',
          marginTop: '4px'
        }}>
          Drop field here
        </div>
      )}
    </div>
  );
};

const GroupPanel = ({ 
  groups, 
  onAddGroup, 
  onEditGroup, 
  onDeleteGroup, 
  onAddFieldToGroup,
  onRemoveFieldFromGroup,
  formFields,
  onMoveFieldToGroup 
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGroupForFields, setSelectedGroupForFields] = useState(null);

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName('');
      message.success('Group added successfully');
    }
  };

  const handleEditGroup = (groupId, currentName) => {
    setEditingGroup(groupId);
    setEditGroupName(currentName);
  };

  const handleSaveEdit = () => {
    if (editGroupName.trim() && editingGroup) {
      onEditGroup(editingGroup, { name: editGroupName.trim() });
      setEditingGroup(null);
      setEditGroupName('');
      message.success('Group updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditGroupName('');
  };

  const handleDeleteGroup = (groupId) => {
    onDeleteGroup(groupId);
    message.success('Group deleted successfully');
  };

  const handleDropField = (groupId, field) => {
    if (field.fromGroup) {
      // Moving field between groups or from main form
      onMoveFieldToGroup(field.id, field.fromGroup, groupId);
    } else {
      // Adding new field to group
      onAddFieldToGroup(groupId, field);
    }
    message.success('Field added to group');
  };

  const handleRemoveFieldFromGroup = (groupId, fieldId) => {
    onRemoveFieldFromGroup(groupId, fieldId);
    message.success('Field removed from group');
  };

  const showFieldSelectionModal = (groupId) => {
    setSelectedGroupForFields(groupId);
    setIsModalVisible(true);
  };

  const handleAddExistingField = (fieldId) => {
    if (selectedGroupForFields && fieldId) {
      const field = formFields.find(f => f.id === fieldId);
      if (field) {
        onMoveFieldToGroup(fieldId, null, selectedGroupForFields);
        message.success('Field moved to group');
      }
    }
    setIsModalVisible(false);
    setSelectedGroupForFields(null);
  };

  const toggleGroupCollapse = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      onEditGroup(groupId, { collapsed: !group.collapsed });
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, flex: 1 }}>Form Groups</h3>
        <Tag color="blue">{groups.length}</Tag>
      </div>
      
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          placeholder="New group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onPressEnter={handleAddGroup}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGroup}>
          Add
        </Button>
      </Space.Compact>

      <Collapse 
        defaultActiveKey={groups.map((_, index) => index.toString())}
        size="small"
      >
        {groups.map((group, index) => (
          <Panel
            header={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                {editingGroup === group.id ? (
                  <Space.Compact style={{ flex: 1, marginRight: '8px' }}>
                    <Input
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      onPressEnter={handleSaveEdit}
                      size="small"
                    />
                    <Button size="small" type="primary" onClick={handleSaveEdit}>
                      Save
                    </Button>
                    <Button size="small" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </Space.Compact>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>
                      <DragOutlined style={{ marginRight: '8px', color: '#999' }} />
                      {group.name}
                    </span>
                    <Space size="small">
                      <Tag color="green" size="small">
                        {group.fields?.length || 0} fields
                      </Tag>
                      <Button
                        size="small"
                        type="text"
                        icon={group.collapsed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupCollapse(group.id);
                        }}
                      />
                    </Space>
                  </>
                )}
              </div>
            }
            key={group.id || index}
            extra={
              editingGroup !== group.id && (
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditGroup(group.id, group.name)}
                  />
                  <Popconfirm
                    title="Delete Group"
                    description="Are you sure you want to delete this group? Fields will be moved back to the main form."
                    onConfirm={() => handleDeleteGroup(group.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              )
            }
          >
            <GroupDropZone groupId={group.id} onDropField={handleDropField}>
              {group.fields && group.fields.length > 0 ? (
                <List
                  size="small"
                  dataSource={group.fields}
                  renderItem={(field) => (
                    <List.Item
                      actions={[
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveFieldFromGroup(group.id, field.id)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={<Text style={{ fontSize: '12px' }}>{field.label}</Text>}
                        description={
                          <Space size="small">
                            <Tag size="small" color="blue">{field.type}</Tag>
                            {field.required && <Tag size="small" color="red">Required</Tag>}
                            <Tag size="small" color="default">Span: {field.span}</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#999',
                  fontSize: '12px'
                }}>
                  Drop fields here or click "Add Field" to add fields to this group
                </div>
              )}
            </GroupDropZone>
            
            <div style={{ marginTop: '12px' }}>
              <Space size="small">
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => showFieldSelectionModal(group.id)}
                  disabled={formFields.length === 0}
                >
                  Add Field
                </Button>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  or drag fields from the field list above
                </Text>
              </Space>
            </div>
          </Panel>
        ))}
      </Collapse>

      {groups.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          border: '1px dashed #d9d9d9',
          borderRadius: '4px',
          color: '#999'
        }}>
          <p>No groups created yet</p>
          <p style={{ fontSize: '12px' }}>Create groups to organize your form fields</p>
        </div>
      )}

      <Modal
        title="Add Field to Group"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedGroupForFields(null);
        }}
        footer={null}
        width={400}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">Select a field from the main form to add to this group:</Text>
        </div>
        
        {formFields.length > 0 ? (
          <List
            size="small"
            dataSource={formFields}
            renderItem={(field) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleAddExistingField(field.id)}
                  >
                    Add to Group
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={field.label}
                  description={
                    <Space size="small">
                      <Tag size="small" color="blue">{field.type}</Tag>
                      {field.required && <Tag size="small" color="red">Required</Tag>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No fields available in the main form
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GroupPanel;
