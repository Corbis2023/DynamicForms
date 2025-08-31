import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Space, Card, Typography, Divider, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const ValidationRulesBuilder = ({ visible, onCancel, onSave, formFields, currentField }) => {
  const [form] = Form.useForm();
  const [rules, setRules] = useState([]);

  const addRule = () => {
    const newRule = {
      id: Date.now(),
      condition: {
        field: '',
        operator: 'equals',
        value: ''
      },
      action: {
        type: 'show', // show, hide, enable, disable
        target: currentField?.id || ''
      }
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (ruleId) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const updateRule = (ruleId, updates) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleSave = () => {
    const validationRules = {
      fieldId: currentField?.id,
      rules: rules.filter(rule => 
        rule.condition.field && 
        rule.condition.operator && 
        rule.condition.value !== ''
      )
    };
    onSave(validationRules);
  };

  const getFieldOptions = () => {
    return formFields
      .filter(field => field.id !== currentField?.id)
      .map(field => ({
        value: field.id,
        label: field.label || field.type,
        type: field.type
      }));
  };

  const getOperatorOptions = (fieldType) => {
    const commonOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' }
    ];

    if (fieldType === 'number' || fieldType === 'date') {
      return [
        ...commonOperators,
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'greater_equal', label: 'Greater Than or Equal' },
        { value: 'less_equal', label: 'Less Than or Equal' }
      ];
    }

    if (fieldType === 'text' || fieldType === 'textarea') {
      return [
        ...commonOperators,
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does Not Contain' },
        { value: 'starts_with', label: 'Starts With' },
        { value: 'ends_with', label: 'Ends With' }
      ];
    }

    return commonOperators;
  };

  return (
    <Modal
      title={`Validation Rules for ${currentField?.label || 'Field'}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      width={800}
      okText="Save Rules"
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Create conditional rules to show/hide or enable/disable this field based on other field values.
          </Text>
        </div>

        <Button
          type="dashed"
          onClick={addRule}
          icon={<PlusOutlined />}
          style={{ marginBottom: 16, width: '100%' }}
        >
          Add Validation Rule
        </Button>

        {rules.map((rule, index) => {
          const selectedField = formFields.find(f => f.id === rule.condition.field);
          const fieldType = selectedField?.type;

          return (
            <Card
              key={rule.id}
              size="small"
              style={{ marginBottom: 16 }}
              title={`Rule ${index + 1}`}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeRule(rule.id)}
                />
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Condition:</Text>
                  <Space wrap style={{ marginTop: 8 }}>
                    <div>
                      <Text>When field</Text>
                      <Select
                        placeholder="Select field"
                        style={{ width: 150, margin: '0 8px' }}
                        value={rule.condition.field}
                        onChange={(value) => updateRule(rule.id, {
                          condition: { ...rule.condition, field: value }
                        })}
                      >
                        {getFieldOptions().map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Select
                        placeholder="Operator"
                        style={{ width: 120, margin: '0 8px' }}
                        value={rule.condition.operator}
                        onChange={(value) => updateRule(rule.id, {
                          condition: { ...rule.condition, operator: value }
                        })}
                      >
                        {getOperatorOptions(fieldType).map(op => (
                          <Option key={op.value} value={op.value}>
                            {op.label}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Input
                        placeholder="Value"
                        style={{ width: 120, margin: '0 8px' }}
                        value={rule.condition.value}
                        onChange={(e) => updateRule(rule.id, {
                          condition: { ...rule.condition, value: e.target.value }
                        })}
                      />
                    </div>
                  </Space>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div>
                  <Text strong>Action:</Text>
                  <Space wrap style={{ marginTop: 8 }}>
                    <div>
                      <Text>Then</Text>
                      <Select
                        style={{ width: 100, margin: '0 8px' }}
                        value={rule.action.type}
                        onChange={(value) => updateRule(rule.id, {
                          action: { ...rule.action, type: value }
                        })}
                      >
                        <Option value="show">Show</Option>
                        <Option value="hide">Hide</Option>
                        <Option value="enable">Enable</Option>
                        <Option value="disable">Disable</Option>
                      </Select>
                    </div>
                    <Text>this field</Text>
                  </Space>
                </div>
              </Space>
            </Card>
          );
        })}

        {rules.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <Text type="secondary">No validation rules defined. Click "Add Validation Rule" to create one.</Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ValidationRulesBuilder;
