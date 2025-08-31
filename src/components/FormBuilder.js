import React, { useState } from 'react';
import { 
  Layout, 
  Form, 
  Button, 
  Row, 
  Col, 
  Modal, 
  Input, 
  Select, 
  Switch, 
  Space, 
  Typography,
  Divider,
  Upload,
  message,
  Tooltip,
  Dropdown,
  Collapse,
  ColorPicker,
  InputNumber,
  Tabs
} from 'antd';
import { useDrop, useDrag } from 'react-dnd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  SettingOutlined,
  FileTextOutlined,
  CodeOutlined,
  HolderOutlined
} from '@ant-design/icons';
import FieldList from './FieldList';
import FieldRenderer from './FieldRenderer';
import GroupPanel from './GroupPanel';
import FormPreview from './FormPreview';
import { useFormBuilder } from '../hooks/useFormBuilder';
import { exportFormAsJSON, exportFormAsHTML, importFormFromJSON, validateFormStructure } from '../utils/formExport';

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { Title } = Typography;

const FormBuilder = () => {
  const { state, actions } = useFormBuilder();
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [metadataForm] = Form.useForm();
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [isMetadataModalVisible, setIsMetadataModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const { formFields, groups, isPreviewMode, formMetadata } = state;

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'field',
    drop: (item, monitor) => {
      // Check if the drop was already handled by a group drop zone
      if (monitor.didDrop()) {
        return;
      }
      
      const newField = {
        ...item,
        id: Date.now() + Math.random(),
        label: item.label || `${item.type} Field`,
        required: false,
        span: 24,
        placeholder: '',
        options: (item.type === 'dropdown' || item.type === 'multiselect' || item.type === 'checkbox' || item.type === 'radio') 
          ? ['Option 1', 'Option 2', 'Option 3'] 
          : undefined,
      };
      actions.addField(newField);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && !monitor.getDropResult(),
    }),
  }));

  const onFinish = (values) => {
    console.log('Form values:', values);
    message.success('Form submitted successfully!');
  };

  const showConfigModal = (field) => {
    setEditingField(field);
    configForm.setFieldsValue({
      label: field.label,
      required: field.required,
      span: field.span,
      placeholder: field.placeholder,
      options: field.options?.join('\n') || '',
      decimalPlaces: field.decimalPlaces || 0,
      showPercentage: field.showPercentage || false,
      heightConversion: field.heightConversion || false,
      selectAll: field.selectAll || false,
      layout: field.layout || 'vertical',
      // Dropdown field specific configurations
      multiSelect: field.multiSelect || false,
      renderAs: field.renderAs || 'dropdown',
      // Notes field specific configurations
      content: field.content || '',
      fontStyle: field.fontStyle || 'normal',
      fontWeight: field.fontWeight || 'normal',
      textDecoration: field.textDecoration || 'none',
      // Style configurations
      labelColor: field.styles?.labelColor || '#000000',
      labelFontSize: field.styles?.labelFontSize || 14,
      labelFontWeight: field.styles?.labelFontWeight || 'normal',
      borderColor: field.styles?.borderColor || '#d9d9d9',
      borderWidth: field.styles?.borderWidth || 1,
      borderRadius: field.styles?.borderRadius || 4,
      boxShadow: field.styles?.boxShadow || 'none',
      valueColor: field.styles?.valueColor || '#000000',
      backgroundColor: field.styles?.backgroundColor || '#ffffff',
    });
    setIsConfigModalVisible(true);
  };

  const handleConfigOk = () => {
    configForm.validateFields().then((values) => {
      // Helper function to extract color value
      const getColorValue = (colorValue) => {
        if (typeof colorValue === 'string') {
          return colorValue;
        }
        if (colorValue && typeof colorValue === 'object') {
          return colorValue.toHexString ? colorValue.toHexString() : colorValue.hex || colorValue;
        }
        return colorValue;
      };

      const updates = {
        label: values.label,
        required: values.required,
        span: values.span,
        placeholder: values.placeholder,
        options: values.options ? values.options.split('\n').filter(opt => opt.trim()) : editingField.options,
        decimalPlaces: values.decimalPlaces,
        showPercentage: values.showPercentage,
        heightConversion: values.heightConversion,
        selectAll: values.selectAll,
        layout: values.layout,
        // Dropdown field specific configurations
        multiSelect: values.multiSelect,
        renderAs: values.renderAs,
        // Notes field specific configurations
        content: values.content,
        fontStyle: values.fontStyle,
        fontWeight: values.fontWeight,
        textDecoration: values.textDecoration,
        // Style configurations
        styles: {
          labelColor: getColorValue(values.labelColor),
          labelFontSize: values.labelFontSize,
          labelFontWeight: values.labelFontWeight,
          borderColor: getColorValue(values.borderColor),
          borderWidth: values.borderWidth,
          borderRadius: values.borderRadius,
          boxShadow: values.boxShadow,
          valueColor: getColorValue(values.valueColor),
          backgroundColor: getColorValue(values.backgroundColor),
        }
      };
      actions.updateField(editingField.id, updates);
      setIsConfigModalVisible(false);
      setEditingField(null);
      message.success('Field updated successfully');
    });
  };

  const handleConfigCancel = () => {
    setIsConfigModalVisible(false);
    setEditingField(null);
  };

  const showMetadataModal = () => {
    metadataForm.setFieldsValue(formMetadata);
    setIsMetadataModalVisible(true);
  };

  const handleMetadataOk = () => {
    metadataForm.validateFields().then((values) => {
      // Update form metadata using the reducer
      actions.importForm({
        ...state,
        formMetadata: {
          ...state.formMetadata,
          ...values,
          updatedAt: new Date().toISOString()
        }
      });
      setIsMetadataModalVisible(false);
      message.success('Form metadata updated');
    });
  };

  const deleteField = (id) => {
    actions.deleteField(id);
    message.success('Field deleted');
  };

  const handleAddGroup = (name) => {
    actions.addGroup(name);
  };

  const handleEditGroup = (groupId, updates) => {
    actions.updateGroup(groupId, updates);
  };

  const handleDeleteGroup = (groupId) => {
    // Move fields back to main form before deleting group
    const group = groups.find(g => g.id === groupId);
    if (group && group.fields) {
      group.fields.forEach(field => {
        actions.addField(field);
      });
    }
    actions.deleteGroup(groupId);
  };

  const handleAddFieldToGroup = (groupId, field) => {
    actions.addFieldToGroup(groupId, field);
  };

  const handleRemoveFieldFromGroup = (groupId, fieldId) => {
    // Move field back to main form
    const group = groups.find(g => g.id === groupId);
    const field = group?.fields?.find(f => f.id === fieldId);
    if (field) {
      actions.addField(field);
    }
    actions.removeFieldFromGroup(groupId, fieldId);
  };

  const handleMoveFieldToGroup = (fieldId, fromGroupId, toGroupId) => {
    let field;
    
    if (fromGroupId) {
      // Moving from another group
      const fromGroup = groups.find(g => g.id === fromGroupId);
      field = fromGroup?.fields?.find(f => f.id === fieldId);
      if (field) {
        actions.removeFieldFromGroup(fromGroupId, fieldId);
      }
    } else {
      // Moving from main form
      field = formFields.find(f => f.id === fieldId);
      if (field) {
        actions.deleteField(fieldId);
      }
    }
    
    if (field && toGroupId) {
      actions.addFieldToGroup(toGroupId, field);
    }
  };

  const handleExportJSON = () => {
    exportFormAsJSON(state);
    message.success('Form exported as JSON');
  };

  const handleExportHTML = () => {
    exportFormAsHTML(state);
    message.success('Form exported as HTML');
  };

  const handleImportForm = (file) => {
    importFormFromJSON(file)
      .then((formData) => {
        const validation = validateFormStructure(formData);
        if (validation.isValid) {
          actions.importForm(formData);
          message.success('Form imported successfully');
        } else {
          message.error(`Import failed: ${validation.errors.join(', ')}`);
        }
      })
      .catch((error) => {
        message.error(`Import failed: ${error.message}`);
      });
    return false; // Prevent default upload behavior
  };

  const handleResetForm = () => {
    Modal.confirm({
      title: 'Reset Form',
      content: 'Are you sure you want to reset the entire form? This action cannot be undone.',
      onOk: () => {
        actions.resetForm();
        message.success('Form reset successfully');
      },
    });
  };

  const renderFieldsInGrid = (fieldsToRender = formFields) => {
    const rows = [];
    let currentRow = [];
    let currentSpan = 0;

    fieldsToRender.forEach((field) => {
      if (currentSpan + field.span > 24) {
        rows.push(currentRow);
        currentRow = [field];
        currentSpan = field.span;
      } else {
        currentRow.push(field);
        currentSpan += field.span;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <Row key={rowIndex} gutter={16}>
        {row.map((field) => (
          <Col key={field.id} span={field.span}>
            <div style={{ 
              position: 'relative', 
              border: '1px solid #d9d9d9', 
              padding: '8px', 
              marginBottom: '8px',
              borderRadius: '4px',
              transition: 'all 0.3s ease'
            }}>
              <Space style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 1 }}>
                <Tooltip title="Edit Field">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => showConfigModal(field)}
                  />
                </Tooltip>
                <Tooltip title="Delete Field">
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteField(field.id)}
                  />
                </Tooltip>
              </Space>
              <FieldRenderer field={field} />
            </div>
          </Col>
        ))}
      </Row>
    ));
  };

  // Sortable Field Component
  const SortableField = ({ field, index, groupId, moveField }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'sortable-field',
      item: { id: field.id, index, groupId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop(() => ({
      accept: 'sortable-field',
      hover: (draggedItem) => {
        if (draggedItem.groupId === groupId && draggedItem.index !== index) {
          moveField(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    }));

    return (
      <Col key={field.id} span={field.span}>
        <div
          ref={(node) => drag(drop(node))}
          style={{ 
            position: 'relative', 
            border: '1px solid #d9d9d9', 
            padding: '8px', 
            marginBottom: '8px',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
            opacity: isDragging ? 0.5 : 1,
          }}
        >
          <Space style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 1 }}>
            <Tooltip title="Drag to reorder">
              <HolderOutlined 
                style={{ 
                  cursor: 'grab',
                  color: '#999',
                  fontSize: '12px'
                }} 
              />
            </Tooltip>
            <Tooltip title="Edit Field">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => showConfigModal(field)}
              />
            </Tooltip>
            <Tooltip title="Delete Field">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteField(field.id)}
              />
            </Tooltip>
          </Space>
          <FieldRenderer field={field} />
        </div>
      </Col>
    );
  };

  const renderSortableFieldsInGrid = (fieldsToRender, groupId) => {
    const rows = [];
    let currentRow = [];
    let currentSpan = 0;

    fieldsToRender.forEach((field, index) => {
      if (currentSpan + field.span > 24) {
        rows.push(currentRow);
        currentRow = [{ field, index }];
        currentSpan = field.span;
      } else {
        currentRow.push({ field, index });
        currentSpan += field.span;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    const moveField = (fromIndex, toIndex) => {
      actions.moveFieldWithinGroup(groupId, fromIndex, toIndex);
    };

    return rows.map((row, rowIndex) => (
      <Row key={rowIndex} gutter={16}>
        {row.map(({ field, index }) => (
          <SortableField
            key={field.id}
            field={field}
            index={index}
            groupId={groupId}
            moveField={moveField}
          />
        ))}
      </Row>
    ));
  };

  // Sortable Group Component
  const SortableGroup = ({ group, index, moveGroup }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'group',
      item: { id: group.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop(() => ({
      accept: 'group',
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          moveGroup(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    }));

    // Create a drop zone for each group
    const GroupDropZone = ({ children }) => {
      const [{ isOver }, fieldDrop] = useDrop(() => ({
        accept: ['field', 'sortable-field'],
        drop: (item, monitor) => {
          // Prevent the drop from bubbling up to the main drop zone
          if (monitor.didDrop()) {
            return;
          }
          
          if (item.type === 'sortable-field') {
            // Handle reordering within group or moving between groups
            if (item.groupId === group.id) {
              // Same group, just reordering
              return;
            } else {
              // Moving from another group or main form
              const field = item.groupId 
                ? groups.find(g => g.id === item.groupId)?.fields?.find(f => f.id === item.id)
                : formFields.find(f => f.id === item.id);
              
              if (field) {
                if (item.groupId) {
                  actions.removeFieldFromGroup(item.groupId, item.id);
                } else {
                  actions.deleteField(item.id);
                }
                actions.addFieldToGroup(group.id, field);
              }
            }
          } else {
            // New field from field list
            const newField = {
              ...item,
              id: Date.now() + Math.random(),
              label: item.label || `${item.type} Field`,
              required: false,
              span: 24,
              placeholder: '',
              options: (item.type === 'dropdown' || item.type === 'multiselect' || item.type === 'checkbox' || item.type === 'radio') 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined,
            };
            actions.addFieldToGroup(group.id, newField);
          }
          
          // Return an object to indicate that the drop was handled
          return { dropped: true };
        },
        collect: (monitor) => ({
          isOver: monitor.isOver() && !monitor.getDropResult(),
        }),
      }));

      return (
        <div 
          ref={fieldDrop}
          style={{ 
            minHeight: '60px',
            border: isOver ? '2px dashed #1890ff' : '1px dashed transparent',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
            backgroundColor: isOver ? '#f0f8ff' : 'transparent'
          }}
        >
          {children}
        </div>
      );
    };

    return (
      <div
        ref={(node) => drag(drop(node))}
        style={{
          opacity: isDragging ? 0.5 : 1,
          marginBottom: '8px',
        }}
      >
        <Collapse
          items={[{
            key: group.id.toString(),
            label: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <HolderOutlined 
                    style={{ 
                      marginRight: '8px', 
                      cursor: 'grab',
                      color: '#999'
                    }} 
                  />
                  <span>
                    <strong>{group.name}</strong>
                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
                      ({group.fields?.length || 0} fields)
                    </span>
                  </span>
                </div>
              </div>
            ),
            children: (
              <GroupDropZone>
                {group.fields && group.fields.length > 0 ? (
                  renderSortableFieldsInGrid(group.fields, group.id)
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#999', 
                    padding: '20px',
                    fontSize: '14px'
                  }}>
                    Drop fields here or drag from the left panel
                  </div>
                )}
              </GroupDropZone>
            )
          }]}
          activeKey={group.collapsed ? [] : [group.id.toString()]}
          onChange={(keys) => {
            const isCurrentlyActive = keys.includes(group.id.toString());
            const shouldBeActive = !group.collapsed;
            
            if (isCurrentlyActive !== shouldBeActive) {
              actions.toggleGroupCollapse(group.id);
            }
          }}
          size="small"
        />
      </div>
    );
  };

  const moveGroup = (fromIndex, toIndex) => {
    actions.moveGroup(fromIndex, toIndex);
  };

  const renderGroups = () => {
    return (
      <div style={{ marginBottom: '16px' }}>
        {groups.map((group, index) => (
          <SortableGroup
            key={group.id}
            group={group}
            index={index}
            moveGroup={moveGroup}
          />
        ))}
      </div>
    );
  };

  const exportMenuItems = [
    {
      key: 'json',
      label: 'Export as JSON',
      icon: <CodeOutlined />,
      onClick: handleExportJSON,
    },
    {
      key: 'html',
      label: 'Export as HTML',
      icon: <FileTextOutlined />,
      onClick: handleExportHTML,
    },
  ];

  if (isPreviewMode) {
    return (
      <FormPreview 
        formState={state} 
        onBack={() => actions.setPreviewMode(false)} 
      />
    );
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={320} style={{ background: '#fff', padding: '16px', overflow: 'auto' }}>
        <FieldList />
        <GroupPanel
          groups={groups}
          formFields={formFields}
          onAddGroup={handleAddGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onAddFieldToGroup={handleAddFieldToGroup}
          onRemoveFieldFromGroup={handleRemoveFieldFromGroup}
          onMoveFieldToGroup={handleMoveFieldToGroup}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {formMetadata.title}
            </Title>
            <span style={{ color: '#666', fontSize: '12px' }}>
              {formFields.length + groups.reduce((acc, g) => acc + (g.fields?.length || 0), 0)} fields
            </span>
          </div>
          
          <Space>
            <Tooltip title="Form Settings">
              <Button 
                icon={<SettingOutlined />} 
                onClick={showMetadataModal}
              />
            </Tooltip>
            
            <Upload
              beforeUpload={handleImportForm}
              showUploadList={false}
              accept=".json"
            >
              <Tooltip title="Import Form">
                <Button icon={<UploadOutlined />} />
              </Tooltip>
            </Upload>
            
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Tooltip title="Export Form">
                <Button icon={<DownloadOutlined />} />
              </Tooltip>
            </Dropdown>
            
            <Tooltip title="Preview Form">
              <Button 
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => actions.setPreviewMode(true)}
              />
            </Tooltip>
            
            <Tooltip title="Reset Form">
              <Button 
                danger
                icon={<ReloadOutlined />}
                onClick={handleResetForm}
              />
            </Tooltip>
          </Space>
        </Header>
        
        <Content
          ref={drop}
          style={{
            margin: '16px',
            background: '#fff',
            padding: '24px',
            border: isOver ? '2px dashed #1890ff' : '1px solid #d9d9d9',
            borderRadius: '8px',
            minHeight: '400px',
            overflow: 'auto'
          }}
        >
          {formFields.length === 0 && groups.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <Title level={4} type="secondary">Start Building Your Form</Title>
              <p>Drag fields from the left panel to build your form</p>
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={onFinish}>
              {/* Render Groups */}
              {groups.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  {renderGroups()}
                </div>
              )}
              
              {/* Render Ungrouped Fields */}
              {formFields.length > 0 && (
                <>
                  {groups.length > 0 && <Divider>Ungrouped Fields</Divider>}
                  {renderFieldsInGrid()}
                </>
              )}
              
              {/* Submit Button */}
              {(formFields.length > 0 || groups.some(g => g.fields && g.fields.length > 0)) && (
                <Form.Item style={{ marginTop: '32px', textAlign: 'center' }}>
                  <Space size="large">
                    <Button type="primary" htmlType="submit" size="large">
                      Submit Form
                    </Button>
                    <Button htmlType="button" onClick={() => form.resetFields()}>
                      Reset
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          )}
        </Content>
      </Layout>

      {/* Field Configuration Modal */}
      <Modal
        title="Field Configuration"
        open={isConfigModalVisible}
        onOk={handleConfigOk}
        onCancel={handleConfigCancel}
        width={700}
      >
        <Form form={configForm} layout="vertical">
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'General',
                children: (
                  <>
                    <Form.Item name="label" label="Label" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="required" label="Required" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="span" label="Column Span" rules={[{ required: true }]}>
                      <Select placeholder="Select column span">
                        <Option value={6}>1/4 Width (6)</Option>
                        <Option value={8}>1/3 Width (8)</Option>
                        <Option value={12}>1/2 Width (12)</Option>
                        <Option value={16}>2/3 Width (16)</Option>
                        <Option value={18}>3/4 Width (18)</Option>
                        <Option value={24}>Full Width (24)</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="placeholder" label="Placeholder">
                      <Input />
                    </Form.Item>
                    {/* Options for dropdown, multiselect, checkbox, and radio fields */}
                    {(editingField?.type === 'dropdown' || editingField?.type === 'multiselect' || editingField?.type === 'checkbox' || editingField?.type === 'radio') && (
                      <Form.Item name="options" label="Options (one per line)">
                        <Input.TextArea rows={4} placeholder="Option 1&#10;Option 2&#10;Option 3" />
                      </Form.Item>
                    )}

                    {/* Notes field specific configurations */}
                    {editingField?.type === 'notes' && (
                      <>
                        <Form.Item name="content" label="Notes Content">
                          <Input.TextArea rows={4} placeholder="Enter your notes content here..." />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item name="fontStyle" label="Font Style">
                              <Select placeholder="Select font style">
                                <Option value="normal">Normal</Option>
                                <Option value="italic">Italic</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="fontWeight" label="Font Weight">
                              <Select placeholder="Select font weight">
                                <Option value="normal">Normal</Option>
                                <Option value="bold">Bold</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="textDecoration" label="Text Decoration">
                              <Select placeholder="Select text decoration">
                                <Option value="none">None</Option>
                                <Option value="underline">Underline</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    )}

                    {/* Dropdown field specific configurations */}
                    {editingField?.type === 'dropdown' && (
                      <>
                        <Form.Item name="multiSelect" label="Multi-Select" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                        <Form.Item name="renderAs" label="Render As">
                          <Select placeholder="Select render type">
                            <Option value="dropdown">Dropdown</Option>
                            <Option value="radio">Radio Buttons</Option>
                            <Option value="checkbox">Checkboxes</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item name="layout" label="Layout">
                          <Select placeholder="Select layout">
                            <Option value="vertical">Vertical</Option>
                            <Option value="horizontal">Horizontal</Option>
                          </Select>
                        </Form.Item>
                      </>
                    )}

                    {/* Number field specific configurations */}
                    {editingField?.type === 'number' && (
                      <>
                        <Form.Item name="decimalPlaces" label="Decimal Places">
                          <Select placeholder="Select decimal places">
                            <Option value={0}>0 (Integer)</Option>
                            <Option value={1}>1 decimal place</Option>
                            <Option value={2}>2 decimal places</Option>
                            <Option value
