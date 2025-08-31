import React, { useState } from 'react';
import { Select, Form } from 'antd';

const { Option } = Select;

const MultiSelectField = ({ 
  id, 
  label, 
  required, 
  options = ['Option 1', 'Option 2', 'Option 3'], 
  placeholder = 'Select multiple options', 
  styles, 
  disabled,
  selectAll = true // Enable select all by default for multi-select
}) => {
  const [selectedValues, setSelectedValues] = useState([]);
  
  const inputStyle = {
    width: '100%',
    ...(styles?.input ? {
      color: styles.input.color,
      backgroundColor: styles.input.backgroundColor,
      borderColor: styles.input.borderColor,
      borderWidth: styles.input.borderWidth,
      borderRadius: styles.input.borderRadius,
      boxShadow: styles.input.boxShadow,
    } : {})
  };

  const handleChange = (values) => {
    // Check if "Select All" was clicked
    if (values.includes('__SELECT_ALL__')) {
      // Remove the __SELECT_ALL__ from values first
      const filteredValues = values.filter(v => v !== '__SELECT_ALL__');
      
      if (selectedValues.length === options.length) {
        // If all are selected, clear all
        setSelectedValues([]);
      } else {
        // Select all options
        setSelectedValues([...options]);
      }
    } else {
      setSelectedValues(values);
    }
  };

  // Create dropdown options with Select All option at the top
  const dropdownOptions = [];
  
  if (selectAll && options.length > 0) {
    const allSelected = selectedValues.length === options.length;
    dropdownOptions.push(
      <Option key="__SELECT_ALL__" value="__SELECT_ALL__">
        <div style={{ fontWeight: 'bold', color: '#1890ff', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px', marginBottom: '4px' }}>
          {allSelected ? '✓ Deselect All' : 'Select All'}
        </div>
      </Option>
    );
  }

  // Add regular options
  options.forEach((option, index) => {
    dropdownOptions.push(
      <Option key={index} value={option}>
        {option}
      </Option>
    );
  });

  return (
    <Form.Item
      label={<span style={styles?.label}>{label}</span>}
      name={id}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
      style={{ 
        marginBottom: '16px',
      }}
    >
      <Select 
        mode="multiple"
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
        allowClear
        showSearch
        value={selectedValues}
        onChange={handleChange}
        filterOption={(input, option) => {
          // Don't filter the Select All option
          if (option?.key === '__SELECT_ALL__') {
            return true;
          }
          return option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
      >
        {dropdownOptions}
      </Select>
    </Form.Item>
  );
};

export default MultiSelectField;
