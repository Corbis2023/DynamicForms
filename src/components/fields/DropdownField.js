import React from 'react';
import { Select, Form, Radio, Checkbox, Space } from 'antd';

const { Option } = Select;

const DropdownField = ({ 
  id, 
  label, 
  required, 
  options = ['Option 1', 'Option 2', 'Option 3'], 
  placeholder = 'Select an option', 
  styles, 
  disabled,
  multiSelect = false,
  layout = 'vertical',
  renderAs = 'dropdown' // 'dropdown', 'radio', 'checkbox'
}) => {
  const commonStyle = {
    ...(styles?.input ? {
      color: styles.input.color,
      backgroundColor: styles.input.backgroundColor,
      borderColor: styles.input.borderColor,
      borderWidth: styles.input.borderWidth,
      borderRadius: styles.input.borderRadius,
      boxShadow: styles.input.boxShadow,
    } : {})
  };

  // Determine if multi-select should be enabled based on renderAs and multiSelect prop
  const shouldUseMultiSelect = renderAs === 'checkbox' || (renderAs === 'dropdown' && multiSelect);

  const renderDropdown = () => (
    <Select 
      mode={shouldUseMultiSelect ? 'multiple' : undefined}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        ...commonStyle
      }}
    >
      {options.map((option, index) => (
        <Option key={index} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  );

  const renderRadio = () => (
    <Radio.Group 
      disabled={disabled}
      style={commonStyle}
    >
      <Space direction={layout === 'horizontal' ? 'horizontal' : 'vertical'}>
        {options.map((option, index) => (
          <Radio key={index} value={option}>
            {option}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );

  const renderCheckbox = () => (
    <Checkbox.Group 
      disabled={disabled}
      style={commonStyle}
    >
      <Space direction={layout === 'horizontal' ? 'horizontal' : 'vertical'}>
        {options.map((option, index) => (
          <Checkbox key={index} value={option}>
            {option}
          </Checkbox>
        ))}
      </Space>
    </Checkbox.Group>
  );

  const renderField = () => {
    switch (renderAs) {
      case 'radio':
        return renderRadio();
      case 'checkbox':
        return renderCheckbox();
      case 'dropdown':
      default:
        return renderDropdown();
    }
  };

  return (
    <Form.Item
      label={<span style={styles?.label}>{label}</span>}
      name={id}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
      style={{ 
        marginBottom: '16px',
      }}
    >
      {renderField()}
    </Form.Item>
  );
};

export default DropdownField;
